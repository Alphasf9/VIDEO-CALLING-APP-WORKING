import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
    const [email, setEmail] = useState('');
    const [room, setRoom] = useState('');
    const socket = useSocket();
    const navigate = useNavigate();

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        if (!email || !room) {
            alert("Please fill all fields to join the call");
            return;
        }
        console.log(`${email} joined room ${room}`);
        socket.emit('join-room', { email, room });
        navigate(`/room/${room}`);
    }, [email, room, socket, navigate]);

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;
        console.log(`User with email ${email} has joined room ${room}`);
        setEmail(email);
        setRoom(room);
    }, []);


  

    useEffect(() => {
        socket.on('join-room', handleJoinRoom);
        return () => {
            socket.off('join-room', handleJoinRoom);
        };
    }, [socket, handleJoinRoom]);

   
    const reviews = [
        {
            name: "Dr. Emily Harper",
            role: "Chief Technology Officer",
            review: "Learning Hub delivers unmatched video quality and reliability, transforming our global team meetings into seamless experiences.",
            rating: 5,
        },
        {
            name: "James Patel",
            role: "Project Manager",
            review: "The intuitive interface and robust performance make Learning Hub the perfect tool for coordinating with clients worldwide.",
            rating: 4,
        },
        {
            name: "Sophia Nguyen",
            role: "Educator & Consultant",
            review: "Learning Hub's elegant design and flawless connectivity have elevated my virtual workshops to a professional standard.",
            rating: 5,
        },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-8">
            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 border border-gray-100 transform transition-all duration-300 hover:shadow-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Learning Hub</h1>
                    <p className="text-gray-500 mt-2 text-base md:text-lg font-medium">
                        Seamless, Professional Video Conferencing
                    </p>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="room" className="block text-sm font-semibold text-gray-800 mb-2">
                            Room ID
                        </label>
                        <input
                            type="text"
                            id="room"
                            name="room"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            placeholder="Enter your room ID"
                            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 font-semibold text-base md:text-lg shadow-md"
                    >
                        Join Video Call
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6 font-medium">
                    Need assistance?{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200">
                        Contact Support
                    </a>
                </p>
            </div>

            {/* Reviews Section */}
            <div className="w-full max-w-4xl mt-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
                    Trusted by Professionals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((review, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="flex items-center mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className="w-5 h-5 text-yellow-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118l-3.39-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-gray-600 text-sm italic mb-4">"{review.review}"</p>
                            <div>
                                <p className="text-gray-800 font-semibold">{review.name}</p>
                                <p className="text-gray-500 text-sm">{review.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Lobby;