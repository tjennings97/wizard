export async function userLogin(username, password) {
    let req = {
        "username": username,
        "password": password
    }

    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req)
    });

    const data = await response.json();
    return {
        data: data,
        status: response.status,
        ok: response.ok
    };
}

export async function fetchUserById(id, token) {
    const response = await fetch(`/api/users/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    });
    const data = await response.json();
    return data;
}