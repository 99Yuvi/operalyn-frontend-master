import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getFreelancer } from '@/api/profiles'
import { respondReview } from '@/api/reviews'
import { formatCurrency, getInitials, getAvatarColor } from '@/lib/utils'
import { freelancerKeys } from '@/lib/queryKeys'

export default function FreelancerPublicProfile() {
  const { userId }        = useParams()
  const { user: authUser }= useAuth()   // rename to avoid clash with API `user`
  const qc                = useQueryClient()

  const [respondingTo, setRespondingTo] = useState(null)
  const [responseText, setResponseText] = useState('')

  const respondMutation = useMutation({
    mutationFn: ({ reviewId, response }) => respondReview(reviewId, { response }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: freelancerKeys.detail(userId) })
      setRespondingTo(null)
      setResponseText('')
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: freelancerKeys.detail(userId),
    queryFn:  () => getFreelancer(userId),
    enabled:  !!userId,
  })

  if (isLoading) return <div className="text-sm text-slate-400 py-10 text-center">Loading profile…</div>

  const { user, profile: fp, reviews = [] } = data?.data ?? {}
  if (!fp) return <div className="text-sm text-red-500 py-10 text-center">Profile not found.</div>

  const colors  = getAvatarColor(user?.name ?? '')
  const isOwner = String(authUser?.id) === String(userId)

  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <div className="flex items-start gap-5">
          <div className={`h-16 w-16 rounded-full ${colors.bg} ${colors.text} text-xl font-bold flex items-center justify-center shrink-0`}>
            {getInitials(user?.name ?? '')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>{user?.name}</h1>
              {fp.verification_status === 'approved' && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">✓ Verified</span>
              )}
            </div>
            {fp.headline && <p className="text-sm text-slate-500 mt-1">{fp.headline}</p>}
            <div className="flex items-center gap-3 mt-2 flex-wrap text-sm">
              {fp.rating_avg ? (
                <span className="text-slate-600">★ <strong>{fp.rating_avg}</strong> <span className="text-slate-400">({fp.rating_count} reviews)</span></span>
              ) : fp.rating_count > 0 ? (
                <span className="text-xs text-slate-400">New freelancer</span>
              ) : null}
              {fp.hourly_rate && <span className="text-slate-600">{formatCurrency(fp.hourly_rate)}<span className="text-slate-400">/hr</span></span>}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                fp.availability === 'available' ? 'bg-green-50 text-green-700' :
                fp.availability === 'busy'      ? 'bg-yellow-50 text-yellow-700' :
                                                  'bg-slate-100 text-slate-500'
              }`}>{fp.availability}</span>
            </div>
          </div>
        </div>
        {fp.bio && <p className="mt-4 text-sm text-slate-600 whitespace-pre-wrap">{fp.bio}</p>}
        {fp.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {fp.skills.map(s => (
              <span key={s.id} className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{s.name}</span>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio */}
      {fp.portfolio?.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
          <h2 className="text-base font-semibold text-slate-800 mb-3">Portfolio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fp.portfolio.map(item => (
              <div key={item.id} className="border border-slate-100 rounded-lg p-3">
                <p className="text-sm font-medium text-slate-700">{item.title}</p>
                {item.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>}
                {item.project_url && (
                  <a href={item.project_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                    View project →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {fp.experiences?.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
          <h2 className="text-base font-semibold text-slate-800 mb-3">Experience</h2>
          <div className="space-y-3">
            {fp.experiences.map(e => (
              <div key={e.id} className="border-l-2 border-slate-200 pl-3">
                <p className="text-sm font-medium text-slate-800">{e.title} · {e.company}</p>
                <p className="text-xs text-slate-400">{e.start_date?.slice(0,7)} — {e.is_current ? 'Present' : e.end_date?.slice(0,7)}</p>
                {e.description && <p className="text-xs text-slate-500 mt-0.5">{e.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-3">
            Reviews <span className="text-slate-400 font-normal text-sm">({reviews.length})</span>
          </h2>
          <div className="space-y-5">
            {reviews.map(r => (
              <div key={r.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{r.reviewer?.name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map(n => (
                        <span key={n} className={`text-sm ${n <= r.overall ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {/* Dimension breakdown */}
                  <div className="text-xs text-slate-400 text-right space-y-0.5">
                    <div>Quality: {r.quality}/5</div>
                    <div>Comm: {r.communication}/5</div>
                    <div>Time: {r.timeliness}/5</div>
                  </div>
                </div>

                {r.body && <p className="text-sm text-slate-600">{r.body}</p>}

                {/* Existing response */}
                {r.response && (
                  <div className="mt-2 pl-3 border-l-2 border-slate-200">
                    <p className="text-xs text-slate-400 font-medium mb-0.5">Freelancer's response</p>
                    <p className="text-sm text-slate-500 italic">"{r.response}"</p>
                  </div>
                )}

                {/* Response form — only for the profile owner, only if not yet responded */}
                {isOwner && !r.response && (
                  respondingTo === r.id ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={responseText}
                        onChange={e => setResponseText(e.target.value.slice(0, 300))}
                        rows={2}
                        placeholder="Write a short response (max 300 chars)…"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setRespondingTo(null)}
                          className="text-xs text-slate-500 border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                          Cancel
                        </button>
                        <button
                          onClick={() => respondMutation.mutate({ reviewId: r.id, response: responseText })}
                          disabled={responseText.trim().length < 5 || respondMutation.isPending}
                          className="text-xs font-semibold bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                          {respondMutation.isPending ? 'Sending…' : 'Post response'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setRespondingTo(r.id); setResponseText('') }}
                      className="mt-2 text-xs text-blue-600 hover:underline">
                      Respond to this review →
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
