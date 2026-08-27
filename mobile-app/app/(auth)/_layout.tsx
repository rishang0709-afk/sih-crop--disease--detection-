/**
 * app/(auth)/_layout.tsx — Auth stack layout (login + register screens).
 */
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0f0d' } }}>
      <Stack.Screen name="login"    />
      <Stack.Screen name="register" />
    </Stack>
  )
}
