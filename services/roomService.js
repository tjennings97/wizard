import { withTransaction } from "./dbHelper.js";

const MAX_SEATS = 8;

export async function addMember(roomId, userId, role, io) {
  let started = false;
  let newMember = null;

  await withTransaction(async (client) => {

    // Lock the room row
    const roomRes = await client.query(
      `SELECT status FROM rooms WHERE id = $1 FOR UPDATE`,
      [roomId]
    );

    if (roomRes.rowCount === 0) {
      throw { status: 404, message: "Room not found" };
    }

    const room = roomRes.rows[0];
    if (room.status !== "waiting" && room.status !== "open") {
      if(role === "player") {
        throw { status: 400, message: "Cannot join: room is closed to new players" };
      }
    }

    // Assign seat if role is player
    let seatNumber = null;
    if (role === "player") {
      const seatCheck = await client.query(
        `SELECT seat_number FROM room_members WHERE room_id = $1 AND role = 'player' FOR UPDATE`,
        [roomId]
      );

      if (seatCheck.rowCount >= MAX_SEATS) {
        throw { status: 400, message: "Player maximum reached" };
      }

      const takenSeats = new Set(seatCheck.rows.map(r => r.seat_number));
      const allSeats = Array.from({ length: MAX_SEATS }, (value, i) => i + 1);
      const available = allSeats.filter(seat => !takenSeats.has(seat));
      seatNumber = available[0];
    }

    // Check if user already exists
    const existsRes = await client.query(
      `SELECT 1 FROM room_members WHERE user_id = $1`,
      [userId]
    );
    if (existsRes.rowCount > 0) {
      throw { status: 409, message: "User already exists in a room" };
    }

    // Insert the member
    const insertRes = await client.query(
      `INSERT INTO room_members (room_id, user_id, role, seat_number)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [roomId, userId, role, seatNumber]
    );
    newMember = insertRes.rows[0];

    // Count players after insert
    const countRes = await client.query(
      `SELECT COUNT(*)::int AS player_count FROM room_members WHERE room_id = $1 AND role = 'player'`,
      [roomId]
    );

    const playerCount = countRes.rows[0].player_count;

    // Auto-start game if 8 players
    if (playerCount === MAX_SEATS) {
      await client.query(
        `UPDATE rooms SET status = 'playing' WHERE id = $1`,
        [roomId]
      );
      started = true;
    }
  }); // transaction ends here

  // Emit socket events after commit
  if (io) {
    // console.log(io)
    console.log(`emitting to socket room ${roomId}`)
    io.to(roomId).emit("room_updated", { roomId });
    if (started) {
      console.log(`emmiting started to socket room ${roomId}`)
      io.to(roomId).emit("game_started", { roomId });
    }
  }

  return { newMember, started };
}