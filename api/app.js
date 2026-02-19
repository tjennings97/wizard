import express from 'express';
import pool from './db.js'
import login from './routes/login.js';
import games from './routes/games.js';
import rooms from './routes/rooms.js';
import users from './routes/users.js';

import { generateOpenApiDocument } from './docs/registry.js';
import { swaggerUi } from './swagger.js';
const app = express();

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

app.use(express.json());

// TO DO: enforce auth on each endpoint
app.use('/login', login);
app.use('/games', games);
app.use('/rooms', rooms);
app.use('/users', users);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Swagger docs
const openApiDoc = generateOpenApiDocument()
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// app.listen(3000, () =>
//   console.log('app listening on port 3000!\naccess http://localhost:3000')
// );

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await pool.end();
  server.close(() => console.log('Server closed'));
});

export { app }