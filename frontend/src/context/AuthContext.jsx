import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('helpdost_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Rehydrate session on mount
  useEffect(() => {
    const token = localStorage.getItem('helpdost_token')
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user)
        localStorage.setItem('helpdost_user', JSON.stringify(res.data.user))
      })
      .catch(() => {
        setUser(null)
        localStorage.removeItem('helpdost_token')
        localStorage.removeItem('helpdost_user')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('helpdost_user', JSON.stringify(userData))
    if (token) localStorage.setItem('helpdost_token', token)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    setUser(null)
    localStorage.removeItem('helpdost_token')
    localStorage.removeItem('helpdost_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
