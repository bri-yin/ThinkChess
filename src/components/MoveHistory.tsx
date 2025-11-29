import { useEffect, useRef } from 'react'
import { Chess, Square } from 'chess.js'

interface MoveHistoryProps {
  moves: string[] // UCI moves
  currentIndex?: number
  onSelectMove?: (index: number) => void
  interactive?: boolean
}

export function MoveHistory({ moves, currentIndex, onSelectMove, interactive = false }: MoveHistoryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Convert UCI moves to SAN
  const sanMoves: string[] = []
  const chess = new Chess()
  
  for (const uci of moves) {
    try {
      const from = uci.slice(0, 2) as Square
      const to = uci.slice(2, 4) as Square
      const promotion = uci.length > 4 ? uci[4] : undefined
      const result = chess.move({ from, to, promotion })
      if (result) {
        sanMoves.push(result.san)
      }
    } catch {
      sanMoves.push(uci)
    }
  }
  
  // Group moves into pairs (white, black)
  const movePairs: Array<{ number: number; white?: string; black?: string; whiteIndex: number; blackIndex?: number }> = []
  
  for (let i = 0; i < sanMoves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: sanMoves[i],
      black: sanMoves[i + 1],
      whiteIndex: i,
      blackIndex: sanMoves[i + 1] !== undefined ? i + 1 : undefined
    })
  }
  
  // Auto-scroll to current move
  useEffect(() => {
    if (containerRef.current && currentIndex !== undefined) {
      const moveElement = containerRef.current.querySelector(`[data-index="${currentIndex}"]`)
      if (moveElement) {
        moveElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [currentIndex])
  
  if (moves.length === 0) {
    return (
      <div className="text-slate-500 text-sm text-center py-4">
        No moves yet
      </div>
    )
  }
  
  return (
    <div 
      ref={containerRef}
      className="space-y-1 max-h-48 overflow-y-auto font-mono text-sm"
    >
      {movePairs.map((pair) => (
        <div key={pair.number} className="flex gap-2">
          <span className="text-slate-500 w-8 text-right">{pair.number}.</span>
          {pair.white && (
            <span
              data-index={pair.whiteIndex}
              onClick={() => interactive && onSelectMove?.(pair.whiteIndex)}
              className={`
                w-16 px-1 rounded
                ${interactive ? 'cursor-pointer hover:bg-slate-700' : ''}
                ${currentIndex === pair.whiteIndex ? 'bg-emerald-600/30 text-emerald-400' : 'text-white'}
              `}
            >
              {pair.white}
            </span>
          )}
          {pair.black && (
            <span
              data-index={pair.blackIndex}
              onClick={() => interactive && pair.blackIndex !== undefined && onSelectMove?.(pair.blackIndex)}
              className={`
                w-16 px-1 rounded
                ${interactive ? 'cursor-pointer hover:bg-slate-700' : ''}
                ${currentIndex === pair.blackIndex ? 'bg-emerald-600/30 text-emerald-400' : 'text-white'}
              `}
            >
              {pair.black}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}


