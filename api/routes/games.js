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
import { getGames, addGame, getGame, updateGame } from '../../services/gameService.js'

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time:', Date.now());
    next();
});

router.get('/', authenticate, async (req, res, next) => {
    try {
        const games = await getGames();
        return res.status(200).json(games);
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
        const game = await addGame(body_parsed.data.room_id, body_parsed.data.status)
        return res.status(201).json(game);
    } catch (err) {
        return next(err);
    }
});

router.get('/:id', authenticate, async (req, res, next) => {
    const gameId_parsed = game_idSchema.safeParse(req.params.id);
    if (!gameId_parsed.success) {
        return res.status(400).json({ error: "invalid id" })
    }

    try {
        const game = await getGame(gameId_parsed.data)
        res.status(200).json(game);
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
        await updateGame(id_parsed.data, body_parsed.data)
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
});

export default router;
