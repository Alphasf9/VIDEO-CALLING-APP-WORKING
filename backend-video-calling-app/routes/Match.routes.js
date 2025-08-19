import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { matchLearnerToEducator } from "../controllers/Matching.controller.js";

const router = express.Router();



router.post("/match", authenticate, matchLearnerToEducator)

export default router;