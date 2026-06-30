import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/** Skeleton shown while auth state is loading */
function PageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  )
}

/**
 * Role-gated route wrapper.
 * Usage in router: element={<RequireAuth role="client" />}
 */
export default function RequireAuth({ role }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <PageSkeleton />
  if (!user) return <Navigate to="/auth/login" replace />
  if (role && user.role !== role) return <Navigate to="/403" replace />

  return <Outlet />
}
