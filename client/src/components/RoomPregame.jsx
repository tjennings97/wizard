import { fetchRoomMembers } from "../services/rooms";
import { useState, useEffect } from "react";
import UserItem from "./UserItem";

function RoomPregame({id}) {
    const [players, setPlayers] = useState([]);
    const [spectators, setSpectators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState({})

    //get room members
    useEffect(() => {

        const loadRoomMembers = async () => {
            try {
                const data = await fetchRoomMembers(id);
                if (data.error !== undefined) {
                    throw { error: data.error }
                }
                setPlayers(data.length > 0 ? data.filter(member => member.role === "player") : []);
                setSpectators(data.length > 0 ? data.filter(member => member.role === "spectator") : []);
            } catch (err) {
                console.log(err);
                setError(true)
                setErrorMsg(err)
            } finally {
                setLoading(false);
            }
        };

        loadRoomMembers();
    }, []);

    return <div className="room-pregame-details">
        {loading ? (
            <div className="loading">Loading...</div>
        ) : (error ? 
            (errorMsg.error === "Room members not found" ? (
                <div className="error">No users in this room.</div>
            ) : (
                <div className="error">There was an error.</div>
            )
        ) : (
            <div className="room-pregame-details-list">
                Players
                <ul>
                    {players.map((player) => (
                        <UserItem id={player.user_id} key={player.user_id} />
                    ))}
                </ul>
                Spectators
                <ul>
                    {spectators.map((spectator) => (
                        <UserItem id={spectator.user_id} key={spectator.user_id} />
                    ))}
                </ul>
            </div>
        ))}
    </div>


}

export default RoomPregame