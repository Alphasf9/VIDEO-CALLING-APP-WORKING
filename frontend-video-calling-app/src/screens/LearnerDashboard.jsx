import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import api from '../api/AxiosInstance';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaSignOutAlt, FaBookOpen, FaChartLine, FaRocket, FaCheck, FaTimes } from 'react-icons/fa';
import { useEducator } from '../context/EducatorContext';
import { useSocket } from '../context/SocketContext';
import { useRoom } from '../context/RoomContext';

const LearnerDashboard = () => {
  const { user, clearUserSession, setUser } = useUser();
  const navigate = useNavigate();
  const socket = useSocket();
  const [bioInput, setBioInput] = useState(user?.bio || '');
  const [topicsInput, setTopicsInput] = useState(user?.topics?.join(', ') || '');
  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(', ') || '');
  const [loading, setLoading] = useState(false);
  const { setEducator } = useEducator();
  const [isSearching, setIsSearching] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [connectionRequest, setConnectionRequest] = useState(null);
  const { setRoomId } = useRoom();


  const loadingMessages = [
    'Scanning for top educators...',
    'Matching your topics and interests...',
    'Connecting with the best experts...',
    'Analyzing compatibility...',
    'Preparing your perfect learning match...',
  ];


  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("Socket connected on learner dashboard:", socket.id);

      // Register user ID with backend immediately
      if (user?.userId) {
        socket.emit("register-user", { userId: user.userId });
      }

      // Attach listener AFTER connection
      console.log("🟢 Attaching listener for connection request");
      const handleConnectionRequest = ({ from }) => {
        console.log("🟢 Connection request received from educator", from);
        alert(`You have a connection request from educator ${from}`);
      };

      socket.on("connection-request-by-learner", handleConnectionRequest);

      // Clean up
      return () => {
        socket.off("connection-request-by-learner", handleConnectionRequest);
      };
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.once("connect", handleConnect);
    }
  }, [socket, user?.userId]);





  useEffect(() => {

    console.log("I am fired up 🔥🔥")

    socket.on("join-educator-room", ({ educatorId, learnerId, roomId, userId }) => {
      console.log("✅ Received educator room invite", { educatorId, learnerId, roomId });
      setRoomId(roomId);
      alert(`You will be redirected to room ${roomId}`);
      setConnectionRequest({ educatorId, learnerId, roomId });
      navigate("/lobby", { state: { userId } }); // pass learner userId
      // navigate(`/room/${roomId}`);
    });

    // return () => {
    //   socket.off("join-educator-room"); 
    // };
  }, [navigate, socket, setRoomId]);







  useEffect(() => {
    let interval;
    if (isSearching) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSearching, loadingMessages.length]);



  useEffect(() => {
    if (user && socket) {
      socket.emit('update-availability', {
        userId: user.userId,
        socketId: socket.id,
        status: 'online',
      });
    }
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;

    const handler = ({ educatorId, learnerId, roomId }) => {
      console.log("✅ Received educator room invite", { educatorId, learnerId, roomId });
      setConnectionRequest({ educatorId, learnerId, roomId });
    };

    socket.on("join-educator-room", handler);

    return () => {
      socket.off("join-educator-room", handler);
    };
  }, [socket]);







  const handleAcceptRequest = () => {
    if (!connectionRequest) return;

    console.log(`✅ Accepted connection request from educator ${connectionRequest.educatorId}`);
    const roomId = connectionRequest.roomId;
    setConnectionRequest(null);

    navigate(`/room/${roomId}`);
  };


  const handleRejectRequest = () => {
    console.log(`Rejected connection request from educator ${connectionRequest.educatorId}`);
    setConnectionRequest(null);
  };





  const handleLogout = async () => {
    try {
      await api.post('/users/user-logout');
      clearUserSession();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Failed to logout. Please try again.');
    }
  };

  const updateUserDetails = async (field) => {
    try {
      setLoading(true);
      const payload = {};
      if (field === 'bio') payload.bio = bioInput;
      if (field === 'topics') payload.topics = topicsInput.split(',').map(t => t.trim());
      if (field === 'skills') payload.skills = skillsInput.split(',').map(t => t.trim());

      const { data } = await api.patch('/users/update-user-deatils', payload);
      setUser(data.user);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update profile. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfileClick = () => {
    alert('Your profile cannot be edited once set. Contact support for assistance.');
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
      const { data } = await api.post('/matches/match/learner-to-educator', {
        learnerId: user.userId,
        topics: user.topics,
      });
      setEducator(data);
      navigate('/educator-details');
    } catch (err) {
      console.error('Error while searching educator:', err);
      alert('Failed to find educator. Try again.');
      setIsSearching(false);
    }
  };



  const welcomeMessage = user?.role === 'educator'
    ? 'Join the Learning Lobby to share your expertise with eager learners. Connect and inspire through your skills!'
    : 'Dive into the Learning Lobby to connect with expert educators. Explore your interests and boost your skills!';




  if (isSearching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <FaRocket className="text-6xl mb-6 animate-bounce" />
        <h2 className="text-3xl font-bold mb-4">Finding Your Perfect Match...</h2>
        <p className="text-xl mb-8 animate-fade-in-out">{loadingMessages[currentMessageIndex]}</p>
        <div className="w-64 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-progress"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Connection Request Modal */}
      {connectionRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform animate-fade-in">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-4 flex items-center space-x-2">
              <FaBookOpen className="text-indigo-600" />
              <span>New Connection Request</span>
            </h2>
            <p className="text-gray-600 mb-6">
              You have received a connection request from Educator{' '}
              <span className="font-bold text-indigo-600">{connectionRequest.educatorId}</span>.
              Would you like to join the learning session?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleRejectRequest}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-full hover:from-red-600 hover:to-red-800 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaTimes />
                <span>Reject</span>
              </button>
              <button
                onClick={handleAcceptRequest}
                className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-full hover:from-green-500 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaCheck />
                <span>Accept</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <nav className="bg-white bg-opacity-90 backdrop-blur-lg shadow-md p-4 fixed w-full z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/logo.png" alt="Platform Logo" className="h-10" />
            <h1 className="text-2xl font-bold text-indigo-600">Learning Hub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-800 font-bold bg-white bg-opacity-80"
              />
              <FaBookOpen className="absolute top-3 left-3 text-gray-600" />
            </div>
            <div className="relative group">
              {user?.avatarUrl ? (
                <div className={`relative w-12 h-12 rounded-full border-2 ${user.availability === 'online' ? 'border-green-400' : 'border-red-400'} shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}>
                  <img
                    src={user.avatarUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                    onClick={() => navigate('/profile')}
                  />
                  <div
                    className={`absolute inset-0 rounded-full border-4 ${user.availability === 'online' ? 'border-green-400 animate-aura-online' : 'border-red-400 animate-aura-offline'} opacity-50 group-hover:opacity-75 transition-opacity duration-300`}
                  ></div>
                </div>
              ) : (
                <div className={`relative w-12 h-12 rounded-full border-2 ${user.availability === 'online' ? 'border-green-400' : 'border-red-400'} shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}>
                  <FaUserCircle
                    className={`text-4xl ${user.availability === 'online' ? 'text-green-600' : 'text-red-600'} hover:scale-105 transition-transform duration-300`}
                    onClick={() => navigate('/profile')}
                  />
                  <div
                    className={`absolute inset-0 rounded-full border-4 ${user.availability === 'online' ? 'border-green-400 animate-aura-online' : 'border-red-400 animate-aura-offline'} opacity-50 group-hover:opacity-75 transition-opacity duration-300`}
                  ></div>
                </div>
              )}
              <div className="absolute top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                {user.availability === 'online' ? 'You are Online' : 'You are Offline'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-full hover:from-red-600 hover:to-red-800 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
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
          <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-xl p-6 text-center">
            <div className="relative inline-block">
              {user?.avatarUrl ? (
                <div className={`relative w-32 h-32 rounded-full border-4 ${user.availability === 'online' ? 'border-green-400' : 'border-red-400'} shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <img
                    src={user.avatarUrl}
                    alt={`${user.name}'s profile`}
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 rounded-full border-8 ${user.availability === 'online' ? 'border-green-400 animate-aura-online' : 'border-red-400 animate-aura-offline'} opacity-50 hover:opacity-75 transition-opacity duration-300`}
                  ></div>
                </div>
              ) : (
                <div className={`relative w-32 h-32 rounded-full border-4 ${user.availability === 'online' ? 'border-green-400' : 'border-red-400'} shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <FaUserCircle className={`text-9xl ${user.availability === 'online' ? 'text-green-600' : 'text-red-600'} mx-auto mb-4`} />
                  <div
                    className={`absolute inset-0 rounded-full border-8 ${user.availability === 'online' ? 'border-green-400 animate-aura-online' : 'border-red-400 animate-aura-offline'} opacity-50 hover:opacity-75 transition-opacity duration-300`}
                  ></div>
                </div>
              )}
              <p className={`mt-2 text-sm font-bold animate-fade-in ${user.availability === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                {user.availability === 'online' ? 'Online' : 'Offline'}
              </p>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">{user?.name || 'Guest'}</h2>
            <p className="text-gray-600 capitalize">{user?.role || 'Learner'}</p>
            <p className="text-gray-500 mt-2">{user?.email || 'N/A'}</p>
            <button
              onClick={handleEditProfileClick}
              className="mt-4 w-full py-2 bg-gray-300 text-gray-600 rounded-full cursor-not-allowed flex items-center justify-center space-x-2 shadow-md"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </button>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Account Stats</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex justify-between text-sm">
                  <span>Created:</span>
                  <span>{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span>Updated:</span>
                  <span>{user?.updatedAt ? formatDate(user.updatedAt) : 'N/A'}</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span>User ID:</span>
                  <span className="truncate">{user?.userId || 'N/A'}</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Sections */}
        <div className="md:col-span-3 space-y-6">
          {/* Welcome Banner with Join Lobby Button */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            <h1 className="text-4xl font-extrabold mb-4 animate-fade-in">Welcome Back, {user?.name}! 🚀</h1>
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
          <section className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <FaBookOpen className="text-indigo-600" />
              <span>Your Bio</span>
            </h2>
            <textarea
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-800 font-bold resize-y min-h-[120px] bg-white bg-opacity-80"
              placeholder="Tell us about yourself..."
            />
            <button
              onClick={() => updateUserDetails('bio')}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <FaEdit />
              <span>{loading ? 'Updating...' : 'Update Bio'}</span>
            </button>
          </section>

          {/* Topics Editor */}
          <section className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <FaBookOpen className="text-indigo-600" />
              <span>Topics of Interest</span>
            </h2>
            <input
              type="text"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-800 font-bold bg-white bg-opacity-80"
              placeholder="Enter topics separated by commas, e.g., web development, app development"
            />
            <button
              onClick={() => updateUserDetails('topics')}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <FaEdit />
              <span>{loading ? 'Updating...' : 'Update Topics'}</span>
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
            <section className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <FaBookOpen className="text-indigo-600" />
                <span>Your Skills</span>
              </h2>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-800 font-bold bg-white bg-opacity-80"
                placeholder="Enter skills separated by commas, e.g., teaching, mentoring, coding"
              />
              <button
                onClick={() => updateUserDetails('skills')}
                disabled={loading}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <FaEdit />
                <span>{loading ? 'Updating...' : 'Update Skills'}</span>
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
      <footer className="bg-white bg-opacity-90 backdrop-blur-lg shadow-md p-4 text-center text-gray-500 text-sm">
        <p>© 2025 Learning Hub. All rights reserved.</p>
        <p className="mt-2">
          Made with ❤️ by{' '}
          <a href="mailto:developerhaseeb1234@gmail.com" className="text-indigo-600 font-bold hover:underline">
            Mohd Haseeb Ali
          </a>
        </p>
      </footer>

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
        @keyframes aura-online {
          0% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.7), 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(34, 197, 94, 1), 0 0 30px rgba(59, 130, 246, 0.7); }
          100% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.7), 0 0 20px rgba(59, 130, 246, 0.5); }
        }
        .animate-aura-online {
          animation: aura-online 2s infinite;
        }
        @keyframes aura-offline {
          0% { box-shadow: 0 0 10px rgba(107, 114, 128, 0.7), 0 0 20px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 20px rgba(107, 114, 128, 1), 0 0 30px rgba(239, 68, 68, 0.7); }
          100% { box-shadow: 0 0 10px rgba(107, 114, 128, 0.7), 0 0 20px rgba(239, 68, 68, 0.5); }
        }
        .animate-aura-offline {
          animation: aura-offline 2s infinite;
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
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