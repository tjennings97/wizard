import express from 'express';
const router = express.Router();
import pool from '../db.js'
import { 
    createUserSchema, 
    updateUserSchema,
    userIdSchema 
} from '../schemas/user_schema.js'
import bcrypt from 'bcrypt';
import * as z from "zod"; 
import updateUserQuery from '../helpers/updateUserQuery.js'

// bcrpyt cost factor
const saltRounds = 10;

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time:', Date.now());
    next();
});

// define the root users route
router.get('/', (req, res) => {
    pool.query('SELECT id, username, email, role, created, updated from users')
        .then(usersData => {
            res.send(usersData.rows)
        })
});

// TO DO: validate that values for id are only valid values
router.get('/:id', (req, res) => {
    const { id } = req.params;
    pool.query(`SELECT id, username, email, role, created, updated from users where id=${id}`)
        .then(userData => {
            res.send(userData.rows)
        })
});

router.post('/', async (req, res, next) => {
    // check request body schema
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(z.treeifyError(parsed.error));
    }

    // attempt to insert data into DB
    try {
        const passwordHash = await bcrypt.hash(parsed.data.password, saltRounds);

        const result = await pool.query(
            `
            INSERT INTO users (username, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role
            `,
            [
                parsed.data.username,
                parsed.data.email ?? null,
                passwordHash,
                parsed.data.role
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({
                error: err.detail
            });
        }

        next(err); // let global error handler deal with it
    }
});


// TO DO: validate that value for id is valid
// only email and/or password can be edited according to user schema at this time
// TO DO: make username & role changeable by admin role only
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const id_parsed = userIdSchema.safeParse(req.params);
    if(!id_parsed.success){
        return res.status(400).json({error: "invalid id"})
    }
    console.log(id_parsed)

    //check request body schema
    const body_parsed = updateUserSchema.safeParse(req.body);
    if (!body_parsed.success) {
        return res.status(400).json(z.treeifyError(body_parsed.error));
    }

    // attempt to update data in DB
    try {
        const queryData = await updateUserQuery(id_parsed.data.id, body_parsed.data);
        console.log(queryData)

        const { rows } = await pool.query(queryData[0], queryData[1]);
        if (rows[0]) {
            res.status(204).json(rows[0]);
        } else if (rows[0] === undefined) { // undefined if user not found 
            res.status(404).json({error: "provided ID not found"});
        }
        else {
            res.status(500);
        }
        
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({
                error: err.detail
            });
        }

        next(err); // let global error handler deal with it
    }
});

export default router;
