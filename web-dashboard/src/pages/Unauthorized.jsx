import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Unauthorized() {
  const { role, ROLE_ROUTES } = useAuth()
  const homeRoute = (role && ROLE_ROUTES[role]) || '/login'

  return (
    <div className="page-center" style={{ flexDirection: 'column', gap: 24, textAlign: 'center' }}>
      <div style={{ fontSize: '4rem' }}>🔒</div>
      <div>
        <h2>Access Denied</h2>
        <p style={{ marginTop: 8 }}>You don't have permission to view this page.</p>
        {role && <p style={{ marginTop: 4, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Your role: <strong>{role}</strong></p>}
      </div>
      <Link to={homeRoute} className="btn btn-primary">
        ← Back to your dashboard
      </Link>
    </div>
  )
}
