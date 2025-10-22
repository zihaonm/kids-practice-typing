// Game state
let score = 0;
let level = 1;
let streak = 0;
let isPlaying = false;
let currentLetter = '';
let soundEnabled = true;

// Typing mode state
let currentMode = 'letters';  // letters, words, sentences, paragraphs
let currentDifficulty = 'easy';  // easy, medium, hard
let currentTarget = '';
let currentInput = '';
let currentPosition = 0;  // Current character position in target
let totalCharacters = 0;
let correctCharacters = 0;
let startTime = null;
let wordsTyped = 0;

// Quantity tracking state
let targetQuantity = 10;  // Number of items to complete (default 10)
let itemsCompleted = 0;  // Number of items completed

// Lesson mode state
let isLessonMode = false;  // Are we in lesson mode or free practice?
let currentLesson = null;  // Current lesson object
let completedLessons = [];  // Array of completed lesson IDs

// Racing game state
let raceProgress = 0;
let starCount = 0;
let gemCount = 0;
let meatCount = 0;
let collectiblesSpawned = [];
let selectedCharacter = '🦖';  // Default character

// Audio context for sound effects
let audioContext = null;

// Initialize audio context
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play correct sound
function playCorrectSound() {
    if (!soundEnabled || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Play wrong sound
function playWrongSound() {
    if (!soundEnabled || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

// Play typing click sound
function playTypingSound() {
    if (!soundEnabled || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 600;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}

// Finger mapping for each key
const fingerMap = {
    // Number row
    '1': 'pinky-l', '2': 'ring-l', '3': 'middle-l', '4': 'index-l', '5': 'index-l',
    '6': 'index-r', '7': 'index-r', '8': 'middle-r', '9': 'ring-r', '0': 'pinky-r',
    '-': 'pinky-r','=': 'pinky-r','⬅️': 'pinky-r',
    // Top letter row
    'Q': 'pinky-l', 'W': 'ring-l', 'E': 'middle-l', 'R': 'index-l', 'T': 'index-l',
    'Y': 'index-r', 'U': 'index-r', 'I': 'middle-r', 'O': 'ring-r', 'P': 'pinky-r',
    '[':'pinky-r',']':'pinky-r','\\':'pinky-r',
    // Home row
    'A': 'pinky-l', 'S': 'ring-l', 'D': 'middle-l', 'F': 'index-l', 'G': 'index-l',
    'H': 'index-r', 'J': 'index-r', 'K': 'middle-r', 'L': 'ring-r',
    ';':'pinky-r','\'':'pinky-r',
    // Bottom row
    'Z': 'pinky-l', 'X': 'ring-l', 'C': 'middle-l', 'V': 'index-l', 'B': 'index-l',
    'N': 'index-r', 'M': 'index-r',
    ',': 'middle-r', '.': 'ring-r', '/':'pinky-r',
    // Special keys
    'ENTER': 'pinky-r', 'Enter': 'pinky-r',
    'SPACE': 'thumb', ' ': 'thumb'
};

// Encouragement messages
const correctMessages = [
    "Awesome! 🌟",
    "Great job! 🎉",
    "Perfect! ✨",
    "You're doing amazing! 🏆",
    "Fantastic! 🎨",
    "Super! 🚀",
    "Brilliant! 💫",
    "Keep it up! 🌈"
];

const wrongMessages = [
    "Oops! Try again! 💪",
    "Almost! You can do it! 🌟",
    "Keep trying! 🎯",
    "Don't give up! 💝"
];

// Letter sets for different levels
const letterSets = [
    ['A', 'B', 'C', 'D', 'E'],  // Level 1
    ['F', 'G', 'H', 'I', 'J'],  // Level 2
    ['K', 'L', 'M', 'N', 'O'],  // Level 3
    ['P', 'Q', 'R', 'S', 'T'],  // Level 4
    ['U', 'V', 'W', 'X', 'Y', 'Z'],  // Level 5
    // Level 6+: All letters
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
     'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
];

// DOM elements
const targetTextEl = document.getElementById('targetText');
const messageEl = document.getElementById('message');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const encouragementEl = document.getElementById('encouragement');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const streakEl = document.getElementById('streak');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const soundBtn = document.getElementById('soundBtn');
const keyboardSVG = document.getElementById('keyboard');

// Win modal elements
const winModalEl = document.getElementById('winModal');
const winStatsEl = document.getElementById('winStats');
const nextLessonBtn = document.getElementById('nextLessonBtn');
const resetFromWinBtn = document.getElementById('resetFromWinBtn');

// Mode selector elements
const modeButtons = document.querySelectorAll('.mode-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const quantityButtons = document.querySelectorAll('.quantity-btn');

// Progress elements
const progressDisplayEl = document.getElementById('progressDisplay');
const itemsCompletedEl = document.getElementById('itemsCompleted');
const itemsTargetEl = document.getElementById('itemsTarget');

// Racing game elements
const playerDinoEl = document.getElementById('playerDino');
const raceProgressEl = document.getElementById('raceProgress');
const starCountEl = document.getElementById('starCount');
const gemCountEl = document.getElementById('gemCount');
const meatCountEl = document.getElementById('meatCount');
const collectiblesContainer = document.getElementById('playerCollectibles');
const characterButtons = document.querySelectorAll('.character-btn');

// Step navigation elements
const step0El = document.getElementById('step0');
const step1El = document.getElementById('step1');
const step2El = document.getElementById('step2');
const gameAreaEl = document.getElementById('gameArea');
const nextToStep2Btn = document.getElementById('nextToStep2');
const backToStep1Btn = document.getElementById('backToStep1');

// Learning path elements
const selectLessonsBtn = document.getElementById('selectLessonsBtn');
const selectPracticeBtn = document.getElementById('selectPracticeBtn');
const lessonSelectionEl = document.getElementById('lessonSelection');
const lessonsGridEl = document.getElementById('lessonsGrid');
const backToPathBtn = document.getElementById('backToPath');

// Lesson info elements
const lessonInfoEl = document.getElementById('lessonInfo');
const lessonEmojiEl = document.getElementById('lessonEmoji');
const lessonTitleEl = document.getElementById('lessonTitle');
const lessonInstructionsEl = document.getElementById('lessonInstructions');
const lessonKeysEl = document.getElementById('lessonKeys');

// Lesson start modal elements
const lessonStartModalEl = document.getElementById('lessonStartModal');
const lessonStartEmojiEl = document.getElementById('lessonStartEmoji');
const lessonStartTitleEl = document.getElementById('lessonStartTitle');
const lessonStartInstructionsEl = document.getElementById('lessonStartInstructions');
const lessonStartKeysEl = document.getElementById('lessonStartKeys');
const startLessonBtn = document.getElementById('startLessonBtn');

// Helper function to get SVG key element
function getSVGKey(keyId) {
    return document.getElementById(keyId);
}

// Helper function to highlight SVG key
function highlightSVGKey(keyId) {
    // Remove all highlights
    const allKeys = keyboardSVG.querySelectorAll('.key-rect');
    allKeys.forEach(key => {
        key.style.stroke = '';
        key.style.strokeWidth = '';
        key.style.filter = '';
    });

    // Highlight the target key
    const key = getSVGKey(keyId);
    if (key) {
        key.style.stroke = '#667eea';
        key.style.strokeWidth = '4';
        key.style.filter = 'drop-shadow(0 0 10px rgba(102, 126, 234, 0.6))';
    }
}

// Helper function to press SVG key
function pressSVGKey(keyId) {
    const key = getSVGKey(keyId);
    if (key) {
        const originalFill = key.style.fill || key.getAttribute('fill') || window.getComputedStyle(key).fill;
        key.style.fill = '#4caf50';
        setTimeout(() => {
            key.style.fill = '';
        }, 200);
    }
}

// Helper function to show wrong key
function wrongSVGKey(keyId) {
    const key = getSVGKey(keyId);
    if (key) {
        const originalFill = key.style.fill || key.getAttribute('fill') || window.getComputedStyle(key).fill;
        key.style.fill = '#f44336';
        setTimeout(() => {
            key.style.fill = '';
        }, 300);
    }
}

// Initialize keyboard (no longer needed, but keep for compatibility)
function createKeyboard() {
    // Keyboard is now embedded as SVG in HTML
    console.log('SVG keyboard embedded in HTML');
}

// Mode selection handlers
function setMode(mode) {
    currentMode = mode;
    modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update UI based on mode
    if (mode === 'letters') {
        targetTextEl.classList.add('letter-mode');
    } else {
        targetTextEl.classList.remove('letter-mode');
    }


    // Update quantity selector visibility based on mode
    updateQuantitySelectorVisibility();
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    difficultyButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
    });
}

function setQuantity(quantity) {
    targetQuantity = parseInt(quantity);
    quantityButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.quantity === quantity);
    });
}

// Update quantity selector visibility based on mode
function updateQuantitySelectorVisibility() {
    const quantitySelector = document.getElementById('quantitySelector');


    // Show quantity selector for letters, words, and lesson modes
    // Hide for sentences and paragraphs (they use character count from the sentence/paragraph itself)
    if (currentMode === 'letters' || currentMode === 'words' || isLessonMode) {
        quantitySelector.classList.remove('hidden');
    } else {
        // For sentences and paragraphs, hide the selector
        quantitySelector.classList.add('hidden');
    }
}

// Progress tracking functions
function updateProgressDisplay() {
    // For sentences and paragraphs, show character count instead of item count
    if (currentMode === 'sentences' || currentMode === 'paragraphs') {
        itemsCompletedEl.textContent = correctCharacters;
        itemsTargetEl.textContent = targetQuantity;
    } else {
        // For letters and words, show item count
        itemsCompletedEl.textContent = itemsCompleted;
        itemsTargetEl.textContent = targetQuantity;
    }

    // Add animation when nearly done (90% or more)
    const progress = (currentMode === 'sentences' || currentMode === 'paragraphs')
        ? correctCharacters / targetQuantity
        : itemsCompleted / targetQuantity;

    if (progress >= 0.9) {
        progressDisplayEl.classList.add('nearly-done');
    } else {
        progressDisplayEl.classList.remove('nearly-done');
    }
}

function checkCompletion() {
    // For letters and words, check item count
    // (Sentences and paragraphs complete immediately after one item)
    if (itemsCompleted >= targetQuantity) {
        completePractice();
    }
}

function completePractice() {
    isPlaying = false;
    document.removeEventListener('keydown', handleKeyPress);

    // Calculate final stats
    const timeElapsed = (Date.now() - startTime) / 1000;
    // Calculate WPM based on characters typed (standard is 5 characters = 1 word)
    const wordsCalculated = correctCharacters / 5;
    const finalWPM = Math.round((wordsCalculated / (timeElapsed / 60)) || 0);
    const finalAccuracy = Math.round((correctCharacters / totalCharacters) * 100) || 100;

    // If in lesson mode, mark lesson as completed
    if (isLessonMode && currentLesson) {
        if (!completedLessons.includes(currentLesson.id)) {
            completedLessons.push(currentLesson.id);
            localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
        }
    }

    // Update win stats
    let completedLabel;
    if (currentMode === 'sentences' || currentMode === 'paragraphs') {
        completedLabel = `<div>✅ Completed: <strong>${correctCharacters} characters</strong></div>`;
    } else {
        completedLabel = `<div>✅ Completed: <strong>${itemsCompleted} items</strong></div>`;
    }

    let statsHTML = `
        ${completedLabel}
        <div>⏱️ Time: <strong>${Math.round(timeElapsed)}s</strong></div>
        <div>⭐ Stars: <strong>${starCount}</strong></div>
        <div>💎 Gems: <strong>${gemCount}</strong></div>
        <div>🍖 Meat: <strong>${meatCount}</strong></div>
        <div>📊 Score: <strong>${score}</strong></div>
        <div>⚡ WPM: <strong>${finalWPM}</strong></div>
        <div>🎯 Accuracy: <strong>${finalAccuracy}%</strong></div>
    `;

    if (isLessonMode && currentLesson) {
        statsHTML = `<div>🎓 Lesson Completed: <strong>${currentLesson.title}</strong></div>` + statsHTML;
    }

    winStatsEl.innerHTML = statsHTML;

    // Show the modal
    winModalEl.classList.remove('hidden');
}

// Character selection
function setCharacter(character) {
    selectedCharacter = character;
    characterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.character === character);
    });

    // Update player character in race
    if (playerDinoEl) {
        playerDinoEl.textContent = character;
    }
}

