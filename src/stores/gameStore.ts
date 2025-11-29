import { create } from 'zustand'
import { Chess, Square } from 'chess.js'
import { GameState, PendingMove, LichessGameFull, LichessGameState } from '@/types'
import { lichessAPI } from '@/services/lichess'

interface GameStoreState extends GameState {
  selectedSquare: string | null
  pendingMove: PendingMove | null
  legalMoves: string[]
  chess: Chess
}

interface GameStoreActions {
  seekGame: (initial: number, increment: number) => Promise<void>
  cancelSeek: () => void
  initializeGame: (gameFull: LichessGameFull, myUserId: string) => void
  updateGameState: (gameState: LichessGameState) => void
  selectSquare: (square: string) => void
  clearSelection: () => void
  confirmMove: () => Promise<void>
  resign: () => Promise<void>
  resetGame: () => void
  updateClocks: (delta: number) => void
}

const initialGameState: GameState = {
  gameId: null,
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  turn: 'w',
  playerColor: 'white',
  opponentName: '',
  opponentRating: 0,
  status: 'idle',
  result: null,
  winner: null,
  whiteTime: 0,
  blackTime: 0,
  moves: [],
  lastMove: null,
  initialTime: 0,
  increment: 0
}

export const useGameStore = create<GameStoreState & GameStoreActions>((set, get) => ({
  ...initialGameState,
  selectedSquare: null,
  pendingMove: null,
  legalMoves: [],
  chess: new Chess(),

  seekGame: async (initial: number, increment: number) => {
    set({ 
      status: 'seeking',
      initialTime: initial,
      increment: increment
    })
    try {
      await lichessAPI.createSeek(initial, increment)
    } catch (e) {
      console.error('Failed to create seek:', e)
      set({ status: 'idle' })
    }
  },

  cancelSeek: () => {
    set({ status: 'idle' })
  },

  initializeGame: (gameFull: LichessGameFull, myUserId: string) => {
    const chess = new Chess()
    const isWhite = gameFull.white.id.toLowerCase() === myUserId.toLowerCase()
    const playerColor = isWhite ? 'white' : 'black'
    const opponent = isWhite ? gameFull.black : gameFull.white
    
    const movesStr = gameFull.state.moves
    const moves = movesStr ? movesStr.split(' ').filter(m => m) : []
    
    for (const uci of moves) {
      try {
        const from = uci.slice(0, 2) as Square
        const to = uci.slice(2, 4) as Square
        const promotion = uci.length > 4 ? uci[4] : undefined
        chess.move({ from, to, promotion })
      } catch (e) {
        console.error('Failed to apply move:', uci, e)
      }
    }
    
    const lastMove = moves.length > 0 ? {
      from: moves[moves.length - 1].slice(0, 2),
      to: moves[moves.length - 1].slice(2, 4)
    } : null

    set({
      gameId: gameFull.id,
      fen: chess.fen(),
      turn: chess.turn(),
      playerColor,
      opponentName: opponent.name || opponent.id,
      opponentRating: opponent.rating || 1500,
      status: 'playing',
      result: null,
      winner: null,
      whiteTime: gameFull.state.wtime,
      blackTime: gameFull.state.btime,
      moves,
      lastMove,
      chess,
      selectedSquare: null,
      pendingMove: null,
      legalMoves: []
    })
  },

  updateGameState: (gameState: LichessGameState) => {
    const chess = new Chess()
    const movesStr = gameState.moves
    const moves = movesStr ? movesStr.split(' ').filter(m => m) : []
    
    for (const uci of moves) {
      try {
        const from = uci.slice(0, 2) as Square
        const to = uci.slice(2, 4) as Square
        const promotion = uci.length > 4 ? uci[4] : undefined
        chess.move({ from, to, promotion })
      } catch (e) {
        console.error('Failed to apply move:', uci, e)
      }
    }
    
    const lastMove = moves.length > 0 ? {
      from: moves[moves.length - 1].slice(0, 2),
      to: moves[moves.length - 1].slice(2, 4)
    } : null

    let status = get().status
    let result: string | null = null
    let winner: 'white' | 'black' | 'draw' | null = null

    const endStatuses = ['mate', 'resign', 'timeout', 'draw', 'stalemate', 'outoftime', 'aborted']
    if (endStatuses.includes(gameState.status)) {
      status = 'finished'
      
      if (gameState.status === 'mate') {
        result = 'Checkmate'
        winner = chess.turn() === 'w' ? 'black' : 'white'
      } else if (gameState.status === 'resign') {
        result = 'Resignation'
        winner = gameState.winner as 'white' | 'black'
      } else if (gameState.status === 'timeout' || gameState.status === 'outoftime') {
        result = 'Time out'
        winner = gameState.winner as 'white' | 'black'
      } else if (gameState.status === 'stalemate') {
        result = 'Stalemate'
        winner = 'draw'
      } else if (gameState.status === 'draw') {
        result = 'Draw'
        winner = 'draw'
      } else if (gameState.status === 'aborted') {
        result = 'Aborted'
        winner = null
      }
    }

    set({
      fen: chess.fen(),
      turn: chess.turn(),
      whiteTime: gameState.wtime,
      blackTime: gameState.btime,
      moves,
      lastMove,
      chess,
      status,
      result,
      winner,
      selectedSquare: null,
      pendingMove: null,
      legalMoves: []
    })
  },

  selectSquare: (square: string) => {
    const state = get()
    
    if (state.status !== 'playing') return
    const isOurTurn = (state.turn === 'w' && state.playerColor === 'white') ||
                      (state.turn === 'b' && state.playerColor === 'black')
    if (!isOurTurn) return
    
    const piece = state.chess.get(square as Square)
    
    if (state.selectedSquare) {
      if (state.legalMoves.includes(square)) {
        const from = state.selectedSquare
        const to = square
        
        const movingPiece = state.chess.get(from as Square)
        const isPromotion = movingPiece?.type === 'p' && 
          ((movingPiece.color === 'w' && to[1] === '8') ||
           (movingPiece.color === 'b' && to[1] === '1'))
        
        const promotion = isPromotion ? 'q' : undefined
        
        const tempChess = new Chess(state.chess.fen())
        const moveResult = tempChess.move({ from: from as Square, to: to as Square, promotion })
        
        if (moveResult) {
          const uci = from + to + (promotion || '')
          set({
            pendingMove: {
              from,
              to,
              san: moveResult.san,
              uci,
              promotion
            },
            selectedSquare: null,
            legalMoves: []
          })
        }
        return
      }
    }
    
    if (piece) {
      const isOurPiece = (piece.color === 'w' && state.playerColor === 'white') ||
                         (piece.color === 'b' && state.playerColor === 'black')
      if (isOurPiece) {
        const moves = state.chess.moves({ square: square as Square, verbose: true })
        const legalMoves = moves.map(m => m.to)
        
        set({
          selectedSquare: square,
          legalMoves,
          pendingMove: null
        })
        return
      }
    }
    
    set({
      selectedSquare: null,
      legalMoves: [],
      pendingMove: null
    })
  },

  clearSelection: () => {
    set({
      selectedSquare: null,
      pendingMove: null,
      legalMoves: []
    })
  },

  confirmMove: async () => {
    const state = get()
    if (!state.gameId || !state.pendingMove) return
    
    try {
      await lichessAPI.makeMove(state.gameId, state.pendingMove.uci)
      set({ pendingMove: null })
    } catch (e) {
      console.error('Failed to make move:', e)
      set({ pendingMove: null })
    }
  },

  resign: async () => {
    const state = get()
    if (!state.gameId) return
    
    try {
      await lichessAPI.resign(state.gameId)
    } catch (e) {
      console.error('Failed to resign:', e)
    }
  },

  resetGame: () => {
    set({
      ...initialGameState,
      chess: new Chess(),
      selectedSquare: null,
      pendingMove: null,
      legalMoves: []
    })
  },

  updateClocks: (delta: number) => {
    const state = get()
    if (state.status !== 'playing') return
    
    if (state.turn === 'w') {
      set({ whiteTime: Math.max(0, state.whiteTime - delta) })
    } else {
      set({ blackTime: Math.max(0, state.blackTime - delta) })
    }
  }
}))


