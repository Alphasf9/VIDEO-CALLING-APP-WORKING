import * as SessionRequest from "../models/SessionRequest.model.js";
import { inngest } from "../inngest/client.js";
import * as SessionModel from "../models/Session.model.js";





export const createSessionPeruser = async (req, res) => {
    try {


        const { requestId, sessionId, participants, status, metadata } = req.body;

        if (!sessionId || !participants || !Array.isArray(participants) || participants.length === 0) {
            console.log("❌ Invalid session data");
            return res.status(400).json({ message: "Invalid session data" });
        }


        const session = await SessionModel.createSession({
            requestId,
            sessionId,
            participants,
            status: status || "active",
            metadata: metadata || {},
        });



        return res.status(201).json({
            message: "Session created successfully",
            session,
        });
    } catch (error) {
        console.error("❌ Error creating session:", error);
        return res.status(500).json({ message: "Error creating session" });
    }
};




export const getSessionPeruser = async (req, res) => {
    try {
        const { requestId } = req.params;

        const session = await SessionRequest.getSession(requestId);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        return res.status(200).json({ session });
    } catch (error) {
        console.error("Error fetching session:", error);
        return res.status(500).json({ message: "Error fetching session" });
    }
};







export const endSessionOfUser = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { transcript, speaker, roomId, requestId } = req.body;

        const session = await SessionRequest.endSession(requestId);

        await inngest.send({
            name: "session/end",
            data: {
                sessionId,
                roomId,
                requestId,
                userId: req.user?.id || "unknown",
                transcript,
                speaker
            },
        });

        res.json({ message: "Session ended and event sent", session });
    } catch (err) {
        console.error("❌ Error ending session:", err);
        res.status(500).json({ error: "Failed to end session" });
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


export const getAllSessionsOfUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "UserId is required" });
        }

        const sessions = await SessionRequest.getSessionsByUser(userId);

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ message: "No sessions found for this user" });
        }

        return res.status(200).json({ sessions });
    } catch (error) {
        console.error("❌ Error fetching sessions for user:", error);
        return res.status(500).json({ message: "Error fetching sessions" });
    }
};








