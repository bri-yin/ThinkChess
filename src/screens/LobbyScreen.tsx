import { useEffect } from 'react'
import { useConnectionStore } from '@/stores/connectionStore'
import { useGameStore } from '@/stores/gameStore'
import { useJustificationStore } from '@/stores/justificationStore'
import { lichessAPI } from '@/services/lichess'
import { TimeControl, LichessGameStart } from '@/types'

const TIME_CONTROLS: TimeControl[] = [
  { label: '1+0', category: 'Bullet', initial: 60, increment: 0 },
  { label: '2+1', category: 'Bullet', initial: 120, increment: 1 },
  { label: '3+0', category: 'Blitz', initial: 180, increment: 0 },
  { label: '3+2', category: 'Blitz', initial: 180, increment: 2 },
  { label: '5+0', category: 'Blitz', initial: 300, increment: 0 },
  { label: '5+3', category: 'Blitz', initial: 300, increment: 3 },
  { label: '10+0', category: 'Rapid', initial: 600, increment: 0 },
  { label: '10+5', category: 'Rapid', initial: 600, increment: 5 },
  { label: '15+10', category: 'Rapid', initial: 900, increment: 10 },
  { label: '30+0', category: 'Classical', initial: 1800, increment: 0 },
]

const CATEGORIES = ['Bullet', 'Blitz', 'Rapid', 'Classical'] as const

interface LobbyScreenProps {
  onGameStart: () => void
}

export function LobbyScreen({ onGameStart }: LobbyScreenProps) {
  const { user, disconnect } = useConnectionStore()
  const { status, seekGame, cancelSeek, resetGame } = useGameStore()
  const { clearJustifications } = useJustificationStore()
  
  useEffect(() => {
    resetGame()
    clearJustifications()
    
    const cleanup = lichessAPI.streamEvents(
      (event) => {
        if (event.type === 'gameStart') {
          const gameEvent = event as LichessGameStart
          console.log('Game started:', gameEvent.game.gameId)
          onGameStart()
        }
      },
      (error) => {
        console.error('Event stream error:', error)
      }
    )
    
    return cleanup
  }, [onGameStart, resetGame, clearJustifications])
  
  const handleTimeControlClick = (tc: TimeControl) => {
    seekGame(tc.initial, tc.increment)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-2xl">
              {user?.title ? '👑' : '♟'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {user?.title && (
                  <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                    {user.title}
                  </span>
                )}
                <span className="text-xl font-bold text-white">{user?.username}</span>
              </div>
              <span className="text-slate-400">Rating: {user?.rating}</span>
            </div>
          </div>
          
          <button
            onClick={disconnect}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white 
                       hover:bg-slate-700 transition-colors"
          >
            Disconnect
          </button>
        </div>
        
        {status === 'seeking' ? (
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-12 text-center space-y-6 border border-slate-700/50">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-slate-600 rounded-full" />
              <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-4 bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-3xl">♟</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white">Seeking opponent...</h2>
              <p className="text-slate-400 mt-2">Looking for a casual game</p>
            </div>
            
            <button
              onClick={cancelSeek}
              className="px-6 py-3 rounded-lg bg-slate-700 text-white 
                         hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Choose Time Control</h2>
              <p className="text-slate-400 mt-1">Select a time format to start seeking an opponent</p>
            </div>
            
            {CATEGORIES.map(category => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                  {category}
                  {category === 'Rapid' && (
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                      Recommended
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {TIME_CONTROLS.filter(tc => tc.category === category).map(tc => {
                    const isRecommended = tc.label === '15+10'
                    return (
                      <button
                        key={tc.label}
                        onClick={() => handleTimeControlClick(tc)}
                        className={`
                          px-6 py-4 rounded-xl font-mono font-bold text-lg transition-all
                          ${isRecommended
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 hover:bg-emerald-500'
                            : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                          }
                        `}
                      >
                        {tc.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mt-8">
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                💡 About Thoughtful Chess
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Before each move, you'll write a brief justification (10-280 characters) explaining 
                your reasoning. This promotes deeper thinking and helps you learn from your games. 
                We recommend Rapid time controls (15+10) to give yourself enough time for thoughtful play.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


