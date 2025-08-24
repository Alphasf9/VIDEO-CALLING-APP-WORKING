import React, { useCallback, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { useUser } from '../context/UserContext';
import { useEducator } from '../context/EducatorContext';

const Lobby = () => {
    const { roomId: contextRoomId } = useRoom();
    const { user } = useUser();
    const { educator } = useEducator();
    const socket = useSocket();
    const navigate = useNavigate();

    // Use email directly from context
    const email = user?.email || educator?.email || "";
    const room = contextRoomId || "";

    const handleJoinCall = useCallback(() => {
        if (!email || !room) {
            alert("Cannot join call: missing email or room ID");
            return;
        }

        console.log(`${email} joined room ${room}`);
        socket.emit('join-room', { email, room });
        navigate(`/room/${room}`);
    }, [email, room, socket, navigate]);

    // Optionally listen to join-room events if needed
    useEffect(() => {
        const handleJoinRoom = (data) => {
            console.log(`User ${data.email} has joined room ${data.room}`);
        };

        socket.on('join-room', handleJoinRoom);
        return () => socket.off('join-room', handleJoinRoom);
    }, [socket]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 border border-gray-100 transform transition-all duration-300 hover:shadow-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Learning Hub</h1>
                    <p className="text-gray-500 mt-2 text-base md:text-lg font-medium">
                        Seamless, Professional Video Conferencing
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Room ID</label>
                        <input
                            type="text"
                            value={room}
                            disabled
                            className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                    </div>

                    <button
                        onClick={handleJoinCall}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 font-semibold text-base md:text-lg shadow-md"
                    >
                        Join Video Call
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Lobby;
