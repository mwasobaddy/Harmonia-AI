import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  MessageCircle
} from 'lucide-react';

export default function AdminHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/documents', label: 'Documents', icon: FileText },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const guestLinks = [
    { href: '/services', label: 'Services' },
    { href: '/info', label: 'Info' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const profileLinks = [
    { href: '/profile', label: 'Profile Settings', icon: User },
    { href: '/chat', label: 'Chat', icon: MessageCircle },
    { href: '/documents', label: 'Documents', icon: FileText },
  ];

  return (
    <header className="bg-[#0f2b2f]/90 backdrop-blur-lg border-b border-[#73cfd0]/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#73cfd0] to-[#5abdc4] flex items-center justify-center shadow-lg">
                <img src="/logo.png" alt="Harmonia-AI Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl font-bold text-white">Harmonia-AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Guest Links */}
            {guestLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-[#73cfd0] font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}

            {/* Admin Links */}
            <div className="h-6 w-px bg-[#73cfd0]/30"></div>
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = router.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#73cfd0] text-black'
                      : 'text-white/70 hover:text-[#73cfd0] hover:bg-[#73cfd0]/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Profile Section */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Profile Links */}
            <div className="flex items-center gap-2">
              {profileLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-[#73cfd0] hover:bg-[#73cfd0]/10 rounded-lg transition-all duration-200"
                    title={link.label}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#73cfd0]/20">
              <div className="text-right">
                <div className="text-white text-sm font-medium">
                  {user?.name || user?.email?.split('@')[0] || 'Admin'}
                </div>
                <div className="text-[#73cfd0] text-xs">Administrator</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-[#73cfd0] transition-colors duration-200"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#73cfd0]/20 py-4">
            <nav className="space-y-2">
              {/* Guest Links */}
              <div className="px-2 py-2">
                <div className="text-[#73cfd0] text-xs font-semibold uppercase tracking-wide mb-2">Public</div>
                {guestLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-white/70 hover:text-[#73cfd0] hover:bg-[#73cfd0]/10 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Admin Links */}
              <div className="px-2 py-2 border-t border-[#73cfd0]/20">
                <div className="text-[#73cfd0] text-xs font-semibold uppercase tracking-wide mb-2">Admin</div>
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = router.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-[#73cfd0] text-black'
                          : 'text-white/70 hover:text-[#73cfd0] hover:bg-[#73cfd0]/10'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Profile Links */}
              <div className="px-2 py-2 border-t border-[#73cfd0]/20">
                <div className="text-[#73cfd0] text-xs font-semibold uppercase tracking-wide mb-2">Account</div>
                {profileLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-[#73cfd0] hover:bg-[#73cfd0]/10 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}