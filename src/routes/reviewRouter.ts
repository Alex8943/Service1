import express from "express";
import { Review as Reviews } from "../other_services/model/seqModel";
import logger from "../other_services/winstonLogger";
import { fetchDataFromQueue, createChannel } from "../other_services/rabbitMQ";
import verifyUser from "./authenticateUser";

const router = express.Router();


//Fetching delete reviews
router.get("/deleted/reviews", verifyUser, async (req, res) => {
    try {
        const queue = "soft-deleted-reviews-service";
        const reviews = await fetchDataFromQueue(queue, {});
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching soft-deleted reviews:", error);
        res.status(500).send("Something went wrong while fetching soft-deleted reviews.");
    }
});


/*
// old logic to fetch soft-deleted reviews
export async function getSoftDeletedReviews() {
    let channel = null;
    try {
        // Reuse the RabbitMQ channel
        const rabbitMQ = await createChannel();
        channel = rabbitMQ.channel;

        // Fetch all soft-deleted reviews
        const reviews = await Reviews.findAll({
            where: { isBlocked: true }, // Fetch soft-deleted reviews
        });

        if (reviews.length === 0) {
            console.log("No soft-deleted reviews found.");
            return [];
        }

        console.log("Fetched soft-deleted reviews from the database:", reviews);

        // Enrich each review with related data
        const enrichedReviews = await Promise.all(
            reviews.map(async (review) => {
                const [user, media, genres] = await Promise.all([
                    fetchDataFromQueue("user-service", { userId: review.user_fk }),
                    fetchDataFromQueue("media-service", { mediaId: review.media_fk }),
                    fetchDataFromQueue("review-genres-service", { reviewId: review.id }),
                ]);

                return {
                    id: review.id,
                    title: review.title,
                    description: review.description,
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt,
                    user: user || { error: "User not found" },
                    media: media || { error: "Media not found" },
                    genres: genres || [],
                };
            })
        );

        return enrichedReviews;
    } catch (error) {
        console.error("Error enriching soft-deleted reviews:", error);
        throw error;
    } finally {
        // Close the channel if necessary
        if (channel) {
            await channel.close();
            console.log("RabbitMQ channel closed after processing.");
        }
    }
}
    */


export default router;
