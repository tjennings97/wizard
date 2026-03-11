// import http from "http"
// import { api } from "./api/api.js"
// import express from 'express';
// import dotenv from 'dotenv';
// dotenv.config();

// const apiServer = http.createServer(api);

// apiServer.use(express.static("client"));


// apiServer.listen(3000, () => {
//     console.log("API Server running on port 3000");
// }); 


import http from "http";
import { api } from "./api/api.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./sockets/index.js";

dotenv.config();

const server = http.createServer(api);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

registerSocketHandlers(io);

server.listen(3000, () => {
  console.log("Server running on port 3000");
});

