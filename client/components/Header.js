import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Button from './Button'
import ProfileDropdown from './ProfileDropdown'
import { LogIn, LogOut } from 'lucide-react'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status on mount and route changes
    checkAuthStatus()

    // Add scroll event listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
        } else if (response.status === 401) {
          // Token invalid, remove it
          localStorage.removeItem('authToken')
          setIsLoggedIn(false)
          setUser(null)
        } else {
          // Other errors (server error, network issues, etc.) - don't remove token
          console.warn('Auth verification failed with status:', response.status)
          setIsLoggedIn(false)
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Don't remove token on network errors - user might still be logged in
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
    // Dispatch custom event to notify components of auth change
    window.dispatchEvent(new Event('authChange'))
    setIsLoggedIn(false)
    setUser(null)
    router.push('/')
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${isScrolled ? 'backdrop-blur-sm bg-white/80 border-b border-gray-200 shadow-md' : ''}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hidden md:block">
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
            <Link href="/info" className="text-gray-700 hover:text-gray-900">
              Info
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
                <ProfileDropdown user={user} onLogout={handleLogout} />
              </div>
            ) : (
              <Button href="/login" size="sm">
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 block md:hidden">
        <div className="flex justify-between h-[45px] items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Harmonia-AI
            </Link>
          </div>

          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <ProfileDropdown user={user} onLogout={handleLogout} />
            </div>
          ) : (
            <Button href="/login" size="sm" className='bg-rose-500 h-fit'>
              <LogIn className="h-4 w-4 mr-1" />
              Login
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}