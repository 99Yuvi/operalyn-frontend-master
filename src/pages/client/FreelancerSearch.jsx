import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getFreelancers } from '@/api/profiles'
import { getSkills } from '@/api/profiles'
import { getInitials, getAvatarColor, formatCurrency } from '@/lib/utils'
import { freelancerKeys } from '@/lib/queryKeys'
import { Search, Users, Star } from 'lucide-react'

export default function FreelancerSearch() {
  const [params, setParams] = useState({ q: '', availability: '', sort: 'rating' })
  const [applied, setApplied] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: freelancerKeys.list(applied),
    queryFn:  () => getFreelancers(applied),
  })

  const { data: skillsData } = useQuery({ queryKey: ['skills'], queryFn: getSkills })
  const allSkills = skillsData?.data ?? []

  const freelancers = data?.data ?? []

  const handleSearch = (e) => {
    e.preventDefault()
    setApplied({ ...params })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Find Talent</h2>
      <p className="text-sm text-slate-500 mb-6">Search verified freelancers by skill, rate, or name.</p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={params.q}
            onChange={e => setParams(p => ({ ...p, q: e.target.value }))}
            placeholder="Search by name, skill, or headline…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <select
          value={params.availability}
          onChange={e => setParams(p => ({ ...p, availability: e.target.value }))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">Any availability</option>
          <option value="available">Available now</option>
          <option value="busy">Busy</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="text-center py-12">
          <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Users className="h-7 w-7 text-blue-400" />
          </div>
          <p className="text-base font-semibold text-slate-700 mb-1">No freelancers found</p>
          <p className="text-sm text-slate-500">No freelancers match your search. Try different keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {freelancers.map(fp => {
            const user   = fp.user
            const colors = getAvatarColor(user?.name ?? '')
            return (
              <Link key={fp.id} to={`/client/freelancers/${user?.id}`}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all flex gap-4">
                <div className={`h-11 w-11 rounded-full ${colors.bg} ${colors.text} text-sm font-semibold flex items-center justify-center shrink-0`}>
                  {getInitials(user?.name ?? '')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                    {fp.verification_status === 'approved' && (
                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-green-50 border border-green-200 shrink-0">
                        <svg className="h-2.5 w-2.5 text-green-600" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </div>
                  {fp.headline && <p className="text-xs text-slate-500 mt-0.5 truncate">{fp.headline}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {fp.rating_avg && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {fp.rating_avg}
                        <span className="text-slate-400 font-normal">({fp.rating_count})</span>
                      </span>
                    )}
                    {fp.hourly_rate && (
                      <span className="text-xs text-slate-500 font-medium">{formatCurrency(fp.hourly_rate)}/hr</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      fp.availability === 'available'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : fp.availability === 'busy'
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>{fp.availability}</span>
                  </div>
                  {fp.skills?.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {fp.skills.slice(0, 3).map(s => (
                        <span key={s.id} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">{s.name}</span>
                      ))}
                      {fp.skills.length > 3 && <span className="text-xs text-slate-400 px-1">+{fp.skills.length - 3} more</span>}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
