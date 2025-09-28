import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Button from './Button'
import ProfileDropdown from './ProfileDropdown'
import { LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const { isLoggedIn, user } = useAuth()

  useEffect(() => {
    // Add scroll event listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${isScrolled ? 'backdrop-blur-sm bg-white/80 border-b border-gray-200 shadow-md' : ''}`}>
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
                <ProfileDropdown user={user} />
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
              <ProfileDropdown user={user} />
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