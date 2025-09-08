import express from "express";
import { authenticate, isEducator, isLearner } from "../middleware/auth.middleware.js";
import { createRating, getRatingsForUser, getTopRatedEducators, getTopRatedLearners } from "../controllers/Rating.controller.js";
;

const router = express.Router();



router.post("/create-rating", authenticate, createRating)

router.get("/get-ratings/:toUserId", authenticate, getRatingsForUser)

router.get("/top-rated-educators", authenticate, isLearner, getTopRatedEducators)

router.get("/top-rated-learners", authenticate, isEducator, getTopRatedLearners)

export default router;