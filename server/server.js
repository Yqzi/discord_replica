const express = require("express");
require("dotenv").config();
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const users = {};

const socketToRoom = {};

io.on("connection", (socket) => {
    socket.on("joinRoom", (roomID) => {
        if (users[roomID]) {
            const length = users[roomID].length;

            if (length === 4) {
                socket.emit("roomFull");
                return;
            }

            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }

        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

        socket.emit("allUsers", usersInThisRoom);
    });

    socket.on("sendingSignal", (payload) => {
        io.to(payload.callerID).emit("userJoined", {
            signal: payload.signal,
            callerID: payload.callerID,
        });
    });

    socket.on("returningSignal", (payload) => {
        io.to(payload.callerID).emit("receivingReturnedSignal", {
            signal: payload.signal,
            callerID: payload.callerID,
        });
    });

    socket.on("disconnect", () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter((id) => id !== socket.id);
            users[roomID] = room;
        }
    });
});

server.listen(5000, () => console.log("server is running on port 5000"));