// Step navigation functions
function goToStep2() {
    step1El.classList.add('hidden');
    step2El.classList.remove('hidden');

    // Update quantity selector visibility based on current mode
    updateQuantitySelectorVisibility();
}

function goToStep1() {
    step2El.classList.add('hidden');
    step1El.classList.remove('hidden');
}

function showGameArea() {
    step2El.classList.add('hidden');
    gameAreaEl.classList.remove('hidden');

    // If in lesson mode, show the lesson start modal instead of starting immediately
    if (isLessonMode && currentLesson) {
        showLessonStartModal();
    } else {
        // Free practice mode - start immediately
        startGame();
    }
}

// Learning path navigation
function selectLessonsPath() {
    isLessonMode = true;
    step0El.classList.add('hidden');
    lessonSelectionEl.classList.remove('hidden');
    generateLessonsGrid();
}

function selectPracticePath() {
    isLessonMode = false;
    step0El.classList.add('hidden');
    step1El.classList.remove('hidden');
}

function goBackToPath() {
    lessonSelectionEl.classList.add('hidden');
    step0El.classList.remove('hidden');
}

// Generate lessons grid
function generateLessonsGrid() {
    lessonsGridEl.innerHTML = '';

    // Load completed lessons from localStorage
    const saved = localStorage.getItem('completedLessons');
    if (saved) {
        completedLessons = JSON.parse(saved);
    }

    typingLessons.forEach((lesson, index) => {
        const card = document.createElement('div');
        card.className = 'lesson-card';

        const isCompleted = completedLessons.includes(lesson.id);
        const isLocked = index > 0 && !completedLessons.includes(typingLessons[index - 1].id);

        if (isCompleted) {
            card.classList.add('completed');
        }
        if (isLocked) {
            card.classList.add('locked');
        }

        card.innerHTML = `
            <div class="lesson-number">Lesson ${lesson.id}</div>
            <div class="lesson-emoji-card">${lesson.emoji}</div>
            <div class="lesson-title-card">${lesson.title}</div>
            <div class="lesson-description-card">${lesson.description}</div>
            <div class="lesson-status ${isCompleted ? 'completed' : (isLocked ? 'locked' : '')}">
                ${isCompleted ? '✓ Completed' : (isLocked ? '🔒 Locked' : 'Start →')}
            </div>
        `;

        if (!isLocked) {
            card.addEventListener('click', () => {
                selectLesson(lesson);
            });
        }

        lessonsGridEl.appendChild(card);
    });
}

