import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as apiRegister } from '@/api/auth'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '', role: 'freelancer',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
  }

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

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Check your email</h2>
          <p className="text-sm text-slate-500">
            We sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.
          </p>
          <Link to="/auth/login" className="mt-6 inline-block text-sm font-medium text-slate-700 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  const err = (field) => errors[field]?.[0]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
            Operalyn
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create your account</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          {errors._global && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {errors._global}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="flex gap-2 p-1 rounded-lg bg-slate-100">
              {['freelancer', 'client'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    form.role === r
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {r === 'freelancer' ? "I'm a freelancer" : "I'm hiring"}
                </button>
              ))}
            </div>

            <Field label="Full name" id="name" name="name" value={form.name} onChange={onChange} error={err('name')} placeholder="Arjun Singh" />
            <Field label="Email address" id="email" name="email" type="email" value={form.email} onChange={onChange} error={err('email')} placeholder="you@example.com" />
            <Field label="Password" id="password" name="password" type="password" value={form.password} onChange={onChange} error={err('password')} helper="Min 8 chars, 1 uppercase, 1 number" />
            <Field label="Confirm password" id="password_confirmation" name="password_confirmation" type="password" value={form.password_confirmation} onChange={onChange} error={err('password_confirmation')} />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-medium text-slate-700 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, id, name, type = 'text', value, onChange, error, helper, placeholder }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={`block text-sm font-medium ${error ? 'text-red-600' : 'text-slate-700'}`}>
        {label}
      </label>
      <input
        id={id} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
          error ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-slate-400'
        }`}
      />
      {error  && <p className="text-xs text-red-600">{error}</p>}
      {helper && !error && <p className="text-xs text-slate-400">{helper}</p>}
    </div>
  )
}
