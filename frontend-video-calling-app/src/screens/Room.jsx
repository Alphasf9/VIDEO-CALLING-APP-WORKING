/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useParams } from "react-router-dom";
import api from "../api/AxiosInstance";
import { useUser } from "../context/UserContext";
import { useEducator } from "../context/EducatorContext";

const Room = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const { user } = useUser();
  const { educator } = useEducator();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [participants, setParticipants] = useState([]);

  const localVideoRef = useRef(null);
  const pcsRef = useRef({});

  const startLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    setParticipants([user.email]);

    socket.emit("join-room", { room: roomId, email: user.email });
    console.log(`📡 Joined room: ${roomId} as ${user.email}`);
  };

  const handleSessions = async (finalParticipants) => {
    try {
      const response = await api.post("/sessions/create-session", {
        sessionId: roomId,
        participants: finalParticipants,
        status: "active",
        sessionType: "video",
        metadata: { startedBy: user.email },
      });

      console.log("✅ Session created:", response.data.session);
      window.sessionCreated = true;
    } catch (error) {
      console.error("❌ Error creating session:", error.response?.data || error.message);
    }
  };

  const endSession = async () => {
    if (!window.sessionCreated) return;
    try {
      await api.patch(`/sessions/${roomId}/end`);
      console.log("🛑 Session ended:", roomId);
      window.sessionCreated = false;
    } catch (error) {
      console.error("❌ Error ending session:", error.response?.data || error.message);
    }
  };

  const createPeerConnection = (socketId) => {
    if (pcsRef.current[socketId]) return pcsRef.current[socketId];

    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pcsRef.current[socketId] = pc;

    localStream?.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams((prev) => ({ ...prev, [socketId]: remoteStream }));
      console.log("📹 Remote track received from", socketId);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, to: socketId });
      }
    };

    return pc;
  };

  useEffect(() => {
    socket.on("user:joined", async ({ email, id }) => {
      console.log("🟢 User joined:", email, id);

      setParticipants((prev) => {
        const updated = prev.includes(email) ? prev : [...prev, email];

        if (updated.length === 2 && educator?.role === "educator" && !window.sessionCreated) {
          handleSessions(updated);
        }
        return updated;
      });

      const pc = createPeerConnection(id);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer-created", { offer, to: id });
      console.log("📤 Offer sent to", id);
    });

    socket.on("offer-received", async ({ offer, from }) => {
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer-created", { answer, to: from });
      console.log("📤 Answer sent to", from);
    });

    socket.on("answer-received", async ({ answer, from }) => {
      const pc = pcsRef.current[from];
      if (pc) await pc.setRemoteDescription(answer);
      console.log("✅ Answer received from", from);
    });

    socket.on("ice-candidate", async ({ candidate, from }) => {
      const pc = pcsRef.current[from];
      if (pc) await pc.addIceCandidate(candidate);
      console.log("🧊 ICE candidate received from", from);
    });

    const handleBeforeUnload = () => {
      endSession();
      socket.disconnect();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.off("user:joined");
      socket.off("offer-received");
      socket.off("answer-received");
      socket.off("ice-candidate");
      window.removeEventListener("beforeunload", handleBeforeUnload);

      endSession();
    };
  }, [socket, localStream]);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Room: {roomId}</h1>

      {!localStream && (
        <button onClick={startLocalStream} className="btn btn-primary px-6 py-2 rounded">
          Join Video Call
        </button>
      )}

      <div className="grid grid-cols-2 gap-4 mt-6">
        <video playsInline muted autoPlay ref={localVideoRef} className="w-full h-[300px] bg-black" />
        {Object.values(remoteStreams).map((stream, idx) => (
          <video
            key={idx}
            playsInline
            autoPlay
            ref={(el) => el && (el.srcObject = stream)}
            className="w-full h-[300px] bg-black"
          />
        ))}
      </div>
    </div>
  );
};

export default Room;