// Select a lesson
function selectLesson(lesson) {
    currentLesson = lesson;
    lessonSelectionEl.classList.add('hidden');
    step2El.classList.remove('hidden');

    // Update lesson info display
    updateLessonInfo();

    // Update quantity selector visibility for lesson mode
    updateQuantitySelectorVisibility();
}

// Update lesson info panel (now only used for modal, panel stays hidden)
function updateLessonInfo() {
    // Keep lessonInfo panel hidden - we only use the popup modal now
    lessonInfoEl.classList.add('hidden');
}

// Show lesson start modal
function showLessonStartModal() {
    if (currentLesson) {
        lessonStartEmojiEl.textContent = currentLesson.emoji;
        lessonStartTitleEl.textContent = currentLesson.title;
        lessonStartInstructionsEl.textContent = currentLesson.instructions;
        lessonStartKeysEl.textContent = currentLesson.keys.join(' ');
        lessonStartModalEl.classList.remove('hidden');
    }
}

// Hide lesson start modal and start game
function hideLessonStartModal() {
    lessonStartModalEl.classList.add('hidden');
    startGame();
}

// Get next target based on mode and difficulty
function getNextTarget() {
    // If in lesson mode, use lesson words
    if (isLessonMode && currentLesson) {
        const words = currentLesson.words;
        return words[Math.floor(Math.random() * words.length)];
    }

    // Otherwise use regular mode-based content
    if (currentMode === 'letters') {
        const levelIndex = Math.min(level - 1, letterSets.length - 1);
        const letters = letterSets[levelIndex];
        return letters[Math.floor(Math.random() * letters.length)];
    } else if (currentMode === 'words') {
        const words = typingWords[currentDifficulty];
        return words[Math.floor(Math.random() * words.length)];
    } else if (currentMode === 'sentences') {
        const sentences = typingSentences[currentDifficulty];
        return sentences[Math.floor(Math.random() * sentences.length)];
    } else if (currentMode === 'paragraphs') {
        const paragraphs = typingParagraphs[currentDifficulty];
        return paragraphs[Math.floor(Math.random() * paragraphs.length)];
    }
}

