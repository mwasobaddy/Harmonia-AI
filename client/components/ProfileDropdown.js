
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';


const ProfileDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const router = useRouter();
  const { logout, user: contextUser } = useAuth();

  // If `user` prop is not provided, fall back to context user
  const displayUser = user || contextUser || null;

  // Animate dropdown menu
  useEffect(() => {
    if (isOpen && dropdownMenuRef.current) {
      gsap.fromTo(
        dropdownMenuRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-black hover:text-[#73cfd0] focus:outline-none focus:ring-2 focus:ring-[#73cfd0] rounded-full p-1 transition-all duration-200 shadow-sm border-2 border-white/80 hover:bg-[#73cfd0]/10"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* Avatar with gradient border */}
        <div className="w-9 h-9 bg-gradient-to-br from-[#73cfd0] to-[#5abdc4] rounded-full flex items-center justify-center text-black text-base font-bold shadow border-2 border-white">
          {displayUser?.name?.charAt(0)?.toUpperCase()
            || displayUser?.email?.charAt(0)?.toUpperCase()
            || 'U'}
        </div>
        <span className="text-base font-semibold hidden sm:block text-white tracking-wide">
          {displayUser?.name
            ? displayUser.name.split(' ')[0]
            : displayUser?.email
              ? displayUser.email.split('@')[0]
              : 'User'}
        </span>
        <ChevronDown className={`h-4 w-4 text-[#73cfd0] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          ref={dropdownMenuRef}
          className="absolute right-0 mt-2 min-w-[190px] w-fit bg-white rounded-xl shadow-2xl pt-1 z-50 border border-[#73cfd0] animate-fade-in"
        >
          <div className="px-4 py-3 border-b border-[#73cfd0] flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#73cfd0] to-[#5abdc4] rounded-full flex items-center justify-center text-black text-base font-bold">
              {displayUser?.name?.charAt(0)?.toUpperCase()
                || displayUser?.email?.charAt(0)?.toUpperCase()
                || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-black">{displayUser?.name || displayUser?.email || 'User'}</p>
              <p className="text-xs text-[#73cfd0]">{displayUser?.email}</p>
            </div>
          </div>

          <Link
            href="/profile"
            className="flex items-center px-4 py-2 text-sm text-black hover:bg-[#73cfd0] hover:text-white rounded transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4 mr-3 text-[#73cfd0] group-hover:text-white transition-colors" />
            Profile Settings
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-100 hover:text-red-900 rounded transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;