/**
 * app/language-select.tsx
 * First-launch language selector screen.
 * - Full-screen, large flag + language name buttons
 * - TTS speaks the language name when user scrolls to/presses each option
 * - Stores selection, marks first launch done, navigates to /(tabs)/
 */
import React, { useEffect, useRef, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Platform,
  Dimensions, StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Speech from 'expo-speech'
import * as Haptics from 'expo-haptics'
import { useLanguage } from '../context/LanguageContext'
import { SUPPORTED_LANGUAGES } from '../constants/roles'

const { width: SCREEN_W } = Dimensions.get('window')

const LANG_BCP47: Record<string, string> = {
  hi: 'hi-IN', en: 'en-IN', mr: 'mr-IN', pa: 'pa-IN',
  te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', gu: 'gu-IN',
  bn: 'bn-IN', or: 'or-IN',
}

// Prompt for each language in its own script
const SELECT_PROMPTS: Record<string, string> = {
  hi: 'हिंदी', en: 'English', mr: 'मराठी', pa: 'ਪੰਜਾਬੀ',
  te: 'తెలుగు', ta: 'தமிழ்', kn: 'ಕನ್ನಡ', gu: 'ગુજરાતી',
  bn: 'বাংলা', or: 'ଓଡ଼ିଆ',
}

export default function LanguageSelectScreen() {
  const router = useRouter()
  const { setLanguage, markLanguageSelected } = useLanguage()
  const [selected, setSelected] = useState<string | null>(null)
  const lastSpokeRef = useRef<string | null>(null)

  // Speak "please select your language" in English on first render
  useEffect(() => {
    Speech.speak('Please select your preferred language.', {
      language: 'en-IN', rate: 0.85,
    })
  }, [])

  const handleSpeak = (code: string) => {
    if (lastSpokeRef.current === code) return
    lastSpokeRef.current = code
    Speech.stop().then(() => {
      Speech.speak(SELECT_PROMPTS[code] ?? code, {
        language: LANG_BCP47[code] ?? 'hi-IN',
        rate: 0.85,
      })
    })
  }

  const handleSelect = async (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    setSelected(code)
    await Speech.stop()
    Speech.speak(SELECT_PROMPTS[code] ?? code, {
      language: LANG_BCP47[code] ?? 'hi-IN', rate: 0.85,
    })
    await setLanguage(code as any)
    await markLanguageSelected()
    setTimeout(() => {
      router.replace('/(tabs)/')
    }, 800)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoEmoji}>🌿</Text>
        <Text style={styles.title}>Crop Health Advisory</Text>
        <Text style={styles.subtitle}>Select your language / अपनी भाषा चुनें</Text>
      </View>

      {/* Language grid */}
      <FlatList
        data={SUPPORTED_LANGUAGES}
        keyExtractor={item => item.code}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: 14 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selected === item.code
          return (
            <TouchableOpacity
              testID={`lang-select-${item.code}`}
              style={[styles.langCard, isSelected && styles.langCardSelected]}
              onPress={() => handleSelect(item.code)}
              onLongPress={() => handleSpeak(item.code)}
              activeOpacity={0.75}
            >
              <Text style={styles.langFlag}>{item.flag}</Text>
              <Text style={[styles.langNative, isSelected && { color: '#052e16' }]}>
                {SELECT_PROMPTS[item.code]}
              </Text>
              <Text style={[styles.langEnglish, isSelected && { color: '#064e3b' }]}>
                {item.label.replace(/^[^\s]+ /, '')}
              </Text>
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        }}
      />

      <Text style={styles.hint}>
        Long-press any button to hear its name · स्क्रीन पर टैप करें
      </Text>
    </View>
  )
}

const CARD_W = (SCREEN_W - 48 - 14) / 2

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f0d',
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  logoEmoji: { fontSize: 48 },
  title:     { color: '#f0fdf4', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  subtitle:  { color: 'rgba(240,253,244,0.5)', fontSize: 14, textAlign: 'center' },

  grid: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },

  langCard: {
    width: CARD_W,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    alignItems: 'center',
    gap: 8,
    minHeight: 140,
    justifyContent: 'center',
  },
  langCardSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#4ade80',
  },
  langFlag:    { fontSize: 36 },
  langNative:  { color: '#f0fdf4', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  langEnglish: { color: 'rgba(240,253,244,0.5)', fontSize: 12, textAlign: 'center' },

  selectedBadge: {
    position: 'absolute',
    top: 10, right: 10,
    width: 24, height: 24,
    borderRadius: 12,
    backgroundColor: '#052e16',
    alignItems: 'center', justifyContent: 'center',
  },
  selectedBadgeText: { color: '#4ade80', fontSize: 13, fontWeight: '800' },

  hint: {
    color: 'rgba(240,253,244,0.25)',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
})
