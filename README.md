# ♞ Thoughtful Chess

A desktop Electron app that connects to Lichess to play real-time chess games with a unique twist: **you must explain your reasoning before each move**.

![Thoughtful Chess](https://img.shields.io/badge/chess-thoughtful-emerald)

## Features

- 🎯 **Move Justifications** - Write 10-280 character explanations for each move
- ⚡ **Real-time Games** - Play casual games via Lichess Board API
- 📊 **Game Review** - Analyze your games with your recorded justifications
- 📝 **PGN Export** - Export games with your thoughts as comments

## Getting Started

### Prerequisites

- Node.js 18+
- A Lichess account with an API token

### Get Your Lichess Token

1. Go to [lichess.org/account/oauth/token](https://lichess.org/account/oauth/token)
2. Create a new token with the `board:play` scope
3. Copy the token (starts with `lip_`)

### Installation

```bash
# Install dependencies
npm install

# Run in browser mode (for testing)
npm run dev:web

# Run with Electron (desktop app)
npm run dev
```

### Building for Production

```bash
npm run build
```

This creates distributable packages in the `dist/` folder for Windows, macOS, and Linux.

## How It Works

1. **Connect** - Enter your Lichess API token to authenticate
2. **Choose Time Control** - Select a time format (Rapid 15+10 recommended)
3. **Play** - Click pieces to select, then click destination squares
4. **Justify** - Before each move executes, write why you're making it
5. **Review** - After the game, see all your moves with justifications
6. **Export** - Save your annotated game as PGN

## Why Thoughtful Chess?

Most chess improvement comes from thinking deliberately about your moves. Thoughtful Chess enforces this habit by requiring you to articulate your reasoning before each move. This:

- Forces you to consider alternatives
- Builds pattern recognition through verbalization
- Creates a record of your thought process for review
- Slows down impulsive play

## Tech Stack

- **Electron** - Desktop app framework
- **React** - UI components
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **chess.js** - Chess logic
- **react-chessboard** - Board rendering

## Project Structure

```
ThinkChess/
├── electron/               # Electron main process
│   ├── main.ts            # Window creation, IPC handlers
│   └── preload.ts         # Context bridge for secure API
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Clock.tsx      # Time display with warnings
│   │   ├── JustificationInput.tsx
│   │   └── MoveHistory.tsx
│   ├── screens/           # Main app screens
│   │   ├── HomeScreen.tsx     # Login
│   │   ├── LobbyScreen.tsx    # Time control selection
│   │   ├── GameScreen.tsx     # Main gameplay
│   │   └── ReviewScreen.tsx   # Post-game analysis
│   ├── services/
│   │   └── lichess.ts     # Lichess Board API integration
│   ├── stores/            # Zustand state management
│   │   ├── connectionStore.ts
│   │   ├── gameStore.ts
│   │   └── justificationStore.ts
│   ├── types/             # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/             # Helper functions
│   │   ├── chess.ts       # Chess utilities
│   │   └── electron.ts    # Electron/browser API wrapper
│   ├── App.tsx            # Main app with routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/
│   └── chess.svg          # App icon
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── tsconfig.electron.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run with Electron (full desktop app) |
| `npm run dev:web` | Run in browser only (for testing) |
| `npm run build` | Build for production |
| `npm run build:electron` | Compile Electron TypeScript |
| `npm run preview` | Preview production build |

## API Reference

The app uses the [Lichess Board API](https://lichess.org/api#tag/Board):

| Endpoint | Purpose |
|----------|---------|
| `GET /api/account` | Validate token, get user info |
| `GET /api/stream/event` | Listen for incoming games |
| `GET /api/board/game/stream/{id}` | Stream game state |
| `POST /api/board/seek` | Create game seek |
| `POST /api/board/game/{id}/move/{uci}` | Submit move |
| `POST /api/board/game/{id}/resign` | Resign game |

## License

MIT

---

*Think before you move. Explain your strategy.*

