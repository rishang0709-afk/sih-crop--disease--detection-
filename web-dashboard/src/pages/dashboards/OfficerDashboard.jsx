import React from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardShell from '../../components/DashboardShell'

const NAV = [
  { icon: '🗺️', label: 'Hotspot Map',    active: true  },
  { icon: '📸', label: 'Submissions',    active: false },
  { icon: '⛺', label: 'Schedule Camp',  active: false },
  { icon: '📊', label: 'Analytics',      active: false },
]

const STATS = [
  { label: 'Red Zones',          value: '—', sub: 'Phase 7', color: 'var(--color-danger)' },
  { label: 'Orange Zones',       value: '—', sub: 'Phase 7', color: 'var(--color-warning)' },
  { label: 'Submissions Today',  value: '—', sub: 'Phase 3' },
  { label: 'Pending Expert Review', value: '—', sub: 'Phase 6', color: 'var(--color-info)' },
]

export default function OfficerDashboard() {
  const { role } = useAuth()
  const isHort = role === 'HORTICULTURE_OFFICER'

  return (
    <DashboardShell
      title={isHort ? 'Horticulture Officer Dashboard' : 'Agriculture Officer Dashboard'}
      icon={isHort ? '🍎' : '🌾'}
      badge={isHort ? 'HORT. OFFICER' : 'AGRI. OFFICER'}
      navItems={NAV}
      statCards={STATS}
    >
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🗺️</div>
        <h3 style={{ marginBottom: 8, color: 'var(--color-text-primary)' }}>Hotspot Map — Phase 7</h3>
        <p style={{ fontSize: '0.9rem' }}>
          The geospatial disease hotspot map (Red/Orange/Green zones, PostGIS + Leaflet)
          will be built in Phase 7. Auth &amp; RBAC is live ✅
        </p>
      </div>
    </DashboardShell>
  )
}
