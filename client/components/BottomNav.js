
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, MessageCircle, FileText, Briefcase, Phone, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Modern, glassmorphic, animated bottom nav, preserving router and auth logic
const BottomNav = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const navItems = [
    { href: '/', label: 'Home', icon: Home, alwaysVisible: true },
    { href: '/chat', label: 'Chat', icon: MessageCircle, alwaysVisible: false },
    { href: '/documents', label: 'Docs', icon: FileText, alwaysVisible: false },
    { href: '/info', label: 'Info', icon: Info, alwaysVisible: true },
    { href: '/services', label: 'Services', icon: Briefcase, alwaysVisible: true },
    { href: '/contact', label: 'Contact', icon: Phone, alwaysVisible: true },
  ];

  const visibleNavItems = navItems.filter(item => item.alwaysVisible || isLoggedIn);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-r from-[#0f1419]/95 to-[#1a2332]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
        <div className="flex justify-around items-center py-2 px-2">
          {visibleNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-300 group hover:bg-white/10"
              >
                <div className={`rounded-2xl transition-all duration-300 p-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#73cfd0] to-[#5abdc4] text-black shadow-lg'
                    : 'text-gray-400 group-hover:text-[#73cfd0] group-hover:bg-white/5'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium mt-1 transition-colors duration-300 ${
                  isActive ? 'text-[#73cfd0]' : 'text-gray-400 group-hover:text-white'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;