import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4"
      style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <div className="text-center max-w-sm">

        {/* Icon circle */}
        <div className="h-16 w-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">🗺️</span>
        </div>

        {/* 404 */}
        <p className="text-7xl font-bold text-slate-800 mb-3 tracking-tight"
          style={{ fontFamily: 'Georgia, serif', lineHeight: 1 }}>
          404
        </p>

        <h1 className="text-lg font-semibold text-slate-800 mb-2">Page not found</h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
