import { useEffect, useState } from "react";
import { fetchRooms } from "../services/rooms";
import RoomItem from "../components/RoomItem";
import { useRoomContext } from "../contexts/RoomContext";

function Lobby() {

    const {rooms, setRooms} = useRoomContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    //get rooms
    useEffect(() => {
        if (rooms.length === 3) {
            setLoading(false); // Skip fetch if we already have them!
            return;
        }

        const loadRooms = async () => {
            try {
                const data = await fetchRooms();
                if(data.error !== undefined) {
                    throw { error: data.error}
                }
                setRooms(data);
            } catch (err) {
                console.log(err);
                setError(true)
            } finally {
                setLoading(false);
            }
        };

        loadRooms();
    }, []);


    return <div className="lobby-page">
        <h1 className="lobby-title">Lobby</h1>
        {loading ? (
            <div className="loading">Loading...</div>
        ) : (error ? (
            <div className="error">There was an error.</div>
        ) : (
            <div className="lobby-list">
                <ul>
                    {rooms.map((room) => (
                        <RoomItem room={room} key={room.id} />
                    ))}
                </ul>

            </div>
        ))}
    </div>

}

export default Lobby;

