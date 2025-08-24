import express from "express";

import { authenticate, isEducator, isLearner } from "../middleware/auth.middleware.js";
import { matchEducatorToLearners, matchLearnerToEducator } from "../controllers/Matching.controller.js";

const router = express.Router();



router.post("/match/learner-to-educator", authenticate, isLearner, matchLearnerToEducator)
router.post("/match/educator-to-learner", authenticate, isEducator, matchEducatorToLearners)

export default router;