// Render target text with character highlighting
function renderTargetText() {
    // Always wrap characters in spans for highlighting (including letter mode and lesson mode)
    targetTextEl.innerHTML = '';
    for (let i = 0; i < currentTarget.length; i++) {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = currentTarget[i];

        if (i < currentPosition) {
            span.classList.add('correct');
        } else if (i === currentPosition) {
            span.classList.add('current');
        }

        targetTextEl.appendChild(span);
    }

    // Highlight keyboard key for current character
    const currentChar = currentTarget[currentPosition];
    if (currentChar) {
        const keyToHighlight = currentChar.toUpperCase();

        // Map some special characters to SVG key IDs
        let svgKeyId = keyToHighlight;
        if (keyToHighlight === ' ') svgKeyId = 'SPACE';
        if (keyToHighlight === 'ENTER') svgKeyId = 'ENTER';

        // Highlight SVG key
        highlightSVGKey(svgKeyId);

        // Highlight finger visual
        const fingerClass = fingerMap[keyToHighlight];
        if (fingerClass) {
            document.querySelectorAll('.finger-visual').forEach(finger => {
                finger.classList.remove('active');
            });
            const fingerEl = document.querySelector(`.${fingerClass}-visual`);
            if (fingerEl) {
                fingerEl.classList.add('active');
            }
        }
    }
}

