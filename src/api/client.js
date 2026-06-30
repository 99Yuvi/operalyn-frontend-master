import axios from 'axios'

// In development: VITE_API_URL is unset → relative URLs go through Vite proxy
// In production: VITE_API_URL=https://api.operalyn.com → absolute URLs
const API_ORIGIN = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({
  baseURL: `${API_ORIGIN}/api/v1`,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

/** Initialise CSRF cookie before any auth call */
export async function initCsrf() {
  await axios.get(`${API_ORIGIN}/sanctum/csrf-cookie`, { withCredentials: true })
}

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname
      // Don't redirect from public pages — only kick out of protected routes
      const isPublic = path === '/' || path.startsWith('/auth') || path.startsWith('/freelancers')
      if (!isPublic) {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(err.response?.data ?? err)
  },
)

export default api
