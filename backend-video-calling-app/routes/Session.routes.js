import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createSession, endSession, getSession } from "../controllers/Session.controller.js";

const router = express.Router()


router.post("/create-session", authenticate, createSession)

router.get("/:sessionId", authenticate, getSession)

router.patch("/:sessionId/end", authenticate, endSession);


export default router;