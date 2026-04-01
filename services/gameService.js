import { withTransaction } from "./dbHelper.js";

export async function getGames() {
    let games = null

    await withTransaction(async (client) => {
        const result = await client.query(
            `SELECT * FROM games ORDER BY id ASC`
        );
        games = result;
    })
    if (games.rowCount === 0) {
        throw { status: 404, message: "No games found" };
    }

    return games.rows;
}

export async function addGame(roomId, status) {
    let game = null
    await withTransaction(async (client) => {

        try {
            const result = await client.query(
                `INSERT INTO games (room_id, status) VALUES ($1, $2) RETURNING *`,
                [roomId, status]
            );
            game = result;

        } catch (err) {
            if (err.code === "23505") {
                throw { status: 409, message: "There is already an active game in the room" }
            } else if (err.code === "23503") {
                throw { status: 404, message: "Game not found" }
            } else {
                throw { status: (err.status || 500), message: (err.message || "Internal server error") };
            }
        }

    });

    return game.rows[0];
}

export async function getGame(gameId) {
    let game = null

    await withTransaction(async (client) => {
        const result = await client.query(
            `SELECT * FROM games WHERE id=$1`,
            [gameId]
        );
        game = result;
    })
    if (game.rowCount === 0) {
        throw { status: 404, message: "Game not found" };
    }

    return game.rows;
}

export async function updateGame(gameId, data) {

    const fields = [];
    const values = [];
    let idx = 1;

    if (data.status !== undefined) {
        fields.push(`status = $${idx++}`);
        values.push(data.status);
    }

    if (data.winneruser_id !== undefined) {
        fields.push(`winner_user_id = $${idx++}`);
        values.push(data.winneruser_id);
    }

    if (data.finalState !== undefined) {
        fields.push(`final_state = $${idx++}`); // Stringify to ensure Postgres sees it as a JSON string
        values.push(JSON.stringify(data.finalState));
    }

    if (fields.length === 0) {
        throw new Error("No fields to update");
    }

    fields.push(`updated = now()`);

    // push the id as the last value
    values.push(gameId);

    const query = `UPDATE games SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *;`;

    await withTransaction(async (client) => {
        try {
            const gameRes = await client.query(query, values)
            if (gameRes.rowCount === 0) {
                throw { status: 404, message: "Game not found" };
            }
        } catch (err) {
            console.log(err)
            throw { status: (err.status || 500), message: (err.message || "Internal server error") };
        }

        return;
    })
}