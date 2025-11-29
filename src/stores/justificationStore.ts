import { create } from 'zustand'
import { Chess, Square } from 'chess.js'
import { Justification } from '@/types'

interface JustificationState {
  justifications: Justification[]
  currentText: string
}

interface JustificationActions {
  setCurrentText: (text: string) => void
  addJustification: (justification: Omit<Justification, 'timestamp'>) => void
  clearJustifications: () => void
  exportPGN: (moves: string[], result: string | null, playerColor: 'white' | 'black') => string
}

export const useJustificationStore = create<JustificationState & JustificationActions>((set, get) => ({
  justifications: [],
  currentText: '',

  setCurrentText: (text: string) => {
    set({ currentText: text })
  },

  addJustification: (justification: Omit<Justification, 'timestamp'>) => {
    const newJustification: Justification = {
      ...justification,
      timestamp: Date.now()
    }
    set(state => ({
      justifications: [...state.justifications, newJustification],
      currentText: ''
    }))
  },

  clearJustifications: () => {
    set({ justifications: [], currentText: '' })
  },

  exportPGN: (moves: string[], result: string | null, playerColor: 'white' | 'black') => {
    const state = get()
    const chess = new Chess()
    const pgnMoves: string[] = []
    
    const isWhite = playerColor === 'white'
    
    for (let i = 0; i < moves.length; i++) {
      const uci = moves[i]
      const from = uci.slice(0, 2) as Square
      const to = uci.slice(2, 4) as Square
      const promotion = uci.length > 4 ? uci[4] : undefined
      
      const moveResult = chess.move({ from, to, promotion })
      if (!moveResult) continue
      
      const san = moveResult.san
      const moveNumber = Math.floor(i / 2) + 1
      const isWhiteMove = i % 2 === 0
      
      let moveStr = ''
      if (isWhiteMove) {
        moveStr = `${moveNumber}. ${san}`
      } else {
        moveStr = san
      }
      
      const isOurMove = (isWhite && isWhiteMove) || (!isWhite && !isWhiteMove)
      if (isOurMove) {
        const justification = state.justifications.find(
          j => j.uci === uci || (j.moveNumber === moveNumber && j.move === san)
        )
        if (justification) {
          moveStr += ` { ${justification.text} }`
        }
      }
      
      pgnMoves.push(moveStr)
    }
    
    let resultStr = '*'
    if (result) {
      if (result === 'Checkmate' || result === 'Resignation' || result === 'Time out') {
        const lastTurn = chess.turn()
        resultStr = lastTurn === 'w' ? '0-1' : '1-0'
      } else if (result.includes('Draw') || result === 'Stalemate') {
        resultStr = '1/2-1/2'
      }
    }
    
    const date = new Date()
    const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    
    const pgn = `[Event "Thoughtful Chess Game"]
[Site "Lichess.org"]
[Date "${dateStr}"]
[Round "?"]
[White "?"]
[Black "?"]
[Result "${resultStr}"]

${pgnMoves.join(' ')} ${resultStr}`
    
    return pgn
  }
}))


