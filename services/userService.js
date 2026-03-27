import bcrypt from 'bcrypt';

import { withTransaction } from "./dbHelper.js";

// bcrpyt cost factor
const saltRounds = 10;

export async function getUsers() {
    let users = null

    await withTransaction(async (client) => {
        const result = await client.query(
            `SELECT * FROM users ORDER BY id ASC`
        );
        users = result;
    })
    if (users.rowCount === 0) {
        throw { status: 404, message: "No users found" };
    }

    return users.rows;
}

export async function addUser(username, email, password, role) {
    let user = null
    const password_hash = await bcrypt.hash(password, saltRounds);
    await withTransaction(async (client) => {

        try {
            const addUser = await client.query(
                `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created, updated`,
                [username, email, password_hash, role]
            );
            user = addUser.rows[0];
        } catch (err) {
            // Unique constraint violation
            if (err.code === "23505") {
                throw { status: 409, message: err.detail }
            } else {
                throw { status: 500, message: "Something went wrong" };
            }
        }


    });

    return user;
}

export async function getUser(userId, reqRole, reqId) {
    // userId - id to retrieve
    // reqRole - role of requesting user
    // reqId - id of requesting user
    let user = null

    let query = `SELECT id, username, email, role, created, updated FROM users WHERE id = $1`
    let qValues = [userId]

    // non-admin user can only retrieve id & username of not self
    if (reqRole != "admin" && userId != reqId) {
        query = `SELECT id, username FROM users WHERE id = $1`
    }

    await withTransaction(async (client) => {
        const result = await client.query(query, qValues);
        user = result;
    })
    if (user.rowCount === 0) {
        throw { status: 404, message: "User not found" };
    }

    return user.rows;
}

export async function updateUser(userId, data, reqRole, reqId) {

    // non-admin user can only retrieve id & username of not self
    if (reqRole != "admin" && userId != reqId) {
        throw { status: 403, message: "Forbidden" }
    }

    await withTransaction(async (client) => {
        const fields = [];
        const values = [];
        let idx = 1;

        if (data.username !== undefined) {
            fields.push(`username = $${idx++}`);
            values.push(data.username);
        }

        if (data.email !== undefined) {
            fields.push(`email = $${idx++}`);
            values.push(data.email);
        }

        if (data.password !== undefined) {
            const saltRounds = 10;
            const hash = await bcrypt.hash(data.password, saltRounds);
            fields.push(`password_hash = $${idx++}`);
            values.push(hash);
        }

        if (data.role !== undefined) {
            fields.push(`role = $${idx++}`);
            values.push(data.role);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        // always update the timestamp
        fields.push(`updated = now()`);

        // push the id as the last value
        values.push(userId)
        console.log(values)

        const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, username, email, role, updated;`;

        try {
            const user = await client.query(query, values)
            if (user.rowCount === 0) {
                console.log(user)
                throw { status: 404, message: "User not found" };
            }
        } catch (err) {
            throw { status: err.status || 500, message: (err.message || "Internal server error") };
        }

        return;
    })
}

export async function removeUser(userId) {

  await withTransaction(async (client) => {

    try {
      const member = await client.query(
        `DELETE FROM users WHERE id = $1`,
        [userId]
      );
      member;
      if (member.rowCount === 0) {
        throw { status: 404, message: "Room member not found" };
      }
    } catch (err) {
      throw { status: err.status || 500, message: (err.message || "Internal server error") };
    }
  })

  return;
}