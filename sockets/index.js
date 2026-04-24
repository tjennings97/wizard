import { addGame } from '../services/gameService.js'

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("New client connection:", socket.id);

    socket.on("join_room", ([roomId, username, role]) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
      io.emit('userJoined', {
        msg: `User ${username} has joined socket ${roomId}`,
        user: username,
        role: role
      });
    });

    socket.on("leave_room", ([roomId, username]) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room: ${roomId}`);
      io.emit('userLeft', {
        msg: `User ${username} left socket ${roomId}`,
        user: username
      });
    });

    socket.on("game_start", async ([roomId, username]) => {
      console.log(`game start requested in room ${roomId} by ${username}`)
      //make service call to change room state
      let game = null;
      try {
        const newGame = await addGame(roomId, "active")
        game = newGame;
        io.to(roomId).emit('gameStarted', {
          msg: `Game started`,
          game: game.id
        })
      } catch (err) {
        console.error("Error starting game:", err);
      }
      //actually, when the api call goes through to make the game, room should be updated to be playing
      // when api call goes through to make the game stale, room should be updated to be stale too
      // io.to(roomId).emit('gameStarted', {
      //   msg: `Game started`
      // })
      // console.log(game.id)
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}