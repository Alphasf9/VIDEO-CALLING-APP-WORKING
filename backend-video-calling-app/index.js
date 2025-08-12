import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    res.send("✅ WebRTC Signaling Server is running");
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    socket.on("join-room", (data) => {
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        socket.join(room);

        io.to(room).emit("user:joined", { email, id: socket.id });
        io.to(socket.id).emit("join-room", data);
    });

    socket.on("offer-created", ({ offer, to }) => {
        io.to(to).emit("offer-received", { offer, from: socket.id });
    });

    socket.on("answer-created", ({ answer, to }) => {
        io.to(to).emit("answer-received", { answer, from: socket.id });
    });

    socket.on("disconnect", () => {
        console.log(`🔴 User disconnected: ${socket.id}`);
    });
});


const PORT = 8000;
server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
