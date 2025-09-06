import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "../context/UserContext";
import api from "../api/AxiosInstance";
import {
    FaCommentAlt,
    FaExclamationTriangle,
    FaChevronDown,
    FaChevronUp,
    FaLightbulb,
    FaRocket,
    FaQuoteLeft,
    FaStar,
    FaChartLine,
    FaChartPie,
} from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const UserSessions = ({ userId }) => {
    const [sessions, setSessions] = useState([]);
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSessions, setExpandedSessions] = useState({});
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    const inspirationalQuotes = [
        {
            text: "Learning is a treasure that will follow its owner everywhere.",
            author: "Chinese Proverb",
        },
        {
            text: "The beautiful thing about learning is that nobody can take it away from you.",
            author: "B.B. King",
        },
        {
            text: "Education is the most powerful weapon which you can use to change the world.",
            author: "Nelson Mandela",
        },
        {
            text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
            author: "Mahatma Gandhi",
        },
    ];

    useEffect(() => {
        const quoteInterval = setInterval(() => {
            setCurrentQuoteIndex(
                (prev) => (prev + 1) % inspirationalQuotes.length
            );
        }, 10000);
        return () => clearInterval(quoteInterval);
    }, [inspirationalQuotes.length]);

    useEffect(() => {
        const fetchSessions = async () => {
            if (!userId) return;
            try {
                setLoading(true);
                const { data } = await api.get(
                    `/session-requests/get-all-user-session/${userId}`
                );
                setSessions(data.sessions || []);
                setError(null);
            } catch (err) {
                setError("Failed to fetch your sessions. Please try again.");
                console.error("❌ Error fetching sessions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [userId]);

    const toggleSession = (roomId) => {
        setExpandedSessions((prev) => ({
            ...prev,
            [roomId]: !prev[roomId],
        }));
    };

    const chartData = useMemo(() => {
        if (!sessions || sessions.length === 0) return null;

        const sessionsPerMonth = {};
        const gistLengthPerMonth = {};
        const statusCounts = {};

        sessions.forEach((s) => {
            const date = new Date(s.createdAt || s.timestamp);
            const monthKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

            sessionsPerMonth[monthKey] =
                (sessionsPerMonth[monthKey] || 0) + 1;

            const gistLength = s.gist ? s.gist.length : 0;
            gistLengthPerMonth[monthKey] =
                (gistLengthPerMonth[monthKey] || 0) + gistLength;

            statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
        });

        const months = Object.keys(sessionsPerMonth).sort();

        return {
            barData: {
                labels: months,
                datasets: [
                    {
                        label: "Sessions per Month",
                        data: months.map((m) => sessionsPerMonth[m]),
                        backgroundColor: "rgba(75, 192, 192, 0.7)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                    {
                        label: "Total Gist Length",
                        data: months.map((m) => gistLengthPerMonth[m]),
                        backgroundColor: "rgba(153, 102, 255, 0.7)",
                        borderColor: "rgba(153, 102, 255, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            pieData: {
                labels: Object.keys(statusCounts),
                datasets: [
                    {
                        label: "Session Status Distribution",
                        data: Object.values(statusCounts),
                        backgroundColor: [
                            "#36A2EB",
                            "#FF6384",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                        ],
                        hoverBackgroundColor: [
                            "#36A2EB",
                            "#FF6384",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                        ],
                    },
                ],
            },
        };
    }, [sessions]);

    // 🔹 Loading State
    if (loading)
        return (
            <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 text-center animate-fade-in">
                <FaRocket className="text-5xl text-indigo-600 mb-4 mx-auto animate-bounce" />
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-progress"></div>
                </div>
                <p className="text-gray-700 text-lg font-medium mt-4">
                    Loading your sessions...
                </p>
            </div>
        );

    // 🔹 Error State (role-based messaging)
    if (error) {
        const errorMessage =
            user?.role === "educator"
                ? "We couldn’t load your teaching sessions at the moment."
                : "We couldn’t load your learning sessions at the moment.";

        const subMessage =
            user?.role === "educator"
                ? "Please try refreshing or reach out to support if the issue continues. Your teaching insights matter!"
                : "Please try refreshing or contact support if the issue continues. Your learning progress is important!";

        return (
            <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 text-center animate-fade-in">
                <FaExclamationTriangle className="text-red-500 text-5xl mb-4 mx-auto" />
                <p className="text-gray-700 text-lg font-semibold">
                    {errorMessage}
                </p>
                <p className="text-gray-500 text-md mt-2">{subMessage}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                    <FaRocket className="text-xl" />
                    <span>Try Again</span>
                </button>
            </div>
        );
    }

    // 🔹 Empty Sessions (role-based messaging)
    if (sessions.length === 0) {
        const heading =
            user?.role === "educator"
                ? "No sessions available for analysis"
                : "No learning sessions yet";

        const description =
            user?.role === "educator"
                ? "Your teaching journey starts here! Conduct your first live session to unlock in-depth insights, performance analytics, and a clear view of your impact as an educator."
                : "Your learning journey awaits! Join your first session to gain valuable knowledge, track your progress, and unlock personalized insights.";

        const buttonText =
            user?.role === "educator"
                ? "Create Your First Session"
                : "Join Your First Session";

        return (
            <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 text-center animate-fade-in">
                <FaLightbulb className="text-6xl text-indigo-300 mb-4 mx-auto" />
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{heading}</h2>
                <p className="text-gray-600 text-md mb-6 max-w-lg mx-auto leading-relaxed">
                    {description}
                </p>
                <button
                    onClick={() => (window.location.href = "/dashboard")}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-gray-900 font-bold 
            rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-300 
            flex items-center justify-center space-x-3 mx-auto shadow-2xl hover:shadow-3xl transform hover:scale-110"
                >
                    <FaRocket className="text-2xl" />
                    <span>{buttonText}</span>
                </button>
            </div>
        );
    }

    // 🔹 Main Sessions UI
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <h2 className="text-3xl font-extrabold mb-3 animate-fade-in text-shadow-lg">
                    Your Learning Sessions
                </h2>
                <p className="text-md font-medium">
                    Revisit your past sessions and spark new insights!
                </p>
            </div>

            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl shadow-xl p-6 transform hover:scale-102 transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <FaLightbulb className="text-yellow-500 text-2xl" />
                    <span>Learning Inspiration</span>
                </h3>
                <div className="relative">
                    <FaQuoteLeft className="absolute top-0 left-0 text-indigo-300 text-3xl opacity-50" />
                    <p className="text-gray-700 italic text-md mb-2 pl-8 pr-4">
                        {inspirationalQuotes[currentQuoteIndex].text}
                    </p>
                    <p className="text-right text-gray-500 text-sm font-medium">
                        - {inspirationalQuotes[currentQuoteIndex].author}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl shadow-xl p-6 transform hover:scale-102 transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                        <FaChartLine className="text-indigo-600 text-2xl" />
                        <span>Sessions & Gist Over Time</span>
                    </h3>
                    <Bar data={chartData.barData} />
                </div>
                <div className="bg-white rounded-3xl shadow-xl p-6 transform hover:scale-102 transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                        <FaChartPie className="text-indigo-600 text-2xl" />
                        <span>Session Status Distribution</span>
                    </h3>
                    <Pie data={chartData.pieData} />
                </div>
            </div>

            {sessions.map((session) => (
                <div
                    key={session.roomId}
                    className="bg-white rounded-3xl shadow-xl p-6 transform hover:scale-102 transition-all duration-300"
                >
                    <button
                        onClick={() => toggleSession(session.roomId)}
                        className="w-full flex justify-between items-center text-left py-3 px-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-t-2xl"
                    >
                        <div className="flex items-center space-x-3">
                            <FaCommentAlt className="text-indigo-600 text-2xl" />
                            <h2 className="text-xl font-bold text-gray-800">
                                Session {session.sessionId}
                            </h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 font-medium">
                                {new Date(session.timestamp).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                            {expandedSessions[session.roomId] ? (
                                <FaChevronUp className="text-indigo-600 text-xl" />
                            ) : (
                                <FaChevronDown className="text-indigo-600 text-xl" />
                            )}
                        </div>
                    </button>

                    {expandedSessions[session.roomId] && (
                        <div className="mt-4 space-y-4 animate-fade-in p-4 border border-gray-200 rounded-b-xl bg-gray-50 shadow-inner">
                            {session.gist && (
                                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md border-l-4 border-indigo-500">
                                    <p className="text-gray-800 text-lg font-semibold flex items-center space-x-2">
                                        <FaStar className="text-yellow-500 text-xl" />{" "}
                                        <span>Session Gist:</span>
                                    </p>
                                    <p className="text-gray-700 text-md mt-2 leading-relaxed italic">
                                        {session.gist}
                                    </p>
                                </div>
                            )}
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-700 text-md leading-relaxed">
                                    <span className="font-semibold">Transcript:</span>{" "}
                                    {session.transcript || "No transcript available"}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-600 text-md">
                                <p>
                                    <span className="font-semibold">Speaker:</span>{" "}
                                    {session.speaker || "Unknown"}
                                </p>
                                <p>
                                    <span className="font-semibold">Room:</span>{" "}
                                    {session.roomId}
                                </p>
                                <p>
                                    <span className="font-semibold">Time:</span>{" "}
                                    {new Date(session.timestamp).toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <style jsx>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
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
        @keyframes bounce {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .text-shadow-lg {
          text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
        </div>
    );
};

export default UserSessions;
