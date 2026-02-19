import express from 'express';
const router = express.Router();
import pool from '../db.js'
import {
    room_idSchema,
    updateRoomSchema,
    createRoomMemberSchema
} from '../schemas/room_schema.js'
import { user_idSchema } from '../schemas/user_schema.js';
import * as z from "zod";

const ROOM_MAX = 3;
const MAX_SEATS = 8;

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time:', Date.now());
    next();
});

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

router.post("/", async (req, res, next) => {
    // TO DO: update queries to be joint instead of two separate queries
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
            INSERT INTO rooms (status)
            VALUES ($1)
            RETURNING *
            `,
            [
                'open'
            ]
            );

            return res.status(201).json(addRoom.rows[0]);
        } else {
            return res.status(400).json({ error: "Room maximum reached" })
        }
    } catch (err) {
        return next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    const room_id_parsed = room_idSchema.safeParse(req.params.id);
    if (!room_id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    try {
        const result = await pool.query(
            `
            SELECT *
            FROM rooms 
            WHERE id = $1
            `,
            [
                room_id_parsed.data
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

router.put('/:id', async (req, res, next) => {
    const room_id_parsed = room_idSchema.safeParse(req.params.id);
    if (!room_id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    const body_parsed = updateRoomSchema.safeParse(req.body);
    if (!body_parsed.success) {
        return res.status(400).json(z.treeifyError(body_parsed.error));
    }

    try {
        const updateRoom = await pool.query(
            `
            UPDATE rooms 
            SET status = $1 
            WHERE id = $2 
            RETURNING *;
            `,
            [
                body_parsed.data.status,
                room_id_parsed.data
            ]
        );

        if (updateRoom.rowCount === 0) {
            return res.status(404).json({ error: "provided ID not found" });
        }

        return res.status(204).send();

    } catch (err) {
        return next(err);
    }
});

router.get('/:id/members', async (req, res, next) => {
    const room_id_parsed = room_idSchema.safeParse(req.params.id);
    if (!room_id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }
    
    try {
        const result = await pool.query(
            `
            SELECT room_id, user_id, role, seat_number, created, updated
            FROM room_members
            WHERE room_id = $1
            `,
            [
                room_id_parsed.data
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "no room members found" });
        }

        return res.status(200).json(result.rows);
    } catch (err) {
        return next(err);
    }
});

router.post('/:id/members', async (req, res, next) => {
    const room_id_parsed = room_idSchema.safeParse(req.params.id);
    if (!room_id_parsed.success) {
        return res.status(400).json({ error: "invalid room id" })
    }

    const body_parsed = createRoomMemberSchema.safeParse(req.body);
    if (!body_parsed.success) {
        return res.status(400).json(z.treeifyError(body_parsed.error));
    }

    try {
        let seat_number = null;

        if (body_parsed.data.role === "player") {
            const seatCheck = await pool.query(
            `
            SELECT seat_number
            FROM room_members
            WHERE room_id = $1 AND role = 'player'
            `,
            [
                room_id_parsed.data
            ]
            );

            if (seatCheck.rowCount >= 8) {
                return res.status(400).json({ error: "Room is full" });
            }

            const takenSeats = new Set(seatCheck.rows.map(r => r.seat_number));
            const allSeats = [...Array(MAX_SEATS).keys()].map(i => i + 1);;
            const available = allSeats.filter(seat => !takenSeats.has(seat));
            seat_number = available[0];
        }

        // TO DO: update queries to be joint instead of two separate queries
        const addSeat = await pool.query(
        `
        INSERT INTO room_members (room_id, user_id, role, seat_number)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            room_id_parsed.data,
            body_parsed.data.user_id,
            body_parsed.data.role,
            seat_number
        ]);

        return res.status(201).send(addSeat.rows[0]);
    } catch (err) {
        if (err.code === "23503") {
            // invalid room id or user id
            return res.status(400).json({ error: err.detail });
        } else if (err.code === "23505") { 
            // user already exists in room_members table due to index
            return res.status(409).json({ error: "User already exists in a room" });
        }
        return next(err);
    }
});

router.get('/:room_id/members/:user_id', async (req, res, next) => {
    const room_id_parsed = room_idSchema.safeParse(req.params.room_id);
    if (!room_id_parsed.success) {
        return res.status(400).json({ error: "invalid room id" })
    }
    const user_id_parsed = user_idSchema.safeParse(req.params.user_id);
    if (!user_id_parsed.success) {
        return res.status(400).json({ error: "invalid user id" })
    }

    try {
        const result = await pool.query(
            `
            SELECT room_id, user_id, role, seat_number, created, updated
            FROM room_members 
            WHERE room_id = $1 AND user_id = $2
            `,
            [
                room_id_parsed.data,
                user_id_parsed.data
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "no room member found" });
        }

        return res.status(200).json(result.rows);
    } catch (err) {
        return next(err);
    }
});

router.delete('/:room_id/members/:user_id', async (req, res, next) => {
    const room_id_parsed = room_idSchema.safeParse(req.params.room_id);
    if (!room_id_parsed.success) {
        return res.status(400).json({ error: "invalid room id" })
    }
    const user_id_parsed = user_idSchema.safeParse(req.params.user_id);
    if (!user_id_parsed.success) {
        return res.status(400).json({ error: "invalid user id" })
    }

    try {
        const result = await pool.query(
            `
            DELETE FROM room_members 
            WHERE room_id = $1 AND user_id = $2
            `,
            [
                room_id_parsed.data,
                user_id_parsed.data
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "no room_members found" });
        }

        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
});

export default router;
