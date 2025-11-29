import { Chess, Square } from 'chess.js'

export function getLegalMovesForSquare(fen: string, square: string): string[] {
  const chess = new Chess(fen)
  const moves = chess.moves({ square: square as Square, verbose: true })
  return moves.map(m => m.to)
}

export function isInCheck(fen: string): boolean {
  const chess = new Chess(fen)
  return chess.inCheck()
}

export function getGameResult(fen: string): 'checkmate' | 'stalemate' | 'playing' {
  const chess = new Chess(fen)
  if (chess.isCheckmate()) return 'checkmate'
  if (chess.isStalemate()) return 'stalemate'
  return 'playing'
}

export function uciToSan(fen: string, uci: string): string {
  const chess = new Chess(fen)
  const from = uci.slice(0, 2) as Square
  const to = uci.slice(2, 4) as Square
  const promotion = uci.length > 4 ? uci[4] : undefined
  
  const result = chess.move({ from, to, promotion })
  return result ? result.san : uci
}

export function formatTime(ms: number): string {
  if (ms < 0) ms = 0
  
  const totalSeconds = Math.floor(ms / 1000)
  const tenths = Math.floor((ms % 1000) / 100)
  
  if (ms < 20000) {
    // Show tenths when under 20 seconds
    return `${totalSeconds}.${tenths}`
  }
  
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function getKingSquare(fen: string, color: 'w' | 'b'): string | null {
  const chess = new Chess(fen)
  const board = chess.board()
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.type === 'k' && piece.color === color) {
        const file = String.fromCharCode(97 + col)
        const rank = 8 - row
        return `${file}${rank}`
      }
    }
  }
  return null
}


