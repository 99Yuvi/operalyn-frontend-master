import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '@/api/auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    email: params.get('email') ?? '',
    password: '',
    password_confirmation: '',
    token: params.get('token') ?? '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>Operalyn</h1>
          <p className="text-sm text-slate-500 mt-1">Set a new password</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          {errors._global && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{errors._global}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
              {err('email') && <p className="text-xs text-red-600">{err('email')}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">New password</label>
              <input id="password" name="password" type="password" required value={form.password} onChange={onChange}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 ${err('password') ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-slate-400'}`} />
              {err('password') && <p className="text-xs text-red-600">{err('password')}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700">Confirm password</label>
              <input id="password_confirmation" name="password_confirmation" type="password" required value={form.password_confirmation} onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors">
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
