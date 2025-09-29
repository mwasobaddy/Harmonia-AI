import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminLayout({ children, title, description }) {
  const { isLoggedIn, loading, user } = useAuth();
  const router = useRouter();

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

  return (
    <>
      <Head>
        <title>{title} - Harmonia-AI Admin</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#0f2b2f] via-[#1a2332] to-[#0f2b2f]">
        {/* Admin Header - could be customized for admin */}
        <header className="bg-[#0f2b2f]/80 backdrop-blur-lg border-b border-[#73cfd0]/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#73cfd0] to-[#5abdc4] flex items-center justify-center">
                  <span className="text-black font-bold text-sm">A</span>
                </div>
                <span className="text-white font-semibold text-lg">Admin Panel</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[#73cfd0] text-sm">
                  Welcome, {user?.name || user?.email}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    window.dispatchEvent(new Event('authChange'));
                    router.push('/login');
                  }}
                  className="px-4 py-2 bg-[#73cfd0] text-black rounded-lg hover:bg-white transition-colors duration-200 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content without bottom navigation */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}