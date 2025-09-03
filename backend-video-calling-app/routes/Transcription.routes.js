import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { getTranscriptGist } from "../controllers/Transcription.controller.js";

const router = express.Router();

router.post("/transcription-gist", authenticate, getTranscriptGist);

export default router;