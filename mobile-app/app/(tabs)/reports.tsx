/**
 * app/(tabs)/reports.tsx — My Reports placeholder with voice guidance.
 */
import React, { useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useLanguage } from '../../context/LanguageContext'
import { useSpeech } from '../../hooks/useSpeech'
import ScreenHeader from '../../components/ScreenHeader'

export default function ReportsScreen() {
  const { t, language } = useLanguage()
  const { speakScreen, stop, isSpeaking } = useSpeech()

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => speakScreen('reports'), 600)
      return () => { clearTimeout(timer); stop() }
    }, [language])
  )

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t('myReports')}
        isSpeaking={isSpeaking}
        onSpeak={() => isSpeaking ? stop() : speakScreen('reports')}
      />

      {/* Empty state */}
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTitle}>{t('noReports')}</Text>
        <Text style={styles.emptyHint}>
          {language === 'hi'
            ? 'पहली जांच के लिए फसल स्कैन टैब पर जाएं'
            : 'Go to Scan Crop tab to create your first report'}
        </Text>
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseText}>📋 Reports history: Phase 5</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0a0f0d' },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 16, paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 72 },
  emptyTitle: { color: '#f0fdf4', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  emptyHint:  { color: 'rgba(240,253,244,0.45)', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  phaseBadge: {
    backgroundColor: 'rgba(96,165,250,0.1)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)',
    paddingHorizontal: 16, paddingVertical: 8, marginTop: 8,
  },
  phaseText: { color: '#60a5fa', fontSize: 13, fontWeight: '600' },
})
