export async function startGame(roomId, token) {
    let req = {
        "room_id": roomId,
        "status": "active"
    }

    const response = await fetch("/api/games", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(req)
    });

    const data = await response.json();
    return {
        data: data,
        status: response.status
    }
}