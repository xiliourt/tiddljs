const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { downloadUrl } = require('../tiddljs/dist/downloadUrl');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', (socket) => {
    console.log(`a user connected: ${socket.id}`);

    socket.on('download', async (url) => {
        try {
            await downloadUrl(url, (progress) => {
                socket.emit('progress', progress);
            });
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
