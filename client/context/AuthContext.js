import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Listen for auth changes (e.g., login/logout)
  useEffect(() => {
    const handleAuthChange = () => {
      checkAuthStatus()
    }
    window.addEventListener('authChange', handleAuthChange)
    return () => window.removeEventListener('authChange', handleAuthChange)
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      try {
        // Validate token with server
        const response = await fetch('http://localhost:5000/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setIsLoggedIn(true)
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('authToken')
          setIsLoggedIn(false)
          setUser(null)
        }
      } catch (error) {
        // Network error or server down, keep token but don't assume logged in
        console.warn('Auth validation failed:', error)
        localStorage.removeItem('authToken')
        setIsLoggedIn(false)
        setUser(null)
      }
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
    // Trigger auth status check to validate token and get user data
    checkAuthStatus()
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setIsLoggedIn(false)
    setUser(null)
    setLoading(false)
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