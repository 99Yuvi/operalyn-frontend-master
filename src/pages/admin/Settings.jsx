import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getSettings, updateSettings } from '@/api/admin'

export default function AdminSettings() {
  const [flat, setFlat]     = useState({})
  const [saved, setSaved]   = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['admin','settings'], queryFn: getSettings })
  const updateMut = useMutation({
    mutationFn: updateSettings,
    onSuccess:  () => { setSaved(true); setTimeout(() => setSaved(false), 3000) },
  })

  useEffect(() => {
    if (!data?.data) return
    const all = {}
    Object.values(data.data).forEach(group => group.forEach(s => { all[s.key_name] = s.value }))
    setFlat(all)
  }, [data])

  const handleSubmit = (e) => { e.preventDefault(); updateMut.mutate(flat) }
  const set = (k, v) => setFlat(f => ({ ...f, [k]: v }))

  if (isLoading) return <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>

  const FIELDS = [
    { key: 'commission_rate',        label: 'Platform Commission (%)',               type: 'number', help: 'Percentage taken from each payment. Applied to new contracts only.' },
    { key: 'max_active_proposals',   label: 'Max simultaneous proposals / freelancer', type: 'number', help: 'How many pending + shortlisted proposals a freelancer can hold at once.' },
    { key: 'review_window_days',     label: 'Review window (days)',                  type: 'number', help: 'Days after contract completion that reviews can be submitted.' },
    { key: 'min_reviews_for_rating', label: 'Min reviews before rating shown',       type: 'number', help: 'Freelancers need at least this many reviews to show a public rating.' },
    { key: 'max_file_upload_mb',     label: 'Max upload size (MB)',                  type: 'number', help: 'Applies to delivery files and portfolio images.' },
  ]

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>Platform Settings</h2>
      <p className="text-sm text-slate-500 mb-6">Changes take effect immediately for new activity.</p>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {FIELDS.map(f => (
          <div key={f.key} className="flex items-center justify-between gap-6 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-slate-700">{f.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{f.help}</p>
            </div>
            <input
              type={f.type} value={flat[f.key] ?? ''}
              onChange={e => set(f.key, e.target.value)}
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        ))}
        <div className="px-5 py-4 flex justify-end">
          <button type="submit" disabled={updateMut.isPending}
            className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            {updateMut.isPending ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
