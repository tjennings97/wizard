import express from 'express';
const router = express.Router();
import pool from '../db.js'
import {
    createUserSchema,
    updateUserSchema,
    userIdSchema,
    user_idSchema
} from '../schemas/user_schema.js'
import * as z from "zod";
import updateUserQuery from '../helpers/updateUserQuery.js'
import { authenticate, requireRole } from '../helpers/auth.js';
import {
    getUsers, addUser, getUser, updateUser, removeUser
} from '../../services/userService.js';

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
        const users = await getUsers();
        return res.status(200).json(users);
    } catch (err) {
        return next(err);
    }

});

router.post("/", authenticate, requireRole('admin'), async (req, res, next) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(z.treeifyError(parsed.error));
    }

    try {
        const user = await addUser(parsed.data.username, parsed.data.email ?? null, parsed.data.password, parsed.data.role)
        return res.status(201).json(user);
    } catch (err) {
        return next(err);
    }
});

router.get('/:id', authenticate, async (req, res, next) => {
    const id_parsed = user_idSchema.safeParse(req.params.id);
    if (!id_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    try {
        const user = await getUser(id_parsed.data, req.user.role, req.user.userId)
        res.status(200).json(user);
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

    try {        
        await updateUser(id_parsed.data.id, body_parsed.data, req.user.role, req.user.userId)
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

    try {
        await removeUser(id_parsed.data.id)
        res.status(204).send();
    } catch (err) {
        return next(err);
    }

});

export default router;
