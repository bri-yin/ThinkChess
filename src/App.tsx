import { useEffect, useState, useCallback } from 'react'
import { useConnectionStore } from '@/stores/connectionStore'
import { useGameStore } from '@/stores/gameStore'
import { HomeScreen, LobbyScreen, GameScreen, ReviewScreen } from '@/screens'

type Screen = 'home' | 'lobby' | 'game' | 'review'

export default function App() {
  const { isConnected, loadToken } = useConnectionStore()
  const { status } = useGameStore()
  const [screen, setScreen] = useState<Screen>('home')
  
  useEffect(() => {
    loadToken()
  }, [loadToken])
  
  useEffect(() => {
    if (!isConnected) {
      setScreen('home')
    } else if (status === 'finished') {
      setScreen('review')
    } else if (status === 'playing') {
      setScreen('game')
    } else {
      setScreen('lobby')
    }
  }, [isConnected, status])
  
  const handleGameStart = useCallback(() => {
    setScreen('game')
  }, [])
  
  const handleGameEnd = useCallback(() => {
    setScreen('review')
  }, [])
  
  const handleNewGame = useCallback(() => {
    setScreen('lobby')
  }, [])
  
  const handleHome = useCallback(() => {
    setScreen('lobby')
  }, [])
  
  switch (screen) {
    case 'home':
      return <HomeScreen />
    case 'lobby':
      return <LobbyScreen onGameStart={handleGameStart} />
    case 'game':
      return <GameScreen onGameEnd={handleGameEnd} />
    case 'review':
      return <ReviewScreen onNewGame={handleNewGame} onHome={handleHome} />
    default:
      return <HomeScreen />
  }
}


