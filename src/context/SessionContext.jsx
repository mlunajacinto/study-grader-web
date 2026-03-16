import { createContext, useContext, useState } from 'react'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedChapter, setSelectedChapter] = useState(null)
  // { path: string, name: string }
  const [selectedSections, setSelectedSections] = useState([])
  // [{ title: string, text: string }]
  const [recallText, setRecallText] = useState('')
  const [gradingResult, setGradingResult] = useState(null)
  // { score, correct[], inaccurate: [{said, correct}], missed[] }
  const [flashcardPaths, setFlashcardPaths] = useState(null)
  // { md: string, csv: string }

  /** Called from GradingScreen "Study another section": preserves selectedSections */
  function resetForRetry() {
    setRecallText('')
    setGradingResult(null)
    setFlashcardPaths(null)
  }

  /** Called from FlashcardScreen "Study another section": full reset for same chapter */
  function resetForNewSection() {
    setSelectedSections([])
    setRecallText('')
    setGradingResult(null)
    setFlashcardPaths(null)
  }

  return (
    <SessionContext.Provider value={{
      selectedModel, setSelectedModel,
      selectedChapter, setSelectedChapter,
      selectedSections, setSelectedSections,
      recallText, setRecallText,
      gradingResult, setGradingResult,
      flashcardPaths, setFlashcardPaths,
      resetForRetry,
      resetForNewSection,
    }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
