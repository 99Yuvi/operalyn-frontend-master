import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as apiLogin, getMe } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'

const TRUST_POINTS = [
  { icon: '🎯', text: 'Milestone-based payments — money moves only when you approve' },
  { icon: '✅', text: 'ID-verified freelancers with government-issued credentials' },
  { icon: '💬', text: 'Built-in workspace — chat, files, and contracts in one place' },
]

export default function Login() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [form, setForm]         = useState({ email: '', password: '' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiLogin(form)
      const { data } = await getMe()
      login(data.user, data.profile)
      const roleRedirect = { client: '/client', freelancer: '/freelancer', admin: '/admin' }
      navigate(roleRedirect[data.user.role] ?? '/')
    } catch (err) {
      setError(err?.message ?? 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

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
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: '5px 10px', display: 'inline-flex', alignItems: 'center' }}>
              <img src="/operalynLogo.png" alt="Operalyn" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
            </div>
          </Link>
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#34D399', marginBottom: 16,
          }}>
            Welcome back
          </p>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(26px, 2.4vw, 34px)',
            fontWeight: 700, color: '#F8FAFC',
            lineHeight: 1.2, letterSpacing: '-0.025em',
            marginBottom: 14,
          }}>
            Your projects are<br />waiting for you.
          </h2>
          <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, marginBottom: 36, maxWidth: 320 }}>
            Sign in to manage projects, review proposals, and continue conversations with your team.
          </p>

          {/* Trust points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {TRUST_POINTS.map((t) => (
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
              Sign in to your account
            </h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              Don't have an account?{' '}
              <Link to="/auth/register" style={{ color: '#334155', fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                Create one free →
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

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 20,
                padding: '12px 16px',
                borderRadius: 10,
                background: '#FFF1F2',
                border: '1px solid #FECDD3',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <p style={{ fontSize: 13, color: '#BE123C', lineHeight: 1.5 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 14px',
                    fontSize: 14, color: '#0F172A',
                    border: '1px solid #D1D5DB',
                    borderRadius: 10,
                    background: '#fff',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = '0 0 0 3px rgba(51,65,85,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    Password
                  </label>
                  <Link to="/auth/forgot-password" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none', fontWeight: 500 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#334155' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#64748B' }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={onChange}
                    placeholder="••••••••"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '10px 44px 10px 14px',
                      fontSize: 14, color: '#0F172A',
                      border: '1px solid #D1D5DB',
                      borderRadius: 10,
                      background: '#fff',
                      outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = '0 0 0 3px rgba(51,65,85,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none' }}
                  />
                  {/* Show/hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 15, color: '#94A3B8', padding: 4, lineHeight: 1,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
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
                    Signing in…
                  </>
                ) : (
                  'Sign in →'
                )}
              </button>

            </form>
          </div>

          {/* Footer note */}
          <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
            By signing in, you agree to our{' '}
            <Link to="/" style={{ color: '#64748B', textDecoration: 'underline' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link to="/" style={{ color: '#64748B', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="width: 42%"] { display: none !important; }
        }
      `}</style>
    </div>
  )
}
