import { createContext, useContext, useEffect, useState } from 'react'
import { getMe, logout as apiLogout, getSocketToken } from '@/api/auth'
import { initCsrf } from '@/api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [profile, setProfile]     = useState(null)
  const [socketToken, setSocketToken] = useState(null)
  const [isLoading, setLoading]   = useState(true)

  useEffect(() => {
    getMe()
      .then(({ data }) => {
        setUser(data.user)
        setProfile(data.profile)
        // Fetch a Sanctum token for Socket.io auth
        getSocketToken()
          .then(r => setSocketToken(r.token))
          .catch(() => {})
      })
      .catch(() => {
        setUser(null)
        setProfile(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (userData, profileData) => {
    setUser(userData)
    setProfile(profileData ?? null)
  }

  const logout = async () => {
    try {
      await initCsrf()
      await apiLogout()
    } catch {}
    setSocketToken(null)
    setUser(null)
    setProfile(null)
    window.location.href = '/auth/login'
  }

  const refreshMe = () =>
    getMe().then(({ data }) => {
      setUser(data.user)
      setProfile(data.profile)
    })

  return (
    <AuthContext.Provider value={{ user, profile, socketToken, isLoading, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
