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

    socket.on("game_start", ([roomId, username]) => {
      console.log(`game started in room ${roomId}`)
      //make api call to change room state
      //actually, when the api call goes through to make the game, room should be updated to be playing
      // when api call goes through to make the game stale, room should be updated to be stale too
      io.to(roomId).emit('game_started' )
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}