import express from 'express';
import pool from './db.js'
import games from './routes/games.js';
import room_members from './routes/room_members.js';
import rooms from './routes/rooms.js';
import users from './routes/users.js';

const app = express();

app.use(express.json());

// TO DO: enforce auth on each endpoint
// app.use('/games', games);
// app.use('/room_members', room_members);
// app.use('/rooms', rooms);
app.use('/users', users);

app.listen(3000, () =>
  console.log('app listening on port 3000!\naccess http://localhost:3000')
);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await pool.end();
  server.close(() => console.log('Server closed'));
});
