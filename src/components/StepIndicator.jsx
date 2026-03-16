const STEPS = ['Setup', 'Sections', 'Read', 'Recall', 'Grade', 'Flashcards']

export default function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`
              flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold
              ${active ? 'bg-indigo-500 text-white' : done ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}
            `}>
              {done ? '✓' : step}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 ${done ? 'bg-green-500' : 'bg-slate-700'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
