/**
 * app/(auth)/register.tsx — Farmer/Pradhan registration screen.
 * Collects name, village, block, district, and preferred language.
 */
import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { registerFarmer } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { UserRole, SUPPORTED_LANGUAGES } from '../../constants/roles'

const COLORS = {
  bg: '#0a0f0d', bgCard: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)',
  green: '#4ade80', text: '#f0fdf4', textSub: 'rgba(240,253,244,0.6)',
  textMuted: 'rgba(240,253,244,0.35)', error: '#f87171',
}

const FIELD_ROLES = [
  { value: 'FARMER',  label: '👨‍🌾  Farmer',           desc: 'Individual farm owner' },
  { value: 'PRADHAN', label: '🏘️  Pradhan',           desc: 'Village head (bulk upload)' },
]

export default function RegisterScreen() {
  const { phone, code } = useLocalSearchParams<{ phone: string; code: string }>()
  const router = useRouter()
  const { login } = useAuth()

  const [form, setForm] = useState({
    role:               'FARMER' as 'FARMER' | 'PRADHAN',
    name:               '',
    village:            '',
    block:              '',
    district:           '',
    preferred_language: 'hi',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: keyof typeof form) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.name.trim())     { setError('Please enter your name'); return }
    if (!form.village.trim())  { setError('Please enter your village'); return }
    if (!form.block.trim())    { setError('Please enter your block'); return }
    if (!form.district.trim()) { setError('Please enter your district'); return }

    setError('')
    setLoading(true)
    try {
      const { data } = await registerFarmer({ phone, code, ...form })
      await login(data.token, data.role as UserRole, data.user_id)
      router.replace('/(tabs)/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Phone: {phone}</Text>
        </View>

        {!!error && (
          <View style={styles.alertError}>
            <Text style={{ color: '#fca5a5', fontSize: 14 }}>{error}</Text>
          </View>
        )}

        <View style={styles.card}>

          {/* Role selector */}
          <Text style={styles.label}>I am a…</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {FIELD_ROLES.map(r => (
              <TouchableOpacity
                key={r.value}
                testID={`role-${r.value.toLowerCase()}`}
                style={[styles.roleBtn, form.role === r.value && styles.roleBtnActive]}
                onPress={() => set('role')(r.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.roleLabel}>{r.label}</Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            testID="reg-name"
            style={styles.input}
            placeholder="e.g. Ramesh Kumar"
            placeholderTextColor={COLORS.textMuted}
            value={form.name}
            onChangeText={set('name')}
          />

          {/* Village */}
          <Text style={styles.label}>Village</Text>
          <TextInput
            testID="reg-village"
            style={styles.input}
            placeholder="e.g. Dhakoli"
            placeholderTextColor={COLORS.textMuted}
            value={form.village}
            onChangeText={set('village')}
          />

          {/* Block */}
          <Text style={styles.label}>Block / Tehsil</Text>
          <TextInput
            testID="reg-block"
            style={styles.input}
            placeholder="e.g. Zirakpur"
            placeholderTextColor={COLORS.textMuted}
            value={form.block}
            onChangeText={set('block')}
          />

          {/* District */}
          <Text style={styles.label}>District</Text>
          <TextInput
            testID="reg-district"
            style={styles.input}
            placeholder="e.g. SAS Nagar"
            placeholderTextColor={COLORS.textMuted}
            value={form.district}
            onChangeText={set('district')}
          />

          {/* Language selector */}
          <Text style={styles.label}>Preferred Language</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {SUPPORTED_LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  testID={`lang-${lang.code}`}
                  style={[styles.langChip, form.preferred_language === lang.code && styles.langChipActive]}
                  onPress={() => set('preferred_language')(lang.code)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 18 }}>{lang.flag}</Text>
                  <Text style={[styles.langLabel, form.preferred_language === lang.code && { color: COLORS.text }]}>
                    {lang.label.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            testID="register-submit-btn"
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#052e16" />
              : <Text style={styles.btnText}>Complete Registration  →</Text>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll:    { flexGrow: 1, padding: 24, gap: 20 },
  header:    { alignItems: 'center', gap: 6, paddingTop: 20 },
  title:     { fontSize: 24, fontWeight: '800', color: COLORS.text },
  subtitle:  { fontSize: 14, color: COLORS.textSub },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, padding: 24, gap: 12,
  },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.textSub, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    color: COLORS.text, fontSize: 16, padding: 14,
  },
  roleBtn: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 14, padding: 14, alignItems: 'center', gap: 4,
  },
  roleBtnActive: { borderColor: COLORS.green, backgroundColor: 'rgba(74,222,128,0.08)' },
  roleLabel:     { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  roleDesc:      { color: COLORS.textMuted, fontSize: 11 },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  langChipActive: { borderColor: COLORS.green, backgroundColor: 'rgba(74,222,128,0.08)' },
  langLabel:      { color: COLORS.textSub, fontSize: 12 },
  btn: {
    backgroundColor: '#22c55e', borderRadius: 14, padding: 18,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#4ade80', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  btnDisabled: { opacity: 0.5 },
  btnText:     { color: '#052e16', fontWeight: '700', fontSize: 17 },
  alertError: {
    backgroundColor: 'rgba(248,113,113,0.1)', borderLeftWidth: 3,
    borderLeftColor: '#f87171', borderRadius: 10, padding: 12,
  },
})
