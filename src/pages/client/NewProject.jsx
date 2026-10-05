import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSkills, getCategories } from '@/api/profiles'
import { useCreateProject } from '@/hooks/useProjects'
import { cn } from '@/lib/utils'

const MAX_SKILLS = 10

export default function NewProject() {
  const navigate = useNavigate()
  const createProjectMut = useCreateProject()
  const [categories, setCats] = useState([])
  const [skills, setSkills] = useState([])
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    title: '', description: '', category_id: '',
    skills: [],
    budget_type: 'fixed', budget_min: '', budget_max: '', deadline: '', visibility: 'public',
  })

  useEffect(() => {
    getCategories().then(r => setCats(r.data ?? [])).catch(() => {})
    getSkills().then(r => setSkills(r.data ?? [])).catch(() => {})
  }, [])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })) }
  const err = (f) => errors[f]?.[0] || errors[f]

  const toggleSkill = (id) => {
    if (form.skills.includes(id)) return set('skills', form.skills.filter(x => x !== id))
    if (form.skills.length >= MAX_SKILLS) return
    set('skills', [...form.skills, id])
  }

  const validate = () => {
    const e = {}
    if (form.title.trim().length < 3) e.title = 'Please enter a project title.'
    if (form.description.trim().length < 100) e.description = 'Description must be at least 100 characters.'
    if (!form.category_id) e.category_id = 'Please select a category.'
    if (form.skills.length < 1) e.skills = 'Select at least one skill.'
    if (form.budget_min && form.budget_max && Number(form.budget_min) > Number(form.budget_max)) {
      e.budget_min = 'Minimum budget cannot exceed maximum budget.'
    }
    setErrors(e)
    const first = Object.keys(e)[0]
    if (first) document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return !first
  }

  const handleSubmit = async (status) => {
    if (!validate()) return
    try {
      await createProjectMut.mutateAsync({
        ...form,
        status,
        budget_min: form.budget_min || undefined,
        budget_max: form.budget_max || undefined,
        deadline:   form.deadline   || undefined,
      })
      navigate('/client/projects')
    } catch (e) {
      if (e?.errors) setErrors(e.errors)
    }
  }

  const inputCls = (hasErr) => cn(
    'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2',
    hasErr ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-slate-400'
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-8">
        <button onClick={() => navigate('/client/projects')} className="text-slate-400 hover:text-slate-600 text-sm">← Projects</button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600 font-medium">New Project</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-8">
        {/* Project info */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">Tell us about the project</h2>
          <div id="field-title" className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Project title *</label>
            <input value={form.title} maxLength={100} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Build a React dashboard for our SaaS app"
              className={inputCls(err('title'))} />
            {err('title') && <p className="text-xs text-red-600">{err('title')}</p>}
            <p className="text-xs text-slate-400">{form.title.length}/100 chars</p>
          </div>
          <div id="field-description" className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Description * <span className="text-slate-400 font-normal">(min 100 chars)</span></label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={7} placeholder="Describe what you need built, any tech requirements, and what success looks like…"
              className={cn(inputCls(err('description')), 'resize-none')} />
            {err('description') && <p className="text-xs text-red-600">{err('description')}</p>}
            <p className="text-xs text-slate-400">{form.description.length} chars (min 100)</p>
          </div>
          <div id="field-category_id" className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Category *</label>
            <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
              className={cn(inputCls(err('category_id')), 'text-slate-900')}>
              <option value="">Select a category…</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {err('category_id') && <p className="text-xs text-red-600">{err('category_id')}</p>}
          </div>
        </section>

        {/* Skills */}
        <section id="field-skills" className="space-y-4 pt-8 border-t border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">What skills are required? *</h2>
            <p className="text-sm text-slate-500 mt-1">Select 1–{MAX_SKILLS} skills. These help freelancers find your project.</p>
          </div>
          <div className={cn('flex flex-wrap gap-2 max-h-64 overflow-y-auto border rounded-lg p-3', err('skills') ? 'border-red-400' : 'border-slate-200')}>
            {skills.map(s => {
              const on = form.skills.includes(s.id)
              const locked = !on && form.skills.length >= MAX_SKILLS
              return (
                <button key={s.id} type="button" onClick={() => toggleSkill(s.id)} disabled={locked}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-40',
                    on ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500')}>
                  {s.name}
                </button>
              )
            })}
          </div>
          {err('skills') && <p className="text-xs text-red-600">{err('skills')}</p>}
          <p className="text-xs text-slate-400">{form.skills.length} selected (max {MAX_SKILLS})</p>
        </section>

        {/* Budget */}
        <section className="space-y-5 pt-8 border-t border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Budget & publishing</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Budget type</label>
            <div className="flex gap-3">
              {['fixed', 'hourly'].map(t => (
                <button key={t} type="button" onClick={() => set('budget_type', t)}
                  className={cn('flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors', form.budget_type === t ? 'bg-slate-700 text-white border-slate-700' : 'border-slate-300 text-slate-600 hover:border-slate-400')}>
                  {t === 'fixed' ? 'Fixed price' : 'Hourly rate'}
                </button>
              ))}
            </div>
          </div>

          <div id="field-budget_min" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                {form.budget_type === 'fixed' ? 'Min budget (₹)' : 'Min rate (₹/hr)'}
              </label>
              <input type="number" min="0" value={form.budget_min} onChange={e => set('budget_min', e.target.value)}
                placeholder="500" className={inputCls(err('budget_min'))} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                {form.budget_type === 'fixed' ? 'Max budget (₹)' : 'Max rate (₹/hr)'}
              </label>
              <input type="number" min="0" value={form.budget_max} onChange={e => set('budget_max', e.target.value)}
                placeholder="5000" className={inputCls(false)} />
            </div>
            {err('budget_min') && <p className="text-xs text-red-600 sm:col-span-2">{err('budget_min')}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Deadline (optional)</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]} className={inputCls(false)} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Visibility</label>
              <select value={form.visibility} onChange={e => set('visibility', e.target.value)} className={inputCls(false)}>
                <option value="public">Public — anyone can find it</option>
                <option value="invite_only">Invite only</option>
              </select>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-slate-100">
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
    </div>
  )
}
