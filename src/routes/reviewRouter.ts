import express from "express";
import { Review as Reviews } from "../other_services/model/seqModel";
import logger from "../other_services/winstonLogger";
import { fetchDataFromQueue, createChannel } from "../other_services/rabbitMQ";
import verifyUser from "./authenticateUser";

const router = express.Router();


//Fetching delete reviews
router.get("/deleted/reviews", verifyUser, async (req, res) => {
    try {
        // Fetch soft-deleted reviews from the database
        const reviews = await Reviews.findAll({ where: { isBlocked: true } });

        console.log("Fetched soft-deleted reviews from the database:", reviews);

        // Enrich the reviews with additional data (user, media, genres)
        const enrichedReviews = await Promise.all(reviews.map(enrichReview));

        res.status(200).json(enrichedReviews);
    } catch (error) {
        console.error("Error fetching soft-deleted reviews:", error);
        res.status(500).send("Something went wrong while fetching soft-deleted reviews.");
    }
});



export async function enrichReview(review: any) {
    const [user, media, genres] = await Promise.all([
        fetchDataFromQueue("user-service", { userId: review.user_fk }),
        fetchDataFromQueue("media-service", { mediaId: review.media_fk }),
        fetchDataFromQueue("genre-service", { reviewId: review.id }),
    ]);

    if(review.length === 0){
        console.log("No soft-deleted reviews found.");
        return { error: "No soft-deleted reviews found." };
    };

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
}

export default router;


