const { Server } = require('socket.io');
const { createServer } = require('http');

// Data structures (Note: In-memory state may not persist in serverless - consider using Redis for production)
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

function removePlayerFromRoom(playerId, io) {
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

function showRaceResults(roomCode, io) {
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

function startRace(roomCode, io) {
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

        // Set timeout to show results after 60 seconds
        room.resultsTimeout = setTimeout(() => {
            if (room.results.length > 0) {
                console.log(`Race timeout in room ${roomCode}, showing results`);
                showRaceResults(roomCode, io);
            }
        }, 60000);
    }, 3000);
}

let io;

module.exports = (req, res) => {
    if (!io) {
        // Create Socket.IO instance
        io = new Server(res.socket.server, {
            path: '/socket.io',
            addTrailingSlash: false,
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        res.socket.server.io = io;

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

            // Quick match
            socket.on('quickMatch', () => {
                const player = players.get(socket.id);
                if (!player.username) return;

                let foundRoom = null;
                for (const [code, room] of rooms.entries()) {
                    if (room.isPublic && !room.raceStarted && room.players.length < 8) {
                        foundRoom = { code, room };
                        break;
                    }
                }

                if (foundRoom) {
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

                    setTimeout(() => {
                        const currentRoom = rooms.get(roomCode);
                        if (currentRoom && currentRoom.players.length >= 2 && !currentRoom.raceStarted) {
                            startRace(roomCode, io);
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

                startRace(player.roomCode, io);
            });

            // Update progress
            socket.on('updateProgress', (data) => {
                const player = players.get(socket.id);
                if (!player.roomCode) return;

                player.progress = data.progress;
                player.wpm = data.wpm;
                player.accuracy = data.accuracy;

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

                io.to(player.roomCode).emit('playerFinished', {
                    playerId: socket.id,
                    username: player.username
                });

                console.log(`${player.username} finished race in room ${player.roomCode}`);

                const allFinished = room.players.every(playerId => {
                    const p = players.get(playerId);
                    return p && p.finishTime !== null;
                });

                if (allFinished) {
                    setTimeout(() => {
                        showRaceResults(player.roomCode, io);
                    }, 1000);
                }
            });

            // Play again
            socket.on('playAgain', () => {
                const player = players.get(socket.id);
                if (!player.roomCode) return;

                const room = rooms.get(player.roomCode);
                if (!room) return;

                if (room.resultsTimeout) {
                    clearTimeout(room.resultsTimeout);
                    room.resultsTimeout = null;
                }

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

                io.to(player.roomCode).emit('playersUpdate', getRoomPlayers(player.roomCode));

                console.log(`Room ${player.roomCode} reset for new race`);
            });

            // Leave room
            socket.on('leaveRoom', () => {
                removePlayerFromRoom(socket.id, io);
            });

            // Disconnect
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);

                const queueIndex = matchmakingQueue.indexOf(socket.id);
                if (queueIndex > -1) {
                    matchmakingQueue.splice(queueIndex, 1);
                }

                removePlayerFromRoom(socket.id, io);
                players.delete(socket.id);
            });
        });
    }

    res.end();
};
