import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resendVerification } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'

export default function VerifyEmail() {
  const { user, logout }  = useAuth()
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    setLoading(true)
    try {
      await resendVerification()
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F8FAFC',
      fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Icon circle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: '#EFF6FF', border: '2px solid #BFDBFE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34,
          }}>
            ✉️
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{
            fontSize: 24, fontWeight: 700, color: '#0F172A',
            letterSpacing: '-0.02em', marginBottom: 10,
          }}>
            Verify your email
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>
            We sent a verification link to
          </p>
          {user?.email && (
            <p style={{
              fontSize: 14, fontWeight: 600, color: '#334155',
              background: '#F1F5F9', border: '1px solid #E2E8F0',
              borderRadius: 8, padding: '8px 16px',
              display: 'inline-block', marginTop: 8, marginBottom: 0,
            }}>
              {user.email}
            </p>
          )}
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7, marginBottom: 28 }}>
          Click the link in the email to activate your account. Check your spam or junk folder if you don't see it in your inbox.
        </p>

        {/* Success notice */}
        {sent && (
          <div style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 10,
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>✅</span>
            <p style={{ fontSize: 13, color: '#15803D', lineHeight: 1.5 }}>
              A new verification link has been sent to your email.
            </p>
          </div>
        )}

        {/* Card */}
        <div style={{
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: '28px 28px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={loading || sent}
            style={{
              width: '100%',
              padding: '11px 20px',
              fontSize: 15, fontWeight: 700,
              background: loading || sent ? '#94A3B8' : '#334155',
              color: '#fff',
              border: 'none', borderRadius: 10,
              cursor: loading || sent ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
              boxShadow: loading || sent ? 'none' : '0 1px 3px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { if (!loading && !sent) { e.currentTarget.style.background = '#1E293B'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(51,65,85,0.25)' } }}
            onMouseLeave={e => { if (!loading && !sent) { e.currentTarget.style.background = '#334155'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)' } }}
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
                Sending…
              </>
            ) : sent ? (
              'Link sent ✓'
            ) : (
              'Resend verification email'
            )}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <span style={{ fontSize: 12, color: '#94A3B8' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          {/* Back to login link */}
          <div style={{ textAlign: 'center' }}>
            <Link
              to="/auth/login"
              style={{
                fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              ← Back to sign in
            </Link>
          </div>
        </div>

        {/* Sign out */}
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={logout}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: '#94A3B8', padding: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#475569'}
            onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
          >
            Sign out of this account
          </button>
        </p>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
