import { useEffect, useState } from 'react'
import { getFreelancerProfile, updateFreelancerProfile, uploadResume, submitVerification } from '@/api/profiles'
import { getSkills } from '@/api/profiles'

const STATUS_BADGE = {
  unsubmitted: 'bg-slate-100 text-slate-600',
  pending:     'bg-yellow-100 text-yellow-700',
  approved:    'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-700',
}
const STATUS_LABEL = {
  unsubmitted: 'Not submitted',
  pending:     'Under review',
  approved:    'Verified',
  rejected:    'Rejected',
}
const DOC_LABELS = { id_front: 'ID Front', id_back: 'ID Back', selfie: 'Selfie with ID' }

export default function FreelancerProfileEdit() {
  const [form, setForm]       = useState({ headline: '', bio: '', hourly_rate: '', availability: 'available', skills: [] })
  const [allSkills, setAllSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors]   = useState({})
  const [resumeFile, setResumeFile]     = useState(null)
  const [resumeSaving, setResumeSaving] = useState(false)
  const [verifStatus, setVerifStatus]   = useState('unsubmitted')
  const [verifNotes, setVerifNotes]     = useState(null)
  const [verifDocs, setVerifDocs]       = useState({})       // { id_front: File, ... }
  const [verifSaving, setVerifSaving]   = useState(false)
  const [verifSuccess, setVerifSuccess] = useState(false)

  useEffect(() => {
    Promise.all([getFreelancerProfile(), getSkills()]).then(([profileRes, skillsRes]) => {
      const p = profileRes.data
      setForm({
        headline:     p.headline ?? '',
        bio:          p.bio ?? '',
        hourly_rate:  p.hourly_rate ?? '',
        availability: p.availability ?? 'available',
        skills:       (p.skills ?? []).map((s) => s.id),
      })
      setAllSkills(skillsRes.data ?? [])
      if (p.resume_path) setResumeFile(p.resume_path.split('/').pop())
      setVerifStatus(p.verification_status ?? 'unsubmitted')
      setVerifNotes(p.verification_notes ?? null)
    }).finally(() => setLoading(false))
  }, [])

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
    setSuccess(false)
  }

  const toggleSkill = (id) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(id) ? f.skills.filter((s) => s !== id) : [...f.skills, id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      await updateFreelancerProfile({ ...form, hourly_rate: form.hourly_rate || null })
      setSuccess(true)
    } catch (err) {
      if (err?.errors) setErrors(err.errors)
    } finally {
      setSaving(false)
    }
  }

  const handleResume = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResumeSaving(true)
    try {
      await uploadResume(file)
      setResumeFile(file.name)
    } catch {
      alert('Resume upload failed. Max 5MB PDF only.')
    } finally {
      setResumeSaving(false)
    }
  }

  const handleVerifDocPick = (docType, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVerifDocs((d) => ({ ...d, [docType]: file }))
  }

  const handleVerifSubmit = async () => {
    if (!Object.keys(verifDocs).length) return
    setVerifSaving(true)
    setVerifSuccess(false)
    try {
      const res = await submitVerification(verifDocs)
      setVerifStatus(res.data.verification_status)
      setVerifDocs({})
      setVerifSuccess(true)
    } catch {
      alert('Document upload failed. Please try again.')
    } finally {
      setVerifSaving(false)
    }
  }

  if (loading) return <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>

  const err = (f) => errors[f]?.[0]
  const canSubmitVerif = verifStatus !== 'approved' && Object.keys(verifDocs).length > 0

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>Edit Profile</h2>
      <p className="text-sm text-slate-500 mb-6">Your profile is public and shown to clients searching for freelancers.</p>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          Profile saved.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        {/* Headline */}
        <div className="space-y-1.5">
          <label htmlFor="headline" className="block text-sm font-medium text-slate-700">Headline</label>
          <input id="headline" name="headline" value={form.headline} onChange={onChange}
            placeholder="Full-Stack Developer · React + Laravel"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400" />
          {err('headline') && <p className="text-xs text-red-600">{err('headline')}</p>}
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700">Bio</label>
          <textarea id="bio" name="bio" value={form.bio} onChange={onChange} rows={5}
            placeholder="Describe your experience, skills, and what makes you a great hire…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>

        {/* Rate & Availability */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="hourly_rate" className="block text-sm font-medium text-slate-700">Hourly rate (₹)</label>
            <input id="hourly_rate" name="hourly_rate" type="number" min="0" value={form.hourly_rate} onChange={onChange}
              placeholder="500"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="availability" className="block text-sm font-medium text-slate-700">Availability</label>
            <select id="availability" name="availability" value={form.availability} onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400">
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Skills */}
        {allSkills.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Skills</label>
            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">
              {allSkills.map((skill) => {
                const active = form.skills.includes(skill.id)
                return (
                  <button key={skill.id} type="button" onClick={() => toggleSkill(skill.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      active ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                    }`}>
                    {skill.name}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-slate-400">{form.skills.length} skill{form.skills.length !== 1 ? 's' : ''} selected</p>
          </div>
        )}

        {/* Resume */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Resume (PDF)</label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              {resumeSaving ? 'Uploading…' : 'Choose PDF'}
              <input type="file" accept=".pdf" className="hidden" onChange={handleResume} disabled={resumeSaving} />
            </label>
            {resumeFile && <span className="text-xs text-green-600">✓ {resumeFile} uploaded</span>}
          </div>
          <p className="text-xs text-slate-400">Max 5MB · PDF only</p>
        </div>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={saving}
            className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>

      {/* Verification Section */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-slate-800">Identity Verification</h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[verifStatus]}`}>
            {STATUS_LABEL[verifStatus]}
          </span>
        </div>

        {verifStatus === 'approved' && (
          <p className="text-sm text-green-700 mt-2">Your identity is verified. You appear in client searches.</p>
        )}

        {verifStatus === 'pending' && (
          <p className="text-sm text-slate-500 mt-2">Your documents are under review. We'll notify you once approved.</p>
        )}

        {verifStatus === 'rejected' && (
          <div className="mt-2">
            <p className="text-sm text-red-600">Verification rejected. Please re-upload your documents.</p>
            {verifNotes && <p className="text-xs text-slate-500 mt-1">Reason: {verifNotes}</p>}
          </div>
        )}

        {(verifStatus === 'unsubmitted' || verifStatus === 'rejected') && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-500">Upload clear photos of your government ID and a selfie. JPG or PNG, max 10MB each.</p>

            {Object.entries(DOC_LABELS).map(([docType, label]) => (
              <div key={docType} className="flex items-center gap-3">
                <label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors min-w-[110px]">
                  {label}
                  <input type="file" accept="image/jpg,image/jpeg,image/png" className="hidden"
                    onChange={(e) => handleVerifDocPick(docType, e)} disabled={verifSaving} />
                </label>
                {verifDocs[docType]
                  ? <span className="text-xs text-green-600">✓ {verifDocs[docType].name}</span>
                  : <span className="text-xs text-slate-400">No file chosen</span>
                }
              </div>
            ))}

            {verifSuccess && (
              <p className="text-xs text-green-600">Documents submitted! Admin will review shortly.</p>
            )}

            <button onClick={handleVerifSubmit} disabled={!canSubmitVerif || verifSaving}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
              {verifSaving ? 'Submitting…' : 'Submit for verification'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
