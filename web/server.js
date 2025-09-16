const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { downloadUrl } = require('../tiddljs/dist/downloadUrl');
const { login, logout, refreshToken, getDeviceAuth } = require('../tiddljs/dist/auth');
const { getConfig } = require('../tiddljs/dist/config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')))

let progressState = {};

io.on('connection', (socket) => {
    console.log(`a user connected: ${socket.id}`);
    socket.emit('initialState', progressState);

    socket.on('getAuthStatus', () => {
        const config = getConfig();
        socket.emit('authStatus', !!config.auth.token);
    });

    socket.on('login', async () => {
        const { verificationUriComplete, loginPromise } = await login();
        socket.emit('deviceCode', { verificationUriComplete });
        try {
            await loginPromise;
            socket.emit('authStatus', true);
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('logout', async () => {
        await logout();
        socket.emit('authStatus', false);
    });

    socket.on('refresh', async () => {
        await refreshToken();
        socket.emit('authStatus', true);
    });

    socket.on('download', async (url) => {
        try {
            await downloadUrl(url, (progress) => {
                let currentLevel = progressState;
                for (const link of progress.chain) {
                    if (!currentLevel[link.id]) {
                        currentLevel[link.id] = { type: link.type, id: link.id, title: 'Loading...', progress: 0, message: '', items: {} };
                    }
                    currentLevel = currentLevel[link.id].items;
                }
                const existingItem = currentLevel[progress.id] || {};
                currentLevel[progress.id] = {
                    ...existingItem,
                    ...progress,
                    items: existingItem.items || {}
                };
                io.emit('progress', progress);
            });
        } catch (error) {
            io.emit('error', error.message);
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