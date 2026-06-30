import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resendVerification } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'

export default function VerifyEmail() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sent, setSent]     = useState(false)
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-5">✉️</div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Verify your email</h2>
        <p className="text-sm text-slate-500 mb-6">
          We sent a link to <strong>{user?.email}</strong>. Click it to activate your account. Check your spam folder if you don't see it.
        </p>
        {sent && (
          <p className="text-sm text-green-600 mb-4">A new verification link has been sent.</p>
        )}
        <div className="flex flex-col gap-2">
          <button onClick={handleResend} disabled={loading || sent}
            className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
            {loading ? 'Sending…' : sent ? 'Link sent ✓' : 'Resend link'}
          </button>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-700">
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
