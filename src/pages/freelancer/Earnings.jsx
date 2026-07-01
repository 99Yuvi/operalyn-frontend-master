import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getPayments, getInvoiceUrl } from '@/api/payments'
import { formatCurrency, formatDate } from '@/lib/utils'
import { paymentKeys } from '@/lib/queryKeys'
import { DollarSign, TrendingUp, Clock, CheckCircle, FileText } from 'lucide-react'

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
  const pendingPayout  = Number(profile?.pending_payout ?? 0)

  const metrics = [
    {
      label: 'Total Earnings',
      value: formatCurrency(totalEarnings),
      sub:   'Lifetime net received',
      icon:  DollarSign,
      bg:    'bg-green-50',
      color: 'text-green-600',
    },
    {
      label: 'This Month',
      value: formatCurrency(monthEarnings),
      sub:   `${monthPayments.length} payment${monthPayments.length !== 1 ? 's' : ''} this month`,
      icon:  TrendingUp,
      bg:    'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      label: 'Pending Payout',
      value: formatCurrency(pendingPayout),
      sub:   'Awaiting release',
      icon:  Clock,
      bg:    'bg-amber-50',
      color: 'text-amber-600',
    },
    {
      label: 'Contracts Done',
      value: payments.length,
      sub:   'Completed milestones',
      icon:  CheckCircle,
      bg:    'bg-emerald-50',
      color: 'text-emerald-600',
    },
  ]

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-slate-900 tracking-tight"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Earnings
        </h2>
        <p className="text-sm text-slate-500 mt-1">Your earnings after platform fees.</p>
      </div>

      {/* Metric strip */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
        <div className="flex flex-wrap sm:flex-nowrap divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="flex items-center gap-3 px-5 py-4 flex-1 min-w-[50%] sm:min-w-0"
            >
              <div className={`h-10 w-10 rounded-xl ${m.bg} flex items-center justify-center shrink-0`}>
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">{m.label}</p>
                <p className="text-xl font-bold text-slate-900 tabular-nums leading-tight">{m.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{m.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-7 w-7 text-green-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">No earnings yet</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Complete milestones on active contracts to start earning.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-700">Transaction history</h3>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {payments.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
              >
                {/* Icon */}
                <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {p.contract?.project?.title ?? 'Unnamed project'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {p.milestone?.title}
                    {p.milestone?.title && p.client?.name ? ' · ' : ''}
                    {p.client?.name}
                  </p>
                </div>

                {/* Date */}
                <div className="text-xs text-slate-400 shrink-0 hidden sm:block">
                  {formatDate(p.captured_at)}
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-green-700">
                    +{formatCurrency(p.net_amount)}
                  </p>
                  <p className="text-xs text-slate-400 sm:hidden mt-0.5">
                    {formatDate(p.captured_at)}
                  </p>
                </div>

                {/* PDF link */}
                {p.invoice_path && (
                  <a
                    href={getInvoiceUrl(p.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    PDF
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Footer summary */}
          <div className="px-5 py-3 border-t-2 border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Platform fees paid:{' '}
              <span className="font-semibold text-slate-600">
                {formatCurrency(payments.reduce((s, p) => s + Number(p.commission_amount), 0))}
              </span>
            </span>
            <span className="text-sm font-bold text-green-700">
              Net received: {formatCurrency(payments.reduce((s, p) => s + Number(p.net_amount), 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
