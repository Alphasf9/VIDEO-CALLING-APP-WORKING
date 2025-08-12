import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import Peer from '../service/Peer.js';

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Loading messages to cycle through
  const loadingMessages = [
    "Preparing your video call experience...",
    "Searching for your meeting partner...",
    "Establishing a secure connection...",
    "Getting ready to connect you..."
  ];

  // Cycle loading messages every 3 seconds
  useEffect(() => {
    if (!remoteSocketId) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loadingMessages.length, remoteSocketId]);

  // Listen for remote tracks instantly
  useEffect(() => {
    Peer.onTrack((stream) => {
      console.log("📹 Remote stream received");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });
  }, []);

  const startConnection = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    stream.getTracks().forEach((track) => {
      Peer.peer.addTrack(track, stream);
    });
    if (remoteSocketId) {
      const offer = await Peer.getOffer();
      socket.emit("offer-created", { offer, to: remoteSocketId });
    }
  }, [remoteSocketId, socket]);

  const handleJoinUser = useCallback(
    ({ email, id }) => {
      console.log(`👤 ${id} joined (${email})`);
      setRemoteSocketId(id);
      if (localStream) {
        Peer.getOffer().then((offer) => {
          socket.emit("offer-created", { offer, to: id });
        });
      }
    },
    [socket, localStream]
  );

  const handleOfferReceived = useCallback(
    async ({ offer, from }) => {
      console.log("📩 Offer received from", from);
      setRemoteSocketId(from);
      const answer = await Peer.getAnswer(offer);
      socket.emit("answer-created", { answer, to: from });
    },
    [socket]
  );

  const handleAnswerReceived = useCallback(async ({ answer }) => {
    console.log("📩 Answer received");
    await Peer.setLocalDescription(answer);
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleJoinUser);
    socket.on("offer-received", handleOfferReceived);
    socket.on("answer-received", handleAnswerReceived);
    return () => {
      socket.off("user:joined", handleJoinUser);
      socket.off("offer-received", handleOfferReceived);
      socket.off("answer-received", handleAnswerReceived);
    };
  }, [socket, handleJoinUser, handleOfferReceived, handleAnswerReceived]);

  // Sample user reviews
  const reviews = [
    {
      name: "Dr. Emily Harper",
      role: "Chief Technology Officer",
      review: "VideoSync delivers unmatched video quality and reliability, transforming our global team meetings into seamless experiences.",
      rating: 5,
    },
    {
      name: "James Patel",
      role: "Project Manager",
      review: "The intuitive interface and robust performance make VideoSync the perfect tool for coordinating with clients worldwide.",
      rating: 4,
    },
    {
      name: "Sophia Nguyen",
      role: "Educator & Consultant",
      review: "VideoSync's elegant design and flawless connectivity have elevated my virtual workshops to a professional standard.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center gap-8 p-6 md:p-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          VideoSync Meeting Room
        </h1>
        <p className="text-gray-600 text-lg md:text-xl font-medium mt-2">
          Connect seamlessly with crystal-clear video and audio
        </p>
      </div>

      {/* Connection Status and Loading */}
      {!remoteSocketId ? (
        <div className="flex flex-col items-center space-y-4 text-center max-w-sm">
          <span className="loading loading-infinity loading-xl text-blue-600"></span>
          <p className="text-gray-700 text-base md:text-lg font-medium animate-pulse">
            {loadingMessages[loadingMessageIndex]}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Connected to your meeting partner
        </div>
      )}

      {/* Join Button */}
      {!localStream && (
        <button
          onClick={startConnection}
          className="btn btn-primary btn-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-white bg-blue-600 hover:bg-blue-700"
        >
          Join Video Call
        </button>
      )}

      {/* Video Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mt-10">
        <div className="card bg-white shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          <div className="card-body p-4">
            <h2 className="card-title text-gray-800 text-xl font-bold">Your Video</h2>
            <video
              playsInline
              muted
              autoPlay
              ref={localVideoRef}
              className="rounded-xl w-full h-[400px] bg-black border border-gray-200"
            />
          </div>
        </div>

        <div className="card bg-white shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          <div className="card-body p-4">
            <h2 className="card-title text-gray-800 text-xl font-bold">Partner's Video</h2>
            <video
              playsInline
              autoPlay
              ref={remoteVideoRef}
              className="rounded-xl w-full h-[400px] bg-black border border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="w-full max-w-5xl mt-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
          Trusted by Industry Leaders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118l-3.39-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm italic mb-4">"{review.review}"</p>
              <div>
                <p className="text-gray-800 font-semibold">{review.name}</p>
                <p className="text-gray-500 text-sm">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Room;