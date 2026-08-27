/**
 * hooks/useSpeech.ts
 * Wrapper around expo-speech providing:
 * - speak(text)     — speak arbitrary text in the current language
 * - speakScreen(key) — speak the pre-written script for a screen
 * - stop()           — stop current speech
 * - isSpeaking       — reactive speaking state
 *
 * Language BCP-47 codes for expo-speech:
 *   hi→hi-IN  en→en-IN  mr→mr-IN  pa→pa-IN
 *   te→te-IN  ta→ta-IN  kn→kn-IN  gu→gu-IN
 *   bn→bn-IN  or→or-IN
 */
import { useState, useCallback, useRef } from 'react'
import * as Speech from 'expo-speech'
import { useLanguage } from '../context/LanguageContext'
import { ScreenKey } from '../constants/voice'

// Map our language codes to BCP-47 locale codes for expo-speech
const LANG_TO_BCP47: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  mr: 'mr-IN',
  pa: 'pa-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  gu: 'gu-IN',
  bn: 'bn-IN',
  or: 'or-IN',
}

export function useSpeech() {
  const { language, script } = useLanguage()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<string | null>(null)

  const stop = useCallback(async () => {
    await Speech.stop()
    setIsSpeaking(false)
  }, [])

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return

    // Stop any ongoing speech first
    await Speech.stop()
    utteranceRef.current = text
    setIsSpeaking(true)

    const locale = LANG_TO_BCP47[language] ?? 'hi-IN'

    Speech.speak(text, {
      language: locale,
      pitch:    1.0,
      rate:     0.85,   // slightly slower — easier for non-native speech output
      onDone:   () => setIsSpeaking(false),
      onError:  () => setIsSpeaking(false),
      onStopped:() => setIsSpeaking(false),
    })
  }, [language])

  /** Convenience: speak the pre-written TTS script for a given screen */
  const speakScreen = useCallback(async (screenKey: ScreenKey) => {
    const text = script(screenKey)
    await speak(text)
  }, [script, speak])

  return { speak, speakScreen, stop, isSpeaking }
}
