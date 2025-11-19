# CLAUDE.md - AI Assistant Guide for Kids Practice Typing

## Project Overview

**Kids Practice Typing** is an educational web application designed to teach children touch typing through progressive lessons and gamification. The application features:

- 11 progressive typing lessons (home row to all keyboard keys)
- Free practice mode with customizable difficulty
- Racing game mechanics with collectibles (stars, gems, meat)
- Real-time typing analytics (WPM, accuracy, streak)
- Visual hand/finger guidance with color-coded keyboard
- Audio feedback for correct/incorrect input
- Kid-friendly UI with emoji characters and encouraging messages

**Target Audience:** Children learning to type
**Deployment:** Static web application (no backend required)
**Repository:** https://github.com/zihaonm/kids-practice-typing

---

## Technology Stack

### Core Technologies
- **Language:** Vanilla JavaScript (ES6+)
- **Markup:** HTML5
- **Styling:** CSS3 with Flexbox
- **Graphics:** Inline SVG for keyboard visualization
- **Audio:** Web Audio API for sound effects

### Key Characteristics
- **No dependencies:** Pure vanilla JavaScript, no frameworks or libraries
- **No build process:** Runs directly in browsers without compilation
- **No package manager:** No npm, yarn, or other package management
- **Client-side only:** No server-side processing or APIs
- **Single Page Application:** Dynamic content switching via DOM manipulation

---

## Codebase Structure

```
/home/user/kids-practice-typing/
├── index.html              # Main application UI (24 KB, 741 lines)
├── keyboard.html           # Standalone keyboard testing page (7.7 KB)
├── script.js               # Core application logic (40 KB, 1,255 lines)
├── typing-content.js       # Lesson data and content (25 KB, 365 lines)
├── style.css               # All styles and animations (28 KB, 1,453 lines)
├── README.md               # Basic project description
├── LICENSE                 # Project license
└── .gitignore              # Git exclusions
```

### File Loading Order
1. `index.html` loads first
2. `typing-content.js` is included (provides data)
3. `script.js` is included last (consumes data, initializes UI)

---

## Key Files Deep Dive

### index.html (Main Application)
**Purpose:** Complete UI structure for the typing application
**Key Sections:**
- **Step 0:** Learning path selection (Guided Lessons vs Free Practice)
- **Step 1:** Mode selection (Letters, Words, Sentences, Paragraphs)
- **Step 2:** Difficulty and character selection
- **Game Area:** Practice interface with stats, keyboard, hand visualization
- **Modals:** Lesson start instructions, completion celebration

**Important Elements:**
- Inline SVG keyboard with 65+ key elements
- Color-coded finger zones (8 colors for different fingers)
- Dynamic content containers that show/hide based on user progress
- Event handlers attached via `data-*` attributes

**Lines to Reference:**
- SVG keyboard definition: ~200-600
- Game area structure: ~600-700
- Modals: ~700-741

---

### script.js (Core Application Logic)
**Purpose:** All game mechanics, state management, and user interaction
**Lines:** 1,255
**Functions:** 70+ functions

**State Management Variables:**
```javascript
// Game State
let score, level, streak, items
let totalTyped, correctTyped, wrongTyped
let gameTime, gameTimeRemaining

// Typing State
let currentInput, currentTarget, currentPosition
let typingMode, difficulty, quantity, targetCount
let isPlaying, isLessonMode, currentLesson

// Racing State
let raceDistance, raceProgress, selectedCharacter
let collectibles, collectedStars, collectedGems
```

**Key Functions by Category:**

**Audio (Web Audio API):**
- `playCorrectSound()` - Green note sound for correct typing
- `playWrongSound()` - Red buzz sound for errors
- `playTypingSound()` - Click sound for any keypress

**Game Control:**
- `startGame()` - Initializes game state, starts timer
- `resetGame()` - Clears state, returns to menu
- `handleKeyPress(event)` - Main input handler, validates typing
- `getNextTarget()` - Fetches next typing target based on mode
- `setNewTarget()` - Updates UI with new target text

**Mode/Settings:**
- `setMode(mode)` - Sets typing mode (letters/words/sentences/paragraphs)
- `setDifficulty(diff)` - Sets difficulty (easy/medium/hard)
- `setQuantity(qty)` - Sets practice quantity (10/20/30)
- `selectCharacter(char)` - Chooses racing character

