import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAdminPayments, exportPaymentsCsv } from '@/api/admin'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

const STATUS_C = { captured: 'bg-green-50 text-green-700', pending: 'bg-yellow-50 text-yellow-700', failed: 'bg-red-50 text-red-600' }

export default function AdminPayments() {
  const [filters, setFilters] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ['admin','payments', filters],
    queryFn:  () => getAdminPayments(filters),
  })
  const payments = data?.data ?? []

  const totalGmv = payments.reduce((s, p) => s + Number(p.amount), 0)
  const totalFee = payments.reduce((s, p) => s + Number(p.commission_amount), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>Payments</h2>
        <a href={exportPaymentsCsv()} className="text-sm text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
          Export CSV ↓
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-lg font-bold text-slate-800">{formatCurrency(totalGmv)}</p>
          <p className="text-xs text-slate-500">GMV shown</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-lg font-bold text-green-700">{formatCurrency(totalFee)}</p>
          <p className="text-xs text-slate-500">Commission shown</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <select onChange={e => setFilters(f => ({ ...f, status: e.target.value || undefined }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none">
          <option value="">All statuses</option>
          <option value="captured">Captured</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <input type="date" onChange={e => setFilters(f => ({ ...f, from: e.target.value || undefined }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" />
        <input type="date" onChange={e => setFilters(f => ({ ...f, to: e.target.value || undefined }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Client → Freelancer</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Commission</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-6 text-sm text-slate-400">Loading…</td></tr>
            ) : payments.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800 truncate max-w-[160px]">{p.contract?.project?.title}</p>
                  <p className="text-xs text-slate-400">{p.milestone?.title}</p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{p.client?.name} → {p.freelancer?.name}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3 text-right text-green-700 font-semibold">{formatCurrency(p.commission_amount)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_C[p.status] ?? '')}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-slate-400">{formatDate(p.captured_at ?? p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
