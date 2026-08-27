/**
 * context/LanguageContext.tsx
 * Manages the user's selected language across the entire app.
 * Persisted in SecureStore so the preference survives app restarts.
 */
import React, {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from 'react'
import * as SecureStore from 'expo-secure-store'
import { LangCode, ScreenKey, VOICE_SCRIPTS, UI_LABELS } from '../constants/voice'

interface LanguageContextType {
  language:    LangCode
  setLanguage: (lang: LangCode) => Promise<void>
  /** Get a translated UI label string */
  t: (key: string) => string
  /** Get the TTS voice script for a given screen */
  script: (screenKey: ScreenKey) => string
  /** Whether this is the user's first launch (language not yet selected) */
  isFirstLaunch: boolean
  markLanguageSelected: () => Promise<void>
}

const DEFAULT_LANG: LangCode = 'hi'
const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language,      setLangState]      = useState<LangCode>(DEFAULT_LANG)
  const [isFirstLaunch, setIsFirstLaunch]  = useState(false)
  const [ready,         setReady]          = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const stored     = await SecureStore.getItemAsync('crop_lang') as LangCode | null
        const langPicked = await SecureStore.getItemAsync('lang_selected')

        if (stored) setLangState(stored)
        if (!langPicked) setIsFirstLaunch(true)
      } catch {
        // SecureStore might fail on web/simulator — use defaults
      } finally {
        setReady(true)
      }
    })()
  }, [])

  const setLanguage = useCallback(async (lang: LangCode) => {
    setLangState(lang)
    try {
      await SecureStore.setItemAsync('crop_lang', lang)
    } catch { /* web / test env */ }
  }, [])

  const markLanguageSelected = useCallback(async () => {
    setIsFirstLaunch(false)
    try {
      await SecureStore.setItemAsync('lang_selected', '1')
    } catch { /* web / test env */ }
  }, [])

  /** Translate a UI label key to the current language */
  const t = useCallback((key: string): string => {
    const entry = UI_LABELS[key]
    if (!entry) return key
    return entry[language] ?? entry['en'] ?? key
  }, [language])

  /** Get the TTS script for a screen in the current language */
  const script = useCallback((screenKey: ScreenKey): string => {
    const entry = VOICE_SCRIPTS[screenKey]
    if (!entry) return ''
    return entry[language] ?? entry['en'] ?? ''
  }, [language])

  if (!ready) return null  // prevent flash before language loads

  return (
    <LanguageContext.Provider value={{
      language, setLanguage, t, script, isFirstLaunch, markLanguageSelected,
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
