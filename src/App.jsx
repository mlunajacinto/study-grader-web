import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import SetupScreen from './screens/SetupScreen'
import SectionPickerScreen from './screens/SectionPickerScreen'
import ReadingPromptScreen from './screens/ReadingPromptScreen'
import RecallScreen from './screens/RecallScreen'
import GradingScreen from './screens/GradingScreen'
import FlashcardScreen from './screens/FlashcardScreen'

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<SetupScreen />} />
          <Route path="/sections" element={<SectionPickerScreen />} />
          <Route path="/reading" element={<ReadingPromptScreen />} />
          <Route path="/recall" element={<RecallScreen />} />
          <Route path="/grade" element={<GradingScreen />} />
          <Route path="/flashcards" element={<FlashcardScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  )
}
