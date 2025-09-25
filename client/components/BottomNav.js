import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Home, MessageCircle, FileText, UserIcon, Briefcase, Phone, Info } from 'lucide-react';

const BottomNav = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom auth change events
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setIsLoggedIn(response.ok);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home, alwaysVisible: true },
    { href: '/chat', label: 'Chat', icon: MessageCircle, alwaysVisible: false },
    { href: '/documents', label: 'Documents', icon: FileText, alwaysVisible: false },
    { href: '/profile', label: 'Profile', icon: UserIcon, alwaysVisible: false },
    { href: '/info', label: 'Info', icon: Info, alwaysVisible: true },
    { href: '/services', label: 'Services', icon: Briefcase, alwaysVisible: true },
    { href: '/contact', label: 'Contact', icon: Phone, alwaysVisible: true },
  ];

  const visibleNavItems = navItems.filter(item => item.alwaysVisible || isLoggedIn);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2">
        {visibleNavItems.map((item) => {
          const isActive = router.pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
                <div className={`rounded-full transition-colors p-2 h-8 w-8 flex items-center justify-center ${
                        isActive
                        ? 'text-blue-50 bg-blue-600'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}>
                    <IconComponent className={`h-5 w-5`} />
                </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;