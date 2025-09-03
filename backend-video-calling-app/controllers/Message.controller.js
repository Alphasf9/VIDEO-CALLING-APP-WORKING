import * as MessageModel from "../models/Message.model.js";



export const getSessionMessages = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { userId } = req.query; 

        if (!sessionId) {
            return res.status(400).json({ error: "sessionId is required" });
        }

        let messages = await MessageModel.getMessagesBySession(sessionId, 1000);

        if (userId) {
            messages = messages.filter((m) => m.userId === userId);
        }

        const formattedMessages = messages.map((m) => ({
            transcript: m.transcript,
            originalTranscript: m.originalTranscript || m.transcript,
            gist: m.gist || null,
            speaker: m.speaker,
            timestamp: m.timestamp,
            userId: m.userId,
            messageId: m.messageId,
        }));

        const fullTranscript = formattedMessages.map((m) => m.transcript).join(" ");

        res.json({
            sessionId,
            userId: userId || "all",
            fullTranscript,
            messages: formattedMessages,
        });
    } catch (err) {
        console.error("❌ Error fetching messages:", err);
        res.status(500).json({ error: "Failed to fetch session messages" });
    }
};