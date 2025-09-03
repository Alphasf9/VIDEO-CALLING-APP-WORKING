import { generateGist } from "../service/ai.service.js";
import * as Message from "../models/Message.model.js";
import { v4 as uuidv4 } from "uuid";

export async function getTranscriptGist(req, res) {
    try {
        const { transcript, userId, sessionId } = req.body;

        if (!transcript || !userId || !sessionId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingMessages = await Message.queryBySession(sessionId, 1);
        const previousGist = existingMessages?.[0]?.gist || "";

        const updatedGist = await generateGist(transcript, previousGist);

        const timestamp = new Date().toISOString();

        const messageItem = {
            sessionId,
            timestamp,
            messageId: uuidv4(),
            userId,
            gist: updatedGist,
            originalTranscript: transcript,
        };

        await Message.put(messageItem);

        return res.status(200).json({
            gist: updatedGist,
            saved: true,
            message: "Transcription saved successfully",
        });
    } catch (error) {
        console.error("Error in getTranscriptGist:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
