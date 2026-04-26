import { fetchRoomMembers } from "../services/rooms";
import { useState, useEffect, useCallback } from "react";
import UserItem from "./UserItem";
import { useAuth } from "../contexts/AuthContext";
import { JoinRoomButton, LeaveRoomButton, StartGameButton } from "./Buttons";

function RoomPregame({ id, roomStatus, loadRoomDetails }) {
    const [players, setPlayers] = useState([]);
    const [spectators, setSpectators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const { user, token, gameRole } = useAuth();
    const [join, setJoin] = useState(false);

    // Use callback so it can be safely used in useEffect
    const loadRoomMembers = useCallback(async () => {
        try {
            const data = await fetchRoomMembers(id, token);

            if (data.error) {
                setPlayers([]);
                setSpectators([])
                throw new Error(data.error);
            }
            const playerList = data.filter(m => m.role === "player");
            const spectatorList = data.filter(m => m.role === "spectator");

            setPlayers(playerList);
            setSpectators(spectatorList);

            // Check if current user is already in the room
            const isUserInRoom = data.some(m => m.user_id === user?.id);
            setJoin(isUserInRoom);
            setErrorMsg(""); // Clear errors on success
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "Failed to load room members.");
        } finally {
            setLoading(false);
        }
    }, [id, token, user?.id]);

    useEffect(() => {
        loadRoomMembers();
    }, [loadRoomMembers]);

    const postJoin = (success, message) => {
        if (success) {
            loadRoomMembers();
            loadRoomDetails();
        } else {
            setErrorMsg(message);
        }
    };

    const postLeave = (success, message) => {
        if (success) {
            setJoin(false);
            loadRoomMembers();
            loadRoomDetails();
        } else {
            setErrorMsg(message);
        }
    };

    const postStart = (success, message) => {
        if(success) {
            console.log("started")
            loadRoomMembers();
            loadRoomDetails();
        } else {
            setErrorMsg(message)
        }
    }

    if (loading) return <div className="loading">Loading room details...</div>;

    return (
        <div className="room-pregame-details">
            {errorMsg && <div className="error-message">{errorMsg}</div>}

            <div className="room-pregame-details-list">
                <h3>Players</h3>
                {players.length > 0 ? (
                    <ul>
                        {players.map(p => <UserItem id={p.user_id} key={p.user_id} />)}
                    </ul>
                ) : <p>No players yet.</p>}

                <h3>Spectators</h3>
                {spectators.length > 0 ? (
                    <ul>
                        {spectators.map(s => <UserItem id={s.user_id} key={s.user_id} />)}
                    </ul>
                ) : <p>No spectators yet.</p>}
            </div>

            <div className="room-controls">
                {!join ? (
                    <>
                        {(roomStatus === "open" || roomStatus === "waiting") && <JoinRoomButton role="player" roomId={id} onJoin={postJoin} />}
                        <JoinRoomButton role="spectator" roomId={id} onJoin={postJoin} />
                    </>
                ) : (
                    <>
                        {(gameRole === "player" && roomStatus === "waiting") && <StartGameButton roomId={id} onStart={postStart}/>}
                        <LeaveRoomButton roomId={id} onLeave={postLeave} />
                    </>
                )}
            </div>
        </div>
    );
}

export default RoomPregame;