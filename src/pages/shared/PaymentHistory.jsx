import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getPayments } from '@/api/payments'
import { formatCurrency, formatDate } from '@/lib/utils'
import { paymentKeys } from '@/lib/queryKeys'
import { API_ORIGIN } from '@/api/client'

const STATUS = {
  captured: 'bg-green-50 text-green-700',
  pending:  'bg-yellow-50 text-yellow-700',
  failed:   'bg-red-50 text-red-600',
  refunded: 'bg-slate-100 text-slate-500',
}

export default function PaymentHistory() {
  const { user }  = useAuth()
  const isClient  = user?.role === 'client'
  const [invoicePreview, setInvoicePreview] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: paymentKeys.list({}),
    queryFn:  () => getPayments(),
  })

  const payments = data?.data ?? []

  const openInvoice = async (paymentId) => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/v1/payments/${paymentId}/invoice`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      setInvoicePreview({ url, name: `Invoice-${paymentId}.pdf` })
    } catch { /* silently ignore */ }
  }

  const closeInvoice = () => {
    if (invoicePreview?.url) URL.revokeObjectURL(invoicePreview.url)
    setInvoicePreview(null)
  }

  return (
    <div>
      {/* Invoice popup */}
      {invoicePreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={closeInvoice}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>📄 {invoicePreview.name}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={invoicePreview.url} download={invoicePreview.name} style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8, border: '1px solid #E2E8F0', color: '#334155', textDecoration: 'none' }}>⬇ Download</a>
                <button onClick={closeInvoice} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'none', cursor: 'pointer', color: '#64748B' }}>✕ Close</button>
              </div>
            </div>
            <iframe src={invoicePreview.url} style={{ flex: 1, border: 'none', minHeight: 500 }} title="Invoice" />
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
        Payment History
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        {isClient ? 'Payments made to freelancers.' : 'Payments received from clients.'}
      </p>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <p className="text-3xl mb-2">💳</p>
          <p className="text-sm text-slate-500">No payments yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Project / Milestone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {isClient ? 'Freelancer' : 'Client'}
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                {!isClient && (
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">You received</th>
                )}
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map(p => {
                const other = isClient ? p.freelancer : p.client
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 truncate max-w-[180px]">{p.contract?.project?.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.milestone?.title}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{other?.name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(p.amount)}</td>
                    {!isClient && (
                      <td className="px-4 py-3 text-right">
                        <span className="text-green-700 font-semibold">{formatCurrency(p.net_amount)}</span>
                        <span className="text-xs text-slate-400 block">({p.commission_rate}% fee)</span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS[p.status] ?? ''}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-400">
                      {formatDate(p.captured_at ?? p.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status === 'captured' && p.invoice_path && (
                        <button
                          onClick={() => openInvoice(p.id)}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          Invoice ↗
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
