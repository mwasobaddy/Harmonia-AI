import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Button from './Button'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status on mount and route changes
    checkAuthStatus()
  }, [router.pathname])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      try {
        // Verify token with backend
        const response = await fetch('http://localhost:5000/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setIsLoggedIn(true)
        } else {
          // Token invalid, remove it
          localStorage.removeItem('authToken')
          setIsLoggedIn(false)
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('authToken')
        setIsLoggedIn(false)
        setUser(null)
      }
    } else {
      setIsLoggedIn(false)
      setUser(null)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    localStorage.removeItem('authToken')
    setIsLoggedIn(false)
    setUser(null)
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Harmonia-AI
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/services" className="text-gray-700 hover:text-gray-900">
              Services
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-gray-900">
              How It Works
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900">
              Contact
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link href="/chat" className="text-gray-700 hover:text-gray-900">
                  Chat
                </Link>
                <Link href="/documents" className="text-gray-700 hover:text-gray-900">
                  Documents
                </Link>
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name?.split(' ')[0]}
                </span>
                <Button onClick={handleLogout} size="sm" variant="outline">
                  Logout
                </Button>
              </div>
            ) : (
              <Button href="/login" size="sm">
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}