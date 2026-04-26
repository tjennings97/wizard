import { addMemberToRoom, removeMemberFromRoom } from "../services/rooms";
import { startGame } from "../services/games";
import { useAuth } from "../contexts/AuthContext";

export function JoinRoomButton({ role, roomId, onJoin }) {
    const { token, user, gameRoleChange } = useAuth();
    const roleLower = role.toLowerCase(); // Best not to reassign props directly

    async function addMember() {
        try {
            const data = await addMemberToRoom(roomId, user.id, roleLower, token);
            if (data.status === 201) {
                gameRoleChange(roleLower);
                onJoin(true, "Room joined successfully!");
            } else {
                throw new Error("Failed to join room.");
            }
        } catch (err) {
            onJoin(false, err.message || "Room not joined");
            console.error(err);
        }
    }

    return <button onClick={addMember}>Join as {role}</button>;
}

export function LeaveRoomButton({ roomId, onLeave }) {
    const { token, user, gameRoleChange } = useAuth();

    async function removeMember() {
        try {
            const data = await removeMemberFromRoom(roomId, user.id, token);
            if (data.status === 204) {
                gameRoleChange(null); // Explicitly clear the role
                onLeave(true, "Room left successfully!"); // true here means "Success"
            } else {
                throw new Error("Failed to leave room.");
            }
        } catch (err) {
            onLeave(false, err.message || "Error leaving room");
            console.error(err);
        }
    }

    return <button onClick={removeMember}>Leave Room</button>;
}

export function StartGameButton({ roomId, onStart }) {
    const { token } = useAuth();

    async function startTheGame() {
        try {
            const data = await startGame(roomId, token);
            if (data.status === 201) {
                onStart(true, "Game started successfully");
            } else {
                throw new Error("Failed to start game.")
            }
        } catch (err) {
            onStart(false, err.message || "Game not started")
            console.log(err)
        }
    }

    return <button onClick={startTheGame}>Start Game</button>
}