import { inngest } from "../inngest/client.js";


export const endSessionWithGist = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { transcript, userId } = req.body;

        if (!transcript || !userId) {
            return res.status(400).json({ message: "Missing transcript or userId" });
        }

        const result = await inngest.send({
            name: "session/end",
            data: { sessionId, transcript, userId },
        });

        return res.status(200).json({
            message: "Session ended and gist generated",
            gist: result.data.gist,
            session: result.data.session,
        });
    } catch (error) {
        console.error("❌ Error ending session with gist:", error);
        return res.status(500).json({ message: "Error ending session" });
    }
};



export const startSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await SessionModel.endSession(sessionId);

        const transcript = await TranscriptModel.getBySession(sessionId);

        await inngest.send({
            name: "session/end",
            data: {
                sessionId,
                userId: req.user?.id || "unknown",
                transcript: transcript?.text || "",
            },
        });

        res.json({ message: "Session ended and event sent", session });
    } catch (err) {
        console.error("❌ Error ending session:", err);
        res.status(500).json({ error: "Failed to end session" });
    }
};
