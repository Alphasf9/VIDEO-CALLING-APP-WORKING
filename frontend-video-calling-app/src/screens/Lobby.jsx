import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { useUser } from '../context/UserContext';
import { useEducator } from '../context/EducatorContext';
import { FaVideo, FaEnvelope, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const Lobby = () => {
    const { roomId: contextRoomId } = useRoom();
    const { user } = useUser();
    const { educator } = useEducator();
    const socket = useSocket();
    const navigate = useNavigate();
    const [showErrorModal, setShowErrorModal] = useState(false);

    const email = user?.email || educator?.email || "";
    const room = Array.isArray(contextRoomId) && contextRoomId.length > 0
        ? contextRoomId[contextRoomId.length - 1]
        : "";


    const handleJoinCall = useCallback(() => {
        if (!email || !room) {
            setShowErrorModal(true);
            return;
        }

        console.log(`${email} joined room ${room}`);
        socket.emit('join-room', { email, room });
        navigate(`/room/${room}`);
    }, [email, room, socket, navigate]);

    useEffect(() => {
        const handleJoinRoom = (data) => {
            console.log(`User ${data.email} has joined room ${data.room}`);
        };

        socket.on('join-room', handleJoinRoom);
        return () => socket.off('join-room', handleJoinRoom);
    }, [socket]);

    const handleCloseModal = () => {
        setShowErrorModal(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
            {/* Particle Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-300 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-300 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform animate-fade-in">
                        <div className="flex items-center space-x-3 mb-4">
                            <FaExclamationTriangle className="text-red-500 text-2xl" />
                            <h2 className="text-2xl font-bold text-gray-800">Unable to Join Call</h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Please ensure both your email address and room ID are provided before joining the video conference.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <FaTimes />
                                <span>Close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl w-full max-w-lg p-8 md:p-12 border border-gray-200 transform transition-all duration-500 hover:shadow-2xl z-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 animate-fade-in">
                        Learning Hub
                    </h1>
                    <p className="text-gray-600 mt-4 text-lg md:text-xl font-medium max-w-md mx-auto">
                        Empower your learning journey with seamless, high-quality video conferencing designed for educators and learners.
                    </p>
                </div>

                <div className="space-y-8">
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full px-5 py-3 pl-10 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
                            />
                            <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-indigo-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Room ID</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={room}
                                disabled
                                className="w-full px-5 py-3 pl-10 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
                            />
                            <FaVideo className="absolute top-1/2 left-3 transform -translate-y-1/2 text-indigo-500" />
                        </div>
                    </div>

                    <button
                        onClick={handleJoinCall}
                        className="w-full bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-3 rounded-xl hover:from-indigo-800 hover:to-purple-800 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2 animate-pulse"
                    >
                        <FaVideo className="text-xl" />
                        <span>Join Video Conference</span>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white bg-opacity-95 backdrop-blur-lg shadow-md p-4 text-center text-gray-500 text-sm mt-8 w-full">
                <p>© 2025 Learning Hub. All rights reserved.</p>
                <p className="mt-2">
                    Have feedback or suggestions? Contact us at{' '}
                    <a href="mailto:developerhaseeb1234@gmail.com" className="text-indigo-600 font-semibold hover:underline">
                        developerhaseeb1234@gmail.com
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

export default Lobby;