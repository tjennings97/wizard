import express from 'express';
const router = express.Router();
import pool from '../db.js'
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt';
import { loginSchema } from '../schemas/login_schema.js';

router.post("/", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(z.treeifyError(parsed.error));
    }

    const user = await pool.query(
        "SELECT id, username, password_hash, role FROM users WHERE username = $1",
        [parsed.data.username]
    );

    if (!user.rows.length) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const dbUser = user.rows[0];

    const isMatch = await bcrypt.compare(parsed.data.password, dbUser.password_hash);

    if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
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

    res.json({ token });
});

export default router;