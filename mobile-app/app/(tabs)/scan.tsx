/**
 * app/(tabs)/scan.tsx — Scan Crop placeholder (Phase 3 will wire the camera)
 * Features voice guidance on focus.
 */
import React, { useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useLanguage } from '../../context/LanguageContext'
import { useSpeech } from '../../hooks/useSpeech'
import ScreenHeader from '../../components/ScreenHeader'

export default function ScanScreen() {
  const { t, language } = useLanguage()
  const { speakScreen, stop, isSpeaking } = useSpeech()

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => speakScreen('scan'), 600)
      return () => { clearTimeout(timer); stop() }
    }, [language])
  )

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t('scanCrop')}
        isSpeaking={isSpeaking}
        onSpeak={() => isSpeaking ? stop() : speakScreen('scan')}
      />

      <View style={styles.body}>
        {/* Camera icon area */}
        <View style={styles.cameraArea}>
          <View style={styles.cameraRing}>
            <View style={styles.cameraInner}>
              <Text style={styles.cameraEmoji}>📸</Text>
            </View>
          </View>
          <Text style={styles.hint}>
            {language === 'hi' ? 'यहाँ टैप करें' :
             language === 'mr' ? 'येथे टॅप करा' :
             language === 'pa' ? 'ਇੱਥੇ ਟੈਪ ਕਰੋ' :
             'Tap to open camera'}
          </Text>
        </View>

        {/* Big camera button - wired in Phase 3 */}
        <TouchableOpacity
          testID="camera-btn"
          style={styles.cameraBtn}
          activeOpacity={0.8}
          onPress={() => {
            speakScreen('scan') // re-narrate until Phase 3
          }}
        >
          <Ionicons name="camera" size={32} color="#052e16" />
          <Text style={styles.cameraBtnText}>{t('scanCrop')}</Text>
        </TouchableOpacity>

        {/* Phase badge */}
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseText}>
            📷 Camera wiring: Phase 3
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f0d' },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 32,
  },
  cameraArea: { alignItems: 'center', gap: 16 },
  cameraRing: {
    width: 180, height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(74,222,128,0.2)',
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  cameraInner: {
    width: 140, height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(74,222,128,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  cameraEmoji: { fontSize: 56 },
  hint: { color: 'rgba(240,253,244,0.4)', fontSize: 14 },
  cameraBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios:     { shadowColor: '#4ade80', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 8 },
    }),
  },
  cameraBtnText: { color: '#052e16', fontSize: 20, fontWeight: '800' },
  phaseBadge: {
    backgroundColor: 'rgba(96,165,250,0.1)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  phaseText: { color: '#60a5fa', fontSize: 13, fontWeight: '600' },
})
