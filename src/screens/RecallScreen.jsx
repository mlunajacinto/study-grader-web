import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import StepIndicator from '../components/StepIndicator'

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function progressColor(count) {
  if (count >= 150) return 'bg-green-500'
  if (count >= 100) return 'bg-blue-500'
  if (count >= 50)  return 'bg-yellow-500'
  return 'bg-slate-600'
}

function progressLabel(count) {
  if (count >= 150) return 'Great recall!'
  if (count >= 100) return 'Solid'
  if (count >= 50)  return 'Good start'
  return 'Keep going...'
}

export default function RecallScreen() {
  const navigate = useNavigate()
  const { selectedModel, selectedChapter, selectedSections, setRecallText } = useSession()
  const [text, setText] = useState('')

  // Route guard
  if (!selectedModel || !selectedChapter || selectedSections.length === 0) {
    return <Navigate to="/" replace />
  }

  const count = wordCount(text)
  const pct = Math.min((count / 150) * 100, 100)

  function handleSubmit() {
    if (!text.trim()) return
    setRecallText(text)
    navigate('/grade')
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <StepIndicator current={4} />
      <h1 className="text-xl font-bold text-slate-100 mb-1">Active Recall</h1>
      <p className="text-slate-400 text-sm mb-6">
        Type everything you remember. Don't look at your notes.
        <span className="ml-2 text-slate-500">Ctrl+Enter to submit</span>
      </p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write everything you remember from the section..."
        className="w-full h-64 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 text-sm resize-none focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
        autoFocus
      />

      {/* Word count progress */}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{count} words - {progressLabel(count)}</span>
          <span>150+ = great</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${progressColor(count)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={count === 0}
        className="mt-6 w-full py-3 rounded-lg font-semibold text-sm transition-colors
          disabled:opacity-30 disabled:cursor-not-allowed
          bg-indigo-600 hover:bg-indigo-500 text-white"
      >
        Submit for grading [→]
      </button>
    </div>
  )
}
