import React, { useState, useEffect } from "react";
import { FaCookieBite, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaCog, FaStar } from "react-icons/fa";

function CookieConsent() {
    const [visible, setVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cookiePreferences, setCookiePreferences] = useState({
        essential: true,
        analytics: false,
        personalization: false,
    });

    useEffect(() => {
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) setVisible(true);
    }, []);

    const handleConsent = (choice) => {
        try {
            setLoading(true);
            const consentValue = choice === "custom" ? JSON.stringify(cookiePreferences) : choice;
            localStorage.setItem("cookieConsent", consentValue);
            setShowSettings(false);
            setShowConfirmation(true);

            if (choice === "all") {
                console.log("✅ User accepted all cookies.");
            } else if (choice === "essential") {
                console.log("⚡ Only essential cookies allowed.");
            } else if (choice === "reject") {
                console.log("❌ All optional cookies rejected.");
            } else {
                console.log("🔧 Custom cookie preferences saved:", cookiePreferences);
            }

            setTimeout(() => {
                setVisible(false);
                setShowConfirmation(false);
                setLoading(false);
            }, 2000);
        } catch (error) {
            console.error("Error saving cookie consent:", error);
        }
    };

    const handleTogglePreference = (key) => {
        if (key !== "essential") {
            setCookiePreferences((prev) => ({
                ...prev,
                [key]: !prev[key],
            }));
        }
    };

    const handleButtonClick = (callback) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        callback();
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-6 right-6 max-w-lg w-full sm:w-[28rem] z-50 font-sans">
            <div className="relative bg-white bg-opacity-95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gradient-to-r from-indigo-500 to-purple-500 border-opacity-30 transform transition-all duration-700 ease-in-out animate-slide-up hover:shadow-3xl">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-10 rounded-3xl animate-pulse-slow"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute w-2 h-2 bg-indigo-400 rounded-full animate-sparkle top-10 left-10"></div>
                    <div className="absolute w-2 h-2 bg-purple-400 rounded-full animate-sparkle top-20 right-12 animation-delay-1000"></div>
                    <div className="absolute w-2 h-2 bg-blue-400 rounded-full animate-sparkle bottom-8 left-16 animation-delay-2000"></div>
                </div>

                {/* Header */}
                <div className="flex items-center space-x-3 mb-5">
                    <FaCookieBite className="text-indigo-600 text-4xl animate-bounce-slow relative">
                        <FaStar className="absolute -top-1 -right-1 text-yellow-400 text-xs animate-spin-slow" />
                    </FaCookieBite>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Your Cookie Preferences</h2>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-6 leading-relaxed font-medium">
                    We use <span className="font-semibold text-indigo-600">essential cookies</span> to ensure our platform delivers a seamless experience. With your consent, we may also use optional cookies for analytics and personalization to tailor your journey.{" "}
                    <a
                        href="/privacy-policy"
                        className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-300 inline-flex items-center space-x-1"
                        aria-label="Privacy Policy"
                    >
                        <FaInfoCircle className="text-xs" />
                        <span>Learn More</span>
                    </a>
                </p>
                <p className="text-center text-indigo-600 font-semibold italic mb-6 animate-fade-in">
                    "The beautiful thing about learning is that nobody can take it away from you. – B.B. King"
                </p>

                {/* Confirmation Modal */}
                {showConfirmation && (
                    <div className="absolute inset-0 bg-white bg-opacity-95 rounded-3xl flex items-center justify-center animate-fade-in-fast">
                        <div className="text-center">
                            <FaCheckCircle className="text-4xl text-green-500 mb-4 mx-auto animate-bounce" />
                            <p className="text-lg font-semibold text-gray-800">Preferences Saved!</p>
                            <p className="text-sm text-gray-600">Your settings have been updated.</p>
                        </div>
                    </div>
                )}

                {/* Main Buttons */}
                {!showSettings && !showConfirmation && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <button
                            type="button"
                            onClick={handleButtonClick(() => handleConsent("all"))}
                            className="group relative flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:rotate-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg overflow-hidden"
                            aria-label="Accept all cookies"
                        >
                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
                            <FaCheckCircle className="text-lg group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-semibold">Accept All</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleButtonClick(() => handleConsent("essential"))}
                            className="group relative flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:from-gray-300 hover:to-gray-400 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 shadow-lg overflow-hidden"
                            aria-label="Accept essential cookies only"
                        >
                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
                            <FaCheckCircle className="text-lg group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-semibold">Essential Only</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleButtonClick(() => setShowSettings(true))}
                            className="group relative flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-4 py-3 rounded-lg hover:from-blue-200 hover:to-blue-300 transition-all duration-300 transform hover:scale-105 hover:rotate-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-lg overflow-hidden"
                            aria-label="Customize cookie settings"
                        >
                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
                            <FaCog className="text-lg group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-semibold">Customize</span>
                        </button>
                    </div>
                )}

                {/* Custom Settings Panel */}
                {showSettings && !showConfirmation && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="space-y-4">
                            <label className="flex items-center space-x-3 group relative">
                                <input
                                    type="checkbox"
                                    checked={cookiePreferences.essential}
                                    disabled
                                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-not-allowed"
                                    aria-checked="true"
                                    aria-disabled="true"
                                />
                                <span className="text-gray-800 font-medium">Essential Cookies (Always Required)</span>
                                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 -top-8 left-0 transform -translate-y-2 z-10">
                                    Required for core functionality
                                </div>
                            </label>
                            <label className="flex items-center space-x-3 group relative">
                                <input
                                    type="checkbox"
                                    checked={cookiePreferences.analytics}
                                    onChange={() => handleTogglePreference("analytics")}
                                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition-transform duration-200 group-hover:scale-110"
                                    aria-checked={cookiePreferences.analytics}
                                />
                                <span className="text-gray-800 font-medium">Analytics Cookies</span>
                                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 -top-8 left-0 transform -translate-y-2 z-10">
                                    Helps us understand user behavior
                                </div>
                            </label>
                            <label className="flex items-center space-x-3 group relative">
                                <input
                                    type="checkbox"
                                    checked={cookiePreferences.personalization}
                                    onChange={() => handleTogglePreference("personalization")}
                                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition-transform duration-200 group-hover:scale-110"
                                    aria-checked={cookiePreferences.personalization}
                                />
                                <span className="text-gray-800 font-medium">Personalization Cookies</span>
                                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 -top-8 left-0 transform -translate-y-2 z-10">
                                    Tailors content to your preferences
                                </div>
                            </label>
                        </div>
                        <div className="relative">
                            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-progress"></div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleButtonClick(() => setShowSettings(false))}
                                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-sm"
                                aria-label="Cancel custom settings"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleButtonClick(() => handleConsent("custom"))}
                                disabled={loading}
                                className={`px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm flex items-center space-x-2 ${loading ? "opacity-60 cursor-not-allowed" : ""
                                    }`}
                                aria-label="Save custom cookie preferences"
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm text-white"></span>
                                ) : (
                                    <span>Save Preferences</span>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.7s ease-out;
                }
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-6px);
                    }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
                @keyframes spin-slow {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                .animate-spin-slow {
                    animation: spin-slow 6s linear infinite;
                }
                @keyframes pulse-slow {
                    0% {
                        opacity: 0.08;
                    }
                    50% {
                        opacity: 0.15;
                    }
                    100% {
                        opacity: 0.08;
                    }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 7s infinite;
                }
                @keyframes sparkle {
                    0% {
                        opacity: 0;
                        transform: scale(0);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.2);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0);
                    }
                }
                .animate-sparkle {
                    animation: sparkle 2s infinite;
                }
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-in-out;
                }
                @keyframes fade-in-fast {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-in-out;
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
                    animation: progress 10s linear infinite;
                }
            `}</style>
        </div>
    );
}

export default CookieConsent;