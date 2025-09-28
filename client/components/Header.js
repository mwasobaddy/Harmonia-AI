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
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
  <header className={`sticky top-0 left-0 right-0 z-50 bg-[#0f2b2fcc] transition-all duration-300 ${isScrolled ? 'backdrop-blur-sm bg-[#0f2b2fcc]/90 border-b border-[#73cfd0] shadow-md' : ''}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hidden md:block">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#73cfd0] flex items-center justify-center text-black text-lg font-bold">H</div>
            <Link href="/" className="text-2xl font-extrabold text-white tracking-tight">
              Harmonia-AI
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/services" className="text-white hover:text-[#73cfd0] font-medium transition">Services</Link>
            <Link href="/info" className="text-white hover:text-[#73cfd0] font-medium transition">Info</Link>
            <Link href="/about" className="text-white hover:text-[#73cfd0] font-medium transition">About</Link>
            <Link href="/contact" className="text-white hover:text-[#73cfd0] font-medium transition">Contact</Link>
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link href="/chat" className="text-white hover:text-[#73cfd0] font-medium transition">Chat</Link>
                <Link href="/documents" className="text-white hover:text-[#73cfd0] font-medium transition">Documents</Link>
                <ProfileDropdown user={user} />
              </div>
            ) : (
              <Button href="/login" size="sm" className="bg-[#73cfd0] text-black font-semibold shadow hover:bg-white hover:text-[#73cfd0] transition">
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 block md:hidden">
        <div className="flex justify-between h-[45px] items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#73cfd0] flex items-center justify-center text-black text-lg font-bold">H</div>
            <Link href="/" className="text-xl font-extrabold text-white tracking-tight">
              Harmonia-AI
            </Link>
          </div>
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <ProfileDropdown user={user} />
            </div>
          ) : (
            <Button href="/login" size="sm" className="bg-[#73cfd0] text-black font-semibold shadow hover:bg-white hover:text-[#73cfd0] transition h-fit">
              <LogIn className="h-4 w-4 mr-1" />
              Login
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}