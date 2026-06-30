import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminReviews, hideReview, unhideReview } from '@/api/admin'
import { formatDate } from '@/lib/utils'

export default function AdminReviews() {
  const qc = useQueryClient()
  const [hideModal, setHideModal] = useState(null)
  const [reason, setReason]       = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['admin','reviews'], queryFn: getAdminReviews })
  const reviews = data?.data ?? []

  const hideMut = useMutation({
    mutationFn: ({ id, reason }) => hideReview(id, { reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin','reviews'] }); setHideModal(null); setReason('') },
  })
  const unhideMut = useMutation({
    mutationFn: unhideReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','reviews'] }),
  })

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>Review Moderation</h2>
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-slate-400 py-6 text-center">Loading…</div>
        ) : reviews.map(r => (
          <div key={r.id} className={`bg-white border rounded-xl p-4 ${r.is_hidden ? 'opacity-50 border-slate-100' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-600">{r.reviewer?.name} → {r.reviewee?.name}</span>
                  <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <span key={n} className={`text-xs ${n <= r.overall ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>)}</div>
                  {r.is_hidden && <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">Hidden</span>}
                </div>
                <p className="text-sm text-slate-600">{r.body}</p>
                <p className="text-xs text-slate-400 mt-1">{r.contract?.project?.title} · {formatDate(r.created_at)}</p>
              </div>
              <div className="shrink-0">
                {r.is_hidden ? (
                  <button onClick={() => unhideMut.mutate(r.id)} className="text-xs text-green-600 hover:underline">Restore</button>
                ) : (
                  <button onClick={() => setHideModal(r)} className="text-xs text-red-500 hover:underline">Hide</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hideModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-2">Hide this review</h3>
            <p className="text-sm text-slate-500 mb-3">It will no longer appear on the freelancer's public profile.</p>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (required)…" rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 mb-3" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setHideModal(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => hideMut.mutate({ id: hideModal.id, reason })} disabled={!reason.trim() || hideMut.isPending}
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {hideMut.isPending ? 'Hiding…' : 'Hide review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
