import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminHeader from './AdminHeader';
import {
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children, title, description }) {
  const { isLoggedIn, loading, user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check authentication and admin role
  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }

      if (user?.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        router.push('/chat');
        return;
      }
    }
  }, [isLoggedIn, loading, user, router]);

  if (loading || !isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2b2f] via-[#1a2332] to-[#0f2b2f] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const sidebarLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/documents', label: 'Documents', icon: FileText },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <Head>
        <title>{title} - Harmonia-AI Admin</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#0f2b2f] via-[#1a2332] to-[#0f2b2f] flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f2b2f]/95 backdrop-blur-lg border-r border-[#73cfd0]/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#73cfd0]/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#73cfd0] to-[#5abdc4] flex items-center justify-center">
                  <span className="text-black font-bold text-sm">A</span>
                </div>
                <span className="text-white font-semibold text-lg">Admin Panel</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-white hover:text-[#73cfd0] transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = router.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#73cfd0] text-black shadow-lg'
                        : 'text-white/70 hover:text-[#73cfd0] hover:bg-[#73cfd0]/10'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-[#73cfd0]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#73cfd0] to-[#5abdc4] rounded-full flex items-center justify-center text-black font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {user?.name || user?.email?.split('@')[0] || 'Admin'}
                  </div>
                  <div className="text-[#73cfd0] text-xs">Administrator</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          {/* <AdminHeader /> */}

          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-20 left-4 z-30 p-2 bg-[#0f2b2f]/90 backdrop-blur-lg border border-[#73cfd0]/20 rounded-lg text-white hover:text-[#73cfd0] transition-colors duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page Content */}
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}