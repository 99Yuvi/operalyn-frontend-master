import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSkills, getCategories } from '@/api/profiles'
import { useCreateProject } from '@/hooks/useProjects'
import { cn } from '@/lib/utils'

const STEPS = ['Project info', 'Required skills', 'Budget & publish']

export default function NewProject() {
  const navigate = useNavigate()
  const createProjectMut = useCreateProject()
  const [step, setStep]     = useState(0)
  const [categories, setCats] = useState([])
  const [skills, setSkills] = useState([])
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    title: '', description: '', category_id: '',
    skills: [],
    budget_type: 'fixed', budget_min: '', budget_max: '', deadline: '', visibility: 'public', status: 'open',
  })

  useEffect(() => {
    getCategories().then(r => setCats(r.data ?? []))
    getSkills().then(r => setSkills(r.data ?? []))
  }, [])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })) }
  const err = (f) => errors[f]?.[0] || errors[f]

  /* ── Step validation ── */
  const canAdvance = () => {
    if (step === 0) return form.title.trim().length >= 3 && form.description.trim().length >= 100 && form.category_id
    if (step === 1) return form.skills.length >= 1
    return true
  }

  const handleSubmit = async (statusOverride) => {
    setErrors({})
    try {
      await createProjectMut.mutateAsync({
        ...form,
        status:     statusOverride,
        budget_min: form.budget_min || undefined,
        budget_max: form.budget_max || undefined,
        deadline:   form.deadline   || undefined,
      })
      navigate('/client/projects')
    } catch (e) {
      if (e?.errors) setErrors(e.errors)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-8">
        <button onClick={() => navigate('/client/projects')} className="text-slate-400 hover:text-slate-600 text-sm">← Projects</button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600 font-medium">New Project</span>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2',
                i < step  ? 'bg-green-500 border-green-500 text-white'
                : i === step ? 'border-slate-700 text-slate-700'
                : 'border-slate-200 text-slate-400'
              )}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={cn('text-sm font-medium hidden sm:block', i === step ? 'text-slate-800' : 'text-slate-400')}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={cn('flex-1 h-px mx-3', i < step ? 'bg-green-400' : 'bg-slate-200')} />}
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Step 0 — Info */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-slate-800">Tell us about the project</h2>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Project title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Build a React dashboard for our SaaS app"
                className={cn('w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2', err('title') ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-slate-400')} />
              {err('title') && <p className="text-xs text-red-600">{err('title')}</p>}
              <p className="text-xs text-slate-400">{form.title.length}/100 chars</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Description * <span className="text-slate-400 font-normal">(min 100 chars)</span></label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={7} placeholder="Describe what you need built, any tech requirements, and what success looks like…"
                className={cn('w-full rounded-lg border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2', err('description') ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-slate-400')} />
              {err('description') && <p className="text-xs text-red-600">{err('description')}</p>}
              <p className="text-xs text-slate-400">{form.description.length} chars (min 100)</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Category *</label>
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400">
                <option value="">Select a category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {err('category_id') && <p className="text-xs text-red-600">{err('category_id')}</p>}
            </div>
          </div>
        )}

        {/* Step 1 — Skills */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">What skills are required?</h2>
            <p className="text-sm text-slate-500">Select 1–10 skills. These help freelancers find your project.</p>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3">
              {skills.map(s => {
                const on = form.skills.includes(s.id)
                return (
                  <button key={s.id} type="button"
                    onClick={() => set('skills', on ? form.skills.filter(x => x !== s.id) : [...form.skills, s.id])}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors', on ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500')}>
                    {s.name}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-slate-400">{form.skills.length} selected (max 10)</p>
          </div>
        )}

        {/* Step 2 — Budget */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-slate-800">Budget & publishing</h2>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Budget type</label>
              <div className="flex gap-3">
                {['fixed', 'hourly'].map(t => (
                  <button key={t} type="button" onClick={() => set('budget_type', t)}
                    className={cn('flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors', form.budget_type === t ? 'bg-slate-700 text-white border-slate-700' : 'border-slate-300 text-slate-600 hover:border-slate-400')}>
                    {t === 'fixed' ? '💰 Fixed price' : '⏱ Hourly rate'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  {form.budget_type === 'fixed' ? 'Min budget (₹)' : 'Min rate (₹/hr)'}
                </label>
                <input type="number" min="0" value={form.budget_min} onChange={e => set('budget_min', e.target.value)}
                  placeholder="500"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  {form.budget_type === 'fixed' ? 'Max budget (₹)' : 'Max rate (₹/hr)'}
                </label>
                <input type="number" min="0" value={form.budget_max} onChange={e => set('budget_max', e.target.value)}
                  placeholder="5000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Deadline (optional)</label>
                <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Visibility</label>
                <select value={form.visibility} onChange={e => set('visibility', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
                  <option value="public">Public — anyone can find it</option>
                  <option value="invite_only">Invite only</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => handleSubmit('draft')} disabled={createProjectMut.isPending}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                Save as draft
              </button>
              <button type="button" onClick={() => handleSubmit('open')} disabled={createProjectMut.isPending}
                className="flex-1 rounded-lg bg-slate-700 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                {createProjectMut.isPending ? 'Publishing…' : 'Post project'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step < 2 && (
          <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-30">← Back</button>
            <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
              className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40">
              Next →
            </button>
          </div>
        )}
        {step > 0 && step < 2 && (
          <button onClick={() => setStep(s => s - 1)} className="hidden" />
        )}
      </div>
    </div>
  )
}
