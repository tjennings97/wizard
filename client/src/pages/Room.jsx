import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRoomContext } from "../contexts/RoomContext";
import { fetchRoomById } from "../services/rooms";
import RoomPregame from "../components/RoomPregame";
import { useAuth } from "../contexts/AuthContext";

function Room() {
    const { id } = useParams();
    const { getRoomById, addRoomToContext } = useRoomContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { token } = useAuth();

    // Look for the specific room in our global context array
    const roomInfo = getRoomById(id)
    const [start, setStart] = useState(false);

    const loadRoom = async () => {
        setLoading(true);
        try {
            const data = await fetchRoomById(id, token);
            if (data.error !== undefined) {
                throw { error: data.error }
            }
            addRoomToContext(data); // Add it to context so it's there for next time
            setStart(data.status)
        } catch (err) {
            console.error(err);
            setError(true)
            setLoading(false)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // If we don't have the room (e.g. user refreshed the page)
        if (!roomInfo) {
            loadRoom();
        } else {
            setStart(roomInfo.status)
            setLoading(false)
        }
    }, [id, roomInfo, addRoomToContext]);

    return <div className="room-page">
        {loading ? (
            <p>Loading room...</p>
        ) : (error ? (
            <div className="error">There was an error.</div>
        ) : (
            <div className="room-info">
                {roomInfo.id}: {roomInfo.status}
            </div>
        ))}
        {(start === "open" || start === "waiting") ? (
            <div>
                <RoomPregame id={id} roomStatus={roomInfo.status} loadRoomDetails={loadRoom} />
            </div>) : ((start === "playing") ?
                (<p>Game is started.</p>) :
                (<p>Room is busy.</p>)
        )}
    </div>
}

export default Room