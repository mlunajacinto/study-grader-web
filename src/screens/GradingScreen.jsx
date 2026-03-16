import { useEffect, useState, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { api } from '../api'
import StepIndicator from '../components/StepIndicator'
import ErrorBanner from '../components/ErrorBanner'

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    if (target === null) return
    const start = performance.now()
    function step(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(progress * target))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return value
}

function Panel({ title, color, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  const borderColors = { green: 'border-green-500/40', yellow: 'border-yellow-500/40', red: 'border-red-500/40' }
  const bgColors = { green: 'bg-green-500/10', yellow: 'bg-yellow-500/10', red: 'bg-red-500/10' }
  const textColors = { green: 'text-green-300', yellow: 'text-yellow-300', red: 'text-red-300' }
  return (
    <div className={`rounded-lg border ${borderColors[color]} ${bgColors[color]} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex justify-between items-center px-4 py-3 text-sm font-semibold ${textColors[color]}`}
      >
        <span>{title}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 pb-4 space-y-2 text-sm">{children}</div>}
    </div>
  )
}

export default function GradingScreen() {
  const navigate = useNavigate()
  const {
    selectedModel, selectedSections, recallText,
    setGradingResult, gradingResult, resetForRetry, selectedChapter
  } = useSession()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  // useCountUp must be called before any conditional return (Rules of Hooks)
  const displayScore = useCountUp(result ? result.score : null)

  // Route guard — after all hooks
  if (!selectedModel || selectedSections.length === 0 || !recallText) {
    return <Navigate to="/" replace />
  }

  async function runGrading() {
    setLoading(true)
    setError(null)
    try {
      const sectionText = selectedSections.map(s => s.text).join('\n\n')
      const data = await api.grade(selectedModel, sectionText, recallText)
      setResult(data)
      setGradingResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { runGrading() }, [])

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <StepIndicator current={5} />
      <h1 className="text-xl font-bold text-slate-100 mb-6">Grading Results</h1>

      {loading && (
        <div className="text-center py-16 space-y-3">
          <div className="text-4xl animate-spin inline-block">&#9881;</div>
          <p className="text-slate-400 text-sm">Grading your recall...</p>
        </div>
      )}

      {error && <ErrorBanner message={error} onRetry={runGrading} />}

      {result && !loading && (
        <>
          {/* Score */}
          <div className="text-center mb-8">
            <div className="text-7xl font-black text-indigo-400">{displayScore}%</div>
            <p className="text-slate-400 text-sm mt-1">recall accuracy</p>
          </div>

          {/* Panels */}
          <div className="space-y-3 mb-8">
            <Panel title={`✓ Correct (${result.correct.length})`} color="green">
              {result.correct.length === 0
                ? <p className="text-slate-500 italic">None</p>
                : result.correct.map((c, i) => (
                    <div key={i} className="text-green-200">• {c}</div>
                  ))
              }
            </Panel>

            <Panel title={`~ Inaccurate (${result.inaccurate.length})`} color="yellow" defaultOpen={result.inaccurate.length > 0}>
              {result.inaccurate.length === 0
                ? <p className="text-slate-500 italic">None</p>
                : result.inaccurate.map((item, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="text-yellow-300">You said: {item.said}</div>
                      <div className="text-slate-300 pl-4">Correct: {item.correct}</div>
                    </div>
                  ))
              }
            </Panel>

            <Panel title={`✗ Missed (${result.missed.length})`} color="red" defaultOpen={result.missed.length > 0}>
              {result.missed.length === 0
                ? <p className="text-slate-500 italic">None</p>
                : result.missed.map((m, i) => (
                    <div key={i} className="text-red-200">• {m}</div>
                  ))
              }
            </Panel>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { resetForRetry(); navigate('/sections') }}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Study another section
            </button>
            <button
              onClick={() => navigate('/flashcards')}
              disabled={result.inaccurate.length === 0 && result.missed.length === 0}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Generate flashcards -&gt;
            </button>
          </div>
        </>
      )}
    </div>
  )
}
