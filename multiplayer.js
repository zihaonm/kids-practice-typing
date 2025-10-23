// Multiplayer Typing Race Client
let socket;
let username = '';
let roomCode = '';
let isHost = false;
let raceStartTime = null;
let raceText = '';
let currentPosition = 0;
let totalChars = 0;
let correctChars = 0;
let incorrectChars = 0;
let playerEmojis = {}; // Store consistent emojis for each player

// DOM Elements
const connectionStatus = document.getElementById('connectionStatus');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const usernameSetup = document.getElementById('usernameSetup');
const usernameInput = document.getElementById('usernameInput');
const setUsernameBtn = document.getElementById('setUsernameBtn');
const lobbySelection = document.getElementById('lobbySelection');
const quickMatchBtn = document.getElementById('quickMatchBtn');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const waitingRoom = document.getElementById('waitingRoom');
const roomCodeDisplay = document.getElementById('roomCode');
const copyRoomCodeBtn = document.getElementById('copyRoomCodeBtn');
const playerCount = document.getElementById('playerCount');
const playersList = document.getElementById('playersList');
const waitingMessage = document.getElementById('waitingMessage');
const startRaceBtn = document.getElementById('startRaceBtn');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');
const raceArea = document.getElementById('raceArea');
const countdown = document.getElementById('countdown');
const raceTimer = document.getElementById('raceTimer');
const targetText = document.getElementById('targetText');
const typingInput = document.getElementById('typingInput');
const wpm = document.getElementById('wpm');
const accuracy = document.getElementById('accuracy');
const racePlayers = document.getElementById('racePlayers');
const resultsScreen = document.getElementById('resultsScreen');
const resultsLeaderboard = document.getElementById('resultsLeaderboard');
const playAgainBtn = document.getElementById('playAgainBtn');
const backToLobbyBtn = document.getElementById('backToLobbyBtn');

// Initialize Socket.io connection
function initSocket() {
    socket = io();

    socket.on('connect', () => {
        updateConnectionStatus('connected', '🟢 Connected');
    });

    socket.on('disconnect', () => {
        updateConnectionStatus('disconnected', '🔴 Disconnected');
    });

    socket.on('roomCreated', (data) => {
        roomCode = data.roomCode;
        isHost = true;
        showWaitingRoom();
    });

    socket.on('roomJoined', (data) => {
        roomCode = data.roomCode;
        isHost = data.isHost;
        showWaitingRoom();
    });

    socket.on('roomError', (data) => {
        alert(data.message);
    });

    socket.on('playersUpdate', (players) => {
        updatePlayersList(players);
    });

    socket.on('raceStarting', (data) => {
        startCountdown(data.countdown);
    });

    socket.on('raceStart', (data) => {
        raceText = data.text;
        totalChars = raceText.length;
        startRace();
    });

    socket.on('playerProgress', (data) => {
        updatePlayerProgress(data);
    });

    socket.on('playerFinished', (data) => {
        markPlayerFinished(data);
    });

    socket.on('raceResults', (data) => {
        showResults(data.results);
    });
}

function updateConnectionStatus(status, text) {
    statusText.textContent = text;
    if (status === 'connected') {
        statusIndicator.textContent = '🟢';
        statusIndicator.classList.add('connected');
    } else {
        statusIndicator.textContent = '🔴';
        statusIndicator.classList.remove('connected');
    }
}

// Username Setup
setUsernameBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name.length < 2) {
        alert('Username must be at least 2 characters');
        return;
    }
    username = name;
    socket.emit('setUsername', { username });
    showScreen('lobbySelection');
});

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        setUsernameBtn.click();
    }
});

// Lobby Actions
quickMatchBtn.addEventListener('click', () => {
    socket.emit('quickMatch');
});

createRoomBtn.addEventListener('click', () => {
    socket.emit('createRoom');
});

