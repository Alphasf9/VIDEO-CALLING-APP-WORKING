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
import sessionRoutes from "./routes/Session.routes.js";
import { updateUserAvailability } from "./models/User.model.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("✅ WebRTC Signaling Server is running");
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" },
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();
const educatorIdToSocketIdMap = new Map();
const learnerIdToSocketIdMap = new Map();

io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    socket.on("user:register", ({ learnerId, role }) => {
        if (role === 'learner') learnerIdToSocketIdMap.set(learnerId, socket.id);
        if (role === 'educator') educatorIdToSocketIdMap.set(learnerId, socket.id);

        console.log(`User Signup:- Learner ID: ${learnerId} has socket ${socket.id} and its role is ${role}`);
    });

    socket.on("learner:login", ({ learnerId, role }) => {
        learnerIdToSocketIdMap.set(learnerId, socket.id);
        console.log(`Learner Login:- Learner ID: ${learnerId} has socket ${socket.id}`);
    })

    socket.on("educator:login", ({ educatorId, role }) => {
        educatorIdToSocketIdMap.set(educatorId, socket.id);
        console.log(`Educator Login:- Educator ID: ${educatorId} has socket ${socket.id}`);
    })

    socket.on("update-availability", async ({ userId, socketId, status, educatorId }) => {
        // console.log(`Educator ID: ${educatorId} has socket ${socket.id}`);
        educatorIdToSocketIdMap.set(educatorId, socket.id);
        if (!userId) return;
        await updateUserAvailability(userId, socketId, status);
    });
    socket.on("register:user", ({ userId }) => {
        console.log(`User Signup:- User ID: ${userId} has socket ${socket.id}`);
        educatorIdToSocketIdMap.set(userId, socket.id);
        
    });

    socket.on("join-room", ({ email, room }) => {
        console.log(`${email} joining room ${room}`);
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        socket.join(room);
        io.to(room).emit("user:joined", { email, id: socket.id });
        io.to(socket.id).emit("join-room", { email, room });
    });

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

    socket.on("educator-accepted-room", ({ educatorId, learnerId, roomId, userId }) => {
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


    socket.on("connection-request-by-educator", ({ from, learnerId }) => {
        console.log(`🟢 Connection request by educator: ${from} to learner: ${learnerId}`);
        const learnerSocketId = learnerIdToSocketIdMap.get(learnerId);
        console.log(`Learner socket ID: ${learnerSocketId}`);
        educatorIdToSocketIdMap.set(from, socket.id);
        if (!learnerSocketId) {
            console.log(`❌ Learner ${learnerId} is offline`);
            return;
        }
        io.to(learnerSocketId).emit("connection-request-by-learner", { from });
    })

    socket.on("disconnect", () => {
        console.log(`🔴 User disconnected: ${socket.id}`);
    });
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/sessions', sessionRoutes);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
