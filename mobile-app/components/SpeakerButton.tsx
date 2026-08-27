/**
 * components/SpeakerButton.tsx
 * Small button to re-trigger TTS narration for the current screen.
 * Placed in the header of each screen.
 */
import React from 'react'
import { TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

interface SpeakerButtonProps {
  isSpeaking: boolean
  onPress:    () => void
  size?:      number
}

export default function SpeakerButton({ isSpeaking, onPress, size = 40 }: SpeakerButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    onPress()
  }

  return (
    <TouchableOpacity
      testID="speaker-btn"
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.btn,
        { width: size, height: size, borderRadius: size / 2 },
        isSpeaking && styles.btnActive,
      ]}
      accessibilityLabel="Speak screen guide"
    >
      <Ionicons
        name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
        size={size * 0.48}
        color={isSpeaking ? '#052e16' : '#4ade80'}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: '#22c55e',
    borderColor: '#4ade80',
  },
})
