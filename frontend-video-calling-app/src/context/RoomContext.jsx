/* eslint-disable react-refresh/only-export-components */
import { useEffect } from "react";
import { useState } from "react";
import { createContext, useContext } from "react";



const RoomContext = createContext();


export const RoomProvider = ({ children }) => {
    const [roomId, setRoomIdState] = useState([]);

    useEffect(() => {
        const savedRoomIds = localStorage.getItem("roomId");
        if (savedRoomIds) {
            try {
                setRoomIdState(JSON.parse(savedRoomIds));

            } catch {
                setRoomIdState([savedRoomIds])
            }
        }
    }, []);

    const setRoomId = (id) => {
        if (!id) return;

        setRoomIdState((prev) => {
            const updated = [...new Set([...prev, id])];
            localStorage.setItem("roomId", JSON.stringify(updated));
            return updated;
        });
    };

    const removeRoomId = (id) => {
        if (!id) return;

        setRoomIdState((prev) => {
            const updated = prev.filter((room) => room !== id);
            localStorage.setItem("roomId", JSON.stringify(updated));
            return updated;
        });
    };

    const clearRoomId = () => {
        localStorage.removeItem("roomId");
        setRoomIdState([]);
    };

    return (
        <RoomContext.Provider value={{ roomId, setRoomId, removeRoomId, clearRoomId }}>
            {children}
        </RoomContext.Provider>
    );
};



export const useRoom = () => useContext(RoomContext);