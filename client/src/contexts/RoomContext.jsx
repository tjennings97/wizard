import { createContext, useContext, useState } from "react";

const RoomContext = createContext();

export const useRoomContext = () => useContext(RoomContext);

export const RoomProvider = ({ children }) => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    // This helper lets you find a room by ID from the already-fetched list
    const getRoomById = (id) => {
        return rooms.find(r => r.id === parseInt(id));
    };

    // Helper to add a single room (used by the Room page on refresh)
    const addRoomToContext = (newRoom) => {
        setRooms((prev) => {
            if (prev.find(r => r.id === newRoom.id)) return prev;
            return [...prev, newRoom];
        });
    };

    const value = {
        rooms,
        setRooms,
        selectedRoom,
        setSelectedRoom,
        getRoomById,
        addRoomToContext
    };

    return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};