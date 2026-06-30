import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getFreelancers } from '@/api/profiles'
import { getSkills } from '@/api/profiles'
import { getInitials, getAvatarColor, formatCurrency } from '@/lib/utils'
import { freelancerKeys } from '@/lib/queryKeys'

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
      <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>Find Talent</h2>
      <p className="text-sm text-slate-500 mb-6">Search verified freelancers by skill, rate, or name.</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          value={params.q}
          onChange={e => setParams(p => ({ ...p, q: e.target.value }))}
          placeholder="Search by name, skill, or headline…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <select value={params.availability} onChange={e => setParams(p => ({ ...p, availability: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-600 focus:outline-none">
          <option value="">Any availability</option>
          <option value="available">Available now</option>
          <option value="busy">Busy</option>
        </select>
        <button type="submit"
          className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">🔍</p>
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
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                    {fp.verification_status === 'approved' && (
                      <span className="text-xs text-green-600 shrink-0">✓</span>
                    )}
                  </div>
                  {fp.headline && <p className="text-xs text-slate-500 mt-0.5 truncate">{fp.headline}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {fp.rating_avg && (
                      <span className="text-xs text-slate-600">★ {fp.rating_avg} ({fp.rating_count})</span>
                    )}
                    {fp.hourly_rate && (
                      <span className="text-xs text-slate-400">{formatCurrency(fp.hourly_rate)}/hr</span>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      fp.availability === 'available' ? 'bg-green-50 text-green-700' :
                      fp.availability === 'busy' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>{fp.availability}</span>
                  </div>
                  {fp.skills?.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {fp.skills.slice(0, 3).map(s => (
                        <span key={s.id} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{s.name}</span>
                      ))}
                      {fp.skills.length > 3 && <span className="text-xs text-slate-400">+{fp.skills.length - 3}</span>}
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
