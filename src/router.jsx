import { createBrowserRouter } from 'react-router-dom'
import RequireAuth from '@/components/shared/RequireAuth'

// Auth
import Login           from '@/pages/auth/Login'
import Register        from '@/pages/auth/Register'
import ForgotPassword  from '@/pages/auth/ForgotPassword'
import ResetPassword   from '@/pages/auth/ResetPassword'
import VerifyEmail     from '@/pages/auth/VerifyEmail'

// Layouts
import ClientLayout     from '@/layouts/ClientLayout'
import FreelancerLayout from '@/layouts/FreelancerLayout'
import AdminLayout      from '@/layouts/AdminLayout'

// Client pages
import ClientDashboard         from '@/pages/client/Dashboard'
import ClientProfileEdit       from '@/pages/client/ProfileEdit'
import MyProjects              from '@/pages/client/MyProjects'
import NewProject              from '@/pages/client/NewProject'
import ClientProjectDetail     from '@/pages/client/ProjectDetail'
import EditProject              from '@/pages/client/EditProject'
import FreelancerSearch        from '@/pages/client/FreelancerSearch'
import ClientContractsList     from '@/pages/client/ContractsList'

// Freelancer pages
import FreelancerDashboard     from '@/pages/freelancer/Dashboard'
import FreelancerProfileEdit   from '@/pages/freelancer/ProfileEdit'
import BrowseProjects          from '@/pages/freelancer/BrowseProjects'
import FreelancerProjectDetail from '@/pages/freelancer/ProjectDetail'
import MyProposals             from '@/pages/freelancer/MyProposals'
import FreelancerContractsList from '@/pages/freelancer/ContractsList'
import FreelancerEarnings      from '@/pages/freelancer/Earnings'

// Admin pages
import AdminDashboard      from '@/pages/admin/Dashboard'
import AdminUsers          from '@/pages/admin/Users'
import AdminVerifications  from '@/pages/admin/Verifications'
import AdminCategories     from '@/pages/admin/Categories'
import AdminPayments       from '@/pages/admin/Payments'
import AdminReviews        from '@/pages/admin/Reviews'
import AdminAuditLogs      from '@/pages/admin/AuditLogs'
import AdminReports        from '@/pages/admin/Reports'
import AdminSettings       from '@/pages/admin/Settings'

// Shared pages
import ContractDetail          from '@/pages/shared/ContractDetail'
import FreelancerPublicProfile from '@/pages/shared/FreelancerPublicProfile'
import ChatLayout              from '@/pages/shared/ChatLayout'
import PaymentHistory          from '@/pages/shared/PaymentHistory'
import ReviewForm              from '@/pages/shared/ReviewForm'

// Public
import Landing  from '@/pages/public/Landing'
import NotFound from '@/pages/errors/NotFound'
import Forbidden from '@/pages/errors/Forbidden'

export const router = createBrowserRouter([
  // ── Public landing ────────────────────────────────────────────────────
  { path: '/',                     element: <Landing /> },
  { path: '/auth/login',           element: <Login /> },
  { path: '/auth/register',        element: <Register /> },
  { path: '/auth/forgot-password', element: <ForgotPassword /> },
  { path: '/auth/reset-password',  element: <ResetPassword /> },
  { path: '/auth/verify-email',    element: <VerifyEmail /> },

  // ── Client ────────────────────────────────────────────────────────────
  {
    element: <RequireAuth role="client" />,
    children: [{
      element: <ClientLayout />,
      children: [
        { path: '/client',                             element: <ClientDashboard /> },
        { path: '/client/profile',                     element: <ClientProfileEdit /> },
        { path: '/client/projects',                    element: <MyProjects /> },
        { path: '/client/projects/new',                element: <NewProject /> },
        { path: '/client/projects/:id',                element: <ClientProjectDetail /> },
        { path: '/client/projects/:id/edit',           element: <EditProject /> },
        { path: '/client/freelancers',                 element: <FreelancerSearch /> },
        { path: '/client/freelancers/:userId',         element: <FreelancerPublicProfile /> },
        { path: '/client/contracts',                   element: <ClientContractsList /> },
        { path: '/client/contracts/:id',               element: <ContractDetail /> },
        { path: '/client/contracts/:contractId/review',element: <ReviewForm /> },
        { path: '/client/chat',                        element: <ChatLayout /> },
        { path: '/client/chat/:conversationId',        element: <ChatLayout /> },
        { path: '/client/payments',                    element: <PaymentHistory /> },
      ],
    }],
  },

  // ── Freelancer ────────────────────────────────────────────────────────
  {
    element: <RequireAuth role="freelancer" />,
    children: [{
      element: <FreelancerLayout />,
      children: [
        { path: '/freelancer',                              element: <FreelancerDashboard /> },
        { path: '/freelancer/profile',                      element: <FreelancerProfileEdit /> },
        { path: '/freelancer/projects',                     element: <BrowseProjects /> },
        { path: '/freelancer/projects/:id',                 element: <FreelancerProjectDetail /> },
        { path: '/freelancer/proposals',                    element: <MyProposals /> },
        { path: '/freelancer/contracts',                    element: <FreelancerContractsList /> },
        { path: '/freelancer/contracts/:id',                element: <ContractDetail /> },
        { path: '/freelancer/contracts/:contractId/review', element: <ReviewForm /> },
        { path: '/freelancer/chat',                         element: <ChatLayout /> },
        { path: '/freelancer/chat/:conversationId',         element: <ChatLayout /> },
        { path: '/freelancer/earnings',                     element: <FreelancerEarnings /> },
        { path: '/freelancers/:userId',                     element: <FreelancerPublicProfile /> },
      ],
    }],
  },

  // ── Admin ─────────────────────────────────────────────────────────────
  {
    element: <RequireAuth role="admin" />,
    children: [{
      element: <AdminLayout />,
      children: [
        { path: '/admin',               element: <AdminDashboard /> },
        { path: '/admin/users',         element: <AdminUsers /> },
        { path: '/admin/verifications', element: <AdminVerifications /> },
        { path: '/admin/categories',    element: <AdminCategories /> },
        { path: '/admin/payments',      element: <AdminPayments /> },
        { path: '/admin/reviews',       element: <AdminReviews /> },
        { path: '/admin/audit-logs',    element: <AdminAuditLogs /> },
        { path: '/admin/reports',       element: <AdminReports /> },
        { path: '/admin/settings',      element: <AdminSettings /> },
      ],
    }],
  },

  { path: '/403', element: <Forbidden /> },
  { path: '*',    element: <NotFound /> },
])
