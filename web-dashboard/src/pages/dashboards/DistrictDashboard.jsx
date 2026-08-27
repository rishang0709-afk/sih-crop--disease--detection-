import React from 'react'
import DashboardShell from '../../components/DashboardShell'

const NAV = [
  { icon: '🗺️', label: 'State Overview',    active: true  },
  { icon: '📈', label: 'Trend Analysis',    active: false },
  { icon: '💰', label: 'Budget Planning',   active: false },
  { icon: '📦', label: 'Supply Chain',      active: false },
]

const STATS = [
  { label: 'Districts Monitored', value: '—', sub: 'Phase 7' },
  { label: 'Active Outbreaks',    value: '—', sub: 'Phase 7', color: 'var(--color-danger)' },
  { label: 'Farmers Registered',  value: '—', sub: 'Phase 1' },
  { label: 'Subsidies Approved',  value: '—', sub: 'Phase 9', color: 'var(--color-success)' },
]

export default function DistrictDashboard() {
  return (
    <DashboardShell
      title="District / State Dashboard"
      icon="🗺️"
      badge="DISTRICT OFFICIAL"
      navItems={NAV}
      statCards={STATS}
    >
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📊</div>
        <h3 style={{ marginBottom: 8, color: 'var(--color-text-primary)' }}>Aggregate Trend View — Phase 7 &amp; 8</h3>
        <p style={{ fontSize: '0.9rem' }}>
          State-wide hotspot aggregation, weather-overlaid risk forecasting, and budget planning
          will be available from Phase 7 onwards. Auth &amp; RBAC live ✅
        </p>
      </div>
    </DashboardShell>
  )
}
