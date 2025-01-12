import amqp, { Channel, Connection, Replies, ConsumeMessage } from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const LOCAL_RABBITMQ_URL = process.env.rabbitmq_url || "amqp://localhost";
if (!LOCAL_RABBITMQ_URL) {
    throw new Error("RabbitMQ URL is not provided");
}

let connection: Connection | null = null;
let channel: Channel | null = null;

// Function to create or reuse the channel
export async function createChannel(): Promise<{ channel: Channel; connection: Connection }> {
    try {
        if (!connection) {
            connection = await amqp.connect(LOCAL_RABBITMQ_URL);
            console.log("RabbitMQ connection established.");
        }
        if (!channel) {
            channel = await connection.createChannel();
            console.log("RabbitMQ channel created.");
        }

        // Gracefully close connection on process exit
        process.on("SIGINT", async () => {
            await closeRabbitMQ();
            process.exit(0);
        });

        return { channel, connection };
    } catch (error) {
        console.error("Error creating RabbitMQ channel/connection:", error);
        throw error;
    }
}



let sharedReplyQueue: Replies.AssertQueue | null = null;
const responseHandlers: { [key: string]: (response: any) => void } = {}; // Explicitly typed

export const fetchDataFromQueue = async (queue: string, message: any): Promise<any> => {
    try {
        const { channel } = await createChannel();

            sharedReplyQueue = await channel.assertQueue("", { exclusive: true });
            console.log("Shared reply queue created:", sharedReplyQueue.queue);

            // Consume messages from the shared reply queue
            channel.consume(
                sharedReplyQueue.queue,
                (msg: ConsumeMessage | null) => {
                    if (!msg) return; // Guard clause for null `msg`

                    const correlationId = msg.properties.correlationId;
                    const response = JSON.parse(msg.content.toString());
                        // Resolve the promise for the matching correlation ID
                        responseHandlers[correlationId](response);
                        delete responseHandlers[correlationId];
                },
                { noAck: true } // Explicit acknowledgment not required for transient queues
            );

        // Declare and initialize correlationId BEFORE using it
        const correlationId = generateUuid();
        console.log(`Sending message to queue: ${queue}, Correlation ID: ${correlationId}`);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                delete responseHandlers[correlationId];
                reject(new Error(`Request timeout: No response from RabbitMQ for queue: ${queue}`));
            }, 20000); // Adjust timeout as needed

            // Store the resolve handler for this correlation ID
            responseHandlers[correlationId] = (response: any) => {
                clearTimeout(timeout);
                resolve(response);
            };

            // Send the message
            if (sharedReplyQueue) {
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                    replyTo: sharedReplyQueue.queue,
                    correlationId, // Now correlationId is properly declared
                });
            } else {
                reject(new Error("Shared reply queue is not initialized"));
            }
        });
    } catch (error) {
        console.error(`Error in fetchDataFromQueue for queue ${queue}:`, error);
        throw error;
    }
};





// Function to close RabbitMQ connection and channel gracefully
export async function closeRabbitMQ() {
    try {
        if (channel) {
            await channel.close();
            console.log("RabbitMQ channel closed.");
        }
        if (connection) {
            await connection.close();
            console.log("RabbitMQ connection closed.");
        }
    } catch (err) {
        console.error("Error closing RabbitMQ:", err);
    } finally {
        connection = null;
        channel = null;
    }
}

// Generate a unique ID for correlation
function generateUuid(): string {
    return `${Math.random().toString(36).substring(2)}-${Math.random().toString(36).substring(2)}`;
}
