/**
 * app/(tabs)/weather.tsx — Weather Alert placeholder with voice guidance.
 */
import React, { useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useLanguage } from '../../context/LanguageContext'
import { useSpeech } from '../../hooks/useSpeech'
import ScreenHeader from '../../components/ScreenHeader'

export default function WeatherScreen() {
  const { t, language } = useLanguage()
  const { speakScreen, stop, isSpeaking } = useSpeech()

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => speakScreen('weather'), 600)
      return () => { clearTimeout(timer); stop() }
    }, [language])
  )

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t('weatherAlert')}
        isSpeaking={isSpeaking}
        onSpeak={() => isSpeaking ? stop() : speakScreen('weather')}
      />

      <View style={styles.body}>
        {/* Placeholder weather card */}
        <View style={styles.weatherCard}>
          <Text style={styles.weatherEmoji}>🌦️</Text>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherTitle}>
              {language === 'hi' ? 'आपका क्षेत्र' : 'Your Area'}
            </Text>
            <Text style={styles.weatherSub}>
              {language === 'hi' ? 'मौसम डेटा Phase 8 में आएगा' : 'Weather data available in Phase 8'}
            </Text>
          </View>
        </View>

        {/* Risk level indicator */}
        <View style={styles.riskSection}>
          <Text style={styles.riskLabel}>
            {language === 'hi' ? 'रोग का खतरा' : 'Disease Risk'}
          </Text>
          <View style={styles.riskBar}>
            {['🟢', '🟡', '🔴'].map((emoji, i) => (
              <View key={i} style={[styles.riskSegment, i === 0 && styles.riskActive]}>
                <Text style={styles.riskEmoji}>{emoji}</Text>
                <Text style={styles.riskText}>
                  {i === 0 ? (language === 'hi' ? 'कम' : 'Low') :
                   i === 1 ? (language === 'hi' ? 'मध्यम' : 'Medium') :
                              (language === 'hi' ? 'उच्च' : 'High')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.phaseBadge}>
          <Text style={styles.phaseText}>🌤️ Live weather data: Phase 8</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f0d' },
  body: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 24, paddingHorizontal: 24,
  },
  weatherCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    width: '100%', backgroundColor: 'rgba(251,191,36,0.08)',
    borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(251,191,36,0.2)',
    padding: 20,
  },
  weatherEmoji: { fontSize: 52 },
  weatherInfo: { flex: 1, gap: 4 },
  weatherTitle: { color: '#f0fdf4', fontSize: 18, fontWeight: '700' },
  weatherSub:   { color: 'rgba(240,253,244,0.45)', fontSize: 13 },

  riskSection: { width: '100%', gap: 12 },
  riskLabel:   { color: 'rgba(240,253,244,0.5)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  riskBar: {
    flexDirection: 'row', gap: 10,
  },
  riskSegment: {
    flex: 1, alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
  },
  riskActive: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderColor: 'rgba(74,222,128,0.3)',
  },
  riskEmoji: { fontSize: 24 },
  riskText:  { color: 'rgba(240,253,244,0.6)', fontSize: 12, fontWeight: '600' },

  phaseBadge: {
    backgroundColor: 'rgba(96,165,250,0.1)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  phaseText: { color: '#60a5fa', fontSize: 13, fontWeight: '600' },
})
