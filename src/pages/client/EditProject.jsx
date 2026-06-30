import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSkills, getCategories } from '@/api/profiles'
import { useMyProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects'
import { cn } from '@/lib/utils'

export default function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: projData, isLoading } = useMyProject(id)
  const updateMut = useUpdateProject(id)
  const deleteMut = useDeleteProject()

  const [categories, setCats] = useState([])
  const [skills, setSkills]   = useState([])
  const [errors, setErrors]   = useState({})
  const [form, setForm] = useState(null)

  useEffect(() => {
    getCategories().then(r => setCats(r.data ?? []))
    getSkills().then(r => setSkills(r.data ?? []))
  }, [])

  useEffect(() => {
    const p = projData?.data
    if (!p) return
    setForm({
      title:       p.title ?? '',
      description: p.description ?? '',
      category_id: p.category_id ?? p.category?.id ?? '',
      skills:      (p.skills ?? []).map(s => s.id),
      budget_type: p.budget_type ?? 'fixed',
      budget_min:  p.budget_min ?? '',
      budget_max:  p.budget_max ?? '',
      deadline:    p.deadline ? p.deadline.split('T')[0] : '',
      visibility:  p.visibility ?? 'public',
      status:      p.status ?? 'open',
    })
  }, [projData])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })) }
  const err = (f) => errors[f]?.[0] || errors[f]

  const toggleSkill = (sid) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(sid) ? f.skills.filter(x => x !== sid) : [...f.skills, sid],
    }))
  }

  const handleSave = async (statusOverride) => {
    setErrors({})
    try {
      await updateMut.mutateAsync({
        ...form,
        status:     statusOverride ?? form.status,
        budget_min: form.budget_min || undefined,
        budget_max: form.budget_max || undefined,
        deadline:   form.deadline   || undefined,
      })
      navigate(`/client/projects/${id}`)
    } catch (e) {
      if (e?.errors) setErrors(e.errors)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    try {
      await deleteMut.mutateAsync(id)
      navigate('/client/projects')
    } catch {}
  }

  if (isLoading || !form) return <div className="text-sm text-slate-400 py-10 text-center">Loading…</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(`/client/projects/${id}`)} className="text-slate-400 hover:text-slate-600 text-sm">← Back to project</button>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-5" style={{ fontFamily: 'Georgia, serif' }}>Edit Project</h2>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Project title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Build a React dashboard for our SaaS app"
            className={cn('w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2', err('title') ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-slate-400')} />
          {err('title') && <p className="text-xs text-red-600">{err('title')}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Description * <span className="text-slate-400 font-normal">(min 100 chars)</span></label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={7} placeholder="Describe what you need built…"
            className={cn('w-full rounded-lg border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2', err('description') ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-slate-400')} />
          {err('description') && <p className="text-xs text-red-600">{err('description')}</p>}
          <p className="text-xs text-slate-400">{form.description.length} chars</p>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Category *</label>
          <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400">
            <option value="">Select a category…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Required skills</label>
            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto border border-slate-200 rounded-lg p-3">
              {skills.map(s => {
                const on = form.skills.includes(s.id)
                return (
                  <button key={s.id} type="button" onClick={() => toggleSkill(s.id)}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors', on ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500')}>
                    {s.name}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-slate-400">{form.skills.length} selected</p>
          </div>
        )}

        {/* Budget */}
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
            <label className="block text-sm font-medium text-slate-700">{form.budget_type === 'fixed' ? 'Min budget (₹)' : 'Min rate (₹/hr)'}</label>
            <input type="number" min="0" value={form.budget_min} onChange={e => set('budget_min', e.target.value)} placeholder="500"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">{form.budget_type === 'fixed' ? 'Max budget (₹)' : 'Max rate (₹/hr)'}</label>
            <input type="number" min="0" value={form.budget_max} onChange={e => set('budget_max', e.target.value)} placeholder="5000"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
        </div>

        {/* Deadline & Visibility */}
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
              <option value="public">Public</option>
              <option value="invite_only">Invite only</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button onClick={handleDelete} disabled={deleteMut.isPending}
            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
            Delete project
          </button>
          <div className="flex gap-3">
            <button onClick={() => navigate(`/client/projects/${id}`)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={() => handleSave()} disabled={updateMut.isPending}
              className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
              {updateMut.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
