import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '@/api/auth'

export default function ForgotPassword() {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword({ email })
      setSent(true)
    } catch (err) {
      setError(err?.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>Operalyn</h1>
          <p className="text-sm text-slate-500 mt-1">Reset your password</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          {sent ? (
            <div className="text-center">
              <p className="text-sm text-slate-600">
                If <strong>{email}</strong> is registered, a reset link has been sent. Check your inbox.
              </p>
              <Link to="/auth/login" className="mt-4 inline-block text-sm font-medium text-slate-700 hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
              )}
              <p className="text-sm text-slate-500">
                Enter your email and we'll send a reset link.
              </p>
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                <input
                  id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors">
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <p className="text-center text-sm text-slate-500">
                <Link to="/auth/login" className="font-medium text-slate-700 hover:underline">Back to sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
