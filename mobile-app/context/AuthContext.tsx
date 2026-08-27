/**
 * context/AuthContext.tsx — Auth state for the mobile app.
 * Stores token in Expo SecureStore (encrypted on-device).
 */
import React, {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from 'react'
import * as SecureStore from 'expo-secure-store'
import { getMyProfile } from '../services/api'
import { UserRole, FIELD_ROLES } from '../constants/roles'

interface User {
  id: string
  phone: string
  role: UserRole
  name?: string
  village?: string
  block?: string
  district?: string
  preferred_language?: string
}

interface AuthContextType {
  user:    User | null
  token:   string | null
  role:    UserRole | null
  loading: boolean
  login:   (token: string, role: UserRole, userId: string) => Promise<void>
  logout:  () => Promise<void>
  isFieldUser: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [token,   setToken]   = useState<string | null>(null)
  const [role,    setRole]    = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On mount: restore session from SecureStore
    ;(async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('crop_token')
        const storedRole  = await SecureStore.getItemAsync('crop_role') as UserRole | null
        if (storedToken && storedRole) {
          setToken(storedToken)
          setRole(storedRole)
          const { data } = await getMyProfile()
          setUser(data)
        }
      } catch {
        // Token invalid or network down — clear silently
        await SecureStore.deleteItemAsync('crop_token').catch(() => {})
        await SecureStore.deleteItemAsync('crop_role').catch(() => {})
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const login = useCallback(async (tokenVal: string, roleVal: UserRole, _userId: string) => {
    await SecureStore.setItemAsync('crop_token', tokenVal)
    await SecureStore.setItemAsync('crop_role',  roleVal)
    setToken(tokenVal)
    setRole(roleVal)
  }, [])

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('crop_token').catch(() => {})
    await SecureStore.deleteItemAsync('crop_role').catch(() => {})
    setToken(null)
    setRole(null)
    setUser(null)
  }, [])

  const isFieldUser = role ? FIELD_ROLES.includes(role) : false

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, logout, isFieldUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
