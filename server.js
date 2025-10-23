const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Serve static files
app.use(express.static(__dirname));

// Data structures
const rooms = new Map();
const players = new Map();
const matchmakingQueue = [];

// Sample typing texts
const typingTexts = [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump! The five boxing wizards jump quickly through the fog.",
    "Sphinx of black quartz, judge my vow. The job requires extra pluck and zeal from every young wage earner.",
    "Programming is the art of telling another human what one wants the computer to do.",
    "JavaScript is a versatile programming language used for web development and beyond.",
];

// Helper functions
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return rooms.has(code) ? generateRoomCode() : code;
}

function getRandomText() {
    return typingTexts[Math.floor(Math.random() * typingTexts.length)];
}

function getRandomEmoji() {
    const emojis = ['🦖', '🚗', '🐱', '🐶', '🦁', '🐯', '🦈', '🐴', '🦄', '🏎️', '🐢', '🐰', '🦅', '🦋', '🐉'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

function getRoomPlayers(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return [];

    return room.players.map(playerId => {
        const player = players.get(playerId);
        return {
            id: playerId,
            username: player.username,
            emoji: player.emoji,
            isHost: playerId === room.hostId,
            ready: player.ready
        };
    });
}

function cleanupRoom(roomCode) {
    const room = rooms.get(roomCode);
    if (room && room.players.length === 0) {
        rooms.delete(roomCode);
        console.log(`Room ${roomCode} deleted (empty)`);
    }
}

function removePlayerFromRoom(playerId) {
    const player = players.get(playerId);
    if (!player || !player.roomCode) return;

    const room = rooms.get(player.roomCode);
    if (room) {
        room.players = room.players.filter(id => id !== playerId);

        // If host left, assign new host
        if (room.hostId === playerId && room.players.length > 0) {
            room.hostId = room.players[0];
        }

        // Update all players in room
        io.to(player.roomCode).emit('playersUpdate', getRoomPlayers(player.roomCode));

        cleanupRoom(player.roomCode);
    }

    player.roomCode = null;
    player.ready = false;
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Initialize player
    players.set(socket.id, {
        id: socket.id,
        username: '',
        emoji: getRandomEmoji(),
        roomCode: null,
        ready: false,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finishTime: null
    });

    // Set username
    socket.on('setUsername', (data) => {
        const player = players.get(socket.id);
        player.username = data.username;
        console.log(`${socket.id} set username to ${data.username}`);
    });

    // Create private room
    socket.on('createRoom', () => {
        const player = players.get(socket.id);
        if (!player.username) return;

        const roomCode = generateRoomCode();
        const room = {
            code: roomCode,
            hostId: socket.id,
            players: [socket.id],
            isPublic: false,
            raceStarted: false,
            raceText: '',
            results: [],
            resultsTimeout: null
        };

        rooms.set(roomCode, room);
        player.roomCode = roomCode;

        socket.join(roomCode);
        socket.emit('roomCreated', { roomCode });
        io.to(roomCode).emit('playersUpdate', getRoomPlayers(roomCode));

        console.log(`Room ${roomCode} created by ${player.username}`);
    });

    // Join private room
    socket.on('joinRoom', (data) => {
        const player = players.get(socket.id);
        if (!player.username) return;

        const room = rooms.get(data.roomCode);
        if (!room) {
            socket.emit('roomError', { message: 'Room not found!' });
            return;
        }

        if (room.raceStarted) {
            socket.emit('roomError', { message: 'Race already in progress!' });
            return;
        }

        room.players.push(socket.id);
        player.roomCode = data.roomCode;

        socket.join(data.roomCode);
        socket.emit('roomJoined', {
            roomCode: data.roomCode,
            isHost: false
        });
        io.to(data.roomCode).emit('playersUpdate', getRoomPlayers(data.roomCode));

        console.log(`${player.username} joined room ${data.roomCode}`);
    });

    // Quick match (public matchmaking)
    socket.on('quickMatch', () => {
        const player = players.get(socket.id);
        if (!player.username) return;

        // Check if there's an available public room
        let foundRoom = null;
        for (const [code, room] of rooms.entries()) {
            if (room.isPublic && !room.raceStarted && room.players.length < 8) {
                foundRoom = { code, room };
                break;
            }
        }

        if (foundRoom) {
            // Join existing public room
            const { code, room } = foundRoom;
            room.players.push(socket.id);
            player.roomCode = code;

            socket.join(code);
            socket.emit('roomJoined', {
                roomCode: code,
                isHost: false
            });
            io.to(code).emit('playersUpdate', getRoomPlayers(code));

            console.log(`${player.username} joined public room ${code}`);
        } else {
            // Create new public room
            const roomCode = generateRoomCode();
            const room = {
                code: roomCode,
                hostId: socket.id,
                players: [socket.id],
                isPublic: true,
                raceStarted: false,
                raceText: '',
                results: [],
                resultsTimeout: null
            };

            rooms.set(roomCode, room);
            player.roomCode = roomCode;

            socket.join(roomCode);
            socket.emit('roomCreated', { roomCode });
            io.to(roomCode).emit('playersUpdate', getRoomPlayers(roomCode));

            console.log(`Public room ${roomCode} created by ${player.username}`);

            // Auto-start after 10 seconds if enough players
            setTimeout(() => {
                const currentRoom = rooms.get(roomCode);
                if (currentRoom && currentRoom.players.length >= 2 && !currentRoom.raceStarted) {
                    startRace(roomCode);
                }
            }, 10000);
        }
    });

    // Start race
    socket.on('startRace', () => {
        const player = players.get(socket.id);
        if (!player.roomCode) return;

        const room = rooms.get(player.roomCode);
        if (!room || room.hostId !== socket.id) return;

        startRace(player.roomCode);
    });

    function showRaceResults(roomCode) {
        const room = rooms.get(roomCode);
        if (!room) return;

        // Clear any existing timeout
        if (room.resultsTimeout) {
            clearTimeout(room.resultsTimeout);
            room.resultsTimeout = null;
        }

        // Sort results by WPM, then accuracy
        room.results.sort((a, b) => {
            if (b.wpm !== a.wpm) return b.wpm - a.wpm;
            return b.accuracy - a.accuracy;
        });

        // Send results to all players
        io.to(roomCode).emit('raceResults', {
            results: room.results
        });

        console.log(`Race ended in room ${roomCode} with ${room.results.length} finishers`);
    }

    function startRace(roomCode) {
        const room = rooms.get(roomCode);
        if (!room || room.raceStarted) return;

        room.raceStarted = true;
        room.raceText = getRandomText();
        room.results = [];

        // Reset all players
        room.players.forEach(playerId => {
            const p = players.get(playerId);
            p.progress = 0;
            p.wpm = 0;
            p.accuracy = 100;
            p.finishTime = null;
        });

        // Send countdown
        io.to(roomCode).emit('raceStarting', { countdown: 3 });

        // Start race after countdown
        setTimeout(() => {
            io.to(roomCode).emit('raceStart', { text: room.raceText });
            console.log(`Race started in room ${roomCode}`);

            // Set timeout to show results after 60 seconds even if not all players finish
            room.resultsTimeout = setTimeout(() => {
                if (room.results.length > 0) {
                    console.log(`Race timeout in room ${roomCode}, showing results`);
                    showRaceResults(roomCode);
                }
            }, 60000); // 60 seconds
        }, 3000);
    }

    // Update progress
    socket.on('updateProgress', (data) => {
        const player = players.get(socket.id);
        if (!player.roomCode) return;

        player.progress = data.progress;
        player.wpm = data.wpm;
        player.accuracy = data.accuracy;

        // Broadcast to room
        io.to(player.roomCode).emit('playerProgress', {
            playerId: socket.id,
            username: player.username,
            emoji: player.emoji,
            progress: data.progress,
            wpm: data.wpm,
            accuracy: data.accuracy
        });
    });

    // Finish race
    socket.on('finishRace', (data) => {
        const player = players.get(socket.id);
        if (!player.roomCode) return;

        const room = rooms.get(player.roomCode);
        if (!room) return;

        player.finishTime = Date.now();
        player.wpm = data.wpm;
        player.accuracy = data.accuracy;

        room.results.push({
            playerId: socket.id,
            username: player.username,
            wpm: data.wpm,
            accuracy: data.accuracy,
            time: data.time
        });

        // Notify room
        io.to(player.roomCode).emit('playerFinished', {
            playerId: socket.id,
            username: player.username
        });

        console.log(`${player.username} finished race in room ${player.roomCode}`);

        // Check if all players finished
        const allFinished = room.players.every(playerId => {
            const p = players.get(playerId);
            return p && p.finishTime !== null;
        });

        // Show results if all players finished
        if (allFinished) {
            setTimeout(() => {
                showRaceResults(player.roomCode);
            }, 1000);
        }
    });

    // Play again
    socket.on('playAgain', () => {
        const player = players.get(socket.id);
        if (!player.roomCode) return;

        const room = rooms.get(player.roomCode);
        if (!room) return;

        // Clear any existing timeout
        if (room.resultsTimeout) {
            clearTimeout(room.resultsTimeout);
            room.resultsTimeout = null;
        }

        // Reset race state
        room.raceStarted = false;
        room.results = [];

        room.players.forEach(playerId => {
            const p = players.get(playerId);
            if (p) {
                p.progress = 0;
                p.wpm = 0;
                p.accuracy = 100;
                p.finishTime = null;
            }
        });

        // Send all players back to waiting room
        io.to(player.roomCode).emit('playersUpdate', getRoomPlayers(player.roomCode));

        console.log(`Room ${player.roomCode} reset for new race`);
    });

    // Leave room
    socket.on('leaveRoom', () => {
        removePlayerFromRoom(socket.id);
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        // Remove from matchmaking queue
        const queueIndex = matchmakingQueue.indexOf(socket.id);
        if (queueIndex > -1) {
            matchmakingQueue.splice(queueIndex, 1);
        }

        // Remove from room
        removePlayerFromRoom(socket.id);

        // Remove player
        players.delete(socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}/multiplayer.html to play`);
});
