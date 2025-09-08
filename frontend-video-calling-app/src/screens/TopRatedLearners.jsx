import React, { useState, useEffect, useRef } from "react";
import api from "../api/AxiosInstance";
import { FaStar, FaUserCircle, FaCrown, FaBookOpen } from "react-icons/fa";
import { useEducator } from "../context/EducatorContext";
import { useSocket } from "../context/SocketContext";

const TopRatedLearners = () => {
    const [topLearners, setTopLearners] = useState([]);
    const { educator } = useEducator();
    const socket = useSocket();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    const getTopRatedLearners = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/ratings/top-rated-learners");

            if (response.status === 200) {
                setTopLearners(response.data.topLearners);
            }
        } catch (err) {
            console.error("Error fetching top rated learners:", err);
            setError("Internal server error while fetching top rated learners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTopRatedLearners();
    }, []);

  
    const handleConnectionToLearner = (learnerId) => {
        console.log("Connection request sent to learner:", learnerId);
        if (!socket || !socket.connected) {
            console.warn("Socket not connected!");
            return;
        }
        alert("Connection request sent successfully!");
        console.log("Sending connection request to learner:", learnerId);

        socket.emit("connection-request-by-educator", {
            from: educator.userId,
            learnerId
        });
    };

    useEffect(() => {
        if (!scrollContainerRef.current || isPaused || topLearners.length === 0)
            return;

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
                    scrollContainerRef.current.scrollBy({
                        left: cardWidth,
                        behavior: "smooth",
                    });
                }
            }
        }, 3000);

        return () => clearInterval(scrollInterval);
    }, [topLearners, isPaused]);

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
                <span>Top Rated Learners</span>
            </h2>

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-4 text-gray-600 text-lg font-medium">
                        Loading top learners...
                    </span>
                </div>
            )}
            {error && (
                <p className="text-red-500 text-center text-lg font-medium mb-6">
                    {error}
                </p>
            )}

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto space-x-6 pb-6 snap-x snap-mandatory scrollbar-thin"
            >
                {topLearners.map((learner) => (
                    <div
                        key={learner.userId}
                        className="min-w-[320px] max-w-[320px] bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl hover:scale-105 transition-all duration-300 snap-center relative border border-gray-100"
                    >
                        {/* Premium Badge */}
                        {learner.isPremium && (
                            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-2 shadow-md">
                                <FaCrown className="text-white text-lg" />
                            </div>
                        )}

                        {/* Avatar */}
                        {learner.avatarUrl ? (
                            <div className="relative w-24 h-24 rounded-full border-4 border-indigo-500 shadow-md mb-4">
                                <img
                                    src={`https://${learner.avatarUrl}`}
                                    alt={learner.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        ) : (
                            <FaUserCircle className="text-7xl text-indigo-500 mb-4" />
                        )}

                        {/* Learner Details */}
                        <h3 className="text-xl font-semibold text-gray-800 text-center">
                            {learner.name}
                        </h3>
                        <p className="text-gray-600 mt-2 flex items-center">
                            <FaStar className="text-yellow-500 mr-1" />
                            <span className="font-medium">{learner.avgRating.toFixed(1)}</span>
                        </p>
                        {learner.isPremium && (
                            <p className="text-sm font-medium text-yellow-600 mt-1">
                                {learner.premiumPlan || "Premium"} Member
                            </p>
                        )}
                        <p className="text-gray-500 mt-2 text-sm text-center">
                            <span className="font-medium">Skills:</span>{" "}
                            {truncateText(learner.skills.join(", "), 50) || "N/A"}
                        </p>

                        {/* Action Button */}
                        <button
                            className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                            onClick={() => handleConnectionToLearner(learner.userId)}
                        >
                            <FaBookOpen className="text-lg" />
                            <span>Connect</span>
                        </button>
                    </div>
                ))}
            </div>

            <style jsx>{`
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

export default TopRatedLearners;
