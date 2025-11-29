import { useEffect, useRef, useState, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import { useConnectionStore } from '@/stores/connectionStore'
import { useGameStore } from '@/stores/gameStore'
import { useJustificationStore } from '@/stores/justificationStore'
import { lichessAPI } from '@/services/lichess'
import { Clock, JustificationInput, MoveHistory } from '@/components'
import { isInCheck, getKingSquare } from '@/utils/chess'
import { LichessGameFull, LichessGameState } from '@/types'
import type { Square, CustomSquareStyles } from 'react-chessboard/dist/chessboard/types'

interface GameScreenProps {
  onGameEnd: () => void
}

export function GameScreen({ onGameEnd }: GameScreenProps) {
  const { user } = useConnectionStore()
  const {
    gameId,
    fen,
    turn,
    playerColor,
    opponentName,
    opponentRating,
    status,
    whiteTime,
    blackTime,
    moves,
    lastMove,
    selectedSquare,
    pendingMove,
    legalMoves,
    selectSquare,
    clearSelection,
    confirmMove,
    resign,
    initializeGame,
    updateGameState,
    updateClocks
  } = useGameStore()
  
  const { currentText, setCurrentText, addJustification } = useJustificationStore()
  
  const [showResignConfirm, setShowResignConfirm] = useState(false)
  const [showMoveHistory, setShowMoveHistory] = useState(true)
  const gameStreamCleanup = useRef<(() => void) | null>(null)
  const clockInterval = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    if (!user) return
    
    const eventCleanup = lichessAPI.streamEvents(
      (event) => {
        if (event.type === 'gameStart') {
          const gameEvent = event as { type: 'gameStart'; game: { gameId: string } }
          const newGameId = gameEvent.game.gameId
          
          gameStreamCleanup.current = lichessAPI.streamGame(
            newGameId,
            (gameEvent) => {
              if (gameEvent.type === 'gameFull') {
                initializeGame(gameEvent as LichessGameFull, user.id)
              } else if (gameEvent.type === 'gameState') {
                updateGameState(gameEvent as LichessGameState)
              }
            },
            (error) => {
              console.error('Game stream error:', error)
            }
          )
        }
      },
      (error) => {
        console.error('Event stream error:', error)
      }
    )
    
    return () => {
      eventCleanup()
      gameStreamCleanup.current?.()
    }
  }, [user, initializeGame, updateGameState])
  
  useEffect(() => {
    if (status === 'playing') {
      clockInterval.current = setInterval(() => {
        updateClocks(100)
      }, 100)
    }
    
    return () => {
      if (clockInterval.current) {
        clearInterval(clockInterval.current)
      }
    }
  }, [status, updateClocks])
  
  useEffect(() => {
    if (status === 'finished') {
      const timeout = setTimeout(() => {
        onGameEnd()
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [status, onGameEnd])
  
  const handleSquareClick = (square: Square) => {
    if (pendingMove) return
    selectSquare(square)
  }
  
  const handleJustificationSubmit = () => {
    if (!pendingMove || currentText.length < 10) return
    
    const moveNumber = Math.floor(moves.length / 2) + 1
    
    addJustification({
      moveNumber,
      move: pendingMove.san,
      uci: pendingMove.uci,
      text: currentText,
      fen
    })
    
    confirmMove()
  }
  
  const handleResign = () => {
    if (showResignConfirm) {
      resign()
      setShowResignConfirm(false)
    } else {
      setShowResignConfirm(true)
    }
  }
  
  const customSquareStyles = useMemo(() => {
    const styles: CustomSquareStyles = {}
    
    if (lastMove) {
      styles[lastMove.from as Square] = { backgroundColor: 'rgba(255, 255, 0, 0.2)' }
      styles[lastMove.to as Square] = { backgroundColor: 'rgba(255, 255, 0, 0.3)' }
    }
    
    if (selectedSquare) {
      styles[selectedSquare as Square] = { backgroundColor: 'rgba(59, 130, 246, 0.5)' }
    }
    
    for (const square of legalMoves) {
      styles[square as Square] = {
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.6) 25%, transparent 25%)',
        ...(styles[square as Square] || {})
      }
    }
    
    if (isInCheck(fen)) {
      const kingSquare = getKingSquare(fen, turn)
      if (kingSquare) {
        styles[kingSquare as Square] = { backgroundColor: 'rgba(239, 68, 68, 0.6)' }
      }
    }
    
    return styles
  }, [lastMove, selectedSquare, legalMoves, fen, turn])
  
  const isWhitePlayer = playerColor === 'white'
  const playerTime = isWhitePlayer ? whiteTime : blackTime
  const opponentTime = isWhitePlayer ? blackTime : whiteTime
  const isPlayerTurn = (turn === 'w' && isWhitePlayer) || (turn === 'b' && !isWhitePlayer)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto flex gap-6">
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="w-full max-w-[500px] flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-sm">♟</span>
              </div>
              <div>
                <span className="text-white font-medium">{opponentName || 'Opponent'}</span>
                <span className="text-slate-400 text-sm ml-2">({opponentRating || '?'})</span>
              </div>
            </div>
            <Clock time={opponentTime} isActive={!isPlayerTurn && status === 'playing'} isPlayer={false} />
          </div>
          
          <div className="chess-board-container w-full max-w-[500px]">
            <Chessboard
              position={fen}
              boardOrientation={playerColor}
              onSquareClick={handleSquareClick}
              arePiecesDraggable={false}
              customSquareStyles={customSquareStyles}
              customBoardStyle={{
                borderRadius: '8px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
              customDarkSquareStyle={{ backgroundColor: '#4a5568' }}
              customLightSquareStyle={{ backgroundColor: '#718096' }}
            />
          </div>
          
          <div className="w-full max-w-[500px] flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-sm">♟</span>
              </div>
              <div>
                <span className="text-white font-medium">{user?.username || 'You'}</span>
                <span className="text-slate-400 text-sm ml-2">({user?.rating || '?'})</span>
              </div>
            </div>
            <Clock time={playerTime} isActive={isPlayerTurn && status === 'playing'} isPlayer={true} />
          </div>
          
          {pendingMove && (
            <div className="w-full max-w-[500px]">
              <JustificationInput
                value={currentText}
                onChange={setCurrentText}
                onSubmit={handleJustificationSubmit}
                onCancel={clearSelection}
                moveSan={pendingMove.san}
              />
            </div>
          )}
          
          {!pendingMove && status === 'playing' && (
            <div className={`text-center py-2 px-4 rounded-lg ${
              isPlayerTurn 
                ? 'bg-emerald-600/20 text-emerald-400' 
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              {isPlayerTurn ? 'Your turn - click a piece to move' : "Opponent's turn..."}
            </div>
          )}
          
          {status === 'finished' && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-2xl p-8 text-center space-y-4 animate-pulse">
                <h2 className="text-3xl font-bold text-white">Game Over</h2>
                <p className="text-xl text-slate-300">
                  {useGameStore.getState().result}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="w-64 flex flex-col gap-4">
          <div className="bg-slate-800/50 rounded-lg px-4 py-2">
            <span className="text-slate-500 text-xs">Game ID:</span>
            <span className="text-slate-400 text-xs ml-2 font-mono">{gameId || '...'}</span>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4 flex-1">
            <button
              onClick={() => setShowMoveHistory(!showMoveHistory)}
              className="flex items-center justify-between w-full text-slate-300 font-medium mb-2"
            >
              <span>Moves</span>
              <span className="text-slate-500">{showMoveHistory ? '▼' : '▶'}</span>
            </button>
            {showMoveHistory && (
              <MoveHistory moves={moves} />
            )}
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <button
              onClick={handleResign}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                showResignConfirm
                  ? 'bg-red-600 text-white hover:bg-red-500'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {showResignConfirm ? 'Click again to confirm' : 'Resign'}
            </button>
            {showResignConfirm && (
              <button
                onClick={() => setShowResignConfirm(false)}
                className="w-full mt-2 py-2 px-4 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


