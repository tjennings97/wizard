import { createContext, useContext, useState, useMemo } from "react";

const RoomContext = createContext();

export function RoomProvider({ children }) {
    const [room, setRoom] = useState(null);
    const [members, setMembers] = useState([]);
    const [game, setGame] = useState(null);

    const players = useMemo(
        () => members.filter(m => m.role === "player"),
        [members]
    );

    const spectators = useMemo(
        () => members.filter(m => m.role === "spectator"),
        [members]
    );

    return (
        <RoomContext.Provider value={{
            room, setRoom,
            members, setMembers,
            players,
            spectators,
            game, setGame
        }}>
            {children}
        </RoomContext.Provider>
    );
}

export const useRoom = () => useContext(RoomContext);