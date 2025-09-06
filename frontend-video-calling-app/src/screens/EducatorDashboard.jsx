import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEducator } from '../context/EducatorContext';
import api from '../api/AxiosInstance';
import { FaUserCircle, FaEdit, FaSignOutAlt, FaBookOpen, FaChartLine, FaRocket, FaUsers, FaVideo, FaStar, FaCheck, FaTimes, FaLightbulb, FaQuoteLeft } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext';
import { useRoom } from '../context/RoomContext';
import SessionDetails from './SessionDetails';
import UserSessions from './UserSessions';
import SearchLearners from './SearchLearner';


const EducatorDashboard = () => {
    const { educator: user, setEducator } = useEducator();
    const navigate = useNavigate();
    const socket = useSocket();
    const [bioInput, setBioInput] = useState(user?.bio || '');
    const [topicsInput, setTopicsInput] = useState(user?.topics?.join(', ') || '');
    const [skillsInput, setSkillsInput] = useState(user?.skills?.join(', ') || '');
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [connectionRequest, setConnectionRequest] = useState(null);
    const [recentRoomId, setRecentRoomId] = useState();
    const [query, setQuery] = useState('');

    const { setRoomId } = useRoom();

    const searchMessages = [
        'Finding the best learners for you...',
        'Analyzing interests and skills...',
        'Connecting with eager students...',
        'Matching your expertise perfectly...',
        'Preparing your teaching lobby...',
    ];

    const inspirationalQuotes = [
        { text: "The best teachers are those who show you where to look, but don't tell you what to see.", author: "Alexandra K. Trenfor" },
        { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "William Butler Yeats" },
        { text: "Teaching is the greatest act of optimism.", author: "Colleen Wilcox" },
        { text: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren" },
    ];

    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    useEffect(() => {
        const quoteInterval = setInterval(() => {
            setCurrentQuoteIndex((prev) => (prev + 1) % inspirationalQuotes.length);
        }, 10000);
        return () => clearInterval(quoteInterval);
    }, []);

    function generateRoomId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let roomId = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            roomId += chars[randomIndex];
        }
        return roomId;
    }

    useEffect(() => {
        let interval;
        if (isSearching) {
            interval = setInterval(() => {
                setCurrentMessageIndex((prev) => (prev + 1) % searchMessages.length);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isSearching, searchMessages.length]);

    useEffect(() => {
        if (user && socket) {
            socket.emit('update-availability', {
                userId: user.userId,
                socketId: socket.id,
                status: 'online',
                educatorId: user.userId
            });

            return () => {
                socket.off('connection-request-by-learner');
            };
        }
    }, [socket, user]);

    useEffect(() => {
        if (!socket) return;

        const handleConnectionRequest = ({ from }) => {
            console.log(`We got a connection request from learner ${from}`);
            setConnectionRequest({ from });
        };

        socket.on('connection-request-by-educator', handleConnectionRequest);

        return () => {
            socket.off('connection-request-by-educator', handleConnectionRequest);
        };
    }, [socket]);

    const handleAcceptRequest = () => {
        console.log(`Accepted connection request from ${connectionRequest.from}`);
        const room = generateRoomId();
        setRoomId(room);
        navigate("/lobby", { state: { userId: user.email } });
        socket.emit("educator-accepted-room", {
            educatorId: user.userId,
            learnerId: connectionRequest.from,
            roomId: room,
            userId: user.email
        });

        setConnectionRequest(null);
    };

    const realRoomId = localStorage.getItem("roomId");
    useEffect(() => {
        if (realRoomId) {
            setRecentRoomId(realRoomId);
        }
    }, [realRoomId]);

    const handleRejectRequest = () => {
        console.log(`Rejected connection request from ${connectionRequest.from}`);
        setConnectionRequest(null);
    };

    const handleLogout = async () => {
        try {
            await api.post('/users/user-logout');
            setEducator(null);
            navigate('/educator/login');
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
            setEducator(data.user);
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
            const { data } = await api.post('/matches/match/educator-to-learner', {
                educatorId: user.userId,
                skills: user.skills,
            });
            setEducator(data);
            navigate('/matched/learner');
        } catch (err) {
            console.error('Error while searching learner:', err);
            alert('Failed to find learners. Try again.');
            setIsSearching(false);
        }
    };

    const welcomeMessage = 'Join the Learning Lobby to share your expertise with eager learners. Connect and inspire through your skills!';

    if (isSearching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex flex-col items-center justify-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <FaRocket className="text-6xl mb-6 animate-bounce" />
                <h2 className="text-3xl font-bold mb-4">Finding Your Perfect Learners...</h2>
                <p className="text-xl mb-8 animate-fade-in-out">{searchMessages[currentMessageIndex]}</p>
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
            {/* Enhanced Particle Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-112 h-112 bg-purple-300 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Connection Request Modal */}
            {connectionRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-fade-in">
                        <h2 className="text-2xl font-extrabold text-gray-800 mb-4 flex items-center space-x-2">
                            <FaUsers className="text-indigo-600 text-3xl" />
                            <span>New Connection Request</span>
                        </h2>
                        <p className="text-gray-600 mb-6 text-lg">
                            You've received a connection request from Learner <span className="font-bold text-indigo-600">{connectionRequest.from}</span>.
                            Ready to inspire and teach?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleRejectRequest}
                                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-full hover:from-red-600 hover:to-red-800 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <FaTimes />
                                <span>Decline</span>
                            </button>
                            <button
                                onClick={handleAcceptRequest}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <FaCheck />
                                <span>Accept & Join</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Navigation Bar */}
            <nav className="bg-white bg-opacity-95 backdrop-blur-lg shadow-md p-4 fixed w-full z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img src="/logo2.png" alt="Platform Logo"
                            className="h-12 w-12 object-contain rounded-full bg-white p-2 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        />
                        <h1 className="text-3xl font-extrabold text-indigo-700">Learning Hub</h1>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for learners or topics..."
                                className="pl-12 pr-6 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 font-medium bg-white bg-opacity-80 w-80"
                            />
                            <FaUsers className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 text-xl" />
                        </div>
                        <SearchLearners query={query} />
                        <div className="relative group">
                            {user?.avatarUrl ? (
                                <div className={`relative w-12 h-12 rounded-full border-2 ${user.availability === 'online' ? 'border-green-500' : 'border-red-500'} shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer`}>
                                    <img
                                        src={user.avatarUrl}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                        onClick={() => navigate('/profile')}
                                    />
                                    <div
                                        className={`absolute inset-0 rounded-full border-4 ${user.availability === 'online' ? 'border-green-500 animate-aura-online' : 'border-red-500 animate-aura-offline'} opacity-40 group-hover:opacity-70 transition-opacity duration-300`}
                                    ></div>
                                </div>
                            ) : (
                                <div className={`relative w-12 h-12 rounded-full border-2 ${user.availability === 'online' ? 'border-green-500' : 'border-red-500'} shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer`}>
                                    <FaUserCircle
                                        className={`text-5xl ${user.availability === 'online' ? 'text-green-600' : 'text-red-600'} hover:scale-105 transition-transform duration-300`}
                                        onClick={() => navigate('/profile')}
                                    />
                                    <div
                                        className={`absolute inset-0 rounded-full border-4 ${user.availability === 'online' ? 'border-green-500 animate-aura-online' : 'border-red-500 animate-aura-offline'} opacity-40 group-hover:opacity-70 transition-opacity duration-300`}
                                    ></div>
                                </div>
                            )}
                            <div className="absolute top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-sm rounded-lg py-2 px-4 shadow-lg">
                                {user.availability === 'online' ? 'Online and Ready to Teach' : 'Offline - Come Back Soon!'}
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <FaSignOutAlt className="text-xl" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content - Modular Grid Layout */}
            <main className="max-w-7xl mx-auto pt-32 pb-12 px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar - Profile Card */}
                <aside className="md:col-span-1 space-y-8">
                    <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-300">
                        <div className="relative inline-block mb-4">
                            {user?.avatarUrl ? (
                                <div className={`relative w-32 h-32 rounded-full border-4 ${user.availability === 'online' ? 'border-green-500' : 'border-red-500'} shadow-lg hover:shadow-xl transition-all duration-300`}>
                                    <img
                                        src={user.avatarUrl}
                                        alt={`${user.name}'s profile`}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                    <div
                                        className={`absolute inset-0 rounded-full border-8 ${user.availability === 'online' ? 'border-green-500 animate-aura-online' : 'border-red-500 animate-aura-offline'} opacity-40 hover:opacity-70 transition-opacity duration-300`}
                                    ></div>
                                </div>
                            ) : (
                                <div className={`relative w-32 h-32 rounded-full border-4 ${user.availability === 'online' ? 'border-green-500' : 'border-red-500'} shadow-lg hover:shadow-xl transition-all duration-300`}>
                                    <FaUserCircle className={`text-9xl ${user.availability === 'online' ? 'text-green-600' : 'text-red-600'} mx-auto`} />
                                    <div
                                        className={`absolute inset-0 rounded-full border-8 ${user.availability === 'online' ? 'border-green-500 animate-aura-online' : 'border-red-500 animate-aura-offline'} opacity-40 hover:opacity-70 transition-opacity duration-300`}
                                    ></div>
                                </div>
                            )}
                            <p className={`mt-3 text-sm font-semibold ${user.availability === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                                {user.availability === 'online' ? 'Online' : 'Offline'}
                            </p>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-800">{user?.name || 'Guest'}</h2>
                        <p className="text-gray-600 text-lg capitalize">{user?.role || 'Educator'}</p>
                        <p className="text-gray-500 mt-2 text-md">{user?.email || 'N/A'}</p>
                        <button
                            onClick={handleEditProfileClick}
                            className="mt-6 w-full py-3 bg-gray-200 text-gray-700 rounded-full cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            <FaEdit className="text-xl" />
                            <span className="font-semibold">Edit Profile</span>
                        </button>
                        <div className="mt-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Account Insights</h3>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex justify-between text-md">
                                    <span>Created:</span>
                                    <span className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                                </li>
                                <li className="flex justify-between text-md">
                                    <span>Updated:</span>
                                    <span className="font-medium">{user?.updatedAt ? formatDate(user.updatedAt) : 'N/A'}</span>
                                </li>
                                <li className="flex justify-between text-md">
                                    <span>User ID:</span>
                                    <span className="font-medium truncate">{user?.userId || 'N/A'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Inspirational Quote Section */}
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                            <FaLightbulb className="text-yellow-500 text-2xl" />
                            <span>Teaching Inspiration</span>
                        </h3>
                        <div className="relative">
                            <FaQuoteLeft className="absolute top-0 left-0 text-indigo-300 text-3xl opacity-50" />
                            <p className="text-gray-700 italic text-md mb-2 pl-8 pr-4">{inspirationalQuotes[currentQuoteIndex].text}</p>
                            <p className="text-right text-gray-500 text-sm font-medium">- {inspirationalQuotes[currentQuoteIndex].author}</p>
                        </div>
                    </div>
                </aside>

                {/* Main Sections */}
                <div className="md:col-span-3 space-y-8">
                    {/* Enhanced Welcome Banner */}
                    <section className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-3xl shadow-2xl p-10 text-center relative overflow-hidden transform hover:scale-102 transition-all duration-500">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                        <h1 className="text-5xl font-extrabold mb-4 animate-fade-in text-shadow-lg">Welcome Back, {user?.name}! 🚀</h1>
                        <p className="text-xl mb-8 font-medium">{welcomeMessage}</p>
                        <button
                            onClick={handleSearch}
                            className="px-10 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-gray-900 font-bold rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center space-x-3 mx-auto shadow-2xl hover:shadow-3xl transform hover:scale-110 animate-pulse"
                        >
                            <FaVideo className="text-2xl" />
                            <span>Find Learners</span>
                        </button>
                    </section>

                    {/* Teaching Analytics */}
                    <section className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 transform hover:scale-102 transition-all duration-300">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                            <FaChartLine className="text-indigo-600 text-3xl" />
                            <span>Teaching Analytics</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
                                <FaChartLine className="text-3xl text-indigo-600 mb-2 mx-auto" />
                                <p className="text-gray-700 font-semibold text-md">Hours Taught</p>
                                <p className="text-2xl font-bold text-indigo-700">120</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
                                <FaUsers className="text-3xl text-indigo-600 mb-2 mx-auto" />
                                <p className="text-gray-700 font-semibold text-md">Learners Reached</p>
                                <p className="text-2xl font-bold text-indigo-700">45</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
                                <FaVideo className="text-3xl text-indigo-600 mb-2 mx-auto" />
                                <p className="text-gray-700 font-semibold text-md">Sessions Completed</p>
                                <p className="text-2xl font-bold text-indigo-700">78</p>
                            </div>
                        </div>
                    </section>

                    {/* Bio Editor */}
                    <section className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 transform hover:scale-102 transition-all duration-300">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                            <FaBookOpen className="text-indigo-600 text-3xl" />
                            <span>Your Professional Bio</span>
                        </h2>
                        <textarea
                            value={bioInput}
                            onChange={(e) => setBioInput(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-6 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 font-medium resize-y min-h-[160px] bg-white bg-opacity-80 shadow-inner"
                            placeholder="Share your teaching expertise, experience, and passions..."
                        />
                        <button
                            onClick={() => updateUserDetails('bio')}
                            disabled={loading}
                            className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-3 shadow-md hover:shadow-lg"
                        >
                            <FaEdit className="text-xl" />
                            <span>{loading ? 'Updating...' : 'Update Bio'}</span>
                        </button>
                    </section>

                    {/* Topics Editor */}
                    <section className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 transform hover:scale-102 transition-all duration-300">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                            <FaBookOpen className="text-indigo-600 text-3xl" />
                            <span>Topics You Teach</span>
                        </h2>
                        <input
                            type="text"
                            value={topicsInput}
                            onChange={(e) => setTopicsInput(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-6 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 font-medium bg-white bg-opacity-80 shadow-inner"
                            placeholder="Enter topics separated by commas, e.g., AI Ethics, Quantum Computing, Sustainable Development"
                        />
                        <button
                            onClick={() => updateUserDetails('topics')}
                            disabled={loading}
                            className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-3 shadow-md hover:shadow-lg"
                        >
                            <FaEdit className="text-xl" />
                            <span>{loading ? 'Updating...' : 'Update Topics'}</span>
                        </button>
                        {user?.topics && user.topics.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {user.topics.map((topic, index) => (
                                    <span key={index} className="px-4 py-2 bg-indigo-100 text-indigo-800 font-semibold rounded-full text-sm shadow-sm">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Skills Editor */}
                    <section className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 transform hover:scale-102 transition-all duration-300">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                            <FaBookOpen className="text-indigo-600 text-3xl" />
                            <span>Your Expertise & Skills</span>
                        </h2>
                        <input
                            type="text"
                            value={skillsInput}
                            onChange={(e) => setSkillsInput(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-6 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 font-medium bg-white bg-opacity-80 shadow-inner"
                            placeholder="Enter skills separated by commas, e.g., Leadership, Data Analysis, Public Speaking"
                        />
                        <button
                            onClick={() => updateUserDetails('skills')}
                            disabled={loading}
                            className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-3 shadow-md hover:shadow-lg"
                        >
                            <FaEdit className="text-xl" />
                            <span>{loading ? 'Updating...' : 'Update Skills'}</span>
                        </button>
                        {user?.skills && user.skills.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {user.skills.map((skill, index) => (
                                    <span key={index} className="px-4 py-2 bg-indigo-100 text-indigo-800 font-semibold rounded-full text-sm shadow-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Recent Sessions */}
                    <div className="p-6 bg-white shadow-md rounded-2xl">
                        {user.isPremium ? (
                            <>
                                {/* Recent Session Section */}
                                <section className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 transform hover:scale-102 transition-all duration-300">
                                    <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                                        <FaVideo className="text-indigo-600 text-3xl" />
                                        <span>Your Recent Session</span>
                                    </h2>
                                    {recentRoomId ? (
                                        <SessionDetails sessionId={recentRoomId} userId={user.userId} />
                                    ) : (
                                        <div className="text-center py-12">
                                            <FaVideo className="text-5xl text-indigo-300 mb-4 mx-auto" />
                                            <p className="text-xl font-semibold text-gray-700 mb-2">
                                                No recent sessions yet.
                                            </p>
                                            <p className="text-gray-500 text-md mb-6">
                                                Start a new teaching session to inspire and guide your learners!
                                            </p>
                                            <button
                                                onClick={handleSearch}
                                                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-gray-900 font-bold rounded-full 
                         hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center 
                         space-x-3 mx-auto shadow-2xl hover:shadow-3xl transform hover:scale-110"
                                            >
                                                <FaRocket className="text-2xl" />
                                                <span>Find Learners</span>
                                            </button>
                                        </div>
                                    )}
                                </section>

                                {/* Session Analysis Section */}
                                <UserSessions userId={user.userId} recentRoomId={recentRoomId} />
                            </>
                        ) : (
                            // Upgrade Prompt for Free Educators
                            <div className="text-center py-12 px-6">
                                <h2 className="text-3xl font-bold mb-4 text-gray-800">
                                    Unlock Premium Teaching Tools ✨
                                </h2>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    Gain access to <span className="font-semibold text-indigo-600">detailed session insights</span>,
                                    track your <span className="font-semibold">student engagement</span>, and showcase your impact
                                    as an educator. Upgrade to <span className="font-bold">Learning Hub Premium</span> and take your
                                    teaching to the next level.
                                </p>
                                <a
                                    href="/"
                                    className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-xl 
                   hover:bg-indigo-700 transition-all font-semibold shadow-md hover:shadow-lg"
                                >
                                    🚀 Upgrade to Premium
                                </a>
                            </div>
                        )}
                    </div>



                    {/* Community Spotlight */}
                    <section className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-3xl shadow-2xl p-8 transform hover:scale-102 transition-all duration-500">
                        <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                            <FaStar className="text-yellow-400 text-3xl" />
                            <span>Community Spotlight</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-white bg-opacity-20 rounded-xl shadow-sm transform hover:-translate-y-1 transition-all duration-300">
                                <p className="text-md italic">"Your React course transformed my students' careers!"</p>
                                <p className="text-sm font-semibold mt-2 text-yellow-200">– Priya S., Learner</p>
                            </div>
                            <div className="p-6 bg-white bg-opacity-20 rounded-xl shadow-sm transform hover:-translate-y-1 transition-all duration-300">
                                <p className="text-md italic">"This platform makes connecting with learners seamless and rewarding!"</p>
                                <p className="text-sm font-semibold mt-2 text-yellow-200">– Dr. Rajesh K., Educator</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white bg-opacity-95 backdrop-blur-lg shadow-md p-6 text-center text-gray-500 text-md">
                <p>© 2025 Learning Hub. All rights reserved.</p>
                <p className="mt-3">
                    Crafted with passion by{' '}
                    <a href="mailto:developerhaseeb1234@gmail.com" className="text-indigo-700 font-semibold hover:underline">
                        Mohd Haseeb Ali
                    </a>
                </p>
            </footer>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.2); }
                    66% { transform: translate(-20px, 20px) scale(0.8); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 8s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes aura-online {
                    0% { box-shadow: 0 0 12px rgba(34, 197, 94, 0.8), 0 0 24px rgba(59, 130, 246, 0.6); }
                    50% { box-shadow: 0 0 24px rgba(34, 197, 94, 1), 0 0 36px rgba(59, 130, 246, 0.8); }
                    100% { box-shadow: 0 0 12px rgba(34, 197, 94, 0.8), 0 0 24px rgba(59, 130, 246, 0.6); }
                }
                .animate-aura-online {
                    animation: aura-online 2.5s infinite;
                }
                @keyframes aura-offline {
                    0% { box-shadow: 0 0 12px rgba(107, 114, 128, 0.8), 0 0 24px rgba(239, 68, 68, 0.6); }
                    50% { box-shadow: 0 0 24px rgba(107, 114, 128, 1), 0 0 36px rgba(239, 68, 68, 0.8); }
                    100% { box-shadow: 0 0 12px rgba(107, 114, 128, 0.8), 0 0 24px rgba(239, 68, 68, 0.6); }
                }
                .animate-aura-offline {
                    animation: aura-offline 2.5s infinite;
                }
                @keyframes fade-in {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pulse {
                    animation: pulse 2.5s infinite;
                }
                .text-shadow-lg {
                    text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};

export default EducatorDashboard;