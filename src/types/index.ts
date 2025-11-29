export interface LichessUser {
  id: string
  username: string
  rating: number
  title?: string
}

export interface GameState {
  gameId: string | null
  fen: string
  turn: 'w' | 'b'
  playerColor: 'white' | 'black'
  opponentName: string
  opponentRating: number
  status: 'idle' | 'seeking' | 'playing' | 'finished'
  result: string | null
  winner: 'white' | 'black' | 'draw' | null
  whiteTime: number // ms
  blackTime: number // ms
  moves: string[] // UCI moves
  lastMove: { from: string; to: string } | null
  initialTime: number // seconds
  increment: number // seconds
}

export interface Justification {
  moveNumber: number
  move: string // SAN
  uci: string
  text: string
  timestamp: number
  fen: string // position when move was made
}

export interface TimeControl {
  label: string // e.g., "10+5"
  category: 'Bullet' | 'Blitz' | 'Rapid' | 'Classical'
  initial: number // seconds
  increment: number // seconds
}

export interface PendingMove {
  from: string
  to: string
  san: string
  uci: string
  promotion?: string
}

// Lichess API types
export interface LichessPlayer {
  id: string
  name: string
  rating?: number
  title?: string
}

export interface LichessGameFull {
  type: 'gameFull'
  id: string
  white: LichessPlayer
  black: LichessPlayer
  initialFen: string
  state: {
    type: 'gameState'
    moves: string
    wtime: number
    btime: number
    status: string
    winner?: string
  }
}

export interface LichessGameState {
  type: 'gameState'
  moves: string // space-separated UCI
  wtime: number
  btime: number
  status: string
  winner?: string
}

export interface LichessGameStart {
  type: 'gameStart'
  game: {
    gameId: string
    fullId: string
    color: 'white' | 'black'
    fen: string
    hasMoved: boolean
    isMyTurn: boolean
    lastMove: string
    opponent: {
      id: string
      username: string
      rating?: number
    }
    perf: string
    rated: boolean
    secondsLeft: number
    source: string
    speed: string
    variant: {
      key: string
      name: string
    }
  }
}

export type LichessEvent = LichessGameFull | LichessGameState | LichessGameStart | { type: string }

// Global window interface extension
declare global {
  interface Window {
    electronAPI: {
      getToken: () => Promise<string | null>
      setToken: (token: string) => Promise<boolean>
      deleteToken: () => Promise<boolean>
    }
  }
}

export {}


