import { useState } from 'react'

export default function FlipCard({ front, back }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="relative h-40 cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(f => !f)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex items-center justify-center p-4 rounded-xl border border-slate-600 bg-slate-800 text-center text-sm font-medium text-slate-100"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span>{front}</span>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 flex items-center justify-center p-4 rounded-xl border border-indigo-500/50 bg-indigo-900/30 text-center text-sm text-slate-200"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span>{back}</span>
        </div>
      </div>
      <p className="absolute -bottom-5 left-0 right-0 text-center text-xs text-slate-500">
        {flipped ? 'click to flip back' : 'click to reveal answer'}
      </p>
    </div>
  )
}
