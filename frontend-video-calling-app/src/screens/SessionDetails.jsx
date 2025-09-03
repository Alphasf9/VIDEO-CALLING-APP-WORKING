import React, { useState, useEffect } from "react";
import api from "../api/AxiosInstance";
import { FaCommentAlt, FaExclamationTriangle } from "react-icons/fa";

const SessionDetails = ({ requestId }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!requestId) return;
      try {
        setLoading(true);
        const { data } = await api.get(`/session-requests/${requestId}`);
        console.log("✅ Session Data:", data);
        setSession(data.session || null);
        setError(null);
      } catch (err) {
        setError("Failed to fetch session details. Please try again.");
        console.error("❌ Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [requestId]);

  if (loading) {
    return (
      <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 text-center animate-fade-in">
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-progress"></div>
        </div>
        <p className="text-gray-700 text-lg font-medium mt-4">
          Loading session details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 text-center animate-fade-in">
        <FaExclamationTriangle className="text-red-500 text-4xl mb-4 mx-auto" />
        <p className="text-gray-700 text-lg font-medium">{error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <FaCommentAlt className="text-5xl text-indigo-300 mb-4 mx-auto" />
        <p className="text-gray-700 text-lg font-semibold">No session found.</p>
        <p className="text-gray-500 text-md mt-2">
          Start a session to see details here!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center space-x-3">
        <FaCommentAlt className="text-indigo-600 text-3xl" />
        <span>Session Details</span>
      </h2>

      {/* Session Transcript */}
      <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50 shadow-inner">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          Transcript
        </h3>
        <p className="text-gray-700 text-md leading-relaxed font-medium">
          {session.transcript || "No transcript available"}
        </p>
      </div>

      {/* Session Gist */}
      {session.gist && (
        <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50 shadow-inner">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Gist</h3>
          <p className="text-gray-700 text-md leading-relaxed">{session.gist}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
        <p className="font-semibold text-gray-800 text-lg">
          Speaker: {session.speaker}
        </p>
        <p className="text-gray-600 text-md">
          Room: <span className="font-medium">{session.roomId}</span>
        </p>
        <p className="text-gray-600 text-md">
          Time:{" "}
          {new Date(session.timestamp).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SessionDetails;
