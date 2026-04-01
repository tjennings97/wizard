import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"

import { withTransaction } from "./dbHelper.js";

export async function login(username, password) {
    let user = null

    await withTransaction(async (client) => {
        const result = await client.query(
            "SELECT id, username, password_hash, role FROM users WHERE username = $1",
            [username]
        );
        user = result;
    })
    if (!user.rows.length) {
        throw { status: 401, message: "Invalid credentials" };
    }

    const dbUser = user.rows[0];
    const isMatch = await bcrypt.compare(password, dbUser.password_hash);
    if (!isMatch) {
        throw { status: 401, message: "Invalid credentials" };
    }

    const token = jwt.sign(
        {
            userId: dbUser.id,
            username: dbUser.username,
            role: dbUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );

    const userResponse = {
        token,
        user: {
            id: dbUser.id,
            username: dbUser.username
        }
    }

    return userResponse;
}