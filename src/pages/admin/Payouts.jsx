import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminPayouts, approveAdminPayout, rejectAdminPayout } from '@/api/payouts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowUpRight, Check, X, Clock, Landmark, CreditCard, AlertCircle } from 'lucide-react'

const STATUS = {
  pending:  { label: 'Pending',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  approved: { label: 'Approved', bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  paid:     { label: 'Paid',     bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  rejected: { label: 'Rejected', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
}

export default function AdminPayouts() {
  const qc = useQueryClient()
  const [filter, setFilter]       = useState('pending')
  const [actionId, setActionId]   = useState(null)
  const [actionType, setActionType] = useState(null) // 'approve' | 'reject'
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError]           = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'payouts', filter],
    queryFn:  () => getAdminPayouts({ status: filter }),
  })
  const payouts = data?.data ?? []

  const handleAction = async () => {
    if (actionType === 'reject' && !adminNotes.trim()) {
      setError('Please provide a reason for rejection.')
      return
    }
    setProcessing(true)
    setError('')
    try {
      if (actionType === 'approve') {
        await approveAdminPayout(actionId, { admin_notes: adminNotes })
      } else {
        await rejectAdminPayout(actionId, { admin_notes: adminNotes })
      }
      setActionId(null)
      setActionType(null)
      setAdminNotes('')
      refetch()
    } catch (err) {
      setError(err?.message ?? 'Action failed.')
    } finally {
      setProcessing(false)
    }
  }

  const openAction = (id, type) => {
    setActionId(id)
    setActionType(type)
    setAdminNotes('')
    setError('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
          Payout Requests
        </h2>
        <p className="text-sm text-slate-500 mt-1">Review and process freelancer payout requests.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['pending', 'approved', 'paid', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${
              filter === s
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}>
            {s === 'pending' ? '⏳ ' : s === 'paid' ? '✅ ' : ''}{s}
          </button>
        ))}
      </div>

      {/* Action Modal */}
      {actionId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className={`px-6 py-4 border-b border-slate-100 ${actionType === 'approve' ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="text-base font-semibold text-slate-800">
                {actionType === 'approve' ? '✅ Approve Payout' : '❌ Reject Payout'}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {actionType === 'approve'
                  ? 'Confirm you have processed the bank transfer / UPI payment.'
                  : 'Explain why this request is being rejected.'}
              </p>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {actionType === 'approve' ? 'Notes (optional)' : 'Reason for rejection *'}
                </label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                  rows={3} placeholder={actionType === 'approve' ? 'e.g. Transferred via NEFT on 2 Jul' : 'e.g. Incomplete bank details'}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setActionId(null); setActionType(null) }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={handleAction} disabled={processing}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-colors ${
                    actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}>
                  {processing ? 'Processing…' : actionType === 'approve' ? 'Confirm Approval' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : payouts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700">No {filter} requests</h3>
          <p className="text-sm text-slate-500 mt-1">Nothing to show for this filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">{payouts.length} request{payouts.length !== 1 ? 's' : ''}</p>
            {filter === 'pending' && (
              <p className="text-xs text-slate-400">
                Total pending: {formatCurrency(payouts.reduce((s, p) => s + Number(p.amount), 0))}
              </p>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {payouts.map(p => {
              const st = STATUS[p.status] ?? STATUS.pending
              return (
                <div key={p.id} className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                      <ArrowUpRight className="h-5 w-5 text-amber-500" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {p.freelancer?.name ?? 'Unknown freelancer'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{p.freelancer?.email}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold text-slate-900">{formatCurrency(p.amount)}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
                            {st.label}
                          </span>
                        </div>
                      </div>

                      {/* Bank/UPI details */}
                      <div className="mt-2 flex flex-wrap gap-3">
                        {p.upi_id ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                            <CreditCard className="h-3 w-3" />
                            UPI: {p.upi_id}
                          </span>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                              <Landmark className="h-3 w-3" />
                              {p.bank_account_name} · {p.bank_account_number}
                            </span>
                            <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                              IFSC: {p.ifsc_code}
                            </span>
                          </>
                        )}
                        <span className="text-xs text-slate-400">
                          Requested {formatDate(p.created_at)}
                        </span>
                      </div>

                      {/* Admin notes */}
                      {p.admin_notes && (
                        <p className="text-xs text-slate-500 mt-1.5 italic">Note: {p.admin_notes}</p>
                      )}

                      {/* Actions for pending */}
                      {p.status === 'pending' && (
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => openAction(p.id, 'approve')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors">
                            <Check className="h-3.5 w-3.5" /> Approve & Mark Paid
                          </button>
                          <button onClick={() => openAction(p.id, 'reject')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors">
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
