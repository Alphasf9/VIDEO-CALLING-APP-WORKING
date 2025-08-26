import React from "react";
import { useEducator } from "../context/EducatorContext";
import { useUser } from "../context/UserContext";
import { useSocket } from "../context/SocketContext";
import { Loader2, Star, ArrowRight } from "lucide-react";


const MatchedEducator = () => {
    const { educator } = useEducator();
    const { user } = useUser();
    const socket = useSocket();

   


    const topEducators = educator?.topMatches || [];
    const bestMatchRaw = educator?.bestMatch;


    if ((!topEducators.length && !bestMatchRaw) || !educator) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
                <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

                <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Finding Your Perfect Educators...
                </h2>
                <p className="text-lg text-gray-600 max-w-md text-center">
                    We're matching your interests with the best minds. Hang tight!
                </p>
                <div className="mt-4 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 animate-progress"></div>
                </div>
            </div>
        );
    }

    const bestMatch = bestMatchRaw
        ? {
            educatorId: bestMatchRaw.educatorId,
            educatorName: bestMatchRaw.name,
            educatorSkills: bestMatchRaw.skills,
            bio: bestMatchRaw.bio,
            learnerTopic: bestMatchRaw.subject,
            similarityScore: bestMatchRaw.similarityScore,
        }
        : null;

    const filteredMatches = topEducators.filter(
        (edu) => edu.educatorId !== bestMatch?.educatorId
    );

    const displayMatches = bestMatch ? [bestMatch, ...filteredMatches] : filteredMatches;

    
    const sortedEducators = displayMatches.sort(
        (a, b) => b.similarityScore - a.similarityScore
    );

    const sendConnectionRequest = (educatorId) => {
        alert("Connection request sent successfully!");
        socket.emit("connection-request-by-learner", {
            from: user.userId,
            educatorId,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-5"></div>

            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-extrabold text-center text-indigo-900 mb-12 flex items-center justify-center space-x-2">
                    <Star className="w-8 h-8 text-yellow-400 animate-spin-slow" />
                    <span>We Found {sortedEducators.length} Amazing Educators!</span>
                    <Star className="w-8 h-8 text-yellow-400 animate-spin-slow" />
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedEducators.map((edu, index) => (
                        <div
                            key={edu.educatorId + edu.learnerTopic}
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer group"
                        >
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-center relative">
                                <p className="text-white font-bold text-lg">
                                    Match Score: {edu.similarityScore.toFixed(2)}%
                                </p>
                                {index === 0 && (
                                    <div className="absolute top-4 right-4 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 animate-bounce">
                                        <Star className="w-4 h-4" />
                                        <span>Best Match</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    {edu.educatorName}
                                </h3>
                                <p className="text-gray-600 mb-4 line-clamp-3">{edu.bio}</p>

                                {edu.educatorSkills?.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {edu.educatorSkills.map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <h4 className="text-sm font-semibold text-gray-700 mb-1">Topic:</h4>
                                <p className="text-gray-800 font-medium mb-4">{edu.learnerTopic}</p>
                            </div>

                            <div className="px-6 pb-6">
                                <button
                                    onClick={() => sendConnectionRequest(edu.educatorId)}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-xl"
                                >
                                    <span>Connect Now</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-progress { animation: progress 3s linear infinite; }

        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>
        </div>
    );
};

export default MatchedEducator;
