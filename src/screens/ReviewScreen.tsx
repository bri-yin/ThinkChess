import { useState, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess, Square } from 'chess.js'
import { useGameStore } from '@/stores/gameStore'
import { useJustificationStore } from '@/stores/justificationStore'

interface ReviewScreenProps {
  onNewGame: () => void
  onHome: () => void
}

export function ReviewScreen({ onNewGame, onHome }: ReviewScreenProps) {
  const { moves, result, winner, playerColor } = useGameStore()
  const { justifications, exportPGN } = useJustificationStore()
  
  const [currentMoveIndex, setCurrentMoveIndex] = useState(moves.length)
  
  const { position, sanMoves } = useMemo(() => {
    const chess = new Chess()
    const sans: string[] = []
    
    for (let i = 0; i < moves.length; i++) {
      const uci = moves[i]
      const from = uci.slice(0, 2) as Square
      const to = uci.slice(2, 4) as Square
      const promotion = uci.length > 4 ? uci[4] : undefined
      
      const result = chess.move({ from, to, promotion })
      if (result) {
        sans.push(result.san)
      }
    }
    
    const displayChess = new Chess()
    for (let i = 0; i < currentMoveIndex; i++) {
      const uci = moves[i]
      const from = uci.slice(0, 2) as Square
      const to = uci.slice(2, 4) as Square
      const promotion = uci.length > 4 ? uci[4] : undefined
      displayChess.move({ from, to, promotion })
    }
    
    return { position: displayChess.fen(), sanMoves: sans }
  }, [moves, currentMoveIndex])
  
  const getResultText = () => {
    if (!result) return 'Game Over'
    
    const isWhitePlayer = playerColor === 'white'
    const playerWon = (winner === 'white' && isWhitePlayer) || (winner === 'black' && !isWhitePlayer)
    const playerLost = (winner === 'white' && !isWhitePlayer) || (winner === 'black' && isWhitePlayer)
    
    if (winner === 'draw') {
      return `Draw by ${result.toLowerCase()}`
    } else if (playerWon) {
      return `Victory by ${result.toLowerCase()}!`
    } else if (playerLost) {
      return `Defeat by ${result.toLowerCase()}`
    }
    return result
  }
  
  const getResultColor = () => {
    const isWhitePlayer = playerColor === 'white'
    const playerWon = (winner === 'white' && isWhitePlayer) || (winner === 'black' && !isWhitePlayer)
    
    if (winner === 'draw') return 'text-amber-400'
    if (playerWon) return 'text-emerald-400'
    return 'text-red-400'
  }
  
  const goToStart = () => setCurrentMoveIndex(0)
  const goToPrev = () => setCurrentMoveIndex(Math.max(0, currentMoveIndex - 1))
  const goToNext = () => setCurrentMoveIndex(Math.min(moves.length, currentMoveIndex + 1))
  const goToEnd = () => setCurrentMoveIndex(moves.length)
  
  const getJustificationForMove = (moveIndex: number) => {
    const san = sanMoves[moveIndex]
    const uci = moves[moveIndex]
    const moveNumber = Math.floor(moveIndex / 2) + 1
    
    return justifications.find(
      j => j.uci === uci || (j.moveNumber === moveNumber && j.move === san)
    )
  }
  
  const handleExportPGN = () => {
    const pgn = exportPGN(moves, result, playerColor)
    navigator.clipboard.writeText(pgn)
    alert('PGN copied to clipboard!')
  }
  
  const movePairs: Array<{
    number: number
    white?: { san: string; index: number; justification?: string }
    black?: { san: string; index: number; justification?: string }
  }> = []
  
  for (let i = 0; i < sanMoves.length; i += 2) {
    const whiteJust = getJustificationForMove(i)
    const blackJust = sanMoves[i + 1] ? getJustificationForMove(i + 1) : undefined
    
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: {
        san: sanMoves[i],
        index: i,
        justification: whiteJust?.text
      },
      black: sanMoves[i + 1] ? {
        san: sanMoves[i + 1],
        index: i + 1,
        justification: blackJust?.text
      } : undefined
    })
  }
  
  const isWhitePlayer = playerColor === 'white'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className={`text-3xl font-bold ${getResultColor()}`}>
            {getResultText()}
          </h1>
          <p className="text-slate-400">
            {moves.length} moves played • {justifications.length} justifications recorded
          </p>
        </div>
        
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            <div className="chess-board-container max-w-[500px] mx-auto">
              <Chessboard
                position={position}
                boardOrientation={playerColor}
                arePiecesDraggable={false}
                customBoardStyle={{
                  borderRadius: '8px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
                customDarkSquareStyle={{ backgroundColor: '#4a5568' }}
                customLightSquareStyle={{ backgroundColor: '#718096' }}
              />
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={goToStart}
                disabled={currentMoveIndex === 0}
                className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ⏮
              </button>
              <button
                onClick={goToPrev}
                disabled={currentMoveIndex === 0}
                className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>
              <span className="px-4 py-2 text-slate-300 font-mono">
                {currentMoveIndex} / {moves.length}
              </span>
              <button
                onClick={goToNext}
                disabled={currentMoveIndex === moves.length}
                className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
              <button
                onClick={goToEnd}
                disabled={currentMoveIndex === moves.length}
                className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ⏭
              </button>
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={handleExportPGN}
                className="px-6 py-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
              >
                📋 Export PGN
              </button>
              <button
                onClick={onNewGame}
                className="px-6 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
              >
                🎮 New Game
              </button>
              <button
                onClick={onHome}
                className="px-6 py-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
              >
                🏠 Home
              </button>
            </div>
          </div>
          
          <div className="w-96 bg-slate-800/50 rounded-xl p-4 max-h-[600px] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Move Analysis</h3>
            
            <div className="space-y-2">
              {movePairs.map((pair) => (
                <div key={pair.number} className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 w-8 text-right font-mono">
                      {pair.number}.
                    </span>
                    
                    <div
                      onClick={() => setCurrentMoveIndex(pair.white!.index + 1)}
                      className={`flex-1 px-2 py-1 rounded cursor-pointer transition-colors ${
                        currentMoveIndex === pair.white!.index + 1
                          ? 'bg-emerald-600/30 text-emerald-400'
                          : 'text-white hover:bg-slate-700'
                      }`}
                    >
                      <span className="font-mono font-medium">{pair.white?.san}</span>
                    </div>
                    
                    {pair.black && (
                      <div
                        onClick={() => setCurrentMoveIndex(pair.black!.index + 1)}
                        className={`flex-1 px-2 py-1 rounded cursor-pointer transition-colors ${
                          currentMoveIndex === pair.black.index + 1
                            ? 'bg-emerald-600/30 text-emerald-400'
                            : 'text-white hover:bg-slate-700'
                        }`}
                      >
                        <span className="font-mono font-medium">{pair.black.san}</span>
                      </div>
                    )}
                    {!pair.black && <div className="flex-1" />}
                  </div>
                  
                  {isWhitePlayer && pair.white?.justification && (
                    <div className="ml-10 mr-2 text-xs bg-slate-700/50 rounded px-2 py-1 text-slate-300 italic">
                      "{pair.white.justification}"
                    </div>
                  )}
                  {!isWhitePlayer && pair.black?.justification && (
                    <div className="ml-10 mr-2 text-xs bg-slate-700/50 rounded px-2 py-1 text-slate-300 italic">
                      "{pair.black.justification}"
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {movePairs.length === 0 && (
              <p className="text-slate-500 text-center py-8">No moves to display</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


