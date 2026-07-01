import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBrowseProjects } from '@/hooks/useProjects'
import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/profiles'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Briefcase, DollarSign, Calendar, Clock, Eye, Send } from 'lucide-react'

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
      {/* Page header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-slate-900 tracking-tight"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Find Work
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Browse projects posted by clients looking for your skills.
        </p>
      </div>

      {/* Search & filters */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-slate-200 rounded-xl p-4 mb-5"
      >
        <div className="flex flex-wrap gap-2">
          {/* Search input */}
          <div className="flex-1 min-w-[200px] relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              value={params.q}
              onChange={e => setParams(p => ({ ...p, q: e.target.value }))}
              placeholder="Search projects…"
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition"
            />
          </div>

          {/* Category filter */}
          <select
            value={params.category_id}
            onChange={e => setParams(p => ({ ...p, category_id: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition appearance-none cursor-pointer pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            <option value="">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Budget type filter */}
          <select
            value={params.budget_type}
            onChange={e => setParams(p => ({ ...p, budget_type: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition appearance-none cursor-pointer pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            <option value="">Any budget</option>
            <option value="fixed">Fixed price</option>
            <option value="hourly">Hourly</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-7 w-7 text-blue-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">No projects found</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Try adjusting your search or filters to find more work.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <Link
              key={p.id}
              to={`/freelancer/projects/${p.id}`}
              className="group block bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left — project details */}
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 line-clamp-1">
                      {p.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                    {p.description}
                  </p>

                  {/* Skill tags */}
                  {p.skills && p.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {p.skills.slice(0, 4).map(s => (
                        <span
                          key={s.id}
                          className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                      {p.skills.length > 4 && (
                        <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-medium">
                          +{p.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3">
                    {p.category && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Briefcase className="h-3.5 w-3.5" />
                        {p.category.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Send className="h-3.5 w-3.5" />
                      {p.proposals_count ?? 0} proposal{(p.proposals_count ?? 0) !== 1 ? 's' : ''}
                    </span>
                    {p.deadline && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        Due {formatDate(p.deadline)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(p.created_at)}
                    </span>
                  </div>
                </div>

                {/* Right — budget + view */}
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  {p.budget_max && (
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {formatCurrency(p.budget_min ?? p.budget_max)}
                        {p.budget_max !== p.budget_min && p.budget_min
                          ? ` – ${formatCurrency(p.budget_max)}`
                          : ''}
                        {p.budget_type === 'hourly' ? '/hr' : ''}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">
                        {p.budget_type === 'hourly' ? 'Hourly rate' : 'Fixed price'}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-slate-600 transition-colors mt-1">
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
