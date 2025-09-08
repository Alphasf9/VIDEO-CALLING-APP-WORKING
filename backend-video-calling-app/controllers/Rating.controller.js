import * as RatingModel from "../models/Rating.model.js";
import { v4 as uuidv4 } from 'uuid';
import * as UserModel from '../models/User.model.js';

export const createRating = async (req, res) => {
    try {
        const { fromUserId, toUserId, rating, comment } = req.body;

        if (!fromUserId || !toUserId || rating === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5." });
        }

        const sessionId = uuidv4();

        const newRating = await RatingModel.createRating({
            sessionId,
            fromUserId,
            toUserId,
            rating: Number(rating),
            comment
        });

        if (!newRating) {
            return res.status(500).json({ error: "Error creating rating, something went wrong" });
        }

        const avgRating = await RatingModel.calculateAverageRating(toUserId);

        await UserModel.updateUser(toUserId, {
            rating: avgRating
        });

        return res.status(201).json({
            message: "Rating created successfully",
            rating: newRating,
            avgRating
        });

    } catch (error) {
        console.error("Error creating rating:", error);
        res.status(500).json({ error: "Internal server error while creating rating" });
    }
};



export const getRatingsForUser = async (req, res) => {
    try {
        const { toUserId } = req.params;

        if (!toUserId) {
            return res.status(400).json({ error: "Missing toUserId parameter" });
        }

        const ratings = await RatingModel.getRatingsForUser(toUserId);

        if (!ratings || ratings.length === 0) {
            return res.status(404).json({ error: "No ratings found for the user" });
        }

        return res.status(200).json({
            message: "Ratings fetched successfully",
            ratings
        });

    } catch (error) {
        console.error("Error fetching ratings for user:", error);
        res.status(500).json({ error: "Internal server error while fetching ratings for user" });
    }
}



export const getTopRatedEducators = async (req, res) => {
    try {
        const topUsers = await RatingModel.getTopRatedEducators(5);

        const topEducatorsWithInfo = await Promise.all(
            topUsers.map(async (u) => {
                const user = await UserModel.getUser(u.userId);
                return {
                    userId: u.userId,
                    avgRating: u.avgRating,
                    name: user?.name,
                    avatarUrl: user?.avatarUrl,
                    skills: user?.skills || []
                };
            })
        );

        res.status(200).json({
            message: "Top rated educators fetched successfully",
            topEducators: topEducatorsWithInfo
        });

    } catch (error) {
        console.error("Error fetching top rated educators:", error);
        res.status(500).json({ error: "Internal server error while fetching top rated educators" });
    }
};




export const getTopRatedLearners = async (req, res) => {
    try {
        const topUsers = await RatingModel.getTopRatedLearners(5);

        // console.log("All learners:", topUsers);

        const topLearnersWithInfo = await Promise.all(
            topUsers.map(async (u) => {
                const user = await UserModel.getUser(u.userId);
                return {
                    userId: u.userId,
                    avgRating: u.avgRating,
                    name: user?.name,
                    avatarUrl: user?.avatarUrl,
                    skills: user?.skills || []
                };
            })
        );

        res.status(200).json({
            message: "Top rated learners fetched successfully",
            topLearners: topLearnersWithInfo
        });

    } catch (error) {
        console.error("Error fetching top rated educators:", error);
        res.status(500).json({ error: "Internal server error while fetching top rated educators" });
    }
}
