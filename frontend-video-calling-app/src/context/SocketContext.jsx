/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => {
        return io(
            import.meta.env.VITE_BACKEND_URL || "http://localhost:8000",
            {
                transports: ["websocket"], 
                reconnection: true
            }
        );
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
