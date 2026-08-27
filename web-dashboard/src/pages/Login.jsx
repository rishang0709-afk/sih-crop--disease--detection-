import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { sendOTP, verifyOTP } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STEPS = { PHONE: 'phone', OTP: 'otp', ROLE_SELECT: 'role_select' }

const OFFICER_ROLES = [
  { value: 'BDO',                    label: 'Block Development Officer (BDO)',  icon: '🏛️' },
  { value: 'AGRICULTURE_OFFICER',    label: 'Agriculture Officer',              icon: '🌾' },
  { value: 'HORTICULTURE_OFFICER',   label: 'Horticulture Officer',            icon: '🍎' },
  { value: 'DISTRICT_STATE_OFFICIAL',label: 'District / State Official',        icon: '🗺️' },
  { value: 'KVK_LAB_EXPERT',         label: 'KVK / Lab Expert (Validator)',     icon: '🔬' },
]

export default function Login() {
  const navigate   = useNavigate()
  const { login, ROLE_ROUTES, token } = useAuth()

  const [step, setStep]         = useState(STEPS.PHONE)
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState(['', '', '', '', '', ''])
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [countdown, setCountdown] = useState(0)

  const otpRefs = useRef([])

  // Redirect already-logged-in users
  useEffect(() => {
    if (token) {
      const role = localStorage.getItem('crop_role')
      const route = ROLE_ROUTES[role]
      if (route) navigate(route, { replace: true })
    }
  }, [token]) // eslint-disable-line

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // ── Phone step ────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    const cleaned = phone.trim()
    if (!/^\+?[\d\s\-]{10,}$/.test(cleaned)) {
      setError('Enter a valid phone number (10 digits or +91XXXXXXXXXX)')
      return
    }
    setLoading(true)
    try {
      await sendOTP(cleaned)
      setStep(STEPS.OTP)
      setCountdown(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── OTP digit handlers ────────────────────────────────────────
  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && idx > 0) otpRefs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      otpRefs.current[5]?.focus()
    }
    e.preventDefault()
  }

  // ── Verify OTP ────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setError('Enter all 6 digits'); return }
    setError('')
    setLoading(true)
    try {
      const { data } = await verifyOTP(phone.trim(), code)
      if (!data.needs_registration) {
        // Existing user → log in
        login(data.token, data.role)
        const route = ROLE_ROUTES[data.role]
        navigate(route || '/dashboard/officer', { replace: true })
      } else {
        // New user — store OTP for registration and pick role
        localStorage.setItem('_reg_phone', phone.trim())
        localStorage.setItem('_reg_code',  code)
        setStep(STEPS.ROLE_SELECT)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    setError('')
    setOtp(['', '', '', '', '', ''])
    try {
      await sendOTP(phone.trim())
      setCountdown(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err) {
      setError('Failed to resend OTP.')
    }
  }

  // ── Role select (officer) → navigate to register ──────────────
  const handleRoleSelect = (roleValue) => {
    navigate(`/register?role=${roleValue}`)
  }

  const otpCode = otp.join('')
  const isOtpFilled = otpCode.length === 6

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="page-center">
      <div className="glass-card auth-card fade-in">

        {/* Logo + title */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64,
            background: 'var(--gradient-green)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', boxShadow: 'var(--shadow-glow)',
          }}>🌿</div>
          <div>
            <h1 style={{ marginBottom: 4 }}>Crop Health Advisory</h1>
            <p style={{ fontSize: '0.9rem' }}>
              {step === STEPS.PHONE && 'Sign in to your officer dashboard'}
              {step === STEPS.OTP   && 'Enter the OTP sent to your phone'}
              {step === STEPS.ROLE_SELECT && 'Select your role to continue'}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="step-bar" style={{ justifyContent: 'center' }}>
          {[STEPS.PHONE, STEPS.OTP, STEPS.ROLE_SELECT].map((s, i) => (
            <div
              key={s}
              className={`step-dot ${step === s ? 'active' : i < [STEPS.PHONE, STEPS.OTP, STEPS.ROLE_SELECT].indexOf(step) ? 'done' : ''}`}
            />
          ))}
        </div>

        {/* Error */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* ── STEP 1: Phone ── */}
        {step === STEPS.PHONE && (
          <form onSubmit={handleSendOTP} id="login-phone-form" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="phone-input">Mobile Number</label>
              <input
                id="phone-input"
                className="form-input"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                autoFocus
                required
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                A 6-digit OTP will be sent via SMS
              </span>
            </div>

            <button
              id="send-otp-btn"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading || !phone.trim()}
            >
              {loading ? <><div className="spinner" /> Sending…</> : 'Send OTP →'}
            </button>

            <div className="divider">OR</div>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              New officer? <Link to="/register" style={{ color: 'var(--color-green-400)', fontWeight: 600 }}>Register here</Link>
            </p>

            {/* Dev hint */}
            <div className="alert alert-info" style={{ fontSize: '0.8rem' }}>
              🛠️ <strong>Dev mode:</strong> Any phone works. Enter <strong>123456</strong> as OTP.
            </div>
          </form>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === STEPS.OTP && (
          <form onSubmit={handleVerifyOTP} id="verify-otp-form" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem' }}>
                Sent to <strong style={{ color: 'var(--color-text-primary)' }}>{phone}</strong>
              </p>
              <button
                type="button"
                onClick={() => { setStep(STEPS.PHONE); setOtp(['','','','','','']) }}
                style={{ fontSize: '0.8rem', color: 'var(--color-green-400)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
              >
                Change number
              </button>
            </div>

            <div className="otp-inputs" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-digit-${i}`}
                  ref={el => otpRefs.current[i] = el}
                  className="otp-digit"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button
              id="verify-otp-btn"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading || !isOtpFilled}
            >
              {loading ? <><div className="spinner" /> Verifying…</> : 'Verify OTP →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Didn't receive it?{' '}
              <button
                id="resend-otp-btn"
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0}
                style={{
                  background: 'none', border: 'none', cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  color: countdown > 0 ? 'var(--color-text-muted)' : 'var(--color-green-400)',
                  fontWeight: 600, fontSize: 'inherit',
                }}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </p>
          </form>
        )}

        {/* ── STEP 3: Role select (for new users) ── */}
        {step === STEPS.ROLE_SELECT && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', marginBottom: 4 }}>
              Phone verified! Select your role to complete registration.
            </p>
            {OFFICER_ROLES.map(r => (
              <button
                key={r.value}
                id={`role-${r.value.toLowerCase()}`}
                className="btn btn-ghost"
                style={{ justifyContent: 'flex-start', gap: 14, padding: '14px 18px', fontSize: '0.95rem' }}
                onClick={() => handleRoleSelect(r.value)}
              >
                <span style={{ fontSize: '1.4rem' }}>{r.icon}</span>
                {r.label}
              </button>
            ))}
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
              Farmer / Pradhan? Use the mobile app instead.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
