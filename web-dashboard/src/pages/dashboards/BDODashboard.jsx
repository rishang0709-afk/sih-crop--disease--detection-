import React from 'react'
import DashboardShell from '../../components/DashboardShell'

const NAV = [
  { icon: '📊', label: 'Overview',        active: true  },
  { icon: '✅', label: 'Subsidy Approvals', active: false },
  { icon: '📋', label: 'Reports',          active: false },
  { icon: '⚙️', label: 'Settings',         active: false },
]

const STATS = [
  { label: 'Pending Subsidies', value: '—', sub: 'Phase 9', color: 'var(--color-warning)' },
  { label: 'Active Villages',   value: '—', sub: 'Phase 7' },
  { label: 'Total Submissions', value: '—', sub: 'Phase 3' },
  { label: 'Resolved Cases',    value: '—', sub: 'Phase 6' },
]

export default function BDODashboard() {
  return (
    <DashboardShell
      title="BDO Dashboard"
      icon="🏛️"
      badge="BDO"
      navItems={NAV}
      statCards={STATS}
    >
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚧</div>
        <h3 style={{ marginBottom: 8, color: 'var(--color-text-primary)' }}>Subsidy Workflow — Phase 9</h3>
        <p style={{ fontSize: '0.9rem' }}>
          The full subsidy approval workflow with audit trail will be built in Phase 9.
          Auth &amp; role-based access is live — you're logged in as a BDO. ✅
        </p>
      </div>
    </DashboardShell>
  )
}
