import { formatTime } from '@/utils/chess'

interface ClockProps {
  time: number // milliseconds
  isActive: boolean
  isPlayer: boolean
}

export function Clock({ time, isActive, isPlayer }: ClockProps) {
  const isLowTime = time < 30000
  const isCriticalTime = time < 10000
  
  return (
    <div
      className={`
        font-mono font-bold rounded-lg px-4 py-2 transition-all
        ${isPlayer ? 'text-2xl' : 'text-xl'}
        ${isActive 
          ? isLowTime
            ? isCriticalTime
              ? 'bg-red-600 text-white time-critical'
              : 'bg-red-500 text-white animate-pulse'
            : 'bg-emerald-600 text-white'
          : 'bg-slate-700 text-slate-300'
        }
      `}
    >
      {formatTime(time)}
    </div>
  )
}


