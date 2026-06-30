import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getReports } from '@/api/admin'
import { formatCurrency } from '@/lib/utils'

function MiniChart({ data, color = '#334155' }) {
  if (!data?.length) return <div className="text-xs text-slate-400">No data</div>
  const max = Math.max(...data.map(d => d.count ?? d.total ?? 0), 1)
  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.slice(-30).map((d, i) => {
        const val = d.count ?? d.total ?? 0
        const h = Math.max(2, Math.round((val / max) * 48))
        return (
          <div key={i} title={`${d.date ?? d.category}: ${val}`}
            style={{ height: h, backgroundColor: color, flex: '1', borderRadius: '1px', opacity: 0.8 }} />
        )
      })}
    </div>
  )
}

export default function AdminReports() {
  const [range, setRange] = useState('30')
  const from = new Date(Date.now() - parseInt(range) * 86400000).toISOString().slice(0,10)
  const to   = new Date().toISOString().slice(0,10)

  const { data, isLoading } = useQuery({
    queryKey: ['admin','reports', range],
    queryFn:  () => getReports({ from, to }),
  })
  const r = data?.data ?? {}

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>Reports</h2>
        <div className="flex gap-1">
          {[['7','7 days'], ['30','30 days'], ['90','90 days']].map(([v, l]) => (
            <button key={v} onClick={() => setRange(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${range === v ? 'bg-slate-700 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* User growth */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">User registrations</p>
            <MiniChart data={r.user_growth} color="#4F88D4" />
            <p className="text-xs text-slate-400 mt-2">
              Total: {r.user_growth?.reduce((s, d) => s + d.count, 0) ?? 0} in {range} days
            </p>
          </div>

          {/* Project volume */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Projects posted</p>
            <MiniChart data={r.project_volume} color="#3DB88A" />
            <p className="text-xs text-slate-400 mt-2">
              Total: {r.project_volume?.reduce((s, d) => s + d.count, 0) ?? 0} in {range} days
            </p>
          </div>

          {/* Revenue by category */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Revenue by category</p>
            {r.rev_by_category?.length ? (
              <div className="space-y-2">
                {r.rev_by_category.slice(0, 6).map(c => {
                  const max = r.rev_by_category[0]?.total ?? 1
                  return (
                    <div key={c.category}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-600">{c.category}</span>
                        <span className="text-slate-500 font-medium">{formatCurrency(c.total)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(c.total / max) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : <p className="text-xs text-slate-400">No revenue data</p>}
          </div>

          {/* Top freelancers */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Top freelancers</p>
            <div className="space-y-2">
              {r.top_freelancers?.slice(0, 5).map((f, i) => (
                <div key={f.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 w-4">{i + 1}</span>
                    <span className="text-slate-700 font-medium">{f.name}</span>
                    {f.rating_avg && <span className="text-xs text-yellow-500">★{f.rating_avg}</span>}
                  </div>
                  <span className="text-xs font-semibold text-green-700">{formatCurrency(f.total_earnings)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
