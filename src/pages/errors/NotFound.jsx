import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-slate-200 mb-4" style={{ fontFamily: 'Georgia, serif' }}>404</p>
        <h1 className="text-xl font-semibold text-slate-800 mb-2">Page not found</h1>
        <p className="text-sm text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-block rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Go home</Link>
      </div>
    </div>
  )
}
