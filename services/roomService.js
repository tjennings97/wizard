import { withTransaction } from "./dbHelper.js";

const ROOM_MAX = 3;
const MAX_SEATS = 8;

export async function getRooms() {
  let rooms = null

  await withTransaction(async (client) => {
    const result = await client.query(
      `SELECT * FROM rooms ORDER BY id ASC`
    );
    rooms = result;
  })
  if (rooms.rowCount === 0) {
    throw { status: 404, message: "No rooms found" };
  }

  return rooms.rows;
}

export async function addRoom() {
  let room = null
  await withTransaction(async (client) => {
    const countRes = await client.query(
      `SELECT COUNT(*)::int AS room_count FROM rooms`,
    );
    const roomCount = countRes.rows[0].room_count;

    if (roomCount < ROOM_MAX) {
      const addRoom = await client.query(
        `INSERT INTO rooms (status) VALUES ($1) RETURNING *`,
        ['open']
      );
      room = addRoom.rows[0];
    } else {
      throw { status: 400, message: "Room maximum reached" }
    }
  });

  return room;
}

export async function getRoom(roomId) {
  let room = null

  await withTransaction(async (client) => {
    const result = await client.query(
      `SELECT * FROM rooms WHERE id=$1`,
      [roomId]
    );
    room = result;
  })
  if (room.rowCount === 0) {
    throw { status: 404, message: "Room not found" };
  }

  return room.rows;
}

export async function updateRoom(roomId, status) {

  await withTransaction(async (client) => {

    try {
      const roomRes = await client.query(
        `UPDATE rooms SET status = $1 WHERE id = $2 RETURNING *;`,
        [status, roomId]
      )
      if (roomRes.rowCount === 0) {
        throw { status: 404, message: "Room not found" };
      }
    } catch (err) {
      throw { status: err.status || 500, message: (err.message || "Internal server error") };
    }

    return;
  })
}

export async function getMembers(roomId) {
  let members = null

  await withTransaction(async (client) => {
    const result = await client.query(
      `SELECT * FROM room_members WHERE room_id=$1`,
      [roomId]
    );
    members = result;
  })
  if (members.rowCount === 0) {
    throw { status: 404, message: "Room members not found" };
  }

  return members.rows;
}

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

    // Check if user can be added as player
    const room = roomRes.rows[0];
    if (room.status !== "waiting" && room.status !== "open") {
      if (role === "player") {
        throw { status: 400, message: "Cannot join: room is closed to new players" };
      }
    }

    // Check if user already exists
    const existsRes = await client.query(
      `SELECT 1 FROM room_members WHERE user_id = $1`,
      [userId]
    );
    if (existsRes.rowCount > 0) {
      throw { status: 409, message: "User already exists in a room" };
    }

    // Assign seat if role is player
    let seatNumber = null;
    let seatCount = null
    if (role === "player") {
      const seatCheck = await client.query(
        `SELECT seat_number FROM room_members WHERE room_id = $1 AND role = 'player' FOR UPDATE`,
        [roomId]
      );

      if (seatCheck.rowCount >= MAX_SEATS) {
        throw { status: 400, message: "Player maximum reached" };
      }

      const takenSeats = new Set(seatCheck.rows.map(r => r.seat_number));
      seatCount = takenSeats.size
      const allSeats = Array.from({ length: MAX_SEATS }, (value, i) => i + 1);
      const available = allSeats.filter(seat => !takenSeats.has(seat));
      seatNumber = available[0];
    }

    // Insert the member
    try {
      const insertRes = await client.query(
        `INSERT INTO room_members (room_id, user_id, role, seat_number)
       VALUES ($1, $2, $3, $4) RETURNING *`,
        [roomId, userId, role, seatNumber]
      );
      newMember = insertRes.rows[0];
    } catch (err) {
      if (err.code === "23503") {
        // user id not found
        throw { status: 404, message: "User not found" };
      }
      throw { status: err.status || 500, message: (err.message || "Internal server error") };

    }

    // increment seat counter after member added
    seatCount++;

    // Change open to waiting after first add (assumption: open only when no one is in the room)
    if (room.status === "open") {
      await client.query(
        `UPDATE rooms SET status = 'waiting' WHERE id = $1`,
        [roomId]
      );
      started = true;
    }

    // Auto-start game if 8 players
    if (seatCount === MAX_SEATS) {
      await client.query(
        `UPDATE rooms SET status = 'playing' WHERE id = $1`,
        [roomId]
      );
      started = true;
    }
  }); // transaction ends here

  // Emit socket events after commit
  if (io) {
    console.log(`emitting to socket room ${roomId}`)
    io.to(roomId).emit("room_updated", { roomId });
    if (started) {
      console.log(`emmiting started to socket room ${roomId}`)
      io.to(roomId).emit("game_started", { roomId });
    }
  }

  return { newMember };
}

export async function getMember(roomId, userId) {
  let member = null

  await withTransaction(async (client) => {
    const result = await client.query(
      `SELECT room_id, user_id, role, seat_number, created, updated FROM room_members WHERE room_id = $1 AND user_id = $2`,
      [roomId, userId]
    );
    member = result;
  })
  if (member.rowCount === 0) {
    throw { status: 404, message: "Room member not found" };
  }

  return member.rows;
}

export async function removeMember(roomId, userId) {

  await withTransaction(async (client) => {

    try {
      const member = await client.query(
        `DELETE FROM room_members WHERE room_id = $1 AND user_id = $2`,
        [roomId, userId]
      );
      member;
      if (member.rowCount === 0) {
        throw { status: 404, message: "Room member not found" };
      }
    } catch (err) {
      throw { status: err.status || 500, message: (err.message || "Internal server error") };
    }
  })

  return;
}