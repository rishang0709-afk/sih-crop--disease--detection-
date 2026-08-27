/**
 * hooks/useVoiceInput.ts
 * STT (Speech-to-Text) stub for Phase 2.
 *
 * Architecture note:
 * Real STT with @react-native-voice/voice requires a native build
 * (no Expo Go support). This hook provides the same interface so
 * Phase 10 can swap the implementation without changing screen code.
 *
 * Phase 2 behaviour:
 * - startListening() → sets isListening=true, plays a 3-second simulation,
 *   then returns an empty transcript (user must type instead).
 * - The UI will show the mic animation + a text fallback input.
 *
 * Phase 10 swap:
 * Replace the body of startListening() with @react-native-voice/voice calls.
 */
import { useState, useCallback, useRef } from 'react'

export interface VoiceInputState {
  isListening:    boolean
  transcript:     string
  error:          string | null
  startListening: () => Promise<void>
  stopListening:  () => void
  resetTranscript:() => void
}

export function useVoiceInput(): VoiceInputState {
  const [isListening,  setIsListening]  = useState(false)
  const [transcript,   setTranscript]   = useState('')
  const [error,        setError]        = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopListening = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsListening(false)
  }, [])

  const startListening = useCallback(async () => {
    if (isListening) { stopListening(); return }

    setError(null)
    setTranscript('')
    setIsListening(true)

    // ── Phase 2 stub: simulate 3-second listening window then stop ────────────
    timerRef.current = setTimeout(() => {
      setIsListening(false)
      // In Phase 10: resolve with actual transcribed text from native API
      // For now, leave transcript empty so user falls back to keyboard
    }, 3000)
  }, [isListening, stopListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return { isListening, transcript, error, startListening, stopListening, resetTranscript }
}