**Keyboard Visualization:**
- `highlightKey(key)` - Highlights pressed key on SVG keyboard
- `getFingerForKey(key)` - Returns which finger should press the key
- `updateHandPosition(key)` - Updates visual hand guide

**Racing Game:**
- `updateRaceProgress()` - Moves character forward on track
- `spawnCollectible()` - Creates stars/gems/meat on track
- `checkCollectibles()` - Collision detection for collectibles
- `celebrateRaceWin()` - Completion animation and stats

**Lesson System:**
- `selectLesson(lessonId)` - Loads specific lesson
- `generateLessonsGrid()` - Creates lesson selection UI
- `handleNextLesson()` - Progresses to next lesson
- `getLessonProgress(lessonId)` - Tracks completion status

**Stats & Analytics:**
- `updateStats()` - Updates score, level, streak displays
- `updateTypingStats()` - Calculates WPM and accuracy
- `calculateWPM()` - Words per minute calculation
- `calculateAccuracy()` - Percentage of correct keystrokes

**Critical Code Sections:**
- Input handling: lines ~400-500
- Game initialization: lines ~100-200
- Lesson management: lines ~800-900
- Racing mechanics: lines ~600-700

---

### typing-content.js (Content Database)
**Purpose:** All typing content, lessons, and configuration data
**Lines:** 365
**Structure:** Plain JavaScript objects (no classes)

**Content Objects:**

```javascript
// Word lists by difficulty
const typingWords = {
  easy: [...],    // Simple 3-5 letter words
  medium: [...],  // 5-7 letter words
  hard: [...]     // 7+ letter complex words
}

// Sentence collections
const typingSentences = {
  easy: [...],    // Simple subject-verb sentences
  medium: [...],  // Compound sentences
  hard: [...]     // Complex sentences with punctuation
}

// Paragraph stories
const typingParagraphs = {
  easy: [...],    // 2-3 sentence stories
  medium: [...],  // 4-5 sentence narratives
  hard: [...]     // 6+ sentence complex stories
}

// Emoji themes for fun practice
const typingThemes = {
  animals: [...],
  food: [...],
  space: [...],
  fantasy: [...]
}

// Encouragement messages
const milestones = [...]

// 11 progressive lessons
const typingLessons = [
  {
    id: 1,
    title: "Home Row Heroes",
    emoji: "🏠",
    allowedKeys: ['a','s','d','f','j','k','l',';'],
    words: [...],
    fingerGuide: {...},
    instructions: "..."
  },
  // ... lessons 2-11
]
```

**Lesson Progression:**
1. Home Row (asdf jkl;)
2. Upper Row (qwer uiop)
3. Lower Row (zxcv bnm,)
4. Top Row Numbers (1234 7890)
5. All Letters
6. Number Practice
7. Special Characters
8. Letter Master
9. Number Master
10. Special Character Master
11. Free Practice (all keys)

**Adding New Content:**
- Words: Add to appropriate difficulty array in `typingWords`
- Sentences: Add to `typingSentences[difficulty]`
- Paragraphs: Add to `typingParagraphs[difficulty]`
- Lessons: Add new object to `typingLessons` array

---

### style.css (Styling and Animations)
**Purpose:** All visual presentation and responsive design
**Lines:** 1,453
**Architecture:** Component-based with BEM-like naming

**Key Sections:**

