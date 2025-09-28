import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Fetch user profile if token is present and user is not set
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token && !user) {
      fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.user) setUser(data.user)
        })
        .catch(() => {})
    }
  }, [user])

  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      setIsLoggedIn(true)
      // You could also fetch user profile here
      // fetchUserProfile(token)
    } else {
      setIsLoggedIn(false)
      setUser(null)
    }
    setLoading(false)
  }

  const login = (token, userData = null) => {
    localStorage.setItem('authToken', token)
    setIsLoggedIn(true)
    if (userData) setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setIsLoggedIn(false)
    setUser(null)
  }

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}