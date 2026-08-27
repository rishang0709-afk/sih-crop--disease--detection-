/**
 * components/ScreenHeader.tsx
 * Consistent header for all farmer-facing screens:
 * - Back button (optional)
 * - Title in the current language
 * - Speaker button (re-triggers TTS)
 */
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import SpeakerButton from './SpeakerButton'

interface ScreenHeaderProps {
  title:      string
  showBack?:  boolean
  isSpeaking: boolean
  onSpeak:    () => void
}

export default function ScreenHeader({ title, showBack, isSpeaking, onSpeak }: ScreenHeaderProps) {
  const router = useRouter()

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity
          testID="back-btn"
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color="#4ade80" />
        </TouchableOpacity>
      ) : (
        <View style={styles.logoMark}>
          <Text style={{ fontSize: 18 }}>🌿</Text>
        </View>
      )}

      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      <SpeakerButton isSpeaking={isSpeaking} onPress={onSpeak} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoMark: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#16a34a',
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: '#f0fdf4',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
})
