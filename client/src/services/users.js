let toke = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ3LCJ1c2VybmFtZSI6InRhbWFyYSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NjkwNzAyMiwiZXhwIjoxNzc2OTE0MjIyfQ.Kuo69_3DA27p11AJmktXa-ik-1bSE6L96IMK0RAP4V4";
toke = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ3LCJ1c2VybmFtZSI6InRhbWFyYSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3Njk3MjI5NiwiZXhwIjoxNzc2OTc5NDk2fQ.sFHAzWySQeJ67Jnc39lEmCtp-AqAy1mv786Rad1q3FA";

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
        body: JSON.stringify(req),
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
            Authorization: `Bearer ${toke}`,
        }
    });
    const data = await response.json();
    return data;
}