joinRoomBtn.addEventListener('click', () => {
    const code = roomCodeInput.value.trim().toUpperCase();
    if (code.length !== 6) {
        alert('Room code must be 6 characters');
        return;
    }
    socket.emit('joinRoom', { roomCode: code });
});

roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinRoomBtn.click();
    }
});

copyRoomCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(roomCode).then(() => {
        copyRoomCodeBtn.textContent = '✅ Copied!';
        setTimeout(() => {
            copyRoomCodeBtn.textContent = '📋 Copy Code';
        }, 2000);
    });
});

startRaceBtn.addEventListener('click', () => {
    socket.emit('startRace');
});

leaveRoomBtn.addEventListener('click', () => {
    socket.emit('leaveRoom');
    showScreen('lobbySelection');
});

playAgainBtn.addEventListener('click', () => {
    socket.emit('playAgain');
});

backToLobbyBtn.addEventListener('click', () => {
    socket.emit('leaveRoom');
    showScreen('lobbySelection');
});

// Screen Management
function showScreen(screenName) {
    usernameSetup.classList.add('hidden');
    lobbySelection.classList.add('hidden');
    waitingRoom.classList.add('hidden');
    raceArea.classList.add('hidden');
    resultsScreen.classList.add('hidden');

    document.getElementById(screenName).classList.remove('hidden');
}

function showWaitingRoom() {
    roomCodeDisplay.textContent = roomCode;
    showScreen('waitingRoom');
}

function updatePlayersList(players) {
    playerCount.textContent = players.length;
    playersList.innerHTML = '';

    players.forEach((player, index) => {
        // Store emoji from server
        if (player.emoji) {
            playerEmojis[player.id] = player.emoji;
        }

        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.innerHTML = `
            <div class="player-avatar racer-icon">${getPlayerEmoji(player.id)}</div>
            <div class="player-name">${player.username}</div>
            ${player.isHost ? '<span class="player-host">HOST</span>' : ''}
            ${player.ready ? '<span class="player-status">✓ Ready</span>' : '<span class="player-status">⏱ Waiting</span>'}
        `;
        playersList.appendChild(playerItem);
    });

    // Update start button if host
    if (isHost) {
        startRaceBtn.disabled = players.length < 2;
        waitingMessage.textContent = players.length < 2 ? 'Waiting for at least 2 players to start...' : 'Ready to start!';
    } else {
        waitingMessage.textContent = 'Waiting for host to start the race...';
    }
}

function startCountdown(count) {
    showScreen('raceArea');
    countdown.textContent = count;
    countdown.style.display = 'block';

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdown.textContent = count;
        } else {
            countdown.textContent = 'GO!';
            setTimeout(() => {
                countdown.style.display = 'none';
            }, 500);
            clearInterval(countdownInterval);
        }
    }, 1000);
}

function startRace() {
    raceStartTime = Date.now();
    currentPosition = 0;
    correctChars = 0;
    incorrectChars = 0;

    targetText.innerHTML = raceText.split('').map((char, i) =>
        `<span id="char-${i}">${char}</span>`
    ).join('');

    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();

    // Start timer
    const timerInterval = setInterval(() => {
        if (currentPosition >= totalChars) {
            clearInterval(timerInterval);
        } else {
            const elapsed = Math.floor((Date.now() - raceStartTime) / 1000);
            raceTimer.textContent = elapsed;
        }
    }, 100);
}

