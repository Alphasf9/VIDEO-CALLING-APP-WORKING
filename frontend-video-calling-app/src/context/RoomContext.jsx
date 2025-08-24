/* eslint-disable react-refresh/only-export-components */
import { useEffect } from "react";
import { useState } from "react";
import { createContext, useContext } from "react";



const RoomContext = createContext();


export const RoomProvider = ({ children }) => {
    const [roomId, setRoomId] = useState(null);

    useEffect(() => {
        const roomId = localStorage.getItem("roomId");
        if (roomId) {
            setRoomId(roomId);
        }
    }, []);


    return (
        <RoomContext.Provider value={{ roomId, setRoomId }}>
            {children}
        </RoomContext.Provider>
    )
}


export const useRoom = () => useContext(RoomContext);