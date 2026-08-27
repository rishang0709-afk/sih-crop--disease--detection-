/**
 * app/(tabs)/ask-expert.tsx — Ask Expert screen.
 *
 * Features:
 * - Voice guidance on focus via TTS
 * - STT stub: mic button → 3-second listening animation → fallback to text
 * - Text input fallback with translated placeholder
 * - Phase badge (expert answers wired in Phase 6)
 */
import React, { useCallback, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Platform, KeyboardAvoidingView,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useLanguage } from '../../context/LanguageContext'
import { useSpeech } from '../../hooks/useSpeech'
import { useVoiceInput } from '../../hooks/useVoiceInput'
import ScreenHeader from '../../components/ScreenHeader'
import VoiceButton from '../../components/VoiceButton'

export default function AskExpertScreen() {
  const { t, language } = useLanguage()
  const { speakScreen, speak, stop, isSpeaking } = useSpeech()
  const { isListening, startListening, stopListening } = useVoiceInput()
  const [question, setQuestion] = useState('')

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => speakScreen('askExpert'), 600)
      return () => { clearTimeout(timer); stop() }
    }, [language])
  )

  const handleMicPress = async () => {
    if (isListening) {
      stopListening()
      return
    }
    await stop()
    await speak(t('listening') + ' ' + (language === 'hi' ? 'तीन सेकंड में बोलें' : 'Speak your question'))
    await startListening()
  }

  const handleSend = () => {
    if (!question.trim()) return
    speak(language === 'hi'
      ? 'आपका सवाल भेज दिया गया है। विशेषज्ञ जल्द जवाब देगा।'
      : 'Your question has been submitted. An expert will respond soon.')
    setQuestion('')
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <ScreenHeader
          title={t('askExpert')}
          isSpeaking={isSpeaking}
          onSpeak={() => isSpeaking ? stop() : speakScreen('askExpert')}
        />

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Expert icon */}
          <View style={styles.expertCard}>
            <Text style={styles.expertEmoji}>👩‍🔬</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.expertName}>
                {language === 'hi' ? 'कृषि विशेषज्ञ' : 'Agricultural Expert'}
              </Text>
              <Text style={styles.expertStatus}>● KVK / Lab Expert</Text>
            </View>
            <View style={styles.phaseBadgeSmall}>
              <Text style={styles.phaseTextSmall}>Phase 6</Text>
            </View>
          </View>

          {/* Voice input section */}
          <View style={styles.voiceSection}>
            <Text style={styles.sectionLabel}>
              {t('speakQuestion')}
            </Text>

            <View style={styles.voiceRow}>
              <VoiceButton
                isListening={isListening}
                onPress={handleMicPress}
                size={72}
              />
              <View style={styles.voiceStatus}>
                <Text style={styles.voiceStatusTitle}>
                  {isListening
                    ? t('listening')
                    : (language === 'hi' ? 'माइक दबाएं' : 'Press mic to speak')}
                </Text>
                <Text style={styles.voiceStatusSub}>
                  {isListening
                    ? (language === 'hi' ? '3 सेकंड बोलें...' : 'Speak for 3 seconds...')
                    : (language === 'hi' ? 'या नीचे टाइप करें' : 'Or type below')}
                </Text>
              </View>
            </View>
          </View>

          {/* Text input fallback */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>
              {language === 'hi' ? 'या यहाँ लिखें' : 'Or type your question'}
            </Text>
            <TextInput
              testID="expert-question-input"
              style={styles.textInput}
              placeholder={t('typeHere')}
              placeholderTextColor="rgba(240,253,244,0.25)"
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              testID="send-question-btn"
              style={[styles.sendBtn, !question.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!question.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={18} color={question.trim() ? '#052e16' : 'rgba(240,253,244,0.3)'} />
              <Text style={[styles.sendBtnText, !question.trim() && { color: 'rgba(240,253,244,0.3)' }]}>
                {language === 'hi' ? 'भेजें' : 'Send Question'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.phaseBadge}>
            <Text style={styles.phaseText}>
              💬 Expert answers wired in Phase 6
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f0d' },
  body: { padding: 20, gap: 24, paddingBottom: 40 },

  expertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(192,132,252,0.08)',
    borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(192,132,252,0.2)',
    padding: 18,
  },
  expertEmoji:  { fontSize: 42 },
  expertName:   { color: '#f0fdf4', fontSize: 16, fontWeight: '700' },
  expertStatus: { color: '#4ade80', fontSize: 12, marginTop: 4 },

  sectionLabel: {
    color: 'rgba(240,253,244,0.5)', fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
  },

  voiceSection: { gap: 14 },
  voiceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
  },
  voiceStatus: { flex: 1, gap: 4 },
  voiceStatusTitle: { color: '#f0fdf4', fontSize: 16, fontWeight: '700' },
  voiceStatusSub:   { color: 'rgba(240,253,244,0.4)', fontSize: 13 },

  inputSection: { gap: 12 },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, color: '#f0fdf4', fontSize: 16,
    padding: 16, minHeight: 110,
  },
  sendBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...Platform.select({
      ios:     { shadowColor: '#4ade80', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.06)' },
  sendBtnText:     { color: '#052e16', fontSize: 16, fontWeight: '700' },

  phaseBadgeSmall: {
    backgroundColor: 'rgba(96,165,250,0.1)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)',
    paddingHorizontal: 8, paddingVertical: 4,
  },
  phaseTextSmall: { color: '#60a5fa', fontSize: 10, fontWeight: '700' },
  phaseBadge: {
    backgroundColor: 'rgba(96,165,250,0.1)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)',
    paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'center',
  },
  phaseText: { color: '#60a5fa', fontSize: 13, fontWeight: '600' },
})
