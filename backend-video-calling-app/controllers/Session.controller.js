import * as SessionModel from "../models/Session.model.js";
import { z } from "zod";

export const sessionSchema = z.object({
    sessionId: z.string().min(1, "Session ID is required"),
    participants: z.array(z.string().min(1, "Participants are required"))
        .nonempty("At least one participant is required"),
    status: z.enum(["active", "ended"]).default("active"),
    startedAt: z.string().default(() => new Date().toISOString()),
    endedAt: z.string().optional(),
    sessionType: z.enum(["video", "audio"]).default("video"),
    metadata: z.record(z.any()).default({}),
});


export const createSession = async (req, res) => {
    try {
        console.log("🚀 [Controller] createSession called");
        console.log("📥 Request body:", req.body);

        const { sessionId, participants, status } = req.body;

        if (!sessionId || !participants || !Array.isArray(participants) || participants.length === 0) {
            console.log("❌ Invalid session data");
            return res.status(400).json({ message: "Invalid session data" });
        }

        console.log("➡️ Calling SessionModel.createSession...");
        const session = await SessionModel.createSession({
            sessionId,
            participants,
            status: status || "active",
        });

        console.log("✅ [Controller] Session created:", session);

        return res.status(201).json({
            message: "Session created successfully",
            session,
        });
    } catch (error) {
        console.error("❌ Error creating session:", error);
        return res.status(500).json({ message: "Error creating session" });
    }
};






export const getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await SessionModel.getSession(sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });
        return res.status(200).json({ session });
    } catch (error) {
        console.error("Error fetching session:", error);
        return res.status(500).json({ message: "Error fetching session" });
    }
};

export const endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await SessionModel.endSession(sessionId);
        return res.status(200).json({ message: "Session ended", session });
    } catch (error) {
        console.error("Error ending session:", error);
        return res.status(500).json({ message: "Error ending session" });
    }
};

export const addParticipant = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { participant } = req.body;
        const session = await SessionModel.addParticipantToSession(sessionId, participant);
        return res.status(200).json({ message: "Participant added", session });
    } catch (error) {
        console.error("Error adding participant:", error);
        return res.status(500).json({ message: "Error adding participant" });
    }
};


