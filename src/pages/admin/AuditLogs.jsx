import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/api/admin'
import { formatDate, timeAgo } from '@/lib/utils'

export default function AdminAuditLogs() {
  const [filters, setFilters] = useState({})
  const { data, isLoading } = useQuery({
    queryKey: ['admin','audit-logs', filters],
    queryFn:  () => getAuditLogs(filters),
  })
  const logs = data?.data ?? []

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>Audit Logs</h2>
      <p className="text-sm text-slate-500 mb-4">Immutable record of all admin actions.</p>

      <div className="flex gap-2 mb-4">
        <input placeholder="Filter by action…" onChange={e => setFilters(f => ({ ...f, action: e.target.value || undefined }))}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        <input type="date" onChange={e => setFilters(f => ({ ...f, from: e.target.value || undefined }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Admin</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">IP</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-6 text-sm text-slate-400">Loading…</td></tr>
            ) : logs.map(l => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-700">{l.admin?.name}</td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{l.action}</code>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">{l.ip_address}</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-slate-400" title={formatDate(l.created_at)}>{timeAgo(l.created_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
