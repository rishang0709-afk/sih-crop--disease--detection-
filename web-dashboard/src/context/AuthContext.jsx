import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMyProfile } from '../services/api'

const AuthContext = createContext(null)

export const ROLE_ROUTES = {
  FARMER:                 null,  // mobile only
  PRADHAN:                null,  // mobile only
  BDO:                    '/dashboard/bdo',
  AGRICULTURE_OFFICER:    '/dashboard/officer',
  HORTICULTURE_OFFICER:   '/dashboard/officer',
  DISTRICT_STATE_OFFICIAL:'/dashboard/district',
  KVK_LAB_EXPERT:         '/dashboard/expert',
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('crop_token'))
  const [role, setRole]       = useState(() => localStorage.getItem('crop_role'))
  const [loading, setLoading] = useState(!!localStorage.getItem('crop_token'))

  const login = useCallback((tokenValue, roleValue, userId) => {
    localStorage.setItem('crop_token',   tokenValue)
    localStorage.setItem('crop_role',    roleValue)
    localStorage.setItem('crop_user_id', userId || '')
    setToken(tokenValue)
    setRole(roleValue)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('crop_token')
    localStorage.removeItem('crop_role')
    localStorage.removeItem('crop_user_id')
    setToken(null)
    setRole(null)
    setUser(null)
  }, [])

  // On mount, validate stored token by fetching profile
  useEffect(() => {
    if (!token) { setLoading(false); return }
    getMyProfile()
      .then(({ data }) => { setUser(data); setRole(data.role) })
      .catch(() => { logout() })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, logout, ROLE_ROUTES }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
