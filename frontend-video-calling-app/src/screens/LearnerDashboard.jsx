import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import api from '../api/AxiosInstance';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaSignOutAlt, FaBookOpen, FaChartLine, FaRocket } from 'react-icons/fa';
import { useEducator } from '../context/EducatorContext';

const LearnerDashboard = () => {
  const { user, clearUserSession, setUser } = useUser();
  const navigate = useNavigate();

  const [bioInput, setBioInput] = useState(user?.bio || "");
  const [topicsInput, setTopicsInput] = useState(user?.topics?.join(", ") || "");
  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const { setEducator } = useEducator();
  const [isSearching, setIsSearching] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingMessages = [
    "Scanning for top educators...",
    "Matching your topics and interests...",
    "Connecting with the best experts...",
    "Analyzing compatibility...",
    "Preparing your perfect learning match...",
  ];

  useEffect(() => {
    let interval;
    if (isSearching) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSearching, loadingMessages.length]);

  // Logout
  const handleLogout = async () => {
    try {
      await api.post('/users/user-logout');
      clearUserSession();
      navigate('/learner/login');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Failed to logout. Please try again.');
    }
  };

  // Update user details
  const updateUserDetails = async (field) => {
    try {
      setLoading(true);

      const payload = {};
      if (field === "bio") payload.bio = bioInput;
      if (field === "topics") payload.topics = topicsInput.split(",").map(t => t.trim());
      if (field === "skills") payload.skills = skillsInput.split(",").map(t => t.trim());

      const { data } = await api.patch('/users/update-user-deatils', payload);

      // update context
      setUser(data.user);

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfileClick = () => {
    alert("Your profile cannot be edited once set. Contact support for assistance.");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const { data } = await api.post("/matches/match", {
        topics: user.topics,
      });

      // Update global educator context
      setEducator(data.matches);

      // Navigate to educator details page
      navigate("/educator-details");
    } catch (err) {
      console.error("Error while searching educator:", err);
      alert("Failed to find educator. Try again.");
      setIsSearching(false);
    }
  };

  // Customize welcome message based on role
  const welcomeMessage = user?.role === 'educator'
    ? "Join the Learning Lobby to share your expertise with eager learners. Connect and inspire through your skills!"
    : "Dive into the Learning Lobby to connect with expert educators. Explore your interests and boost your skills!";

  if (isSearching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <FaRocket className="text-6xl mb-6 animate-bounce" />
        <h2 className="text-3xl font-bold mb-4">Finding Your Perfect Match...</h2>
        <p className="text-xl mb-8 animate-fade-in-out">{loadingMessages[currentMessageIndex]}</p>
        <div className="w-64 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <div className="h-full bg-white animate-progress"></div>
        </div>
        <style jsx>{`
          @keyframes fade-in-out {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
          .animate-fade-in-out {
            animation: fade-in-out 2s infinite;
          }
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          .animate-progress {
            animation: progress 2s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md p-4 fixed w-full z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/logo.png" alt="Platform Logo" className="h-10" /> {/* Placeholder for logo */}
            <h1 className="text-2xl font-bold text-indigo-600">Learning Hub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 font-bold"
              />
              <FaBookOpen className="absolute top-3 left-3 text-gray-600" />
            </div>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/profile')}
              />
            ) : (
              <FaUserCircle className="text-4xl text-indigo-600 hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => navigate('/profile')} />
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Modular Grid Layout */}
      <main className="max-w-7xl mx-auto pt-24 pb-8 px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar - Profile Card */}
        <aside className="md:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.name}'s profile`}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-indigo-200 shadow-lg"
              />
            ) : (
              <FaUserCircle className="text-indigo-600 text-9xl mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold text-gray-800">{user?.name || 'Guest'}</h2>
            <p className="text-gray-600 capitalize">{user?.role || 'Learner'}</p>
            <p className="text-gray-500 mt-2">{user?.email || 'N/A'}</p>
            <button
              onClick={handleEditProfileClick}
              className="mt-4 w-full py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Account Stats */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <FaChartLine className="text-indigo-600" />
              <span>Account Stats</span>
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex justify-between">
                <span>Created:</span>
                <span>{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
              </li>
              <li className="flex justify-between">
                <span>Updated:</span>
                <span>{user?.updatedAt ? formatDate(user.updatedAt) : 'N/A'}</span>
              </li>
              <li className="flex justify-between">
                <span>User ID:</span>
                <span className="truncate">{user?.userId || 'N/A'}</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Sections */}
        <div className="md:col-span-3 space-y-6">
          {/* Welcome Banner with Join Lobby Button */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            <h1 className="text-4xl font-extrabold mb-4">Welcome Back, {user?.name}! 🚀</h1>
            <p className="text-lg mb-6">{welcomeMessage}</p>
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-800 font-bold rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto shadow-2xl hover:shadow-3xl transform hover:scale-105 animate-pulse"
            >
              <FaRocket className="text-2xl" />
              <span>Join Learning Lobby</span>
            </button>
          </section>

          {/* Bio Editor */}
          <section className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <FaBookOpen className="text-indigo-600" />
              <span>Your Bio</span>
            </h2>
            <textarea
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 font-bold resize-y min-h-[120px]"
              placeholder="Tell us about yourself..."
            />
            <button
              onClick={() => updateUserDetails("bio")}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all duration-300 flex items-center space-x-2"
            >
              <FaEdit />
              <span>{loading ? "Updating..." : "Update Bio"}</span>
            </button>
          </section>

          {/* Topics Editor */}
          <section className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <FaBookOpen className="text-indigo-600" />
              <span>Topics of Interest</span>
            </h2>
            <input
              type="text"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 font-bold"
              placeholder="Enter topics separated by commas, e.g., web development, app development"
            />
            <button
              onClick={() => updateUserDetails("topics")}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all duration-300 flex items-center space-x-2"
            >
              <FaEdit />
              <span>{loading ? "Updating..." : "Update Topics"}</span>
            </button>
            {user?.topics && user.topics.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {user.topics.map((topic, index) => (
                  <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Skills Editor (Educators Only) */}
          {user?.role === 'educator' && (
            <section className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <FaBookOpen className="text-indigo-600" />
                <span>Your Skills</span>
              </h2>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 font-bold"
                placeholder="Enter skills separated by commas, e.g., teaching, mentoring, coding"
              />
              <button
                onClick={() => updateUserDetails("skills")}
                disabled={loading}
                className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all duration-300 flex items-center space-x-2"
              >
                <FaEdit />
                <span>{loading ? "Updating..." : "Update Skills"}</span>
              </button>
              {user?.skills && user.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-md p-4 text-center text-gray-500 text-sm">
        © 2025 Learning Hub. All rights reserved.
      </footer>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default LearnerDashboard;