export async function fetchRooms(token) {

    const response = await fetch("/api/rooms", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    });
    const data = await response.json();
    return data;
}

export async function fetchRoomById(id, token) {
    const response = await fetch(`/api/rooms/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    });
    const data = await response.json();
    return data;
}

export async function fetchRoomMembers(id, token) {
    const response = await fetch(`/api/rooms/${id}/members`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    });
    const data = await response.json();
    return data;
}

export async function addMemberToRoom(roomId, userId, role, token) {
    const response = await fetch(`/api/rooms/${roomId}/members`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, role: role }),
        method: "POST"
    });

    // Check if there is content before parsing
    const data = response.status !== 204 ? await response.json() : null;
    
    return {
        data: data,
        status: response.status
    };
}

export async function removeMemberFromRoom(roomId, userId, token) {
    const response = await fetch(`/api/rooms/${roomId}/members/${userId}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        method: "DELETE"
    });

    return {
        status: response.status
    };
}