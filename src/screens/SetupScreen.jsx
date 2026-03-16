import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { api } from '../api'
import StepIndicator from '../components/StepIndicator'
import ErrorBanner from '../components/ErrorBanner'

const COURSE_LABELS = { BLAW: 'Business Law', ECON: 'Economics' }

export default function SetupScreen() {
  const navigate = useNavigate()
  const { selectedModel, setSelectedModel, selectedChapter, setSelectedChapter } = useSession()

  const [models, setModels] = useState([])
  const [chapters, setChapters] = useState({ BLAW: [], ECON: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relayDown, setRelayDown] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [modelsData, chaptersData] = await Promise.all([api.models(), api.chapters()])
      setModels(modelsData.models)
      setChapters(chaptersData)
      setRelayDown(false)
    } catch (e) {
      if (e.message?.includes('fetch') || e.status === undefined) {
        setRelayDown(true)
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleStart() {
    if (!selectedModel || !selectedChapter) return
    navigate('/sections')
  }

  if (relayDown) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="text-4xl">⚡</div>
          <h1 className="text-xl font-bold text-slate-100">Relay not running</h1>
          <p className="text-slate-400 text-sm">
            Start the relay server, then refresh this page.
          </p>
          <pre className="text-left text-xs bg-slate-800 rounded-lg p-4 text-indigo-300">
            cd 03-Resources/study-grader{'\n'}python relay.py
          </pre>
          <button
            onClick={load}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <StepIndicator current={1} />
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Study Grader</h1>
      <p className="text-slate-400 text-sm mb-8">Pick a model and chapter to begin.</p>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading && <p className="text-slate-400 text-sm">Loading...</p>}

      {!loading && !error && (
        <>
          {/* Model selector */}
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">
              Model
            </label>
            {models.length === 0 ? (
              <p className="text-yellow-400 text-sm">
                No models found. Run <code className="bg-slate-700 px-1 rounded">ollama pull llama3</code> to add one.
              </p>
            ) : (
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">Choose a model...</option>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
          </div>

          {/* Chapter list */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">
              Chapter
            </label>
            <div className="border border-slate-600 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
              {Object.entries(chapters).map(([course, chaps]) => (
                <div key={course}>
                  <div className="px-4 py-2 bg-slate-700 text-xs font-semibold uppercase tracking-widest text-indigo-400 sticky top-0">
                    {course} — {COURSE_LABELS[course]}
                  </div>
                  {chaps.map(ch => (
                    <button
                      key={ch.path}
                      onClick={() => setSelectedChapter(ch)}
                      className={`
                        w-full text-left px-4 py-2 text-sm transition-colors border-b border-slate-700/50
                        ${selectedChapter?.path === ch.path
                          ? 'bg-indigo-600/30 text-indigo-200'
                          : 'text-slate-300 hover:bg-slate-700/50'}
                      `}
                    >
                      {ch.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!selectedModel || !selectedChapter}
            className="mt-6 w-full py-3 rounded-lg font-semibold text-sm transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed
              bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Start -&gt;
          </button>
        </>
      )}
    </div>
  )
}
