import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import api from "../api/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaBook, FaInfoCircle } from "react-icons/fa";
import {useSocket } from "../context/SocketContext";

const LearnerSignup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    topicsOrSkills: "",
    bio: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { saveUserSession } = useUser();
  const navigate = useNavigate();
  const socket =useSocket();
  if(!socket) {
    return("Socket is not defined on Learner Signup");
  }



  const roleMessages = {
    learner: "Join as a Learner to explore courses and grow your skills!",
    educator: "Join as an Educator to create and share your expertise!",
  };

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
    if (name === "confirmPassword") {
      newErrors.confirmPassword = value !== form.password ? "Passwords do not match" : "";
    }
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (form.confirmPassword !== form.password) newErrors.confirmPassword = "Passwords do not match";
    if (!form.role) newErrors.role = "Please select a role";
    if (!form.topicsOrSkills) newErrors.topicsOrSkills = "This field is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post("/users/user-signup", {
        ...form,
        topic: form.topicsOrSkills.split(",").map(t => t.trim()), 
      });

      if (response.status === 201) {
        const { user, accessToken } = response.data;
        saveUserSession(user, accessToken);
        navigate("/learner/upload-profile-photo");
        socket.emit("user:register",{
          learnerId:user.userId,
          role:user.role
        })
      }
    } catch (error) {
      console.error("Signup error:", error.message);
      setErrors({ api: error.response?.data?.message || "Signup failed" });
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
          Unlock Your Learning Potential
        </h1>
        <p className="text-center text-gray-600 mb-8 font-medium text-lg">
          Join our platform to explore endless opportunities
        </p>

        <form onSubmit={handleSignup} className="space-y-5">
          {errors.api && (
            <p className="text-red-500 text-sm text-center font-semibold bg-red-50 p-3 rounded-xl shadow-sm">
              {errors.api}
            </p>
          )}

          {/* Role Dropdown */}
          <div className="relative group">
            <FaUser className="absolute top-4 left-4 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className={`pl-12 pr-4 py-3.5 w-full rounded-xl border ${errors.role ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium shadow-sm group-hover:shadow-md appearance-none`}
              required
            >
              <option value="" disabled>Select Role</option>
              <option value="learner">Learner</option>
              <option value="educator">Educator</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.role}</p>}
            {form.role && (
              <p className="text-indigo-600 text-sm mt-1.5 font-medium animate-fade-in">
                {roleMessages[form.role]}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="relative group">
            <FaUser className="absolute top-4 left-4 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className={`pl-12 pr-4 py-3.5 w-full rounded-xl border ${errors.name ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium shadow-sm group-hover:shadow-md`}
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.name}</p>}
          </div>

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

          {/* Confirm Password */}
          <div className="relative group">
            <FaLock className="absolute top-4 left-4 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`pl-12 pr-4 py-3.5 w-full rounded-xl border ${errors.confirmPassword ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium shadow-sm group-hover:shadow-md`}
              required
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.confirmPassword}</p>}
          </div>

          {/* Topics / Skills */}
          <div className="relative group">
            <FaBook className="absolute top-4 left-4 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" />
            <input
              type="text"
              name="topicsOrSkills"
              placeholder="Topics or Skills (comma-separated)"
              value={form.topicsOrSkills}
              onChange={handleChange}
              className={`pl-12 pr-4 py-3.5 w-full rounded-xl border ${errors.topicsOrSkills ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium shadow-sm group-hover:shadow-md`}
              required
            />
            {errors.topicsOrSkills && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.topicsOrSkills}</p>}
            {form.role && (
              <p className="text-indigo-600 text-sm mt-1.5 font-medium animate-fade-in">
                {form.role === "learner"
                  ? "Enter the topics you want to learn"
                  : "Enter the skills you can teach"}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="relative group">
            <FaInfoCircle className="absolute top-4 left-4 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" />
            <textarea
              name="bio"
              placeholder="Tell us about yourself"
              value={form.bio}
              onChange={handleChange}
              className="pl-12 pr-4 py-3.5 w-full rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium resize-y shadow-sm group-hover:shadow-md"
              rows="4"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 shadow-lg ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm font-medium">
          Already have an account?{" "}
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
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-3000 { animation-delay: 3s; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default LearnerSignup;
