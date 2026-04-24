import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRoomContext } from "../contexts/RoomContext";
import { fetchRoomById } from "../services/rooms";
import RoomPregame from "../components/RoomPregame";

function Room() {
    const { id } = useParams();
    const { getRoomById, addRoomToContext } = useRoomContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Look for the specific room in our global context array
    const roomInfo = getRoomById(id)

    useEffect(() => {
        // If we don't have the room (e.g. user refreshed the page)
        if (!roomInfo) {
            const loadRoom = async () => {
                setLoading(true);
                try {
                    const data = await fetchRoomById(id);
                    if (data.error !== undefined) {
                        throw { error: data.error }
                    }
                    addRoomToContext(data); // Add it to context so it's there for next time
                } catch (err) {
                    console.error(err);
                    setError(true)
                    setLoading(false)
                } finally {
                    setLoading(false);
                }
            };
            loadRoom();
        } else {
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
        <div>
            <RoomPregame id={id} />
        </div>
        {/* Additional room-specific logic here 
    //         room member details
    //         join as player
    //         join as spectator
    //         logic to show buttons only on certain states
            
    //         */}
    </div>
}

export default Room