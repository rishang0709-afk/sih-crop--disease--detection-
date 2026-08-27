/**
 * app/(auth)/login.tsx — Phone + OTP login screen for farmers and pradhans.
 * Large text, simple layout, accessible for low-literacy users.
 */
import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { sendOTP, verifyOTP } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { UserRole } from '../../constants/roles'

const COLORS = {
  bg:           '#0a0f0d',
  bgCard:       'rgba(255,255,255,0.05)',
  border:       'rgba(255,255,255,0.1)',
  borderFocus:  'rgba(74,222,128,0.5)',
  green:        '#4ade80',
  greenDark:    '#16a34a',
  text:         '#f0fdf4',
  textSub:      'rgba(240,253,244,0.6)',
  textMuted:    'rgba(240,253,244,0.35)',
  error:        '#f87171',
}

export default function LoginScreen() {
  const router = useRouter()
  const { login } = useAuth()

  const [step, setStep]       = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone]     = useState('')
  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const otpRefs = useRef<(TextInput | null)[]>([])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // ── Send OTP ────────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    const cleaned = phone.trim()
    if (!/^\+?[\d\s\-]{10,}$/.test(cleaned)) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    setError('')
    setLoading(true)
    try {
      await sendOTP(cleaned)
      setStep('otp')
      setCountdown(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 300)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not send OTP. Check your number.')
    } finally {
      setLoading(false)
    }
  }

  // ── OTP input ────────────────────────────────────────────────────────────────
  const handleOtpDigit = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpBackspace = (idx: number) => {
    if (!otp[idx] && idx > 0) {
      const next = [...otp]; next[idx - 1] = ''
      setOtp(next)
      otpRefs.current[idx - 1]?.focus()
    }
  }

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Enter all 6 digits'); return }
    setError('')
    setLoading(true)
    try {
      const { data } = await verifyOTP(phone.trim(), code)
      if (!data.needs_registration) {
        await login(data.token, data.role as UserRole, '')
        router.replace('/(tabs)/')
      } else {
        // New user — go to registration
        router.push({ pathname: '/(auth)/register', params: { phone: phone.trim(), code } })
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setOtp(['', '', '', '', '', ''])
    setError('')
    try {
      await sendOTP(phone.trim())
      setCountdown(30)
    } catch {
      setError('Could not resend OTP.')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo + title */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.title}>Crop Health Advisory</Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'Enter your mobile number to get started'
              : 'Enter the 6-digit code sent to your phone'}
          </Text>
        </View>

        {/* Dev hint */}
        <View style={[styles.alert, styles.alertInfo]}>
          <Text style={{ color: '#93c5fd', fontSize: 13 }}>
            🛠️ Dev mode: Any number works. Enter <Text style={{ fontWeight: 'bold' }}>123456</Text> as OTP.
          </Text>
        </View>

        {/* Error */}
        {!!error && (
          <View style={[styles.alert, styles.alertError]}>
            <Text style={{ color: '#fca5a5', fontSize: 14 }}>{error}</Text>
          </View>
        )}

        {/* ── PHONE STEP ── */}
        {step === 'phone' && (
          <View style={styles.card}>
            <Text style={styles.label}>📱  Mobile Number</Text>
            <TextInput
              testID="phone-input"
              style={styles.input}
              placeholder="+91 98765 43210"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSendOTP}
            />
            <TouchableOpacity
              testID="send-otp-btn"
              style={[styles.btn, !phone.trim() && styles.btnDisabled]}
              onPress={handleSendOTP}
              disabled={loading || !phone.trim()}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color="#052e16" />
                : <Text style={styles.btnText}>Send OTP  →</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* ── OTP STEP ── */}
        {step === 'otp' && (
          <View style={styles.card}>
            <Text style={[styles.label, { textAlign: 'center', marginBottom: 4 }]}>
              Sent to {phone}
            </Text>
            <TouchableOpacity onPress={() => { setStep('phone'); setOtp(['','','','','','']) }}>
              <Text style={{ color: COLORS.green, textAlign: 'center', fontSize: 13, marginBottom: 20 }}>
                Change number
              </Text>
            </TouchableOpacity>

            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  testID={`otp-digit-${i}`}
                  ref={el => { otpRefs.current[i] = el }}
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : {}]}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={val => handleOtpDigit(i, val)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace') handleOtpBackspace(i)
                  }}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              testID="verify-otp-btn"
              style={[styles.btn, otp.join('').length < 6 && styles.btnDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading || otp.join('').length < 6}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color="#052e16" />
                : <Text style={styles.btnText}>Verify OTP  →</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              testID="resend-otp-btn"
              onPress={handleResend}
              disabled={countdown > 0}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text style={{ color: countdown > 0 ? COLORS.textMuted : COLORS.green, fontSize: 14 }}>
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 20 },

  header: { alignItems: 'center', gap: 12, marginBottom: 8 },
  logoBox: {
    width: 72, height: 72,
    backgroundColor: '#16a34a',
    borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4ade80', shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logoEmoji: { fontSize: 36 },
  title:     { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  subtitle:  { fontSize: 15, color: COLORS.textSub, textAlign: 'center' },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    gap: 14,
  },

  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSub, textTransform: 'uppercase', letterSpacing: 1 },

  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.text,
    fontSize: 18,
    padding: 16,
    fontWeight: '500',
  },

  btn: {
    backgroundColor: '#22c55e',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#4ade80', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: '#052e16', fontWeight: '700', fontSize: 17 },

  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 8 },
  otpBox: {
    width: 48, height: 58,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.text,
    fontSize: 22, fontWeight: '700',
    textAlign: 'center',
  },
  otpBoxFilled: { borderColor: COLORS.borderFocus },

  alert: { borderRadius: 10, padding: 12, borderLeftWidth: 3 },
  alertInfo:  { backgroundColor: 'rgba(96,165,250,0.1)', borderLeftColor: '#60a5fa' },
  alertError: { backgroundColor: 'rgba(248,113,113,0.1)', borderLeftColor: '#f87171' },
})
