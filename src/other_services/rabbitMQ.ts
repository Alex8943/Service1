import amqp, { Channel, Connection } from "amqplib";
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

// Function to fetch data from a queue
export const fetchDataFromQueue = async (queue: string, message: any): Promise<any> => {
    try {
        const { channel } = await createChannel();
        const replyQueue = await channel.assertQueue("", { exclusive: true });
        const correlationId = generateUuid();

        console.log(`Sending message to queue: ${queue}`);
        console.log(`Message: ${JSON.stringify(message)}`);
        console.log(`Correlation ID: ${correlationId}`);

        return new Promise((resolve, reject) => {
            let resolved = false;
            const timeout = setTimeout(() => {
                if (!resolved) {
                    console.error(`Timeout reached for queue: ${queue}, correlationId: ${correlationId}`);
                    reject(new Error(`Request timeout: No response from RabbitMQ for queue: ${queue}`));
                }
            }, 10000); // 10-second timeout

            // Consume the response from the reply queue
            
            channel.consume(
                replyQueue.queue,
                (msg) => {
                    if (msg && msg.properties.correlationId === correlationId) {
                        resolved = true;
                        clearTimeout(timeout);
                        const response = JSON.parse(msg.content.toString());
                        console.log(`Received response from queue: ${queue}`);
                        resolve(response);

                        // Cancel the consumer and delete the reply queue
                        channel.cancel(msg.fields.consumerTag).catch((err) => console.error("Error canceling consumer:", err));
                        channel.deleteQueue(replyQueue.queue).catch((err) => console.error("Error deleting reply queue:", err));
                    }
                },
                { noAck: true }
            );

            // Send the message to the queue
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                replyTo: replyQueue.queue,
                correlationId,
            });
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
