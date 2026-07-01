import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '@/api/auth'

const SECURITY_POINTS = [
  { icon: '🔑', text: 'Choose a strong password with uppercase, numbers, and symbols' },
  { icon: '🔒', text: 'Your old password will stop working immediately after reset' },
  { icon: '📱', text: 'All active sessions on other devices will be signed out' },
]

/* ── Password strength helper ───────────────────────────── */
function getStrength(pwd) {
  let s = 0
  if (pwd.length >= 8) s++
  if (/[A-Z]/.test(pwd)) s++
  if (/[0-9]/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  return s
}
const STRENGTH_META = [
  { label: '',       color: '#E2E8F0' },
  { label: 'Weak',   color: '#EF4444' },
  { label: 'Fair',   color: '#F59E0B' },
  { label: 'Good',   color: '#10B981' },
  { label: 'Strong', color: '#059669' },
]

/* ── Show/hide password button ──────────────────────────── */
function EyeBtn({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 15, color: '#94A3B8', padding: 4, lineHeight: 1,
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#475569'}
      onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? '🙈' : '👁️'}
    </button>
  )
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    email: params.get('email') ?? '',
    password: '',
    password_confirmation: '',
    token: params.get('token') ?? '',
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await resetPassword(form)
      navigate('/auth/login?reset=1')
    } catch (err) {
      if (err?.errors) setErrors(err.errors)
      else setErrors({ _global: err?.message ?? 'Reset failed.' })
    } finally {
      setLoading(false)
    }
  }

  const err = (f) => errors[f]?.[0]
  const pwdStrength  = getStrength(form.password)
  const strengthMeta = STRENGTH_META[pwdStrength]

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* ── LEFT PANEL ──────────────────────────────────── */}
      <div style={{
        width: '42%', flexShrink: 0,
        background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 48px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />
        {/* Glow */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 400, height: 400,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              <span style={{ color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: 'Georgia, serif' }}>O</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>Operalyn</span>
          </Link>
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#34D399', marginBottom: 16,
          }}>
            Secure reset
          </p>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(26px, 2.4vw, 34px)',
            fontWeight: 700, color: '#F8FAFC',
            lineHeight: 1.2, letterSpacing: '-0.025em',
            marginBottom: 14,
          }}>
            Reset your<br />password.
          </h2>
          <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, marginBottom: 36, maxWidth: 320 }}>
            Create a new strong password to secure your account. You'll be signed in automatically after resetting.
          </p>

          {/* Security points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SECURITY_POINTS.map((t) => (
              <div key={t.text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>{t.icon}</span>
                <p style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6, paddingTop: 5 }}>{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 12, color: '#475569' }}>
            © {new Date().getFullYear()} Operalyn Freelance Network Services Pvt. Ltd.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — FORM ───────────────────────────── */}
      <div style={{
        flex: 1, background: '#F8FAFC',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 6 }}>
              Set a new password
            </h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              Remember your password?{' '}
              <Link to="/auth/login" style={{ color: '#334155', fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                Sign in →
              </Link>
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '32px 32px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
          }}>

            {/* Global error */}
            {errors._global && (
              <div style={{
                marginBottom: 20,
                padding: '12px 16px',
                borderRadius: 10,
                background: '#FFF1F2',
                border: '1px solid #FECDD3',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <p style={{ fontSize: 13, color: '#BE123C', lineHeight: 1.5 }}>{errors._global}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Email (pre-filled, read-only display) */}
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={onChange}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '10px 14px', fontSize: 14, color: '#0F172A',
                      border: `1px solid ${err('email') ? '#FCA5A5' : '#D1D5DB'}`,
                      borderRadius: 10, background: '#fff', outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = '0 0 0 3px rgba(51,65,85,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = err('email') ? '#FCA5A5' : '#D1D5DB'; e.target.style.boxShadow = 'none' }}
                  />
                  {err('email') && <p style={{ fontSize: 12, color: '#BE123C', marginTop: 5 }}>{err('email')}</p>}
                </div>

                {/* New password */}
                <div>
                  <label htmlFor="password" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: err('password') ? '#BE123C' : '#374151', marginBottom: 6 }}>
                    New password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={onChange}
                      placeholder="Min. 8 characters"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '10px 44px 10px 14px', fontSize: 14, color: '#0F172A',
                        border: `1px solid ${err('password') ? '#FCA5A5' : '#D1D5DB'}`,
                        borderRadius: 10, background: '#fff', outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = '0 0 0 3px rgba(51,65,85,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = err('password') ? '#FCA5A5' : '#D1D5DB'; e.target.style.boxShadow = 'none' }}
                    />
                    <EyeBtn show={showPass} onToggle={() => setShowPass(v => !v)} />
                  </div>

                  {/* Strength meter */}
                  {form.password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{
                            flex: 1, height: 3, borderRadius: 4,
                            background: i <= pwdStrength ? strengthMeta.color : '#E2E8F0',
                            transition: 'background 0.2s',
                          }} />
                        ))}
                      </div>
                      {strengthMeta.label && (
                        <p style={{ fontSize: 11, color: strengthMeta.color, fontWeight: 600 }}>{strengthMeta.label}</p>
                      )}
                    </div>
                  )}
                  {err('password') && <p style={{ fontSize: 12, color: '#BE123C', marginTop: 5 }}>{err('password')}</p>}
                  {!err('password') && !form.password && (
                    <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 5 }}>Min. 8 chars · 1 uppercase · 1 number</p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="password_confirmation" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: err('password_confirmation') ? '#BE123C' : '#374151', marginBottom: 6 }}>
                    Confirm new password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showConf ? 'text' : 'password'}
                      required
                      value={form.password_confirmation}
                      onChange={onChange}
                      placeholder="Repeat your new password"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '10px 44px 10px 14px', fontSize: 14, color: '#0F172A',
                        border: `1px solid ${err('password_confirmation') ? '#FCA5A5' : form.password_confirmation && form.password === form.password_confirmation ? '#86EFAC' : '#D1D5DB'}`,
                        borderRadius: 10, background: '#fff', outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = '0 0 0 3px rgba(51,65,85,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = err('password_confirmation') ? '#FCA5A5' : form.password_confirmation && form.password === form.password_confirmation ? '#86EFAC' : '#D1D5DB'; e.target.style.boxShadow = 'none' }}
                    />
                    <EyeBtn show={showConf} onToggle={() => setShowConf(v => !v)} />
                    {/* Match indicator */}
                    {form.password_confirmation && form.password === form.password_confirmation && (
                      <span style={{
                        position: 'absolute', right: 38, top: '50%', transform: 'translateY(-50%)',
                        color: '#22C55E', fontSize: 14,
                      }}>✓</span>
                    )}
                  </div>
                  {err('password_confirmation') && <p style={{ fontSize: 12, color: '#BE123C', marginTop: 5 }}>{err('password_confirmation')}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', marginTop: 4,
                    padding: '11px 20px',
                    fontSize: 15, fontWeight: 700,
                    background: loading ? '#94A3B8' : '#334155',
                    color: '#fff',
                    border: 'none', borderRadius: 10,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
                    boxShadow: loading ? 'none' : '0 1px 3px rgba(0,0,0,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#1E293B'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(51,65,85,0.25)' } }}
                  onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#334155'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)' } }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Resetting…
                    </>
                  ) : (
                    'Reset password →'
                  )}
                </button>

              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Spinner animation + mobile hide */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="width: 42%"] { display: none !important; }
        }
      `}</style>
    </div>
  )
}
