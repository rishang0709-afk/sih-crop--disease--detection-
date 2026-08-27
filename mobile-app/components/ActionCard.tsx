/**
 * components/ActionCard.tsx
 * Large icon-based action card for the farmer home grid.
 * Accessible touch target (min 140×160px), animated press, colored glow.
 */
import React, { useRef } from 'react'
import {
  TouchableOpacity, View, Text, StyleSheet, Animated, Platform,
} from 'react-native'
import * as Haptics from 'expo-haptics'

interface ActionCardProps {
  emoji:       string
  label:       string
  subLabel?:   string
  color:       string   // accent color for glow + border
  onPress:     () => void
  testID?:     string
  isComingSoon?: boolean
}

export default function ActionCard({
  emoji, label, subLabel, color, onPress, testID, isComingSoon,
}: ActionCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const glowAnim  = useRef(new Animated.Value(0)).current

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 100, useNativeDriver: true }),
      Animated.timing(glowAnim,  { toValue: 1,    duration: 100, useNativeDriver: false }),
    ]).start()
  }

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }),
      Animated.timing(glowAnim,  { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start()
  }

  const borderColor = glowAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['rgba(255,255,255,0.08)', color + 'CC'],
  })
  const bgColor = glowAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['rgba(255,255,255,0.04)', color + '18'],
  })

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.touchable}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            borderColor,
            backgroundColor: bgColor,
          },
        ]}
      >
        {/* Emoji icon */}
        <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        <Text style={styles.label} numberOfLines={2}>{label}</Text>

        {subLabel && (
          <Text style={styles.subLabel} numberOfLines={2}>{subLabel}</Text>
        )}

        {isComingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Phase 3+</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    minWidth: 140,
    minHeight: 160,
  },
  card: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 20,
    gap: 10,
    alignItems: 'flex-start',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  iconBox: {
    width: 60, height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji:    { fontSize: 30 },
  label:    { color: '#f0fdf4', fontWeight: '700', fontSize: 16, lineHeight: 22, flexShrink: 1 },
  subLabel: { color: 'rgba(240,253,244,0.45)', fontSize: 12, lineHeight: 17, flexShrink: 1 },
  comingSoonBadge: {
    backgroundColor: 'rgba(96,165,250,0.12)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)',
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 4,
  },
  comingSoonText: { color: '#60a5fa', fontSize: 10, fontWeight: '700' },
})