**Global Styles (lines 1-100):**
- Font: Comic Sans MS (kid-friendly)
- Background: Purple gradient (#667eea to #764ba2)
- Reset/normalize styles
- Box-sizing border-box

**Layout Components:**
- `.container` - Main app wrapper
- `.step-container` - Wizard step sections
- `.game-area` - Active typing interface
- `.stats-container` - Score/WPM display

**Interactive Elements:**
- `.mode-btn`, `.difficulty-btn` - Selection buttons with hover states
- `.character-option` - Racing character selector
- `.lesson-card` - Lesson grid items
- `.btn`, `.btn-primary`, `.btn-secondary` - Action buttons

**Game UI:**
- `.target-text` - Text to type display
- `.current-input` - User input display
- `.keyboard` - SVG keyboard container
- `.hands` - Visual hand guides
- `.race-track` - Racing game visualization
- `.progress-bar` - Completion indicators

**Animations:**
- `.fadeIn` - Smooth content transitions
- Key press feedback (SVG fill changes)
- Color transitions on hover/active states
- Progress bar width animations

**Responsive Design:**
- Mobile-first approach
- Overflow handling for long text
- Flexible sizing for different screens

**Color Scheme:**
- Finger colors (8 colors for keyboard zones):
  - Left pinky: #FF6B6B
  - Left ring: #FFA500
  - Left middle: #FFD700
  - Left index: #90EE90
  - Right index: #87CEEB
  - Right middle: #9370DB
  - Right ring: #FF69B4
  - Right pinky: #FFC0CB

---

## Development Workflow

### Setting Up Development Environment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zihaonm/kids-practice-typing.git
   cd kids-practice-typing
   ```

2. **Open in browser:**
   - Option A: Double-click `index.html` (may have Web Audio API limitations)
   - Option B: Use local server (recommended):
     ```bash
     python -m http.server 8000
     # OR
     python3 -m http.server 8000
     # Then open http://localhost:8000
     ```

3. **Development tools:**
   - Any text editor (VS Code, Sublime, Atom, etc.)
   - Modern browser with DevTools (Chrome/Firefox/Edge recommended)
   - Git for version control

### Making Changes

**For Bug Fixes:**
1. Identify the issue (UI, logic, content, or styling)
2. Locate the relevant file:
   - UI structure → `index.html`
   - Game logic → `script.js`
   - Content/lessons → `typing-content.js`
   - Visual issues → `style.css`
3. Make changes and test in browser
4. Use DevTools console to debug JavaScript
5. Commit with descriptive message

**For New Features:**
1. Plan the feature scope
2. Update relevant files:
   - Add HTML elements if needed
   - Add JavaScript functions in `script.js`
   - Add styles in `style.css`
   - Add content in `typing-content.js` if applicable
3. Test all game modes and edge cases
4. Ensure mobile responsiveness
5. Commit changes

**For Content Updates:**
1. Edit `typing-content.js`
2. Add words/sentences/paragraphs to appropriate arrays
3. For new lessons: Add object to `typingLessons` with all required fields
4. Test in-game to ensure content displays correctly
5. Commit with "Update content: [description]" message

---

## Coding Conventions & Patterns

### JavaScript Style

**Variable Naming:**
- Camel case: `currentTarget`, `typingMode`, `isPlaying`
- Descriptive names: `calculateWPM()` not `calc()`
- Boolean prefixes: `is*`, `has*`, `should*`

**Function Organization:**
- Related functions grouped together
- Event listeners at bottom of file
- Helper functions before main functions that use them

**State Management:**
- Global variables for game state (no modules)
- State grouped by concern (game, typing, racing, UI)
- Reset functions to clear state

**Event Handling:**
- Event delegation where possible
- `data-*` attributes for dynamic elements
- `addEventListener` not inline handlers (except where inline exists)

**Error Handling:**
- Console logging for debugging
- Graceful degradation for missing elements
- No try-catch blocks currently (opportunity for improvement)

### HTML Conventions

**Structure:**
- Semantic elements where applicable
- IDs for unique elements
- Classes for reusable components
- Data attributes for JS interaction

**SVG:**
- Inline SVG for keyboard visualization
- IDs on individual keys for JavaScript access
- Class-based styling for groups

### CSS Conventions

**Organization:**
- Global styles first
- Component styles grouped
- Responsive rules inline with components
- Animation definitions at end

**Naming:**
- Descriptive class names: `.lesson-card`, `.stats-box`
- State classes: `.hidden`, `.active`, `.completed`
- No deep nesting (mostly flat selectors)

**Units:**
- `px` for fixed sizes
- `%` for fluid layouts
- `vh/vw` for viewport-relative sizing
- `rem/em` occasionally for scalable text

---

## Common Tasks & How to Approach Them

### Task: Add a New Typing Lesson

1. **Edit typing-content.js:**
   ```javascript
   const typingLessons = [
     // ... existing lessons
     {
       id: 12,
       title: "Your Lesson Name",
       emoji: "🎯",
       allowedKeys: ['a', 'b', 'c'], // Keys to practice
       words: ["word1", "word2", "word3"],
       fingerGuide: {
         leftHand: ["a", "b"],
         rightHand: ["c"]
       },
       instructions: "Lesson instructions here..."
     }
   ];
   ```

2. **Test the lesson:**
   - Open app → Guided Lessons
   - Verify new lesson appears in grid
   - Complete the lesson to test all mechanics

3. **Files modified:** `typing-content.js`

---

### Task: Fix a Bug in Typing Input

1. **Locate the bug:**
   - Open DevTools console
   - Try to reproduce the issue
   - Check for error messages

2. **Edit script.js:**
   - Find `handleKeyPress()` function (~line 400-500)
   - Add console.logs to track state
   - Fix the logic
   - Test thoroughly

3. **Common bug areas:**
   - `currentPosition` tracking
   - `currentTarget` vs `currentInput` comparison
   - Special character handling
   - Keyboard event key codes

4. **Files modified:** `script.js`

---

### Task: Update Visual Styling

1. **Identify the component:**
   - Use DevTools inspector to find CSS class
   - Note the file location comment in CSS

2. **Edit style.css:**
   - Locate the component section
   - Modify properties (color, size, spacing)
   - Test on different screen sizes

3. **Common style targets:**
   - Buttons: `.btn`, `.mode-btn`, `.difficulty-btn`
   - Cards: `.lesson-card`
   - Game area: `.game-area`, `.target-text`
   - Keyboard: `.keyboard svg`, `.key`

4. **Files modified:** `style.css`

---

### Task: Add New Word Lists

1. **Edit typing-content.js:**
   ```javascript
   const typingWords = {
     easy: [
       // ... existing words
       "new", "word", "here"
     ],
     medium: [
       // ... add medium words
     ],
     hard: [
       // ... add hard words
     ]
   };
   ```

2. **Guidelines for word selection:**
   - Easy: 3-5 letters, common words kids know
   - Medium: 5-7 letters, some complexity
   - Hard: 7+ letters, challenging vocabulary

3. **Test:** Play in Words mode with each difficulty

4. **Files modified:** `typing-content.js`

---

### Task: Add Sound Effects

1. **Understand current implementation:**
   - Web Audio API used (no external files)
   - Synthesized tones in `playCorrectSound()`, etc.
   - Lines in script.js: ~50-100

2. **To add new sound:**
   ```javascript
   function playNewSound() {
     const audioContext = new (window.AudioContext || window.webkitAudioContext)();
     const oscillator = audioContext.createOscillator();
     const gainNode = audioContext.createGain();

     oscillator.connect(gainNode);
     gainNode.connect(audioContext.destination);

     oscillator.frequency.value = 440; // A4 note
     oscillator.type = 'sine'; // sine, square, sawtooth, triangle

     gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
     gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

     oscillator.start(audioContext.currentTime);
     oscillator.stop(audioContext.currentTime + 0.5);
   }
   ```

3. **Call sound at appropriate events:**
   - In `handleKeyPress()` for typing feedback
   - In `celebrateRaceWin()` for completion
   - In `spawnCollectible()` for pickups

4. **Files modified:** `script.js`

---

### Task: Make UI Responsive for Mobile

1. **Check current breakpoints in style.css:**
   - Look for `@media` queries
   - Most styles are already responsive

2. **Test on mobile:**
   - Use DevTools device emulation
   - Test touch events (may need to add)
   - Check text sizes, button hit areas

3. **Common fixes:**
   - Increase button padding for touch
   - Adjust font sizes with `rem`
   - Use viewport units for containers
   - Hide/show elements based on screen size

4. **Files modified:** `style.css`, possibly `script.js` for touch events

---

## Testing Guidelines

### Manual Testing Checklist

Since there's no automated testing framework, follow this checklist:

**Guided Lessons Mode:**
- [ ] All 11 lessons load correctly
- [ ] Lesson instructions display properly
- [ ] Typing validation works for allowed keys
- [ ] Progress tracking updates correctly
- [ ] Next lesson unlocks after completion
- [ ] Statistics (WPM, accuracy) calculate correctly
- [ ] Sound effects play (correct, wrong, typing)

**Free Practice Mode:**
- [ ] All modes selectable (Letters, Words, Sentences, Paragraphs)
- [ ] All difficulties work (Easy, Medium, Hard)
- [ ] Quantity settings apply (10, 20, 30)
- [ ] Character selection works (15 emoji options)
- [ ] Game starts and ends appropriately
- [ ] Reset functionality works

**Keyboard Visualization:**
- [ ] Keys highlight on press
- [ ] Correct finger colors show
- [ ] Hand position updates
- [ ] Special characters map correctly

**Racing Game:**
- [ ] Character moves forward with correct typing
- [ ] Collectibles spawn and detect correctly
- [ ] Stars, gems, meat have proper effects
- [ ] Win celebration triggers at 100%
- [ ] Final stats display correctly

**UI/UX:**
- [ ] Navigation between steps works
- [ ] Modals open and close properly
- [ ] Buttons respond to clicks
- [ ] Hidden elements show/hide correctly
- [ ] Responsive on mobile devices

**Browser Compatibility:**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if accessible)
- [ ] Mobile browsers

### Debugging Tips

**Console Logging:**
```javascript
console.log('Current state:', {
  mode: typingMode,
  difficulty: difficulty,
  target: currentTarget,
  input: currentInput,
  position: currentPosition
});
```

**DevTools Breakpoints:**
- Set breakpoint in `handleKeyPress()` to inspect each keystroke
- Watch variables in DevTools during gameplay
- Use Network tab to ensure all files load

**Common Issues:**
- **Web Audio API not working:** Use HTTP server, not file://
- **Keys not highlighting:** Check SVG key IDs match JavaScript
- **Stats not updating:** Check state variables in console
- **Text not displaying:** Verify content arrays have data

---

## Git Workflow

### Branching Strategy

**Main Branch:**
- Default branch (not specified, likely `main` or `master`)
- Protected branch
- Only merge thoroughly tested code

**Feature Branches:**
- Named: `claude/claude-md-[session-id]` for AI assistant work
- Named: `feature/[feature-name]` for manual development
- Create from main, merge back when complete

**Current Branch:**
- `claude/claude-md-mi5xxhyftc9y9aer-018v5kjM4bPvTxPEjmw1Q79r`
- This is the AI assistant working branch

### Commit Message Conventions

Based on git history, the project uses simple, descriptive commits:

```
fixed bug
Update logic on Sentent and Paragraph.
Update Keyboard
Update UI
Change title
```

**Recommended format:**
```
[Type]: [Short description]

[Optional detailed explanation]
```

**Types:**
- `Fix:` - Bug fixes
- `Update:` - Modifications to existing features
- `Add:` - New features or content
- `Refactor:` - Code restructuring
- `Style:` - CSS/visual changes
- `Docs:` - Documentation updates

**Examples:**
```
Fix: Correct typo in sentence validation logic
Update: Improve keyboard highlighting responsiveness
Add: New intermediate lesson for number row
Style: Adjust button colors for better contrast
```

### Pull Request Process

1. **Ensure all changes are committed:**
   ```bash
   git status
   ```

2. **Push to your branch:**
   ```bash
   git push -u origin claude/claude-md-mi5xxhyftc9y9aer-018v5kjM4bPvTxPEjmw1Q79r
   ```

3. **Create PR with description:**
   - Summary of changes
   - Testing performed
   - Screenshots if UI changes
   - Any breaking changes noted

4. **Wait for review before merging**

### Git Safety

- **NEVER force push** to main/master
- **ALWAYS test** before committing
- **COMMIT frequently** with logical chunks
- **PUSH regularly** to backup work

---

## Important Notes for AI Assistants

### Context About This Project

1. **Educational Focus:** This is a children's application. Keep content appropriate, encouraging, and clear.

2. **No Dependencies:** Don't suggest adding npm packages, frameworks, or build tools unless explicitly requested. The vanilla JavaScript approach is intentional.

3. **File Size Awareness:** Files are already quite large (script.js is 1,255 lines). Consider refactoring before adding significant new code.

4. **Browser Compatibility:** Target modern browsers but avoid bleeding-edge features. Kids may use older devices.

5. **Accessibility:** When making changes, consider:
   - Colorblind users (don't rely only on color)
   - Keyboard-only navigation
   - Screen reader compatibility (could be improved)

### Code Quality Considerations

**Current Strengths:**
- Clear function names and purposes
- Well-organized content separation
- Progressive lesson design
- Engaging gamification

**Opportunities for Improvement:**
- No error handling (try-catch blocks)
- Global state management (could use modules or classes)
- No automated tests
- Limited accessibility features
- Some code duplication (especially in event handlers)

### When Making Changes

1. **Always read the file first** before editing
2. **Test in browser** after every change
3. **Check all game modes** to ensure no regressions
4. **Maintain the kid-friendly tone** in any text content
5. **Keep performance in mind** - this runs in browser only
6. **Comment complex logic** to help future developers

### Common Pitfalls to Avoid

1. **Breaking SVG keyboard:** Key IDs must match JavaScript references
2. **State desynchronization:** Reset all state variables when resetting game
3. **Event listener memory leaks:** Remove listeners when not needed
4. **Web Audio API restrictions:** Won't work on file:// protocol
5. **Special character handling:** Some keys have different event.key values

### File Reference Quick Guide

| Task | Primary File | Secondary Files |
|------|-------------|----------------|
| Fix typing logic | script.js | - |
| Add lessons | typing-content.js | - |
| Update UI structure | index.html | - |
| Change styles | style.css | - |
| Add words/sentences | typing-content.js | - |
| Fix keyboard visual | index.html (SVG), script.js | style.css |
| Add game modes | script.js | typing-content.js |
| Update sounds | script.js | - |

### Performance Tips

- **Minimize DOM manipulation:** Batch updates when possible
- **Debounce rapid events:** Especially for collectible spawning
- **Use CSS transitions:** Instead of JavaScript animations
- **Avoid memory leaks:** Clear intervals, remove event listeners
- **Optimize SVG:** Already inline, avoid adding too many elements

---

## Recent Changes & Development History

Based on recent commits:

```
2758ea4 - fixed bug
fc908e2 - Update logic on Sentent and Paragraph.
94071ed - Update Keyboard
f95bb54 - Update UI
6130e7c - Change title
```

**Recent focus areas:**
- Bug fixes in core logic
- Sentence and paragraph mode improvements
- Keyboard visualization updates
- UI refinements
- Content updates

**Development velocity:** Active development with frequent small commits

---

## Architecture Decisions

### Why Vanilla JavaScript?

**Pros:**
- No build step required
- Smaller learning curve for contributors
- Faster load time (no framework overhead)
- Works offline immediately
- Easy to deploy (just upload files)

**Cons:**
- No state management framework
- More boilerplate code
- Harder to maintain as complexity grows
- No automatic reactivity

**Decision:** Appropriate for this project's scope and educational context.

### Why Inline SVG for Keyboard?

**Pros:**
- Easy to manipulate with JavaScript
- Scalable graphics
- No external image files
- Can style with CSS
- Precise control over individual keys

**Cons:**
- Large HTML file size
- Complex SVG code in HTML
- Hard to edit visually

**Decision:** Benefits outweigh drawbacks for interactive keyboard needs.

### Why Web Audio API Instead of Audio Files?

**Pros:**
- No external files to load
- Synthesized sounds are small
- Can generate sounds programmatically
- Consistent cross-browser

**Cons:**
- Limited sound variety
- Robotic/synthetic sounds
- More complex code

**Decision:** Keeps project self-contained and reduces file dependencies.

---

## Future Improvement Opportunities

When asked to enhance the codebase, consider these areas:

1. **Modularization:** Extract game logic into ES6 modules or classes
2. **State Management:** Implement a simple state management pattern
3. **Error Handling:** Add try-catch blocks and error reporting
4. **Accessibility:** ARIA labels, keyboard navigation, screen reader support
5. **Testing:** Add unit tests for core functions (Jest or similar)
6. **Internationalization:** Support multiple languages
7. **User Accounts:** Save progress across sessions (localStorage or backend)
8. **Analytics:** Track usage patterns for improvement insights
9. **Content Management:** External JSON files for easier content updates
10. **Performance Monitoring:** Track FPS, memory usage for optimization

---

## Contact & Contribution

- **Repository:** https://github.com/zihaonm/kids-practice-typing
- **Issues:** Report bugs via GitHub Issues
- **Contributing:** Follow the development workflow outlined above

---

## Version Information

**Last Updated:** 2025-11-19
**Document Version:** 1.0.0
**Codebase State:** Based on commit `2758ea4` (fixed bug)

---

## Quick Reference Commands

```bash
# Start local development server
python -m http.server 8000

# Check git status
git status

# Create new branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "Your commit message"

# Push to remote
git push -u origin your-branch-name

# View recent commits
git log --oneline -10

# View file in browser (requires server)
# Navigate to: http://localhost:8000/index.html
```

---

**Note to AI Assistants:** This document should be your first reference when working on this codebase. It contains essential context that may not be obvious from the code alone. Always prioritize the educational nature of the project and maintain the kid-friendly experience when making changes.
