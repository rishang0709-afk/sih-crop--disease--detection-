import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { registerOfficer } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { value: 'BDO',                    label: 'Block Development Officer (BDO)',  icon: '🏛️' },
  { value: 'AGRICULTURE_OFFICER',    label: 'Agriculture Officer',              icon: '🌾' },
  { value: 'HORTICULTURE_OFFICER',   label: 'Horticulture Officer',            icon: '🍎' },
  { value: 'DISTRICT_STATE_OFFICIAL',label: 'District / State Official',        icon: '🗺️' },
  { value: 'KVK_LAB_EXPERT',         label: 'KVK / Lab Expert (Validator)',     icon: '🔬' },
]

const JURISDICTION_TYPES = [
  { value: 'village',  label: 'Village' },
  { value: 'block',    label: 'Block / Tehsil' },
  { value: 'district', label: 'District' },
  { value: 'state',    label: 'State' },
]

export default function Register() {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const { login, ROLE_ROUTES } = useAuth()

  const [form, setForm] = useState({
    phone:             localStorage.getItem('_reg_phone') || '',
    code:              localStorage.getItem('_reg_code')  || '',
    role:              params.get('role') || '',
    name:              '',
    designation:       '',
    jurisdiction_type: 'district',
    jurisdiction_name: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If no phone/code in storage, user came here directly — redirect to login
    if (!form.phone || !form.code) navigate('/login', { replace: true })
  }, []) // eslint-disable-line

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.role)              { setError('Please select a role.'); return }
    if (!form.name.trim())       { setError('Name is required.'); return }
    if (!form.designation.trim()){ setError('Designation is required.'); return }
    if (!form.jurisdiction_name.trim()) { setError('Jurisdiction name is required.'); return }

    setLoading(true)
    try {
      const { data } = await registerOfficer(form)
      localStorage.removeItem('_reg_phone')
      localStorage.removeItem('_reg_code')
      login(data.token, data.role, data.user_id)
      navigate(ROLE_ROUTES[data.role] || '/dashboard/officer', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = ROLES.find(r => r.value === form.role)

  return (
    <div className="page-center">
      <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 520, padding: '40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, background: 'var(--gradient-green)',
            borderRadius: 'var(--radius-md)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', margin: '0 auto 16px', boxShadow: 'var(--shadow-glow)',
          }}>
            {selectedRole?.icon || '👤'}
          </div>
          <h2>Create Officer Account</h2>
          <p style={{ marginTop: 6, fontSize: '0.9rem' }}>
            Phone verified: <strong style={{ color: 'var(--color-green-400)' }}>{form.phone}</strong>
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form id="register-officer-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Role selector */}
          <div className="form-group">
            <label className="form-label" htmlFor="role-select">Your Role</label>
            <select
              id="role-select"
              className="form-select"
              value={form.role}
              onChange={set('role')}
              required
            >
              <option value="">— Select role —</option>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.icon} {r.label}</option>
              ))}
            </select>
          </div>

          {/* Full name */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              className="form-input"
              placeholder="e.g. Dr. Priya Sharma"
              value={form.name}
              onChange={set('name')}
              required
            />
          </div>

          {/* Designation */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-designation">Designation</label>
            <input
              id="reg-designation"
              className="form-input"
              placeholder="e.g. Senior Agriculture Officer"
              value={form.designation}
              onChange={set('designation')}
              required
            />
          </div>

          {/* Jurisdiction */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="jurisdiction-type">Jurisdiction Level</label>
              <select
                id="jurisdiction-type"
                className="form-select"
                value={form.jurisdiction_type}
                onChange={set('jurisdiction_type')}
              >
                {JURISDICTION_TYPES.map(j => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="jurisdiction-name">Jurisdiction Name</label>
              <input
                id="jurisdiction-name"
                className="form-input"
                placeholder="e.g. Pune District"
                value={form.jurisdiction_name}
                onChange={set('jurisdiction_name')}
                required
              />
            </div>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? <><div className="spinner" /> Creating account…</> : 'Complete Registration →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-green-400)', fontWeight: 600 }}>Sign in</Link>
        </p>

      </div>
    </div>
  )
}
