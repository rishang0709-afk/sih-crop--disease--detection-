import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

/**
 * Shared dashboard shell — sidebar nav + content area.
 * Used by all officer dashboard pages.
 */
function DashboardShell({ title, icon, badge, statCards, children, navItems }) {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌿</div>
          <div className="sidebar-logo-text">
            Crop Health<br /><span>Advisory</span>
          </div>
        </div>

        {navItems?.map(item => (
          <div key={item.label} className={`sidebar-nav-item ${item.active ? 'active' : ''}`}>
            <span>{item.icon}</span> {item.label}
          </div>
        ))}

        <div className="sidebar-footer">
          <div className="sidebar-nav-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4, paddingBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Signed in as</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{user?.name || 'Officer'}</strong>
            <span className="role-chip" style={{ marginTop: 4 }}>
              {badge || role}
            </span>
          </div>
          <button
            id="logout-btn"
            className="btn btn-ghost btn-full"
            style={{ fontSize: '0.85rem' }}
            onClick={handleLogout}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, background: 'var(--gradient-green)',
                borderRadius: 'var(--radius-md)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
              }}>
                {icon}
              </div>
              <div>
                <h2>{title}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {user?.jurisdiction_name || 'All Jurisdictions'}
                </p>
              </div>
            </div>
            <div className="badge badge-green">● Live</div>
          </div>

          {/* Stat cards */}
          {statCards && (
            <div className="stat-grid">
              {statCards.map(s => (
                <div key={s.label} className="glass-card stat-card fade-in">
                  <div className="stat-card-label">{s.label}</div>
                  <div className="stat-card-value" style={{ color: s.color || 'var(--color-text-primary)' }}>{s.value}</div>
                  <div className="stat-card-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardShell
