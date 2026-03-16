import { useNavigate, Navigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import StepIndicator from '../components/StepIndicator'

export default function ReadingPromptScreen() {
  const navigate = useNavigate()
  const { selectedModel, selectedChapter, selectedSections } = useSession()

  // Route guard
  if (!selectedModel || !selectedChapter || selectedSections.length === 0) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <StepIndicator current={3} />
        <div className="text-center space-y-6">
          <div className="text-5xl">📖</div>
          <h1 className="text-2xl font-bold text-slate-100">Go read your section{selectedSections.length > 1 ? 's' : ''}</h1>
          <div className="space-y-2">
            {selectedSections.map(s => (
              <div key={s.title} className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 text-sm">
                {s.title}
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-sm">
            Close your notes and come back when you're done reading.
          </p>
          <button
            onClick={() => navigate('/recall')}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-white transition-colors"
          >
            Done Reading [→]
          </button>
        </div>
      </div>
    </div>
  )
}
