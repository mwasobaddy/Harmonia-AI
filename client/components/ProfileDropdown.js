import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { logout, user: contextUser } = useAuth();

  // If `user` prop is not provided, fall back to context user
  const displayUser = user || contextUser || null

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
        className="flex items-center space-x-2 text-black hover:text-[#73cfd0] focus:outline-none focus:ring-2 focus:ring-[#73cfd0] rounded-md p-1"
      >
        <div className="w-8 h-8 bg-[#73cfd0] rounded-full flex items-center justify-center text-black text-sm font-medium">
          {displayUser?.name?.charAt(0)?.toUpperCase()
            || displayUser?.email?.charAt(0)?.toUpperCase()
            || 'U'}
        </div>
        <span className="text-sm font-medium hidden sm:block">
          {displayUser?.name
            ? displayUser.name.split(' ')[0]
            : displayUser?.email
              ? displayUser.email.split('@')[0]
              : 'User'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 min-w-[170px] w-fit bg-white rounded-md shadow-lg pt-1 z-50 border border-[#73cfd0]">
          <div className="px-4 py-2 border-b border-[#73cfd0]">
            <p className="text-sm font-medium text-black">{displayUser?.name || displayUser?.email || 'User'}</p>
            <p className="text-sm text-[#73cfd0]">{displayUser?.email}</p>
          </div>

          <Link
            href="/profile"
            className="flex items-center px-4 py-2 text-sm text-black hover:bg-[#73cfd0] hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4 mr-3" />
            Profile Settings
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-100 hover:text-red-900"
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