import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getPayments, getInvoiceUrl } from '@/api/payments'
import { formatCurrency, formatDate } from '@/lib/utils'
import { paymentKeys } from '@/lib/queryKeys'

export default function FreelancerEarnings() {
  const { profile } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: paymentKeys.list({ status: 'captured' }),
    queryFn:  () => getPayments({ status: 'captured' }),
  })

  const payments       = data?.data ?? []
  const totalEarnings  = Number(profile?.total_earnings ?? 0)
  const monthPayments  = payments.filter(p => {
    const d = new Date(p.captured_at ?? p.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthEarnings  = monthPayments.reduce((s, p) => s + Number(p.net_amount), 0)

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>Earnings</h2>
      <p className="text-sm text-slate-500 mb-6">Your earnings after platform fees.</p>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Lifetime earnings',     value: formatCurrency(totalEarnings),  color: 'text-green-600' },
          { label: 'This month',            value: formatCurrency(monthEarnings),  color: 'text-blue-600' },
          { label: 'Completed contracts',   value: payments.length,                color: 'text-slate-800' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per-payment list */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center">
          <p className="text-3xl mb-2">💰</p>
          <p className="text-sm text-slate-500">No earnings yet. Complete milestones to start earning.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-700">Transaction history</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {payments.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.contract?.project?.title}</p>
                  <p className="text-xs text-slate-400">{p.milestone?.title} · {p.client?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-green-700">+{formatCurrency(p.net_amount)}</p>
                  <p className="text-xs text-slate-400">{formatDate(p.captured_at)}</p>
                </div>
                {p.invoice_path && (
                  <a href={getInvoiceUrl(p.id)} target="_blank" rel="noreferrer"
                    className="text-xs text-blue-500 hover:underline shrink-0">
                    PDF
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-between text-sm">
            <span className="text-slate-500">Platform fees paid: {formatCurrency(payments.reduce((s, p) => s + Number(p.commission_amount), 0))}</span>
            <span className="font-bold text-green-700">Net received: {formatCurrency(payments.reduce((s, p) => s + Number(p.net_amount), 0))}</span>
          </div>
        </div>
      )}
    </div>
  )
}
