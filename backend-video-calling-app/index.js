import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import userRoutes from "./routes/User.routes.js";
import matchRoutes from "./routes/Match.routes.js";
import { updateUserAvailability } from "./models/User.model.js";

const app = express();

// --- Middleware ---
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// --- Test route ---
app.get("/", (req, res) => {
    res.send("✅ WebRTC Signaling Server is running");
});

// --- Create HTTP server ---
const server = http.createServer(app);

// --- Socket.IO setup ---
const io = new Server(server, {
    cors: { origin: "*" },
});

// --- Maps to track users ---
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();
const educatorIdToSocketIdMap = new Map();
const learnerIdToSocketIdMap = new Map();

// --- Socket.IO connection ---
io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    // --- Update availability for educator/learner ---
    socket.on("update-availability", async ({ userId, socketId, status, educatorId }) => {
        console.log(`Educator ID: ${educatorId} has socket ${socket.id}`);
        educatorIdToSocketIdMap.set(educatorId, socket.id);
        await updateUserAvailability(userId, socketId, status);
    });

    // --- Join room ---
    socket.on("join-room", ({ email, room }) => {
        console.log(`${email} joining room ${room}`);
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        socket.join(room);
        io.to(room).emit("user:joined", { email, id: socket.id });
        io.to(socket.id).emit("join-room", { email, room });
    });

    // --- WebRTC signaling ---
    socket.on("offer-created", ({ offer, to }) => {
        console.log(`Offer from ${socket.id} to ${to}`);
        io.to(to).emit("offer-received", { offer, from: socket.id });
    });

    socket.on("answer-created", ({ answer, to }) => {
        console.log(`Answer from ${socket.id} to ${to}`);
        io.to(to).emit("answer-received", { answer, from: socket.id });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
        console.log(`ICE candidate from ${socket.id} to ${to}`);
        io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    // --- Connection requests (educator/learner logic untouched) ---
    socket.on("connection-request-by-learner", ({ from, educatorId }) => {
        console.log(`🟢 Connection request by learner: ${from} to educator: ${educatorId}`);
        const educatorSocketId = educatorIdToSocketIdMap.get(educatorId);
        learnerIdToSocketIdMap.set(from, socket.id);

        if (!educatorSocketId) {
            console.log(`❌ Educator ${educatorId} is offline`);
            return;
        }

        io.to(educatorSocketId).emit("connection-request-by-educator", { from });
    });

    socket.on("educator-accepted-room", ({ educatorId, learnerId, roomId ,userId}) => {
        console.log("Educator accepted request, relaying to learner...");
        const learnerSocketId = learnerIdToSocketIdMap.get(learnerId);

        if (!learnerSocketId) {
            console.log(`❌ Learner ${learnerId} is offline`);
            return;
        }

        console.log("🟢 Relaying educator acceptance to learner");
        io.to(learnerSocketId).emit("join-educator-room", {
            educatorId,
            learnerId,
            roomId,
            userId
        });
    });

    // --- Disconnect handler ---
    socket.on("disconnect", () => {
        console.log(`🔴 User disconnected: ${socket.id}`);
    });
});

// --- API routes ---
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/matches', matchRoutes);

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
