import express from 'express';
const router = express.Router();
import pool from '../db.js'
import {
    room_idSchema,
    updateRoomSchema,
    createRoomMemberSchema
} from '../schemas/room_schema.js'
import { user_idSchema } from '../schemas/user_schema.js';
import { authenticate, requireRole } from '../helpers/auth.js';
import { getRooms, addRoom, getRoom, updateRoom, getMembers, addMember, getMember, removeMember } from '../../services/roomService.js';
import * as z from "zod";

const ROOM_MAX = 3;
const MAX_SEATS = 8;

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time:', Date.now());
    next();
});

router.get('/', authenticate, async (req, res, next) => {
    try {
        const rooms = await getRooms();
        return res.status(200).json(rooms);
    } catch (err) {
        return next(err);
    }
});

router.post("/", authenticate, async (req, res, next) => {
    try {
        const room = await addRoom();
        return res.status(201).json(room);
    } catch (err) {
        return next(err);
    }
});

router.get('/:id', authenticate, async (req, res, next) => {
    const room_id_parsed = room_idSchema.safeParse(req.params.id);
    if (!room_id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    try {
        const room = await getRoom(room_id_parsed.data);
        res.status(200).json(room);
    } catch (err) {
        return next(err);
    }

});

router.put('/:id', authenticate, async (req, res, next) => {
    const room_id_parsed = room_idSchema.safeParse(req.params.id);
    if (!room_id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    const body_parsed = updateRoomSchema.safeParse(req.body);
    if (!body_parsed.success) {
        return res.status(400).json(z.treeifyError(body_parsed.error));
    }

    try {
        await updateRoom(room_id_parsed.data, body_parsed.data.status);
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
});

router.get('/:id/members', authenticate, async (req, res, next) => {
    const room_id_parsed = room_idSchema.safeParse(req.params.id);
    if (!room_id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    try {
        const members = await getMembers(room_id_parsed.data)
        return res.status(200).json(members);
    } catch (err) {
        return next(err);
    }
});

router.post('/:id/members', authenticate, async (req, res, next) => {
    const room_id_parsed = room_idSchema.safeParse(req.params.id);
    if (!room_id_parsed.success) {
        return res.status(400).json({ error: "invalid room id" })
    }

    const body_parsed = createRoomMemberSchema.safeParse(req.body);
    if (!body_parsed.success) {
        return res.status(400).json(z.treeifyError(body_parsed.error));
    }

    // non-admin user can only add themselves to a room
    if (req.user.role != "admin" && req.user.userId != body_parsed.data.user_id) {
        return res.status(403).json({ error: "Forbidden" });
    }

    try {
        const { newMember } = await addMember(room_id_parsed.data, body_parsed.data.user_id, body_parsed.data.role, req.io);
        return res.status(201).json(newMember);
    } catch (err) {
        return next(err);
    }
});

router.get('/:room_id/members/:user_id', authenticate, async (req, res, next) => {
    const room_id_parsed = room_idSchema.safeParse(req.params.room_id);
    if (!room_id_parsed.success) {
        return res.status(400).json({ error: "invalid room id" })
    }
    const user_id_parsed = user_idSchema.safeParse(req.params.user_id);
    if (!user_id_parsed.success) {
        return res.status(400).json({ error: "invalid user id" })
    }

    // non-admin user can only retrieve themselves from a room
    if (req.user.role != "admin" && req.user.userId != user_id_parsed.data) {
        return res.status(403).json({ error: "Forbidden" });
    }

    try {
        const member = await getMember(room_id_parsed.data, user_id_parsed.data)
        return res.status(200).json(member);
    } catch (err) {
        return next(err);
    }
});

router.delete('/:room_id/members/:user_id', authenticate, async (req, res, next) => {
    const room_id_parsed = room_idSchema.safeParse(req.params.room_id);
    if (!room_id_parsed.success) {
        return res.status(400).json({ error: "invalid room id" })
    }
    const user_id_parsed = user_idSchema.safeParse(req.params.user_id);
    if (!user_id_parsed.success) {
        return res.status(400).json({ error: "invalid user id" })
    }

    // non-admin user can only remove themselves from a room
    if (req.user.role != "admin" && req.user.userId != user_id_parsed.data) {
        return res.status(403).json({ error: "Forbidden" });
    }

    try {
        await removeMember(room_id_parsed.data, user_id_parsed.data)
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
});

export default router;
