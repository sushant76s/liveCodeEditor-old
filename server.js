const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const ACTIONS = require("./src/Actions");

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("build"));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const userSocketMap = {};
const messages = {};
const userRoomMap = {};

function getAllConnectedClient(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  //   console.log("map: ", userSocketMap);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    userRoomMap[socket.id] = roomId;

    const clients = getAllConnectedClient(roomId);

    if (messages[roomId]) {
      io.to(socket.id).emit(ACTIONS.MESSAGE, { messages: messages[roomId] });
    }

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    // console.log("code: ", code);
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.MESSAGE, ({ roomId, message, username }) => {
    if (!messages[roomId]) {
      messages[roomId] = [];
    }
    messages[roomId].push({ message, username });

    io.in(roomId).emit(ACTIONS.MESSAGE, {
      messages: messages[roomId].slice(-1),
    });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

// console.log("Map: ", userSocketMap);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on Port: ${PORT}`));
