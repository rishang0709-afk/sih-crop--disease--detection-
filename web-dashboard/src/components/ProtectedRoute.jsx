import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute — wraps a component and enforces:
 * 1. Authentication (must have a valid token)
 * 2. Role authorization (if `allowedRoles` is provided)
 *
 * @param {string[]} allowedRoles — list of roles that can access this route
 * @param {React.ReactNode} children — the protected component(s)
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { token, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-center" style={{ flexDirection: 'column', gap: 16 }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Verifying session…</p>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
