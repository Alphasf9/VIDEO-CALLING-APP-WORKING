import React, { useEffect } from "react";
import { useEducator } from "../context/EducatorContext";
import { Star, ArrowRight } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { useUser } from "../context/UserContext";

const MatchedLearner = () => {
    const { educator } = useEducator();
    // console.log(educator)
    const { user } = useUser();
   

    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
        });

        socket.on("connection-request-ack", (data) => {
            console.log("Server acknowledged connection request:", data);
        });

        return () => {
            socket.off("connect");
            socket.off("connection-request-ack");
        };
    }, [socket]);

    if (!educator) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-700 font-medium">
                Loading learners...
            </div>
        );
    }

    const { bestMatch, topMatches } = educator;
    const filteredMatches = topMatches?.filter(
        (m) => m.learnerId !== bestMatch?.learnerId
    );
    const displayMatches = bestMatch ? [bestMatch, ...filteredMatches] : filteredMatches;


    const handleConnectionToLearner = (learnerId) => {
        console.log("Connection request sent to learner:", learnerId);
        if (!socket || !socket.connected) {
            console.warn("Socket not connected!");
            return;
        }

        socket.emit("connection-request-by-educator", {
            from: user.userId,
            learnerId
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-center text-indigo-900 mb-12 flex items-center justify-center space-x-2">
                <Star className="w-8 h-8 text-yellow-400 animate-spin-slow" />
                <span>Matched Learners</span>
                <Star className="w-8 h-8 text-yellow-400 animate-spin-slow" />
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayMatches?.map((learner, index) => (
                    <div
                        key={learner.learnerId}
                        className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer group"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-center relative">
                            {learner.topTopics?.[0] && (
                                <p className="text-white font-bold text-lg">
                                    Top Match Score: {learner.topTopics[0].similarityScore.toFixed(2)}%
                                </p>
                            )}
                            {index === 0 && (
                                <div className="absolute top-4 right-4 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 animate-bounce">
                                    <Star className="w-4 h-4" />
                                    <span>Best Match</span>
                                </div>
                            )}
                        </div>

                        {/* Learner Info */}
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                {learner.name || learner.learnerName}
                            </h3>
                            <p className="text-gray-600 mb-2 line-clamp-3">{learner.bio}</p>

                            {learner.lastOnline && (
                                <p className="text-gray-500 text-sm mb-4">
                                    Last Online: {new Date(learner.lastOnline).toLocaleString()}
                                </p>
                            )}

                            {learner.topics?.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">All Topics:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {learner.topics.map((topic, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {learner.educatorSkills?.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Skills Match:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {learner.educatorSkills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {learner.topTopics?.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Topics & Similarity:</h4>
                                    <div className="flex flex-col gap-1">
                                        {learner.topTopics.map((topic, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                                                    {topic.learnerTopic}
                                                </span>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {topic.similarityScore.toFixed(2)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Connect Button */}
                        <div className="px-6 pb-6">
                            <button
                                onClick={() => handleConnectionToLearner(learner.learnerId)}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-xl"
                            >
                                <span>Connect to Learner</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>
        </div>
    );
};

export default MatchedLearner;
