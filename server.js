import http from "http"
import { app } from "./api/app.js"
import dotenv from 'dotenv';
dotenv.config();

const server = http.createServer(app);

server.listen(3000, () => {
    console.log("Server running on port 3000");
});

