import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPayments } from '@/api/payments'
import api from '@/api/client'
import { getMyPayouts, requestPayout } from '@/api/payouts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { paymentKeys } from '@/lib/queryKeys'
import {
  DollarSign, TrendingUp, Clock, CheckCircle, FileText,
  ArrowUpRight, Landmark, CreditCard, X, AlertCircle,
} from 'lucide-react'

const PAYOUT_STATUS = {
  pending:  { label: 'Under review',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  approved: { label: 'Approved',      bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  paid:     { label: 'Paid',          bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  rejected: { label: 'Rejected',      bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
}

export default function FreelancerEarnings() {
  const { profile, user }  = useAuth()
  const qc                 = useQueryClient()

  const [invoicePreview, setInvoicePreview] = useState(null) // { url, name }

  const openInvoice = async (paymentId) => {
    try {
      const blob = await api.get(`/payments/${paymentId}/invoice`, { responseType: 'blob' })
      const url  = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      setInvoicePreview({ url, name: `Invoice-${paymentId}.pdf` })
    } catch { /* silently ignore */ }
  }

  const closeInvoice = () => {
    if (invoicePreview?.url) URL.revokeObjectURL(invoicePreview.url)
    setInvoicePreview(null)
  }

  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [payoutMethod, setPayoutMethod]     = useState('bank') // 'bank' | 'upi'
  const [payoutForm, setPayoutForm]         = useState({
    amount: '', bank_account_name: '', bank_account_number: '',
    ifsc_code: '', upi_id: '',
  })
  const [payoutLoading, setPayoutLoading]   = useState(false)
  const [payoutError, setPayoutError]       = useState('')
  const [payoutSuccess, setPayoutSuccess]   = useState('')

  const { data, isLoading } = useQuery({
    queryKey: paymentKeys.list({ status: 'captured' }),
    queryFn:  () => getPayments({ status: 'captured' }),
  })

  const { data: payoutsData, refetch: refetchPayouts } = useQuery({
    queryKey: ['payouts', 'mine'],
    queryFn:  () => getMyPayouts(),
  })

  const payments      = data?.data ?? []
  const payouts       = payoutsData?.data ?? []
  const totalEarnings = Number(profile?.total_earnings ?? 0)
  const pendingPayout = Number(profile?.pending_payout ?? 0)

  const monthPayments = payments.filter(p => {
    const d   = new Date(p.captured_at ?? p.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthEarnings = monthPayments.reduce((s, p) => s + Number(p.net_amount), 0)

  const metrics = [
    { label: 'Total Earnings',   value: formatCurrency(totalEarnings), sub: 'Lifetime net received',  icon: DollarSign,  bg: 'bg-green-50',   color: 'text-green-600' },
    { label: 'This Month',       value: formatCurrency(monthEarnings), sub: `${monthPayments.length} payment${monthPayments.length !== 1 ? 's' : ''} this month`, icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Available Payout', value: formatCurrency(pendingPayout), sub: 'Ready to withdraw',       icon: Clock,       bg: 'bg-amber-50',   color: 'text-amber-600' },
    { label: 'Milestones Paid',  value: payments.length,               sub: 'Completed milestones',    icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  ]

  const hasPendingRequest = payouts.some(p => p.status === 'pending')

  const handlePayoutSubmit = async (e) => {
    e.preventDefault()
    setPayoutError('')
    setPayoutSuccess('')

    const amount = Number(payoutForm.amount)
    if (amount < 100) { setPayoutError('Minimum payout amount is ₹100.'); return }
    if (amount > pendingPayout) { setPayoutError(`Maximum available is ${formatCurrency(pendingPayout)}.`); return }

    if (payoutMethod === 'bank') {
      if (!payoutForm.bank_account_name || !payoutForm.bank_account_number || !payoutForm.ifsc_code) {
        setPayoutError('Please fill all bank account details.'); return
      }
    } else {
      if (!payoutForm.upi_id) { setPayoutError('Please enter your UPI ID.'); return }
    }

    setPayoutLoading(true)
    try {
      const payload = { amount }
      if (payoutMethod === 'bank') {
        payload.bank_account_name   = payoutForm.bank_account_name
        payload.bank_account_number = payoutForm.bank_account_number
        payload.ifsc_code           = payoutForm.ifsc_code
      } else {
        payload.upi_id = payoutForm.upi_id
      }
      await requestPayout(payload)
      setPayoutSuccess(`Payout request of ${formatCurrency(amount)} submitted! We'll process it within 2-3 business days.`)
      setShowPayoutForm(false)
      setPayoutForm({ amount: '', bank_account_name: '', bank_account_number: '', ifsc_code: '', upi_id: '' })
      refetchPayouts()
      qc.invalidateQueries({ queryKey: ['auth', 'me'] })
    } catch (err) {
      setPayoutError(err?.message ?? 'Failed to submit payout request.')
    } finally {
      setPayoutLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Invoice Preview Modal */}
      {invoicePreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}
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

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Earnings
          </h2>
          <p className="text-sm text-slate-500 mt-1">Your earnings after platform commission.</p>
        </div>
        {pendingPayout >= 100 && !hasPendingRequest && (
          <button
            onClick={() => setShowPayoutForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors shrink-0"
          >
            <ArrowUpRight className="h-4 w-4" />
            Request Payout
          </button>
        )}
        {hasPendingRequest && (
          <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm font-semibold text-amber-700 shrink-0">
            <Clock className="h-4 w-4" />
            Payout Under Review
          </span>
        )}
      </div>

      {/* Metric Strip */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex flex-wrap sm:flex-nowrap divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-3 px-5 py-4 flex-1 min-w-[50%] sm:min-w-0">
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

      {/* Payout Request Form */}
      {showPayoutForm && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-semibold text-slate-800">Request Payout</h3>
              <span className="text-xs text-slate-400">Available: {formatCurrency(pendingPayout)}</span>
            </div>
            <button onClick={() => { setShowPayoutForm(false); setPayoutError('') }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handlePayoutSubmit} className="p-6 space-y-5">
            {payoutError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{payoutError}</p>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payout Amount (₹)</label>
              <input
                type="number" min="100" max={pendingPayout}
                value={payoutForm.amount}
                onChange={e => setPayoutForm(f => ({ ...f, amount: e.target.value }))}
                placeholder={`Min ₹100 · Max ${formatCurrency(pendingPayout)}`}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                required
              />
              <button type="button" onClick={() => setPayoutForm(f => ({ ...f, amount: String(Math.floor(pendingPayout)) }))}
                className="text-xs text-slate-500 hover:text-slate-800 mt-1.5 underline-offset-2 hover:underline">
                Withdraw full amount ({formatCurrency(pendingPayout)})
              </button>
            </div>

            {/* Method selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'bank', icon: Landmark, label: 'Bank Transfer', sub: 'NEFT / IMPS' },
                  { id: 'upi',  icon: CreditCard, label: 'UPI',        sub: 'Instant transfer' },
                ].map(({ id, icon: Icon, label, sub }) => (
                  <button key={id} type="button" onClick={() => setPayoutMethod(id)}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      payoutMethod === id
                        ? 'border-slate-800 bg-slate-50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1.5 ${payoutMethod === id ? 'text-slate-800' : 'text-slate-400'}`} />
                    <p className={`text-sm font-semibold ${payoutMethod === id ? 'text-slate-800' : 'text-slate-600'}`}>{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bank fields */}
            {payoutMethod === 'bank' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Holder Name</label>
                  <input value={payoutForm.bank_account_name}
                    onChange={e => setPayoutForm(f => ({ ...f, bank_account_name: e.target.value }))}
                    placeholder="As per bank records"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Number</label>
                    <input value={payoutForm.bank_account_number}
                      onChange={e => setPayoutForm(f => ({ ...f, bank_account_number: e.target.value }))}
                      placeholder="XXXXXXXXXXXX"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">IFSC Code</label>
                    <input value={payoutForm.ifsc_code}
                      onChange={e => setPayoutForm(f => ({ ...f, ifsc_code: e.target.value.toUpperCase() }))}
                      placeholder="HDFC0001234"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" required />
                  </div>
                </div>
              </div>
            )}

            {/* UPI field */}
            {payoutMethod === 'upi' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">UPI ID</label>
                <input value={payoutForm.upi_id}
                  onChange={e => setPayoutForm(f => ({ ...f, upi_id: e.target.value }))}
                  placeholder="yourname@upi"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" required />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setShowPayoutForm(false); setPayoutError('') }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={payoutLoading}
                className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors">
                {payoutLoading ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payout Success */}
      {payoutSuccess && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{payoutSuccess}</p>
        </div>
      )}

      {/* Payout History */}
      {payouts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800">Payout Requests</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {payouts.map(p => {
              const st = PAYOUT_STATUS[p.status] ?? PAYOUT_STATUS.pending
              return (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      Payout Request — {p.upi_id ? 'UPI' : 'Bank Transfer'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(p.created_at)}
                      {p.admin_notes && ` · ${p.admin_notes}`}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
                    {st.label}
                  </span>
                  <p className="text-sm font-bold text-slate-800 shrink-0">{formatCurrency(p.amount)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Transaction history */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
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
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-700">Transaction history</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {payments.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {p.contract?.project?.title ?? 'Unnamed project'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {p.milestone?.title}{p.milestone?.title && p.client?.name ? ' · ' : ''}{p.client?.name}
                  </p>
                </div>
                <div className="text-xs text-slate-400 shrink-0 hidden sm:block">
                  {formatDate(p.captured_at)}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-green-700">+{formatCurrency(p.net_amount)}</p>
                  <p className="text-xs text-slate-400 sm:hidden mt-0.5">{formatDate(p.captured_at)}</p>
                </div>
                {p.invoice_path && (
                  <button
                    onClick={() => openInvoice(p.id)}
                    className="shrink-0 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" />PDF
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t-2 border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Platform fees: <span className="font-semibold text-slate-600">
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
