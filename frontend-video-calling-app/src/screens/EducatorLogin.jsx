import React, { useState } from "react";
import api from "../api/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useEducator } from "../context/EducatorContext";

const EducatorLogin = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { setEducator, saveUserSession } = useEducator();
    const navigate = useNavigate();

    const learningQuote = "The beautiful thing about learning is that nobody can take it away from you. – B.B. King";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        validateField(name, value);
    };

    const validateField = (name, value) => {
        let newErrors = { ...errors };
        if (name === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            newErrors.email = !emailRegex.test(value) ? "Invalid email format" : "";
        }
        if (name === "password") {
            newErrors.password = value.length < 6 ? "Password must be at least 6 characters" : "";
        }
        setErrors(newErrors);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.email) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format";
        if (!form.password) newErrors.password = "Password is required";
        else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await api.post("/users/user-login", form);

            if (response.status === 201) {
                const { user, accessToken } = response.data;
                saveUserSession(user, accessToken);
                if (user.avatarUrl === null) navigate("/learner/upload-profile-photo");
                navigate("/educator/dashboard");
            }
        } catch (error) {
            console.error("Login error:", error.message);
            setErrors({ api: error.response?.data?.message || "Login failed" });
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
                    Welcome Back
                </h1>
                <p className="text-center text-gray-600 mb-6 font-medium text-lg">
                    Log in to continue your learning journey
                </p>
                <p className="text-center text-indigo-600 font-semibold italic mb-8 animate-fade-in">
                    "{learningQuote}"
                </p>

                <form onSubmit={handleLogin} className="space-y-5">
                    {errors.api && (
                        <p className="text-red-500 text-sm text-center font-semibold bg-red-50 p-3 rounded-xl shadow-sm">
                            {errors.api}
                        </p>
                    )}

                    {/* Email */}
                    <div className="relative group">
                        <FaEnvelope className="absolute top-4 left-4 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={handleChange}
                            className={`pl-12 pr-4 py-3.5 w-full rounded-xl border ${errors.email ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium shadow-sm group-hover:shadow-md`}
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <FaLock className="absolute top-4 left-4 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            className={`pl-12 pr-4 py-3.5 w-full rounded-xl border ${errors.password ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium shadow-sm group-hover:shadow-md`}
                            required
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.password}</p>}
                    </div>

                    {/* Submit Button with Loading Animation */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 shadow-lg flex items-center justify-center ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        {loading ? (
                            <span className="loading loading-ball loading-xl text-white"></span>
                        ) : (
                            "Log In"
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-500 mt-6 text-sm font-medium">
                    Don't have an account?{" "}
                    <a href="/educator/login" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-300">
                        Sign up
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

export default EducatorLogin;