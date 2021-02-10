const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const { JOIN_CHANNEL, SEND_MESSAGE, NEW_MESSAGE, CHATROOM_USERS_UPDATED } = require('./utils/socketEventTypes');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chatcord Bot';

// Run when client connects
io.on('connection', socket => {
    console.log(`Socket connection established with id: ${socket.id}`);

    socket.on(JOIN_CHANNEL, ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome current user
        socket.emit(NEW_MESSAGE, formatMessage(botName, 'Welcome to ChatCord!'))

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit(NEW_MESSAGE, formatMessage(botName, `${user.username} has joined the chat`));

        io.to(user.room).emit(CHATROOM_USERS_UPDATED, {
            room: user.room,
            users: getRoomUsers(user.room)
        });

        // Listen for chatMessage event
        socket.on(SEND_MESSAGE, (msg) => {
            io.emit(NEW_MESSAGE, formatMessage(user.username, msg));
        });

        // Runs when client disconnects
        socket.on('disconnect', () => {
            const user = userLeave(socket.id);
            console.log(`Socket connection: ${socket.id} has been disconnected`);
            if (user) {
                io.to(user.room).emit(NEW_MESSAGE, formatMessage(botName, `${user.username} left the chat`));
                io.to(user.room).emit(CHATROOM_USERS_UPDATED, {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }
        });
    });
});

const PORT = 5000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));