import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getVerifications, updateVerification } from '@/api/admin'
import { formatDate, getInitials, getAvatarColor } from '@/lib/utils'
import { API_ORIGIN } from '@/api/client'

export default function AdminVerifications() {
  const qc = useQueryClient()
  const [status, setStatus]   = useState('pending')
  const [modal, setModal]     = useState(null)
  const [notes, setNotes]     = useState('')
  const [docPreview, setDocPreview] = useState(null)

  const openDoc = async (profileId, docId, label) => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/v1/admin/verifications/${profileId}/documents/${docId}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed')
      const contentType = res.headers.get('content-type') || 'application/octet-stream'
      const blob = await res.blob()
      const url  = URL.createObjectURL(new Blob([blob], { type: contentType }))
      setDocPreview({ url, name: label, type: contentType })
    } catch { /* silently ignore */ }
  }

  const closeDoc = () => {
    if (docPreview?.url) URL.revokeObjectURL(docPreview.url)
    setDocPreview(null)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin','verifications', status],
    queryFn:  () => getVerifications({ status }),
  })
  const profiles = data?.data ?? []

  const updateMut = useMutation({
    mutationFn: ({ id, status, notes }) => updateVerification(id, { status, notes }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin','verifications'] }); setModal(null); setNotes('') },
  })

  return (
    <div>
      {/* Document preview popup */}
      {docPreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={closeDoc}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>🪪 {docPreview.name}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={docPreview.url} download={docPreview.name} style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8, border: '1px solid #E2E8F0', color: '#334155', textDecoration: 'none' }}>⬇ Download</a>
                <button onClick={closeDoc} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'none', cursor: 'pointer', color: '#64748B' }}>✕ Close</button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              {docPreview.type?.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(docPreview.name) ? (
                <img src={docPreview.url} alt={docPreview.name} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} />
              ) : (
                <iframe src={docPreview.url} style={{ width: '100%', height: '75vh', border: 'none' }} title={docPreview.name} />
              )}
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>Freelancer Verifications</h2>

      <div className="flex gap-2 mb-4">
        {['unsubmitted','pending','approved','rejected'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${status === s ? 'bg-slate-700 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}</div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-10 text-sm text-slate-400">No {status} verifications.</div>
      ) : (
        <div className="space-y-3">
          {profiles.map(fp => {
            const colors = getAvatarColor(fp.user?.name ?? '')
            return (
              <div key={fp.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full ${colors.bg} ${colors.text} text-sm font-semibold flex items-center justify-center shrink-0`}>
                  {getInitials(fp.user?.name ?? '')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{fp.user?.name}</p>
                  <p className="text-xs text-slate-400">{fp.user?.email} · Submitted {formatDate(fp.updated_at)}</p>
                  {fp.documents?.length > 0 && (
                    <div className="flex gap-2 mt-1.5">
                      {fp.documents.map(doc => (
                        <button key={doc.id}
                          onClick={() => openDoc(fp.id, doc.id, doc.doc_type.replace('_', ' '))}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded hover:underline cursor-pointer">
                          {doc.doc_type.replace('_', ' ')} ↗
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {(status === 'pending' || status === 'unsubmitted') && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => updateMut.mutate({ id: fp.id, status: 'approved', notes: '' })}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">
                      Approve
                    </button>
                    <button onClick={() => setModal(fp)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-2">Reject verification</h3>
            <p className="text-sm text-slate-500 mb-3">Tell <strong>{modal.user?.name}</strong> what they need to resubmit.</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Reason for rejection (required)…" rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 mb-3" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setModal(null)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => updateMut.mutate({ id: modal.id, status: 'rejected', notes })}
                disabled={!notes.trim() || updateMut.isPending}
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {updateMut.isPending ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
