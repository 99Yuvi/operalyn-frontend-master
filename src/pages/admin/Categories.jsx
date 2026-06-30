import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '@/api/admin'

export default function AdminCategories() {
  const qc = useQueryClient()
  const [form, setForm]   = useState({ name: '', icon: '', parent_id: '' })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['admin','categories'], queryFn: getAdminCategories })
  const categories = data?.data ?? []

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin','categories'] }); setForm({ name: '', icon: '', parent_id: '' }) },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, ...data }) => updateCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin','categories'] }); setEditing(null) },
  })
  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','categories'] }),
  })

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>Categories</h2>

      {/* Add form */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Add category</h3>
        <div className="flex gap-2">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Category name *" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
            placeholder="Icon (lucide name)" className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
            className="w-44 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none">
            <option value="">Top-level</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => createMut.mutate(form)} disabled={!form.name.trim() || createMut.isPending}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
            Add
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Icon</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Active</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-6 text-sm text-slate-400">Loading…</td></tr>
            ) : categories.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">{c.icon}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => updateMut.mutate({ id: c.id, is_active: !c.is_active })}
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => window.confirm('Delete this category?') && deleteMut.mutate(c.id)}
                    className="text-xs text-red-500 hover:underline">Delete</button>
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
