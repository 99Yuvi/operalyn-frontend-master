import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as apiRegister } from '@/api/auth'

/* ── Role-specific left panel content ───────────────────── */
const ROLE_CONTENT = {
  freelancer: {
    badge:      'For Freelancers',
    badgeColor: '#34D399',
    title:      'Your skills have\na market here.',
    desc:       'Browse real projects, submit proposals, and get paid milestone by milestone — in INR.',
    points: [
      { icon: '🔍', text: 'Browse curated projects filtered by category and budget' },
      { icon: '💰', text: 'Get paid per milestone — clear scope, no payment disputes' },
      { icon: '⭐', text: 'Build your verified profile and stand out with reviews' },
    ],
  },
  client: {
    badge:      'For Clients',
    badgeColor: '#818CF8',
    title:      'Hire the right\nprofessional, fast.',
    desc:       'Post a project, receive proposals from verified freelancers, and pay only when satisfied.',
    points: [
      { icon: '✅', text: 'Every freelancer is ID-verified before getting a badge' },
      { icon: '🎯', text: 'Pay per milestone — money moves only when you approve' },
      { icon: '💬', text: 'Built-in workspace for chat, files, and contracts in one place' },
    ],
  },
}

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

export default function Register() {
  const navigate  = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '', role: 'freelancer',
  })
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined, _global: undefined }))
  }
  const setRole = (r) => setForm((f) => ({ ...f, role: r }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await apiRegister(form)
      setDone(true)
    } catch (err) {
      if (err?.errors) setErrors(err.errors)
      else setErrors({ _global: err?.message ?? 'Registration failed.' })
    } finally {
      setLoading(false)
    }
  }

  const err   = (field) => errors[field]?.[0]
  const panel = ROLE_CONTENT[form.role]
  const pwdStrength = getStrength(form.password)
  const strengthMeta = STRENGTH_META[pwdStrength]

  /* ── Success state ──────────────────────────────────────── */
  if (done) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#F8FAFC', fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
        padding: 24,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#ECFDF5', border: '2px solid #A7F3D0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: 32,
          }}>
            ✉️
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 10, letterSpacing: '-0.02em' }}>
            Check your email
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 8 }}>
            We sent a verification link to
          </p>
          <p style={{
            fontSize: 14, fontWeight: 600, color: '#334155',
            background: '#F1F5F9', border: '1px solid #E2E8F0',
            borderRadius: 8, padding: '8px 16px', display: 'inline-block', marginBottom: 28,
          }}>
            {form.email}
          </p>
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 32, lineHeight: 1.6 }}>
            Click the link in the email to activate your account. Check your spam folder if you don't see it.
          </p>
          <Link to="/auth/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 24px', fontSize: 14, fontWeight: 600,
            background: '#334155', color: '#fff',
            textDecoration: 'none', borderRadius: 10,
          }}>
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  /* ── Main layout ────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* ── LEFT PANEL ──────────────────────────────────── */}
      <div style={{
        width: '42%', flexShrink: 0,
        background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 48px',
        position: 'relative', overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}>
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />
        {/* Glow — color shifts per role */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 400, height: 400,
          background: form.role === 'client'
            ? 'radial-gradient(ellipse, rgba(129,140,248,0.1) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(52,211,153,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
          transition: 'background 0.5s ease',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: '5px 10px', display: 'inline-flex', alignItems: 'center' }}>
              <img src="/operalynLogo.png" alt="Operalyn" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
            </div>
          </Link>
        </div>

        {/* Dynamic content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: panel.badgeColor, marginBottom: 16,
            transition: 'color 0.3s ease',
          }}>
            {panel.badge}
          </span>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(24px, 2.2vw, 34px)',
            fontWeight: 700, color: '#F8FAFC',
            lineHeight: 1.2, letterSpacing: '-0.025em',
            marginBottom: 14,
            whiteSpace: 'pre-line',
          }}>
            {panel.title}
          </h2>
          <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, marginBottom: 36, maxWidth: 320 }}>
            {panel.desc}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {panel.points.map((p) => (
              <div key={p.text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>{p.icon}</span>
                <p style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6, paddingTop: 5 }}>{p.text}</p>
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
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 6 }}>
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              Already have an account?{' '}
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
            padding: '28px 28px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
          }}>

            {/* Role selector */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 10, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                I want to
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { r: 'freelancer', icon: '💼', title: 'Find work', sub: "I'm a freelancer" },
                  { r: 'client',     icon: '🎯', title: 'Hire talent', sub: "I'm a client" },
                ].map(({ r, icon, title, sub }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      padding: '14px 12px',
                      borderRadius: 10,
                      border: form.role === r ? '2px solid #334155' : '1.5px solid #E2E8F0',
                      background: form.role === r ? '#F8FAFC' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                      boxShadow: form.role === r ? '0 0 0 3px rgba(51,65,85,0.08)' : 'none',
                    }}
                    onMouseEnter={e => { if (form.role !== r) e.currentTarget.style.borderColor = '#CBD5E1' }}
                    onMouseLeave={e => { if (form.role !== r) e.currentTarget.style.borderColor = '#E2E8F0' }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: form.role === r ? '#0F172A' : '#374151', marginBottom: 2 }}>{title}</p>
                    <p style={{ fontSize: 12, color: '#94A3B8' }}>{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Global error */}
            {errors._global && (
              <div style={{
                marginBottom: 18, padding: '12px 14px', borderRadius: 10,
                background: '#FFF1F2', border: '1px solid #FECDD3',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
                <p style={{ fontSize: 13, color: '#BE123C', lineHeight: 1.5 }}>{errors._global}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Name */}
                <InputField
                  label="Full name" id="name" name="name"
                  value={form.name} onChange={onChange}
                  error={err('name')} placeholder="Arjun Singh"
                />

                {/* Email */}
                <InputField
                  label="Email address" id="email" name="email" type="email"
                  value={form.email} onChange={onChange}
                  error={err('email')} placeholder="you@example.com"
                />

                {/* Password */}
                <div>
                  <label htmlFor="password" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: err('password') ? '#BE123C' : '#374151', marginBottom: 6 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password" name="password"
                      type={showPass ? 'text' : 'password'}
                      value={form.password} onChange={onChange}
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
                    Confirm password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password_confirmation" name="password_confirmation"
                      type={showConf ? 'text' : 'password'}
                      value={form.password_confirmation} onChange={onChange}
                      placeholder="Repeat your password"
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
                    padding: '12px 20px',
                    fontSize: 15, fontWeight: 700,
                    background: loading ? '#94A3B8' : '#334155',
                    color: '#fff', border: 'none', borderRadius: 10,
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
                      Creating account…
                    </>
                  ) : (
                    `Create ${form.role === 'freelancer' ? 'freelancer' : 'client'} account →`
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer note */}
          <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
            By creating an account, you agree to our{' '}
            <Link to="/" style={{ color: '#64748B', textDecoration: 'underline' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link to="/" style={{ color: '#64748B', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="width: 42%"] { display: none !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Reusable input field ───────────────────────────────── */
function InputField({ label, id, name, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: error ? '#BE123C' : '#374151', marginBottom: 6 }}>
        {label}
      </label>
      <input
        id={id} name={name} type={type} value={value}
        onChange={onChange} placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '10px 14px', fontSize: 14, color: '#0F172A',
          border: `1px solid ${error ? '#FCA5A5' : '#D1D5DB'}`,
          borderRadius: 10, background: '#fff', outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = '0 0 0 3px rgba(51,65,85,0.1)' }}
        onBlur={e => { e.target.style.borderColor = error ? '#FCA5A5' : '#D1D5DB'; e.target.style.boxShadow = 'none' }}
      />
      {error && <p style={{ fontSize: 12, color: '#BE123C', marginTop: 5 }}>{error}</p>}
    </div>
  )
}

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