// Set new target (replaces setNewLetter)
function setNewTarget() {
    currentTarget = getNextTarget();
    currentInput = '';
    currentPosition = 0;


    // For sentences and paragraphs, set targetQuantity to the character count of this item
    if (currentMode === 'sentences' || currentMode === 'paragraphs') {
        targetQuantity = currentTarget.length;
        // Update progress display with the new target
        updateProgressDisplay();
    }

    // Remove all highlights from SVG keyboard
    const allKeys = keyboardSVG.querySelectorAll('.key-rect');
    allKeys.forEach(key => {
        key.style.stroke = '';
        key.style.strokeWidth = '';
        key.style.filter = '';
    });

    // Remove finger highlights
    document.querySelectorAll('.finger-visual').forEach(finger => {
        finger.classList.remove('active');
    });

    // Render the target text with highlighting
    renderTargetText();

    // Reset timer on first character
    if (!startTime) {
        startTime = Date.now();
    }
}

// Calculate WPM and Accuracy
function updateTypingStats() {
    if (startTime && correctCharacters > 0) {
        const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
        // Calculate WPM based on characters typed (standard is 5 characters = 1 word)
        const wordsCalculated = correctCharacters / 5;
        const wpm = Math.round((wordsCalculated / timeElapsed) || 0);
        wpmEl.textContent = wpm;
    }

    if (totalCharacters > 0) {
        const accuracy = Math.round((correctCharacters / totalCharacters) * 100);
        accuracyEl.textContent = accuracy;
    }
}

// Get random letter based on current level (kept for compatibility)
function getRandomLetter() {
    const levelIndex = Math.min(level - 1, letterSets.length - 1);
    const letters = letterSets[levelIndex];
    return letters[Math.floor(Math.random() * letters.length)];
}

// Show encouragement message
function showEncouragement(message, isCorrect) {
    encouragementEl.textContent = message;
    encouragementEl.className = 'encouragement ' + (isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
        encouragementEl.textContent = '';
        encouragementEl.className = 'encouragement';
    }, 2000);
}

// Update stats
function updateStats() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    streakEl.textContent = streak;
}

// Check if should level up
function checkLevelUp() {
    const nextLevelScore = level * 10;
    if (score >= nextLevelScore && level < letterSets.length) {
        level++;
        showEncouragement(`Level Up! Now at Level ${level}! 🎊`, true);
    }
}

// Racing game functions
function updateRaceProgress(amount) {
    raceProgress = Math.min(raceProgress + amount, 100);
    raceProgressEl.textContent = Math.round(raceProgress);

    // Move the dinosaur
    const maxDistance = playerDinoEl.parentElement.offsetWidth - 80;
    const newPosition = (raceProgress / 100) * maxDistance;
    playerDinoEl.style.left = `${newPosition}px`;

    // Add running animation
    playerDinoEl.classList.add('running');
    setTimeout(() => {
        playerDinoEl.classList.remove('running');
    }, 300);

    // Check for collectibles
    checkCollectibles(newPosition);

    // Check if race is won
    if (raceProgress >= 100) {
        celebrateRaceWin();
    }
}

function spawnCollectible() {
    const collectibleTypes = ['⭐', '💎', '🍖'];
    const collectible = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];

    const collectibleEl = document.createElement('div');
    collectibleEl.className = 'collectible';
    collectibleEl.textContent = collectible;

    // Random position on the track
    const maxDistance = playerDinoEl.parentElement.offsetWidth - 80;
    const position = Math.random() * 0.8 * maxDistance + 50;
    collectibleEl.style.left = `${position}px`;
    collectibleEl.style.top = '50%';
    collectibleEl.style.transform = 'translateY(-50%)';

    collectibleEl.dataset.position = position;
    collectibleEl.dataset.type = collectible;
    collectibleEl.dataset.collected = 'false';

    collectiblesContainer.appendChild(collectibleEl);
    collectiblesSpawned.push(collectibleEl);
}

function checkCollectibles(playerPosition) {
    collectiblesSpawned.forEach(collectible => {
        if (collectible.dataset.collected === 'false') {
            const collectiblePosition = parseFloat(collectible.dataset.position);

            // Check if player is close to collectible
            if (Math.abs(playerPosition - collectiblePosition) < 40) {
                collectItem(collectible);
            }
        }
    });
}

