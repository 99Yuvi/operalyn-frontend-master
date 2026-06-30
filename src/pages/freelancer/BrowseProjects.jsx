import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBrowseProjects } from '@/hooks/useProjects'
import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/profiles'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function BrowseProjects() {
  const [params, setParams]   = useState({ q: '', category_id: '', budget_type: '', sort: 'newest' })
  const [applied, setApplied] = useState({})

  const { data, isLoading } = useBrowseProjects(applied)
  const { data: catData }   = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const projects   = data?.data ?? []
  const categories = catData?.data ?? []

  const handleSearch = (e) => {
    e.preventDefault()
    setApplied({ ...params })
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>Find Work</h2>
      <p className="text-sm text-slate-500 mb-5">Browse projects posted by clients looking for your skills.</p>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-5">
        <input value={params.q} onChange={e => setParams(p => ({ ...p, q: e.target.value }))}
          placeholder="Search projects…"
          className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        <select value={params.category_id} onChange={e => setParams(p => ({ ...p, category_id: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 focus:outline-none">
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={params.budget_type} onChange={e => setParams(p => ({ ...p, budget_type: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 focus:outline-none">
          <option value="">Any budget</option>
          <option value="fixed">Fixed price</option>
          <option value="hourly">Hourly</option>
        </select>
        <button type="submit" className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm text-slate-500">No open projects found. Try different filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <Link key={p.id} to={`/freelancer/projects/${p.id}`}
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">{p.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.skills?.slice(0, 4).map(s => (
                      <span key={s.id} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{s.name}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    {p.category && <span>{p.category.name}</span>}
                    <span>·</span>
                    <span>{p.proposals_count ?? 0} proposals</span>
                    {p.deadline && <><span>·</span><span>Due {formatDate(p.deadline)}</span></>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {p.budget_max && (
                    <p className="text-sm font-bold text-slate-800">
                      {formatCurrency(p.budget_min ?? p.budget_max)}
                      {p.budget_max !== p.budget_min && p.budget_min ? ` – ${formatCurrency(p.budget_max)}` : ''}
                      {p.budget_type === 'hourly' ? '/hr' : ''}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(p.created_at)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
