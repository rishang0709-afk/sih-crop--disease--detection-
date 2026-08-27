/**
 * components/VoiceButton.tsx
 * Floating microphone button with animated pulse while listening.
 * Used on every screen for STT input.
 */
import React, { useEffect, useRef } from 'react'
import {
  TouchableOpacity, View, StyleSheet, Animated, Platform,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'

interface VoiceButtonProps {
  isListening: boolean
  onPress:     () => void
  size?:       number
  style?:      object
}

export default function VoiceButton({
  isListening, onPress, size = 56, style,
}: VoiceButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const glowAnim  = useRef(new Animated.Value(0)).current
  const loopRef   = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    if (isListening) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
            Animated.timing(glowAnim,  { toValue: 1,   duration: 600, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1,   duration: 600, useNativeDriver: true }),
            Animated.timing(glowAnim,  { toValue: 0.4, duration: 600, useNativeDriver: true }),
          ]),
        ])
      )
      loopRef.current.start()
    } else {
      loopRef.current?.stop()
      Animated.parallel([
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(glowAnim,  { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start()
    }
  }, [isListening, pulseAnim, glowAnim])

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    onPress()
  }

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] })

  return (
    <View style={[styles.wrapper, { width: size + 24, height: size + 24 }, style]}>
      {/* Animated glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size + 24, height: size + 24,
            borderRadius: (size + 24) / 2,
            opacity: glowOpacity,
          },
        ]}
      />
      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width:  size + 12, height: size + 12,
            borderRadius: (size + 12) / 2,
            transform: [{ scale: pulseAnim }],
            opacity: isListening ? 0.25 : 0,
          },
        ]}
      />
      {/* Button */}
      <TouchableOpacity
        testID="voice-mic-btn"
        activeOpacity={0.8}
        onPress={handlePress}
        style={[
          styles.button,
          { width: size, height: size, borderRadius: size / 2 },
          isListening && styles.buttonActive,
        ]}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Ionicons
            name={isListening ? 'mic' : 'mic-outline'}
            size={size * 0.45}
            color={isListening ? '#052e16' : '#4ade80'}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: '#4ade80',
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: '#4ade80',
  },
  button: {
    backgroundColor: '#0d2218',
    borderWidth: 1.5,
    borderColor: 'rgba(74,222,128,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#4ade80', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  buttonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#4ade80',
  },
})
