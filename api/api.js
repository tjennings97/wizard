import express from 'express';import path from "path";
import { fileURLToPath } from "url";
import pool from './db.js'
import login from './routes/login.js';
import games from './routes/games.js';
import rooms from './routes/rooms.js';
import users from './routes/users.js';
import { generateOpenApiDocument } from './docs/registry.js';
import { swaggerUi } from './swagger.js';
import { io } from '../server.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const api = express();

api.use(express.json());

api.use((req, res, next) => {
  req.io = io;
  next();
});

api.use('/api/login', login);
api.use('/api/games', games);
api.use('/api/rooms', rooms);
api.use('/api/users', users);

// Serve React build
api.use(express.static(path.join(__dirname, "../client/dist")));

// // Catch-all to return index.html for any frontend route
// api.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/dist/index.html"));
// });

api.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Swagger docs
const openApiDoc = generateOpenApiDocument()
api.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await pool.end();
  server.close(() => console.log('Server closed'));
});

export { api }