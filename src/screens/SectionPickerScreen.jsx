import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { api } from '../api'
import StepIndicator from '../components/StepIndicator'
import ErrorBanner from '../components/ErrorBanner'

export default function SectionPickerScreen() {
  const navigate = useNavigate()
  const {
    selectedModel, selectedChapter,
    selectedSections, setSelectedSections,
  } = useSession()

  const [availableSections, setAvailableSections] = useState([])
  const [checked, setChecked] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // All hooks must be declared before any early return (Rules of Hooks)
  useEffect(() => {
    if (!selectedModel || !selectedChapter) return
    load()
  }, [selectedChapter?.path])

  // Route guard — placed after all hooks
  if (!selectedModel || !selectedChapter) return <Navigate to="/" replace />

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.sections(selectedChapter.path)
      setAvailableSections(data)
      // Pre-check any previously selected sections
      const preChecked = new Set(
        data
          .filter(s => selectedSections.some(prev => prev.title === s.title))
          .map(s => s.title)
      )
      setChecked(preChecked)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function toggle(title) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(title) ? next.delete(title) : next.add(title)
      return next
    })
  }

  function selectAll() {
    setChecked(new Set(availableSections.map(s => s.title)))
  }

  function clearAll() {
    setChecked(new Set())
  }

  function handleConfirm() {
    const chosen = availableSections.filter(s => checked.has(s.title))
    setSelectedSections(chosen)
    navigate('/reading')
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <StepIndicator current={2} />
      <h1 className="text-xl font-bold text-slate-100 mb-1">{selectedChapter.name}</h1>
      <p className="text-slate-400 text-sm mb-6">Select sections to study.</p>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading && <p className="text-slate-400 text-sm">Loading sections...</p>}

      {!loading && !error && (
        <>
          <div className="flex gap-3 mb-3">
            <button onClick={selectAll} className="text-xs text-indigo-400 hover:text-indigo-300">
              Select all
            </button>
            <span className="text-slate-600">|</span>
            <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-300">
              Clear
            </button>
          </div>

          <div className="border border-slate-600 rounded-lg overflow-hidden max-h-96 overflow-y-auto mb-6">
            {availableSections.map(s => (
              <label
                key={s.title}
                className={`
                  flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-700/50 transition-colors
                  ${checked.has(s.title) ? 'bg-indigo-600/20' : 'hover:bg-slate-700/30'}
                `}
              >
                <input
                  type="checkbox"
                  checked={checked.has(s.title)}
                  onChange={() => toggle(s.title)}
                  className="accent-indigo-500"
                />
                <span className="text-sm text-slate-200">{s.title}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleConfirm}
            disabled={checked.size === 0}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed
              bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Confirm {checked.size > 0 ? `(${checked.size} section${checked.size > 1 ? 's' : ''})` : ''}
          </button>
        </>
      )}
    </div>
  )
}
