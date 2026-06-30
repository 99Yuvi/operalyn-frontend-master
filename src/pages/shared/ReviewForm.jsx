import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getContract } from '@/api/contracts'
import { submitReview } from '@/api/reviews'
import { contractKeys } from '@/lib/queryKeys'
import { cn } from '@/lib/utils'

const DIMENSIONS = [
  { key: 'communication', label: 'Communication',  help: 'How well did they communicate throughout the project?' },
  { key: 'quality',       label: 'Quality of work', help: 'How satisfied were you with the delivered work?' },
  { key: 'timeliness',    label: 'Timeliness',      help: 'Did they deliver on time and meet deadlines?' },
  { key: 'overall',       label: 'Overall rating',  help: 'Your overall experience working together.' },
]

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className={cn(
            'text-2xl leading-none transition-transform hover:scale-110',
            n <= (hover || value) ? 'text-yellow-400' : 'text-slate-200'
          )}
        >
          ★
        </button>
      ))}
      {value > 0 && (
        <span className="text-sm text-slate-500 self-center ml-1">
          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][value]}
        </span>
      )}
    </div>
  )
}

export default function ReviewForm() {
  const { contractId } = useParams()
  const { user }       = useAuth()
  const navigate       = useNavigate()
  const qc             = useQueryClient()

  const { data } = useQuery({
    queryKey: contractKeys.detail(contractId),
    queryFn:  () => getContract(contractId),
    enabled:  !!contractId,
  })
  const contract = data?.data
  const isClient = user?.role === 'client'

  const [form, setForm]     = useState({ communication: 0, quality: 0, timeliness: 0, overall: 0, body: '' })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const mutation = useMutation({
    mutationFn: (data) => submitReview(contractId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contractKeys.detail(contractId) })
      setSubmitted(true)
    },
    onError: (err) => setErrors(err?.errors ?? { _: err?.message }),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const incomplete = DIMENSIONS.find(d => !form[d.key])
    if (incomplete) { setErrors({ _: `Please rate ${incomplete.label}.` }); return }
    mutation.mutate(form)
  }

  const backPath = isClient ? `/client/contracts/${contractId}` : `/freelancer/contracts/${contractId}`

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-5xl mb-4">⭐</p>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Review submitted!</h2>
        <p className="text-sm text-slate-500 mb-6">
          Your review will become visible once both parties have submitted, or after the 14-day window closes.
        </p>
        <button onClick={() => navigate(backPath)}
          className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          Back to contract
        </button>
      </div>
    )
  }

  const otherName = contract
    ? (isClient ? contract.freelancer?.name : contract.client?.name)
    : '…'

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(backPath)} className="text-slate-400 hover:text-slate-600 text-sm">← Back</button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600 font-medium">Leave a review</span>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
        Review your experience
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        How was working with <strong>{otherName}</strong> on <strong>{contract?.project?.title}</strong>?
      </p>

      {errors._ && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{errors._}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        {DIMENSIONS.map(d => (
          <div key={d.key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">{d.label}</label>
            </div>
            <p className="text-xs text-slate-400 mb-2">{d.help}</p>
            <StarRating
              value={form[d.key]}
              onChange={(v) => setForm(f => ({ ...f, [d.key]: v }))}
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Written review <span className="text-slate-400 font-normal">(optional, max 500 chars)</span>
          </label>
          <textarea
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value.slice(0, 500) }))}
            rows={4}
            placeholder="Share your experience in your own words…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <p className="text-xs text-slate-400 mt-1">{form.body.length}/500</p>
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <button type="button" onClick={() => navigate(backPath)}
            className="px-4 py-2.5 text-sm text-slate-500 border border-slate-300 rounded-lg hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending}
            className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            {mutation.isPending ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      </form>
    </div>
  )
}
