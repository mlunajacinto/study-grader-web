export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300">
      <span className="text-sm">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 text-sm rounded bg-red-500/20 hover:bg-red-500/40 text-red-200 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}