function collectItem(collectibleEl) {
    collectibleEl.dataset.collected = 'true';
    collectibleEl.classList.add('collected');

    const type = collectibleEl.dataset.type;

    if (type === '⭐') {
        starCount++;
        starCountEl.textContent = starCount;
    } else if (type === '💎') {
        gemCount++;
        gemCountEl.textContent = gemCount;
    } else if (type === '🍖') {
        meatCount++;
        meatCountEl.textContent = meatCount;
    }

    // Play collect sound
    playCorrectSound();

    // Remove after animation
    setTimeout(() => {
        collectibleEl.remove();
    }, 500);
}

function celebrateRaceWin() {
    // Stop the game
    isPlaying = false;
    document.removeEventListener('keydown', handleKeyPress);

    // Calculate final stats
    const timeElapsed = (Date.now() - startTime) / 1000;
    const finalWPM = Math.round((wordsTyped / (timeElapsed / 60)) || 0);
    const finalAccuracy = Math.round((correctCharacters / totalCharacters) * 100) || 100;

    // Update win stats
    winStatsEl.innerHTML = `
        <div>⭐ Stars Collected: <strong>${starCount}</strong></div>
        <div>💎 Gems Collected: <strong>${gemCount}</strong></div>
        <div>🍖 Meat Collected: <strong>${meatCount}</strong></div>
        <div>📊 Final Score: <strong>${score}</strong></div>
        <div>⚡ WPM: <strong>${finalWPM}</strong></div>
        <div>🎯 Accuracy: <strong>${finalAccuracy}%</strong></div>
    `;

    // Show the modal
    winModalEl.classList.remove('hidden');
}

// Handle Next Lesson button
function handleNextLesson() {
    winModalEl.classList.add('hidden');

    if (isLessonMode) {
        // In lesson mode, advance to next lesson
        const currentIndex = typingLessons.findIndex(l => l.id === currentLesson.id);
        const nextLesson = typingLessons[currentIndex + 1];

        if (nextLesson) {
            currentLesson = nextLesson;

            // Reset game state but keep in game area
            score = 0;
            level = 1;
            streak = 0;
            totalCharacters = 0;
            correctCharacters = 0;
            wordsTyped = 0;
            currentPosition = 0;
            itemsCompleted = 0;
            startTime = null;

            updateStats();
            resetRace();

            // Show popup for next lesson, then start game
            showLessonStartModal();
        } else {
            // No more lessons, go back to lesson selection
            resetGame();
        }
    } else {
        // Free practice mode - increase difficulty or mode
        if (currentDifficulty === 'easy') {
            setDifficulty('medium');
        } else if (currentDifficulty === 'medium') {
            setDifficulty('hard');
        } else if (currentDifficulty === 'hard') {
            // Advance to next mode
            if (currentMode === 'letters') {
                setMode('words');
                setDifficulty('easy');
            } else if (currentMode === 'words') {
                setMode('sentences');
                setDifficulty('easy');
            } else if (currentMode === 'sentences') {
                setMode('paragraphs');
                setDifficulty('easy');
            } else {
                // Already at max, just restart with hard paragraphs
                setMode('paragraphs');
                setDifficulty('hard');
            }
        }

        // Reset game state but keep in game area
        score = 0;
        level = 1;
        streak = 0;
        totalCharacters = 0;
        correctCharacters = 0;
        wordsTyped = 0;
        currentPosition = 0;
        startTime = null;

        updateStats();
        resetRace();

        // Start new game
        startGame();
    }
}

function resetRace() {
    raceProgress = 0;
    starCount = 0;
    gemCount = 0;
    meatCount = 0;

    raceProgressEl.textContent = '0';
    starCountEl.textContent = '0';
    gemCountEl.textContent = '0';
    meatCountEl.textContent = '0';

    playerDinoEl.style.left = '0';

    // Clear collectibles
    collectiblesSpawned.forEach(c => c.remove());
    collectiblesSpawned = [];

    // Spawn initial collectibles
    for (let i = 0; i < 8; i++) {
        spawnCollectible();
    }
}

// Update race progress per character typed
function updateRaceProgressPerCharacter() {
    let progressIncrement = 0;

    if (currentMode === 'letters') {
        // For letters, each letter is a complete item, so calculate per item
        progressIncrement = (1 / targetQuantity) * 100;
    } else if (currentMode === 'words') {
        // For words, calculate based on total expected characters
        // Estimate: average word is 5 characters, so total chars = targetQuantity * 5
        const estimatedTotalChars = targetQuantity * 5;
        progressIncrement = (1 / estimatedTotalChars) * 100;
    } else if (currentMode === 'sentences' || currentMode === 'paragraphs') {
        // For sentences/paragraphs, calculate based on current item length
        progressIncrement = (1 / targetQuantity) * 100;
    }

    updateRaceProgress(progressIncrement);
}

