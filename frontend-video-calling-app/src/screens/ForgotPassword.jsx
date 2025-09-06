import React, { useState } from "react";
import api from "../api/AxiosInstance";
import { FaEnvelope, FaKey } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const learningQuote = "The beautiful thing about learning is that nobody can take it away from you. – B.B. King";

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            return setMessage("Password should be at least 6 characters long");
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await api.put("/users/update-password", {
                email,
                newPassword,
            });

            

            setMessage(`✅ ${response.data.message}`);
            setEmail("");
            setNewPassword("");
            setConfirmPassword("");
            navigate('/learner/login');
        } catch (error) {
            console.log("Error occurred while changing password", error);
            setMessage(error.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-800 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 animate-pulse"></div>
            <div className="absolute w-[700px] h-[700px] bg-indigo-600 rounded-full filter blur-3xl opacity-25 animate-blob top-[-10%] left-[-10%]"></div>
            <div className="absolute w-[600px] h-[600px] bg-purple-600 rounded-full filter blur-3xl opacity-25 animate-blob bottom-[-10%] right-[-10%] animation-delay-3000"></div>

            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md sm:max-w-lg md:max-w-xl transform transition-all duration-500 hover:shadow-3xl z-10">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-3 tracking-tight">
                    Reset Your Password
                </h1>
                <p className="text-center text-gray-600 mb-6 font-medium text-lg">
                    Secure your account with a new password
                </p>
                <p className="text-center text-indigo-600 font-semibold italic mb-8 animate-fade-in">
                    "{learningQuote}"
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {message && (
                        <p
                            className={`text-sm font-semibold text-center p-3 rounded-xl shadow-sm animate-fade-in ${message.startsWith("✅")
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                        >
                            {message}
                        </p>
                    )}

                    {/* Email */}
                    <div className="relative group">
                        <FaEnvelope className="absolute top-4 left-4 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-12 pr-4 py-3.5 w-full rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium shadow-sm group-hover:shadow-md"
                            required
                        />
                    </div>

                    {/* New Password */}
                    <div className="relative group">
                        <FaKey className="absolute top-4 left-4 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-12 pr-4 py-3.5 w-full rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium shadow-sm group-hover:shadow-md"
                            required
                        />
                    </div>

                    {/* Confirm New Password */}
                    <div className="relative group">
                        <FaKey className="absolute top-4 left-4 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-12 pr-4 py-3.5 w-full rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium shadow-sm group-hover:shadow-md"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 shadow-lg flex items-center justify-center ${loading ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? (
                            <span className="loading loading-ball loading-xl text-white"></span>
                        ) : (
                            "Update Password"
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-500 mt-6 text-sm font-medium">
                    Remember your password?{" "}
                    <a href="/learner/login" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-300">
                        Log in
                    </a>
                </p>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: scale(1); opacity: 0.25; }
                    50% { transform: scale(1.15); opacity: 0.35; }
                    100% { transform: scale(1); opacity: 0.25; }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-3000 {
                    animation-delay: 3s;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;