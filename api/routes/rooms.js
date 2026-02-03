import express from 'express';
const router = express.Router();
import pool from '../db.js'
import {
    roomIdSchema,
    updateRoomSchema
} from '../schemas/room_schema.js'
import updateRoomQuery from '../helpers/updateRoomQuery.js'
import * as z from "zod";


const ROOM_MAX = 3;

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time:', Date.now());
    next();
});

// define the root rooms route
router.get('/', async (req, res, next) => {

    try {
        const result = await pool.query(
            `
            SELECT *
            FROM rooms
            `
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "no rooms found" });
        }

        return res.status(200).json(result.rows);
    } catch (err) {
        return next(err);
    }


});

router.get('/:id', async (req, res, next) => {
    const id_parsed = roomIdSchema.safeParse(req.params);
    if (!id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    try {
        const result = await pool.query(
            `
            SELECT id, status, player_count, created, updated
            FROM rooms 
            WHERE id = $1
            `,
            [
                id_parsed.data.id
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

router.post("", async (req, res, next) => {
    try {

        const roomCheck = await pool.query(
            `
            SELECT *
            FROM rooms
            `
        );

        if (roomCheck.rowCount < ROOM_MAX) {
            const addRoom = await pool.query(
                `
            INSERT INTO rooms (status, player_count)
            VALUES ($1, $2)
            RETURNING id, status, player_count, created, updated
            `,
                [
                    'open',
                    0
                ]
            );

            return res.status(201).json(addRoom.rows[0]);
        } else {
            return res.status(400).json({error: "Room maximum reached"})
        }
    } catch (err) {
        return next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    const id_parsed = roomIdSchema.safeParse(req.params);
    if (!id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    const body_parsed = updateRoomSchema.safeParse(req.body);
    if (!body_parsed.success) {
        return res.status(400).json(z.treeifyError(body_parsed.error));
    }

    try {
        const queryData = await updateRoomQuery(id_parsed.data.id, body_parsed.data);
        const result = await pool.query(queryData[0], queryData[1]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "provided ID not found" });
        }
        
        return res.status(204).send();

    } catch (err) {
        return next(err);
    }
});

export default router;
