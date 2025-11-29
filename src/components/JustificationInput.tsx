import { KeyboardEvent } from 'react'

interface JustificationInputProps {
  value: string
  onChange: (text: string) => void
  onSubmit: () => void
  onCancel: () => void
  moveSan: string
  disabled?: boolean
}

const MIN_CHARS = 10
const MAX_CHARS = 280

export function JustificationInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  moveSan,
  disabled
}: JustificationInputProps) {
  const charCount = value.length
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isValid && !disabled) {
        onSubmit()
      }
    }
  }
  
  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">Your move:</span>
        <span className="text-2xl font-bold text-emerald-400">{moveSan}</span>
      </div>
      
      <textarea
        value={value}
        onChange={e => onChange(e.target.value.slice(0, MAX_CHARS))}
        onKeyDown={handleKeyDown}
        placeholder="Explain what this move accomplishes and why you chose it..."
        disabled={disabled}
        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 
                   text-white placeholder-slate-500 resize-none
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                   disabled:opacity-50"
        rows={3}
        autoFocus
      />
      
      <div className="flex items-center justify-between">
        <span className={`text-sm transition-colors ${
          charCount >= MIN_CHARS ? 'text-emerald-400' : 'text-slate-500'
        }`}>
          {charCount} / {MIN_CHARS} minimum
          {charCount > MAX_CHARS * 0.9 && (
            <span className="text-amber-400 ml-2">({MAX_CHARS - charCount} left)</span>
          )}
        </span>
        
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-medium text-slate-400 
                       hover:text-white hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!isValid || disabled}
            className="px-4 py-2 rounded-lg font-medium bg-emerald-600 text-white
                       hover:bg-emerald-500 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
          >
            Submit Move
          </button>
        </div>
      </div>
    </div>
  )
}


