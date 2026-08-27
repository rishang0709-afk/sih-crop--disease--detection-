import React from 'react'
import DashboardShell from '../../components/DashboardShell'

const NAV = [
  { icon: '🔬', label: 'Validation Queue', active: true  },
  { icon: '📁', label: 'Reviewed Cases',   active: false },
  { icon: '📊', label: 'Stats',            active: false },
]

const STATS = [
  { label: 'Pending Review',   value: '—', sub: 'Phase 6', color: 'var(--color-warning)' },
  { label: 'Reviewed Today',   value: '—', sub: 'Phase 6' },
  { label: 'Accuracy Rate',    value: '—', sub: 'Phase 4', color: 'var(--color-success)' },
  { label: 'Retraining Labels',value: '—', sub: 'Phase 6', color: 'var(--color-info)' },
]

export default function ExpertDashboard() {
  return (
    <DashboardShell
      title="KVK / Lab Expert Dashboard"
      icon="🔬"
      badge="KVK EXPERT"
      navItems={NAV}
      statCards={STATS}
    >
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔬</div>
        <h3 style={{ marginBottom: 8, color: 'var(--color-text-primary)' }}>Expert Validation Queue — Phase 6</h3>
        <p style={{ fontSize: '0.9rem' }}>
          Low-confidence AI submissions will appear here for expert review in Phase 6.
          Corrected labels feed the retraining dataset. Auth &amp; RBAC live ✅
        </p>
      </div>
    </DashboardShell>
  )
}
