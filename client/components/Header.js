
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Button from './Button'
import ProfileDropdown from './ProfileDropdown'
import { MessageCircle, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { isLoggedIn, user } = useAuth()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-[#0f1419]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20 items-center">
          {/* Logo with enhanced styling */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#73cfd0] to-[#5abdc4] flex items-center justify-center shadow-lg">
                <img src="/logo.png" alt="Harmonia-AI Logo" className="h-full w-full object-contain" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse"></div>
            </div>
            <Link href="/" className="text-2xl md:text-3xl font-black text-white tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Harmonia-AI
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {['Services', 'Info', 'About', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="relative text-white/80 hover:text-white font-medium transition-all duration-300 group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#73cfd0] to-[#5abdc4] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Button href="/chat" size="sm" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button href="/documents" size="sm" variant="secondary">
                  <FileText className="w-4 h-4 mr-2" />
                  Docs
                </Button>
                <ProfileDropdown user={user} />
              </div>
            ) : (
              <Button href="/login" size="md">
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile Login/Profile */}
          <div className="lg:hidden">
            {isLoggedIn ? (
              <ProfileDropdown user={user} />
            ) : (
              <Button href="/login" size="sm">
                Get Started
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}