const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const waiting = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.emit('status', 'Connected to the chat server. Looking for a stranger...');

  if (waiting.length > 0) {
    const partner = waiting.shift();
    if (partner.connected) {
      const room = `room-${socket.id}-${partner.id}`;
      socket.join(room);
      partner.join(room);
      socket.data.room = room;
      partner.data.room = room;

      socket.emit('matched');
      partner.emit('matched');
      io.to(room).emit('status', 'You have been connected to a stranger. Say hi!');
    } else {
      socket.emit('status', 'Waiting for a stranger...');
      waiting.push(socket);
    }
  } else {
    waiting.push(socket);
    socket.emit('status', 'Waiting for a stranger...');
  }

  socket.on('message', (text) => {
    const room = socket.data.room;
    if (room) {
      socket.to(room).emit('message', text);
    }
  });

  socket.on('disconnect', () => {
    const room = socket.data.room;
    if (room) {
      socket.to(room).emit('status', 'Your stranger has disconnected. Refresh to find a new match.');
    }
    const index = waiting.indexOf(socket);
    if (index !== -1) waiting.splice(index, 1);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
