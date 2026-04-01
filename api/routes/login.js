import express from 'express';
const router = express.Router();
import { loginSchema } from '../schemas/login_schema.js';
import { login } from '../../services/loginService.js'

router.post("/", async (req, res, next) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(z.treeifyError(parsed.error));
    }

    try {
        const userResponse = await login(parsed.data.username, parsed.data.password)
        res.status(200).json(userResponse);
    } catch (err) {
        next(err)
    }
});

export default router;