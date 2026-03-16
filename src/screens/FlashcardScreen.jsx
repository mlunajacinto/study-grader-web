import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { api } from '../api'
import StepIndicator from '../components/StepIndicator'
import ErrorBanner from '../components/ErrorBanner'
import FlipCard from '../components/FlipCard'

export default function FlashcardScreen() {
  const navigate = useNavigate()
  const {
    selectedModel, selectedChapter, gradingResult,
    setFlashcardPaths, flashcardPaths, resetForNewSection,
  } = useSession()

  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // useEffect called unconditionally (Rules of Hooks)
  useEffect(() => {
    if (!selectedModel || !selectedChapter || !gradingResult) return

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const data = await api.flashcards(selectedModel, gradingResult, selectedChapter.name)
        setCards(data.cards)
        setFlashcardPaths({ md: data.md_path, csv: data.csv_path })
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  // Route guard (after all hooks)
  if (!selectedModel || !selectedChapter || !gradingResult) {
    return <Navigate to="/" replace />
  }

  function handleStudyAnother() {
    resetForNewSection()
    navigate('/sections')
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <StepIndicator current={6} />
      <h1 className="text-xl font-bold text-slate-100 mb-6">Flashcards</h1>

      {loading && (
        <div className="text-center py-16 space-y-3">
          <div className="text-4xl inline-block">&#9881;</div>
          <p className="text-slate-400 text-sm">Generating flashcards...</p>
        </div>
      )}

      {error && <ErrorBanner message={error} onRetry={() => window.location.reload()} />}

      {!loading && !error && (
        <>
          {cards.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-4xl">&#127919;</div>
              <p className="text-slate-300 font-medium">No gaps found - no flashcards needed.</p>
              <p className="text-slate-500 text-sm">Perfect recall on this section.</p>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-sm mb-6">
                {cards.length} card{cards.length > 1 ? 's' : ''} generated - click to flip.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                {cards.map((card, i) => (
                  <FlipCard key={i} front={card.front} back={card.back} />
                ))}
              </div>

              {flashcardPaths && (
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-600 mb-6 space-y-1">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Saved to vault</p>
                  <p className="text-xs text-slate-300 font-mono break-all">{flashcardPaths.md}</p>
                  <p className="text-xs text-slate-400 font-mono break-all">{flashcardPaths.csv}</p>
                </div>
              )}
            </>
          )}

          <button
            onClick={handleStudyAnother}
            className="w-full py-3 rounded-lg font-semibold text-sm border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Study another section
          </button>
        </>
      )}
    </div>
  )
}