// Unified keyboard handler for all modes
function handleKeyPress(event) {
    if (!isPlaying) return;

    const pressedKey = event.key;

    // Ignore special keys except space
    if (pressedKey.length > 1 && pressedKey !== ' ') return;

    playTypingSound();

    // Get the current target character
    const targetChar = currentTarget[currentPosition];

    // Check if the pressed key matches the target character
    const isCorrect = (currentMode === 'letters')
        ? pressedKey.toUpperCase() === targetChar.toUpperCase()
        : pressedKey === targetChar;

    // Map pressed key to SVG key ID
    let svgKeyId = pressedKey.toUpperCase();
    if (svgKeyId === ' ') svgKeyId = 'SPACE';

    if (isCorrect) {
        // Correct key pressed!
        playCorrectSound();
        correctCharacters++;
        totalCharacters++;
        currentPosition++;

        // Show press animation on SVG keyboard
        pressSVGKey(svgKeyId);


        // Update race progress smoothly on each character for sentences/paragraphs
        if (currentMode === 'sentences' || currentMode === 'paragraphs') {
            const progressPerChar = 100 / targetQuantity;
            updateRaceProgress(progressPerChar);
        }

        // Update progress display for sentences/paragraphs on each character
        if (currentMode === 'sentences' || currentMode === 'paragraphs') {
            updateProgressDisplay();
        }

        // Update typing stats on each character for smooth feedback
        updateTypingStats();

        // Check if target is complete
        if (currentPosition >= currentTarget.length) {
            // Completed the target!
            const points = currentMode === 'letters' ? 10 : currentTarget.length;
            score += points;
            streak++;
            itemsCompleted++;

            if (currentMode !== 'letters') {
                wordsTyped++;
            }

            const message = correctMessages[Math.floor(Math.random() * correctMessages.length)];
            showEncouragement(message, true);

            updateStats();
            updateTypingStats();
            updateProgressDisplay();
            checkLevelUp();


            // Update race progress for letters/words (not sentences/paragraphs - already updated per char)
            if (currentMode !== 'sentences' && currentMode !== 'paragraphs') {
                const progressPerItem = 100 / targetQuantity;
                updateRaceProgress(progressPerItem);
            }

            // For sentences/paragraphs, complete practice immediately after one item
            if (currentMode === 'sentences' || currentMode === 'paragraphs') {
                completePractice();
            } else {
                // Check if practice is complete for letters/words
                checkCompletion();

                // Next target (if not complete)
                if (itemsCompleted < targetQuantity) {
                    setTimeout(() => {
                        setNewTarget();
                    }, 300);
                }
            }
        } else {
            // Continue with next character
            renderTargetText();
            // Typing stats already updated above
        }

    } else {
        // Wrong key pressed - just show feedback, don't advance
        playWrongSound();
        totalCharacters++;
        streak = 0;

        // Show wrong key animation on SVG keyboard
        wrongSVGKey(svgKeyId);

        // Mark current character as incorrect temporarily
        const chars = targetTextEl.querySelectorAll('.char');
        if (chars[currentPosition]) {
            chars[currentPosition].classList.add('incorrect');
            setTimeout(() => {
                chars[currentPosition].classList.remove('incorrect');
            }, 300);
        }

        const message = wrongMessages[Math.floor(Math.random() * wrongMessages.length)];
        showEncouragement(message, false);

        updateStats();
        // Update typing stats to show accuracy decrease in real-time
        updateTypingStats();
    }
}

// Start game
function startGame() {
    initAudio();
    isPlaying = true;

    // Reset stats
    startTime = Date.now();
    totalCharacters = 0;
    correctCharacters = 0;
    wordsTyped = 0;
    currentPosition = 0;
    itemsCompleted = 0;

    // For sentences and paragraphs, targetQuantity will be set by setNewTarget()
    // based on the actual length of the sentence/paragraph loaded
    // For letters and words, targetQuantity is already set by user selection

    // Update message based on mode
    if (isLessonMode && currentLesson) {
        messageEl.textContent = currentLesson.instructions;
        // Don't show lesson info panel - only popup is used
    } else if (currentMode === 'letters') {
        messageEl.textContent = 'Type the letter shown above!';
    } else if (currentMode === 'sentences') {
        messageEl.textContent = 'Type the sentence shown above!';
    } else if (currentMode === 'paragraphs') {
        messageEl.textContent = 'Type the paragraph shown above!';
    } else {
        messageEl.textContent = 'Type what you see!';
    }

    // Update progress display
    updateProgressDisplay();

    resetRace();
    setNewTarget();

    // Add event listener
    document.addEventListener('keydown', handleKeyPress);
}

