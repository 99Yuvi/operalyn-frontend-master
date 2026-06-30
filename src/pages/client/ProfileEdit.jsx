import { useEffect, useState } from 'react'
import { getClientProfile, updateClientProfile } from '@/api/profiles'

export default function ClientProfileEdit() {
  const [form, setForm]     = useState({ company_name: '', website: '', industry: '', location: '', bio: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors]   = useState({})

  useEffect(() => {
    getClientProfile().then(({ data }) => {
      setForm({
        company_name: data.company_name ?? '',
        website:      data.website ?? '',
        industry:     data.industry ?? '',
        location:     data.location ?? '',
        bio:          data.bio ?? '',
      })
    }).finally(() => setLoading(false))
  }, [])

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      await updateClientProfile(form)
      setSuccess(true)
    } catch (err) {
      if (err?.errors) setErrors(err.errors)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>

  const err = (f) => errors[f]?.[0]

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>Edit Profile</h2>
      <p className="text-sm text-slate-500 mb-6">Your profile is visible to freelancers viewing your projects.</p>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          Profile saved.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <Field label="Company name" id="company_name" name="company_name" value={form.company_name} onChange={onChange} error={err('company_name')} placeholder="Acme Pvt Ltd" />
        <Field label="Website" id="website" name="website" type="url" value={form.website} onChange={onChange} error={err('website')} placeholder="https://acme.com" />
        <Field label="Industry" id="industry" name="industry" value={form.industry} onChange={onChange} error={err('industry')} placeholder="E-Commerce" />
        <Field label="Location" id="location" name="location" value={form.location} onChange={onChange} error={err('location')} placeholder="Mumbai, India" />
        <div className="space-y-1.5">
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700">Bio</label>
          <textarea
            id="bio" name="bio" value={form.bio} onChange={onChange} rows={4}
            placeholder="A short description of your company or hiring needs…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div className="flex justify-end pt-1">
          <button type="submit" disabled={saving}
            className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, id, name, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={`block text-sm font-medium ${error ? 'text-red-600' : 'text-slate-700'}`}>{label}</label>
      <input id={id} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
          error ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-slate-400'
        }`} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
