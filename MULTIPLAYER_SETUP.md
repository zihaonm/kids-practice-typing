# Multiplayer Typing Race - Setup Guide

## Features
✅ **Real-time multiplayer racing** - Compete with players in real-time
✅ **Room codes** - Create private rooms and invite friends
✅ **Quick match** - Auto-match with other players
✅ **Live progress tracking** - See everyone's progress during the race
✅ **Results leaderboard** - View rankings after each race

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher) installed
- npm (comes with Node.js)

### Installation Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```

3. **Open in browser**
   - Visit `http://localhost:3000/multiplayer.html`
   - Open multiple tabs to test multiplayer functionality

4. **For development** (auto-restart on file changes)
   ```bash
   npm run dev
   ```

## Deploying Online

### Option 1: Deploy to Heroku (Free Tier)

1. **Install Heroku CLI**
   ```bash
   # Mac
   brew tap heroku/brew && brew install heroku

   # Or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku app**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Add Procfile** (already configured in package.json)
   The server will automatically use `process.env.PORT`

4. **Deploy**
   ```bash
   git add .
   git commit -m "Add multiplayer feature"
   git push heroku main
   ```

5. **Open your app**
   ```bash
   heroku open
   ```
   Navigate to `/multiplayer.html`

### Option 2: Deploy to Railway (Easier, Free Tier)

1. **Visit** [railway.app](https://railway.app)

2. **Sign up** with GitHub

3. **Create new project** → Deploy from GitHub repo

4. **Configure**
   - Railway will auto-detect Node.js
   - Set start command: `npm start`
   - It will automatically assign a URL

5. **Access** your app at `https://your-app.railway.app/multiplayer.html`

### Option 3: Deploy to Render (Free Tier)

1. **Visit** [render.com](https://render.com)

2. **Create Web Service** → Connect GitHub repo

3. **Configure**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

4. **Deploy** and access at provided URL + `/multiplayer.html`

### Option 4: Deploy to Glitch

1. **Visit** [glitch.com](https://glitch.com)

2. **Create New Project** → Import from GitHub

3. **Glitch automatically**:
   - Runs `npm install`
   - Starts the server
   - Provides a live URL

4. **Access** at `https://your-project.glitch.me/multiplayer.html`

## File Structure

```
keyboard-practice/
├── server.js              # Node.js server with Socket.io
├── multiplayer.html       # Multiplayer game page
├── multiplayer.css        # Multiplayer styles
├── multiplayer.js         # Client-side multiplayer logic
├── package.json           # Dependencies
├── index.html            # Original practice page
├── style.css             # Shared styles
├── typing-content.js     # Typing content data
└── script.js             # Original practice logic
```

## How to Use

### Creating a Private Room
1. Enter your username
2. Click "Create Private Room"
3. Share the 6-character room code with friends
4. Wait for players to join
5. Click "Start Race" when ready

### Quick Match
1. Enter your username
2. Click "Quick Match"
3. Get matched with other players automatically
4. Race starts after 10 seconds or when room is full

### During Race
- Type the text as fast and accurately as possible
- See real-time progress of all players
- Your WPM and accuracy are calculated live
- First to finish wins!

### After Race
- View the leaderboard with rankings
- See everyone's stats (WPM, accuracy, time)
- Click "Play Again" to race again with same players
- Click "Back to Lobby" to find new opponents

## Customization

### Adding More Typing Texts
Edit `server.js` and add texts to the `typingTexts` array:
```javascript
const typingTexts = [
    "Your custom typing text here...",
    "Add as many as you want...",
];
```

### Changing Room Size
Edit `server.js` and modify the max players check:
```javascript
if (room.isPublic && !room.raceStarted && room.players.length < 8) {
    // Change 8 to your preferred max players
}
```

### Adjusting Auto-Start Timer
Edit `server.js` and change the timeout:
```javascript
setTimeout(() => {
    // Auto-start after 10 seconds
    // Change 10000 to desired milliseconds
}, 10000);
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

### Socket.io Connection Issues
- Make sure server is running
- Check browser console for errors
- Verify WebSocket is not blocked by firewall

### Players Not Syncing
- Refresh the page
- Check network connection
- Verify server logs for errors

## Environment Variables

When deploying, set these if needed:

```bash
PORT=3000                    # Server port (auto-assigned on most platforms)
NODE_ENV=production         # Production mode
```

## Performance Tips

- **For production**: Use a process manager like PM2
  ```bash
  npm install -g pm2
  pm2 start server.js
  pm2 save
  ```

- **Enable compression**: Add compression middleware
  ```bash
  npm install compression
  ```

  Add to `server.js`:
  ```javascript
  const compression = require('compression');
  app.use(compression());
  ```

## Next Steps / Ideas

- Add more typing modes (code snippets, quotes, etc.)
- Add user accounts and statistics tracking
- Add tournament/bracket system
- Add voice chat during races
- Add custom room settings (text length, difficulty)
- Add achievements and badges
- Add replay feature
- Add practice mode with ghosts of previous races

## Support

For issues or questions:
1. Check the troubleshooting section
2. Check server logs with `npm start`
3. Open browser console to see client-side errors
4. Verify Socket.io connection status in UI

## License

MIT License - Feel free to modify and use for your projects!
