import { useState, KeyboardEvent } from 'react'
import { useConnectionStore } from '@/stores/connectionStore'

export function HomeScreen() {
  const [tokenInput, setTokenInput] = useState('')
  const { isConnecting, error, connect, clearError } = useConnectionStore()
  
  const handleConnect = () => {
    if (tokenInput.trim()) {
      connect(tokenInput.trim())
    }
  }
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConnect()
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6 border border-slate-700/50">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white">
              <span className="text-emerald-400">♞</span> Thoughtful Chess
            </h1>
            <p className="text-slate-400">
              Think before you move. Explain your strategy.
            </p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <span className="text-red-400 text-lg">⚠</span>
              <div className="flex-1">
                <p className="text-red-300 text-sm">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-400 text-xs hover:text-red-300 mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          
          {/* Token input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Lichess API Token
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="lip_..."
              disabled={isConnecting}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 
                         text-white placeholder-slate-500 font-mono
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                         disabled:opacity-50 transition-all"
            />
          </div>
          
          {/* Connect button */}
          <button
            onClick={handleConnect}
            disabled={!tokenInput.trim() || isConnecting}
            className="w-full bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg
                       hover:bg-emerald-500 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600
                       flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                Connect to Lichess
              </>
            )}
          </button>
          
          {/* Help text */}
          <div className="text-center space-y-2">
            <p className="text-slate-500 text-sm">
              Don't have a token?{' '}
              <a
                href="https://lichess.org/account/oauth/token"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline"
              >
                Create one here
              </a>
            </p>
            <p className="text-slate-600 text-xs">
              Required scope: <code className="bg-slate-700 px-1 rounded">board:play</code>
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-slate-600 text-sm mt-4">
          Every move requires a justification to build better habits
        </p>
      </div>
    </div>
  )
}


