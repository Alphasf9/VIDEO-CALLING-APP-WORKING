/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

let socket; // singleton

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    if (!socket) {
        socket = io("http://localhost:8000");
        console.log("🟢 Socket initialized:", socket.id);
    }

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