// Reset game
function resetGame() {
    score = 0;
    level = 1;
    streak = 0;
    isPlaying = false;
    startTime = null;
    totalCharacters = 0;
    correctCharacters = 0;
    wordsTyped = 0;
    currentPosition = 0;

    messageEl.textContent = 'Choose a mode and click Start!';
    targetTextEl.textContent = currentMode === 'letters' ? 'A' : 'Ready?';
    encouragementEl.textContent = '';
    wpmEl.textContent = '0';
    accuracyEl.textContent = '100';

    updateStats();
    resetRace();

    // Reset progress
    itemsCompleted = 0;
    updateProgressDisplay();
    progressDisplayEl.classList.remove('nearly-done');

    // Remove all highlights from SVG keyboard
    const allKeys = keyboardSVG.querySelectorAll('.key-rect');
    allKeys.forEach(key => {
        key.style.stroke = '';
        key.style.strokeWidth = '';
        key.style.filter = '';
    });

    // Remove finger highlights
    document.querySelectorAll('.finger-visual').forEach(finger => {
        finger.classList.remove('active');
    });

    document.removeEventListener('keydown', handleKeyPress);

    // Hide win modal and lesson start modal
    winModalEl.classList.add('hidden');
    lessonStartModalEl.classList.add('hidden');

    // Go back to appropriate screen based on mode
    gameAreaEl.classList.add('hidden');
    step2El.classList.add('hidden');

    if (isLessonMode) {
        // Go back to lesson selection
        lessonSelectionEl.classList.remove('hidden');
        generateLessonsGrid();  // Refresh to show newly completed lessons
        currentLesson = null;
    } else {
        // Go back to step 1 (free practice settings)
        step1El.classList.remove('hidden');
    }

    // Always keep lesson info panel hidden
    lessonInfoEl.classList.add('hidden');
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF';
    soundBtn.classList.toggle('muted', !soundEnabled);

    if (soundEnabled) {
        initAudio();
    }
}

// Event listeners
startBtn.addEventListener('click', showGameArea);
resetBtn.addEventListener('click', resetGame);
soundBtn.addEventListener('click', toggleSound);
startLessonBtn.addEventListener('click', hideLessonStartModal);

// Learning path selection
selectLessonsBtn.addEventListener('click', selectLessonsPath);
selectPracticeBtn.addEventListener('click', selectPracticePath);
backToPathBtn.addEventListener('click', goBackToPath);

// Step navigation
nextToStep2Btn.addEventListener('click', goToStep2);
backToStep1Btn.addEventListener('click', goToStep1);

// Win modal buttons
nextLessonBtn.addEventListener('click', handleNextLesson);
resetFromWinBtn.addEventListener('click', resetGame);

// Mode and difficulty selection
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!isPlaying) {
            setMode(btn.dataset.mode);
        }
    });
});

difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!isPlaying) {
            setDifficulty(btn.dataset.difficulty);
        }
    });
});

quantityButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!isPlaying) {
            setQuantity(btn.dataset.quantity);
        }
    });
});

// Character selection
characterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!isPlaying) {
            setCharacter(btn.dataset.character);
        }
    });
});

// Add keyboard event listener for visual feedback on SVG keyboard
document.addEventListener('keydown', (event) => {
    if (!keyboardSVG) return;

    let key = event.key.toUpperCase();
    if (key === ' ') key = 'SPACE';
    if (key === 'ENTER') key = 'ENTER';
    if (key === 'SHIFT') key = event.code.includes('LEFT') ? 'SHIFTLEFT' : 'SHIFTRIGHT';
    if (key === 'CONTROL') key = event.code.includes('LEFT') ? 'CTRLLEFT' : 'CTRLRIGHT';
    if (key === 'ALT') key = event.code.includes('LEFT') ? 'ALTLEFT' : 'ALTRIGHT';
    if (key === 'CAPSLOCK') key = 'CAPSLOCK';
    if (key === 'TAB') key = 'TAB';

    const keyRect = document.getElementById(key);
    if (keyRect) {
        keyRect.style.transform = 'scale(0.95)';
        setTimeout(() => {
            keyRect.style.transform = '';
        }, 100);
    }
});

// Initialize
createKeyboard();
updateStats();
resetRace();
setMode('letters');  // Set initial mode
setDifficulty('easy');  // Set initial difficulty
setQuantity('10');  // Set initial quantity
setCharacter('🦖');  // Set initial character
updateProgressDisplay();
