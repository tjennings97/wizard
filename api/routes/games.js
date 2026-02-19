import express from 'express';
const router = express.Router();
import pool from '../db.js'
import { 
    createGameSchema, 
    game_idSchema,
    updateGameSchema
} from '../schemas/game_schema.js';
import * as z from "zod";
import updateGameQuery from '../helpers/updateGameQuery.js';
import { authenticate, requireRole } from '../helpers/auth.js';

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time:', Date.now());
    next();
});

// define the root games route
router.get('/', authenticate, async (req, res, next) => {

    try {
        const result = await pool.query(
            `
            SELECT *
            FROM games
            `
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "no games found" });
        }

        return res.status(200).json(result.rows);
    } catch (err) {
        return next(err);
    }
});

router.post("/", authenticate, async (req, res, next) => {
    const body_parsed = createGameSchema.safeParse(req.body);
    if (!body_parsed.success) {
        return res.status(400).json(z.treeifyError(body_parsed.error));
    }

    try {
        const addGame = await pool.query(
            `
            INSERT INTO games (room_id, status)
            VALUES ($1, $2)
            RETURNING *
            `,
            [
                body_parsed.data.room_id,
                body_parsed.data.status
            ]
        );

        return res.status(201).json(addGame.rows[0]);

    } catch (err) {
        if (err.code === "23505") {
            // there is already an active game in the room
            return res.status(409).json({ error: "There is already an active game in the room" });
        } else if (err.code === "23503") {
            return res.status(400).json({ error: "The room does not exist"})
        }
        return next(err);
    }
});

router.get('/:id', authenticate, async (req, res, next) => {
    const gameId_parsed = game_idSchema.safeParse(req.params.id);
    if (!gameId_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    try {
        const result = await pool.query(
            `
            SELECT *
            FROM games 
            WHERE id = $1
            `,
            [
                gameId_parsed.data
            ]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "provided id not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        return next(err);
    }

});

router.put('/:id', authenticate, async (req, res, next) => {
    const id_parsed = game_idSchema.safeParse(req.params.id);
    if (!id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    const body_parsed = updateGameSchema.safeParse(req.body);
    if (!body_parsed.success) {
        return res.status(400).json(z.treeifyError(body_parsed.error));
    }

    try {
        const queryData = await updateGameQuery(id_parsed.data, body_parsed.data);
        const result = await pool.query(queryData[0], queryData[1]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "provided ID not found" });
        }
        
        return res.status(204).send();

    } catch (err) {
        if (err.code === "23503") {
            return res.status(400).json({ error: "The user is not a member of the room"})
        }
        return next(err);
    }
});

export default router;
