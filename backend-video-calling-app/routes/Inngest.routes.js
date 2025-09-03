import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { startSession } from "../controllers/inngest.controller.js";

const router = express.Router()


router.patch("/:sessionId/end", authenticate, startSession)

export default router;