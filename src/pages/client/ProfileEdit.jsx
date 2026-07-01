import { useEffect, useState } from 'react'
import { getClientProfile, updateClientProfile } from '@/api/profiles'
import { Check } from 'lucide-react'

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
      {/* Page header */}
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Edit Profile</h2>
      <p className="text-sm text-slate-500 mb-6">Your profile is visible to freelancers viewing your projects.</p>

      {/* Success banner */}
      {success && (
        <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
          <Check className="h-4 w-4 shrink-0" />
          Profile saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Company Information card */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <h3 className="text-base font-semibold text-slate-800 pb-3 border-b border-slate-100">
            Company Information
          </h3>

          {/* Company name */}
          <div>
            <label htmlFor="company_name" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Company name
            </label>
            <input
              id="company_name"
              name="company_name"
              type="text"
              value={form.company_name}
              onChange={onChange}
              placeholder="Acme Pvt Ltd"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-colors ${
                err('company_name') ? 'border-red-400 focus:ring-red-200' : 'border-slate-200'
              }`}
            />
            {err('company_name') && <p className="text-xs text-red-600 mt-1">{err('company_name')}</p>}
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Website
            </label>
            <input
              id="website"
              name="website"
              type="url"
              value={form.website}
              onChange={onChange}
              placeholder="https://acme.com"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-colors ${
                err('website') ? 'border-red-400 focus:ring-red-200' : 'border-slate-200'
              }`}
            />
            {err('website') && <p className="text-xs text-red-600 mt-1">{err('website')}</p>}
          </div>

          {/* Industry & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="industry" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Industry
              </label>
              <input
                id="industry"
                name="industry"
                type="text"
                value={form.industry}
                onChange={onChange}
                placeholder="E-Commerce"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-colors ${
                  err('industry') ? 'border-red-400 focus:ring-red-200' : 'border-slate-200'
                }`}
              />
              {err('industry') && <p className="text-xs text-red-600 mt-1">{err('industry')}</p>}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={onChange}
                placeholder="Mumbai, India"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-colors ${
                  err('location') ? 'border-red-400 focus:ring-red-200' : 'border-slate-200'
                }`}
              />
              {err('location') && <p className="text-xs text-red-600 mt-1">{err('location')}</p>}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={onChange}
              rows={4}
              placeholder="A short description of your company or hiring needs…"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-colors"
            />
            <p className="text-xs text-slate-400 mt-1">Shown to freelancers on your project pages.</p>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}
