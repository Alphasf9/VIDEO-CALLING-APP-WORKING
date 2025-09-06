import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLock, FaRocket, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "../api/AxiosInstance";

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { plan, amount } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(null);

    const handlePayment = async () => {
        if (!plan || !amount) {
            setShowConfirmation("error");
            setTimeout(() => setShowConfirmation(null), 3000);
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/payments/create-order", {
                amount,
                premiumPlan: plan,
            });

            const { order } = data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                plan: plan,
                name: "Learning Hub",
                description: `${plan} Subscription`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post("/payments/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        if(!verifyRes.data.success) throw new Error("Payment verification failed");

                        setShowConfirmation("success");
                        setTimeout(() => {
                            setShowConfirmation(null);
                            navigate("/learner/dashboard"); 
                        }, 2000);
                    } catch (err) {
                        console.error("Payment verification failed:", err);
                        setShowConfirmation("error");
                        setTimeout(() => setShowConfirmation(null), 3000);
                    }
                },
                prefill: {
                    name: "Learner",
                    email: "learner@learninghub.com",
                },
                theme: {
                    color: "#6366F1", // Indigo-600
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Error in payment:", error);
            setShowConfirmation("error");
            setTimeout(() => setShowConfirmation(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const planDetails = {
        "Learner Starter": [
            "Access to 10 courses",
            "5 live video sessions/month",
            "Community forums access",
            "24/7 email support",
        ],
        "Educator Pro": [
            "Unlimited course creation",
            "Up to 50 learners",
            "Advanced session analytics",
            "Priority email & chat support",
            "Custom profile branding",
        ],
        "Institution Elite": [
            "Unlimited courses & learners",
            "Full analytics dashboard",
            "Dedicated account manager",
            "API & custom integrations",
            "Priority support with SLA",
            "Branded learning portal",
        ],
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden flex items-center justify-center px-4 py-12 sm:py-24">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            {/* Main Payment Card */}
            <div className="relative max-w-md w-full bg-white bg-opacity-95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-indigo-200/50 transform transition-all duration-700 animate-slide-up hover:shadow-3xl z-10">
                {/* Header */}
                <div className="flex items-center justify-center space-x-3 mb-6">
                    <FaRocket className="text-indigo-600 text-4xl animate-bounce-slow" />
                    <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight">
                        {plan ? `Subscribe to ${plan}` : "Choose Your Plan"}
                    </h1>
                </div>

                
                {plan && amount ? (
                    <>
                        <p className="text-center text-gray-600 text-lg mb-6 leading-relaxed">
                            Unlock a world of learning with the {plan} plan. Enjoy premium features tailored to your educational journey.
                        </p>
                        <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                            <p className="text-2xl font-bold text-indigo-900 mb-2">Amount: ${amount}/month</p>
                            <ul className="space-y-2 text-gray-600 text-sm">
                                {planDetails[plan]?.map((feature, index) => (
                                    <li key={index} className="flex items-center space-x-2">
                                        <FaCheckCircle className="text-indigo-600" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex items-center justify-center space-x-2 mb-6">
                            <FaLock className="text-indigo-600" />
                            <p className="text-sm text-gray-600 font-medium">Secured by Razorpay</p>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-red-600 text-lg mb-6">Please select a plan to proceed.</p>
                )}

                {/* Confirmation Modal */}
                {showConfirmation && (
                    <div className="absolute inset-0 bg-white bg-opacity-95 rounded-3xl flex items-center justify-center animate-fade-in-fast">
                        <div className="text-center">
                            {showConfirmation === "success" ? (
                                <>
                                    <FaCheckCircle className="text-4xl text-green-500 mb-4 mx-auto animate-bounce" />
                                    <p className="text-lg font-semibold text-gray-800">Payment Successful!</p>
                                    <p className="text-sm text-gray-600">Welcome to your {plan} plan.</p>
                                </>
                            ) : (
                                <>
                                    <FaTimesCircle className="text-4xl text-red-500 mb-4 mx-auto animate-bounce" />
                                    <p className="text-lg font-semibold text-gray-800">Payment Failed</p>
                                    <p className="text-sm text-gray-600">Please try again or contact support.</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Payment Button */}
                {!showConfirmation && (
                    <button
                        onClick={handlePayment}
                        disabled={loading || !plan || !amount}
                        className={`group relative w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2 ${loading || !plan || !amount ? "opacity-60 cursor-not-allowed" : "hover:from-indigo-700 hover:to-purple-700"
                            }`}
                        aria-label={loading ? "Processing payment" : "Pay now"}
                    >
                        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
                        {loading ? (
                            <span className="loading loading-spinner loading-sm text-white"></span>
                        ) : (
                            <>
                                <FaRocket className="text-xl group-hover:scale-110 transition-transform duration-200" />
                                <span>Pay Now</span>
                            </>
                        )}
                    </button>
                )}

                {/* Back to Pricing Link */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate("/")}
                        className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors duration-300"
                        aria-label="Back to pricing page"
                    >
                        Back to Pricing
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>© 2025 Learning Hub. All rights reserved.</p>
                    <p>
                        Need help? Contact{" "}
                        <a
                            href="mailto:support@learninghub.com"
                            className="text-indigo-600 font-bold hover:underline"
                        >
                            Support
                        </a>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
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
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default PaymentPage;