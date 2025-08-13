/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo } from "react";
import { useContext } from "react";
import { io } from "socket.io-client";



const SocketContext = createContext();


export const useSocket = () => useContext(SocketContext);


export const SocketProvider = ({ children }) => {

    const socket = useMemo(() => {
        return io('http://localhost:8000');
    }, [])




    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}



