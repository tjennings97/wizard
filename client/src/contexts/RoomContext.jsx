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
            const roomExists = prev.find(r => r.id === newRoom.id);

            if (roomExists) {
                // Update the existing room in the list with fresh data
                return prev.map((r) => (r.id === newRoom.id ? newRoom : r));
            }
            // If it doesn't exist, append it
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