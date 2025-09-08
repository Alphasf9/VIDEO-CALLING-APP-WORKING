import React, { useState, useEffect, useRef } from "react";
import api from "../api/AxiosInstance";
import { FaStar, FaUserCircle, FaCrown, FaBookOpen } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { useSocket } from "../context/SocketContext";

const TopRatedEducators = () => {
    const [topEducators, setTopEducators] = useState([]);
    const { user } = useUser();
    const socket = useSocket();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    const getTopRatedEducators = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/ratings/top-rated-educators");
          
            if (response.status === 200) {
                setTopEducators(response.data.topEducators);
            }
        } catch (err) {
            console.error("Error fetching top rated educators:", err);
            setError("Internal server error while fetching top rated educators");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTopRatedEducators();
    }, []);

    const sendConnectionRequest = (educatorId) => {
        alert("Connection request sent successfully!");
        // console.log("Sending connection request to educator:", educatorId);
        socket.emit("connection-request-by-learner", {
            from: user.userId,
            educatorId,
        });
    };


    useEffect(() => {
        if (!scrollContainerRef.current || isPaused || topEducators.length === 0) return;

        const scrollWidth = scrollContainerRef.current.scrollWidth;
        const containerWidth = scrollContainerRef.current.clientWidth;
        const cardWidth = 320 + 24;

        const scrollInterval = setInterval(() => {
            if (scrollContainerRef.current) {
                const currentScroll = scrollContainerRef.current.scrollLeft;
                const maxScroll = scrollWidth - containerWidth;

                if (currentScroll >= maxScroll) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
                } else {
                    scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
                }
            }
        }, 3000);

        return () => clearInterval(scrollInterval);
    }, [topEducators, isPaused]);

    const truncateText = (text, maxLength) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + "...";
        }
        return text;
    };

    return (
        <section
            className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 transform hover:scale-102 transition-all duration-300"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                <FaStar className="text-yellow-500 text-3xl" />
                <span>Top Rated Educators</span>
            </h2>

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-4 text-gray-600 text-lg font-medium">Loading top educators...</span>
                </div>
            )}
            {error && (
                <p className="text-red-500 text-center text-lg font-medium mb-6">{error}</p>
            )}

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto space-x-6 pb-6 snap-x snap-mandatory scrollbar-thin"
            >
                {topEducators.map((educator) => (
                    <div
                        key={educator.userId}
                        className="min-w-[320px] max-w-[320px] bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl hover:scale-105 transition-all duration-300 snap-center relative border border-gray-100"
                    >
                        {/* Premium Badge */}
                        {educator.isPremium && (
                            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-2 shadow-md">
                                <FaCrown className="text-white text-lg" />
                            </div>
                        )}

                        {/* Avatar */}
                        {educator.avatarUrl ? (
                            <div className="relative w-24 h-24 rounded-full border-4 border-yellow-500 shadow-md mb-4">
                                <img
                                    src={`https://${educator.avatarUrl}`}
                                    alt={educator.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                                <div className="absolute inset-0 rounded-full border-4 border-yellow-500 animate-aura-premium opacity-30 hover:opacity-60 transition-opacity duration-300"></div>
                            </div>
                        ) : (
                            <FaUserCircle className="text-7xl text-yellow-500 mb-4" />
                        )}

                        {/* Educator Details */}
                        <h3 className="text-xl font-semibold text-gray-800 text-center">{educator.name}</h3>
                        <p className="text-gray-600 mt-2 flex items-center">
                            <FaStar className="text-yellow-500 mr-1" />
                            <span className="font-medium">{educator.avgRating.toFixed(1)}</span>
                        </p>
                        {educator.isPremium && (
                            <p className="text-sm font-medium text-yellow-600 mt-1">{educator.premiumPlan || "Premium"} Member</p>
                        )}
                        <p className="text-gray-500 mt-2 text-sm text-center">
                            <span className="font-medium">Skills:</span> {truncateText(educator.skills.join(", "), 50)}
                        </p>
                        <p className="text-gray-500 mt-2 text-sm text-center">
                            <span className="font-medium">Topics:</span> {truncateText(educator.topics?.join(", ") || "N/A", 50)}
                        </p>
                        <p className="text-gray-500 mt-2 text-sm text-center">
                            <span className="font-medium">Bio:</span> {truncateText(educator.bio || "No bio available", 100)}
                        </p>

                        {/* Action Button */}
                        <button

                            className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                            onClick={() => sendConnectionRequest(educator.userId)}
                        >
                            <FaBookOpen className="text-lg" />
                            <span>Connect</span>
                        </button>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .animate-aura-premium {
          animation: aura-premium 2.5s infinite;
        }
        @keyframes aura-premium {
          0% {
            box-shadow: 0 0 12px rgba(234, 179, 8, 0.8), 0 0 24px rgba(234, 179, 8, 0.6);
          }
          50% {
            box-shadow: 0 0 24px rgba(234, 179, 8, 1), 0 0 36px rgba(234, 179, 8, 0.8);
          }
          100% {
            box-shadow: 0 0 12px rgba(234, 179, 8, 0.8), 0 0 24px rgba(234, 179, 8, 0.6);
          }
        }
        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          height: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(241, 241, 241, 0.7);
          border-radius: 5px;
          backdrop-filter: blur(4px);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(136, 136, 136, 0.8);
          border-radius: 5px;
          transition: background 0.3s;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(85, 85, 85, 0.9);
        }
        /* Snap scrolling */
        .snap-x {
          scroll-snap-type: x mandatory;
        }
        .snap-center {
          scroll-snap-align: center;
        }
      `}</style>
        </section>
    );
};

export default TopRatedEducators;