typingInput.addEventListener('input', (e) => {
    const typed = e.target.value;
    const expected = raceText.substring(0, typed.length);

    // Update text highlighting
    for (let i = 0; i < raceText.length; i++) {
        const charElement = document.getElementById(`char-${i}`);
        if (i < typed.length) {
            if (typed[i] === raceText[i]) {
                charElement.className = 'correct';
                if (i === typed.length - 1) correctChars++;
            } else {
                charElement.className = 'incorrect';
                if (i === typed.length - 1) incorrectChars++;
            }
        } else if (i === typed.length) {
            charElement.className = 'current';
        } else {
            charElement.className = '';
        }
    }

    currentPosition = typed.length;
    const progress = (currentPosition / totalChars) * 100;

    // Calculate WPM
    const timeElapsed = (Date.now() - raceStartTime) / 1000 / 60; // in minutes
    const wordsTyped = currentPosition / 5; // average word length
    const currentWPM = Math.round(wordsTyped / timeElapsed) || 0;
    wpm.textContent = currentWPM;

    // Calculate Accuracy
    const totalTyped = correctChars + incorrectChars;
    const currentAccuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
    accuracy.textContent = currentAccuracy;

    // Send progress to server
    socket.emit('updateProgress', {
        progress,
        wpm: currentWPM,
        accuracy: currentAccuracy
    });

    // Check if finished
    if (currentPosition >= totalChars && typed === raceText) {
        finishRace(currentWPM, currentAccuracy);
    }
});

function finishRace(finalWPM, finalAccuracy) {
    typingInput.disabled = true;
    const timeElapsed = (Date.now() - raceStartTime) / 1000;

    socket.emit('finishRace', {
        wpm: finalWPM,
        accuracy: finalAccuracy,
        time: timeElapsed
    });
}

function updatePlayerProgress(data) {
    // Store emoji from server
    if (data.emoji) {
        playerEmojis[data.playerId] = data.emoji;
    }

    const playerElement = document.getElementById(`race-player-${data.playerId}`);
    if (!playerElement) {
        // Create new player progress bar
        const newPlayer = document.createElement('div');
        newPlayer.id = `race-player-${data.playerId}`;
        newPlayer.className = 'race-player';
        newPlayer.innerHTML = `
            <div class="race-player-info">
                <span class="race-player-name">${data.username}</span>
                <span class="race-player-stats">
                    ${data.wpm} WPM | ${data.accuracy}%
                </span>
            </div>
            <div class="race-player-progress">
                <div class="race-player-bar" style="width: ${data.progress}%">
                    <span class="race-player-character racer-icon">${getPlayerEmoji(data.playerId)}</span>
                </div>
            </div>
        `;
        racePlayers.appendChild(newPlayer);
    } else {
        // Update existing player
        const bar = playerElement.querySelector('.race-player-bar');
        bar.style.width = `${data.progress}%`;
        const stats = playerElement.querySelector('.race-player-stats');
        stats.textContent = `${data.wpm} WPM | ${data.accuracy}%`;
    }
}

function markPlayerFinished(data) {
    const playerElement = document.getElementById(`race-player-${data.playerId}`);
    if (playerElement) {
        playerElement.classList.add('finished');
    }
}

function showResults(results) {
    showScreen('resultsScreen');
    resultsLeaderboard.innerHTML = '';

    results.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${['first', 'second', 'third'][index] || ''}`;

        const medals = ['🥇', '🥈', '🥉'];
        const rankDisplay = medals[index] || `#${index + 1}`;

        resultItem.innerHTML = `
            <div class="result-rank">${rankDisplay}</div>
            <div class="result-info">
                <div class="result-name">${result.username}</div>
                <div class="result-stats">
                    ${result.wpm} WPM | ${result.accuracy}% accuracy | ${result.time.toFixed(1)}s
                </div>
            </div>
        `;
        resultsLeaderboard.appendChild(resultItem);
    });
}

function getPlayerEmoji(playerId) {
    // If player already has an emoji, return it
    if (playerEmojis[playerId]) {
        return playerEmojis[playerId];
    }

    // Otherwise, assign a new one
    const emojis = ['🦖', '🚗', '🐱', '🐶', '🦁', '🐯', '🦈', '🐴', '🦄', '🏎️', '🐢', '🐰', '🦅', '🦋', '🐉'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    playerEmojis[playerId] = emoji;
    return emoji;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initSocket();
});
