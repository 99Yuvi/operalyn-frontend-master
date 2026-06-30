import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as apiLogin, getMe } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
            Operalyn
          </h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link to="/auth/forgot-password" className="text-xs text-slate-500 hover:text-slate-700">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/auth/register" className="font-medium text-slate-700 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
