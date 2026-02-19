import express from 'express';
const router = express.Router();
import pool from '../db.js'
import {
    createUserSchema,
    updateUserSchema,
    userIdSchema,
    user_idSchema
} from '../schemas/user_schema.js'
import bcrypt from 'bcrypt';
import * as z from "zod";
import updateUserQuery from '../helpers/updateUserQuery.js'
import { authenticate, requireRole } from '../helpers/auth.js';

// bcrpyt cost factor
const saltRounds = 10;

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time:', Date.now());
    next();
});

// define the root users route
router.get('/', authenticate, requireRole('admin'), async (req, res, next) => {

    try {
        const result = await pool.query(
            `
            SELECT id, username, email, role, created, updated
            FROM users
            `
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "no users found" });
        }

        return res.status(200).json(result.rows);
    } catch(err) {
        return next(err);
    }
    

});

router.post("/", authenticate, requireRole('admin'), async (req, res, next) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(z.treeifyError(parsed.error));
    }

    try {
        const passwordHash = await bcrypt.hash(parsed.data.password, saltRounds);

        const result = await pool.query(
            `
            INSERT INTO users (username, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role, created, updated
            `,
            [
                parsed.data.username,
                parsed.data.email ?? null,
                passwordHash,
                parsed.data.role
            ]
        );

        return res.status(201).json(result.rows[0]);

    } catch (err) {
        // Unique constraint violation
        if (err.code === "23505") {
            return res.status(409).json({ error: err.detail });
        }

        return next(err);
    }
});

router.get('/:id', authenticate, async (req, res, next) => {
    const id_parsed = user_idSchema.safeParse(req.params.id);
    if (!id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    // non-admin user can only retrieve themselves
    if (req.user.role != "admin" && req.user.userId != user_id_parsed.data) {
        return res.status(403).json({ error: "Forbidden" });
    }

    try {
        const result = await pool.query(
            `
            SELECT id, username, email, role, created, updated
            FROM users 
            WHERE id = $1
            `,
            [
                id_parsed.data
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "provided id not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        return next(err);
    }
        
});

// only email and/or password can be edited according to user schema at this time
// TO DO: make username & role changeable by admin role only
router.put('/:id', authenticate, async (req, res, next) => {
    const id_parsed = userIdSchema.safeParse(req.params);
    if (!id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    const body_parsed = updateUserSchema.safeParse(req.body);
    if (!body_parsed.success) {
        return res.status(400).json(z.treeifyError(body_parsed.error));
    }

    // // non-admin user can only modify email & password themselves
    // if (req.user.role != "admin" && req.user.userId != user_id_parsed.data) {
    // }

    try {
        const queryData = await updateUserQuery(id_parsed.data.id, body_parsed.data);
        const result = await pool.query(queryData[0], queryData[1]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "provided ID not found" });
        }
        
        return res.status(204).send();

    } catch (err) {
        return next(err);
    }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
    const id_parsed = userIdSchema.safeParse(req.params);
    if (!id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    // attempt to insert data into DB
    try {
        const result = await pool.query(
            `
            DELETE FROM users 
            WHERE id = $1
            `,
            [
                id_parsed.data.id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "provided id not found" });
        }

        res.status(204).send();

    } catch (err) {
        return next(err);
    }

});

export default router;
