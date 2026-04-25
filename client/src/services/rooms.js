let toke = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ3LCJ1c2VybmFtZSI6InRhbWFyYSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NjkwNzAyMiwiZXhwIjoxNzc2OTE0MjIyfQ.Kuo69_3DA27p11AJmktXa-ik-1bSE6L96IMK0RAP4V4";
toke = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ3LCJ1c2VybmFtZSI6InRhbWFyYSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NzA1Njg4NiwiZXhwIjoxNzc3MDY0MDg2fQ.PybgtfEsksSDB1NciZgZCxSKxqIHlSdYMRmaLHlRmDE";

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

    // DELETE almost always returns 204 (No Content)
    // Parsing an empty body will throw a SyntaxError
    const data = response.status !== 204 ? await response.json() : null;

    return {
        data: data,
        status: response.status
    };
}