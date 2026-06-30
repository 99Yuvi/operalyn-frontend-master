import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminUsers, updateUserStatus, deleteUser } from '@/api/admin'
import { formatDate, cn } from '@/lib/utils'

const ROLE_C = { admin: 'bg-purple-50 text-purple-700', client: 'bg-blue-50 text-blue-700', freelancer: 'bg-green-50 text-green-700' }
const STATUS_C = { active: 'bg-green-50 text-green-700', suspended: 'bg-red-50 text-red-600' }

export default function AdminUsers() {
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({})
  const [suspendModal, setSuspendModal] = useState(null)
  const [reason, setReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin','users', filters],
    queryFn:  () => getAdminUsers(filters),
  })
  const users = data?.data ?? []

  const statusMut = useMutation({
    mutationFn: ({ id, status, reason }) => updateUserStatus(id, { status, reason }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin','users'] }); setSuspendModal(null); setReason('') },
  })
  const deleteMut = useMutation({
    mutationFn: ({ id, reason }) => deleteUser(id, { reason }),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin','users'] }),
  })

  const handleSearch = (e) => { e.preventDefault(); setFilters({ q }) }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>Users</h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or email…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        <select onChange={e => setFilters(f => ({ ...f, role: e.target.value || undefined }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none">
          <option value="">All roles</option>
          <option value="client">Clients</option>
          <option value="freelancer">Freelancers</option>
          <option value="admin">Admins</option>
        </select>
        <select onChange={e => setFilters(f => ({ ...f, status: e.target.value || undefined }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button type="submit" className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Search
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">Loading…</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', ROLE_C[u.role] ?? '')}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_C[u.status] ?? '')}>{u.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {u.status === 'active' ? (
                      <button onClick={() => setSuspendModal(u)}
                        className="text-xs text-amber-600 hover:underline">Suspend</button>
                    ) : (
                      <button onClick={() => statusMut.mutate({ id: u.id, status: 'active', reason: 'Unsuspended by admin' })}
                        className="text-xs text-green-600 hover:underline">Unsuspend</button>
                    )}
                    <button onClick={() => window.confirm('Delete this user?') && deleteMut.mutate({ id: u.id, reason: 'Admin deletion' })}
                      className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Suspend modal */}
      {suspendModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-2">Suspend {suspendModal.name}</h3>
            <p className="text-sm text-slate-500 mb-4">Their account will be hidden. You can unsuspend anytime.</p>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Reason for suspension…" rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 mb-3" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setSuspendModal(null)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => statusMut.mutate({ id: suspendModal.id, status: 'suspended', reason })}
                disabled={!reason.trim() || statusMut.isPending}
                className="px-4 py-2 text-sm font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50">
                {statusMut.isPending ? 'Suspending…' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
