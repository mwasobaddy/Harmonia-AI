import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, LoadingSpinner } from '../../components';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import {
  Users,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Activity,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    pendingReviews: 0,
    activeConversations: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isLoggedIn, loading, user } = useAuth();

  // Animation refs
  const dashboardRef = useRef(null);
  const statsRef = useRef(null);

  // Check authentication and admin role
  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }

      // Check if user is admin
      if (user?.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        router.push('/chat');
        return;
      }
    }
  }, [isLoggedIn, loading, user, router]);

  // Load dashboard stats
  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      loadDashboardStats();
    }
  }, [isLoggedIn, user]);

  // Animate in on mount
  useEffect(() => {
    if (dashboardRef.current && !loading && isLoggedIn && user?.role === 'admin') {
      gsap.fromTo(
        dashboardRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );

      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
        );
      }
    }
  }, [loading, isLoggedIn, user, stats]);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);

      // Fetch dashboard statistics
      const response = await fetch('http://localhost:5000/api/chat/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to load dashboard stats');
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2b2f] via-[#1a2332] to-[#0f2b2f] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const adminMenuItems = [
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Document Review',
      description: 'Review and approve generated documents',
      icon: FileText,
      href: '/admin/documents',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Analytics',
      description: 'View platform usage statistics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <AdminLayout title="Dashboard" description="Admin dashboard for Harmonia-AI platform">
      <main className="pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div ref={dashboardRef} className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-[#73cfd0]" />
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <p className="text-xl text-[#73cfd0]/80">
              Welcome back, {user?.name || user?.email}. Manage your platform from here.
            </p>
          </div>

          {/* Stats Cards */}
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#73cfd0]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#73cfd0]/80 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-white">{isLoading ? '...' : stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-[#73cfd0]" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#73cfd0]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#73cfd0]/80 text-sm font-medium">Total Orders</p>
                  <p className="text-3xl font-bold text-white">{isLoading ? '...' : stats.totalOrders}</p>
                </div>
                <FileText className="h-8 w-8 text-[#73cfd0]" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#73cfd0]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#73cfd0]/80 text-sm font-medium">Pending Reviews</p>
                  <p className="text-3xl font-bold text-white">{isLoading ? '...' : stats.pendingReviews}</p>
                </div>
                <Activity className="h-8 w-8 text-[#73cfd0]" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#73cfd0]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#73cfd0]/80 text-sm font-medium">Active Chats</p>
                  <p className="text-3xl font-bold text-white">{isLoading ? '...' : stats.activeConversations}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-[#73cfd0]" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminMenuItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#73cfd0]/20 hover:border-[#73cfd0]/40 transition-all duration-300 cursor-pointer group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-[#73cfd0]/80 text-sm">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#73cfd0]/20">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-[#73cfd0]" />
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[#73cfd0]/20">
                <div>
                  <p className="text-white font-medium">New user registration</p>
                  <p className="text-[#73cfd0]/60 text-sm">john.doe@example.com joined the platform</p>
                </div>
                <span className="text-[#73cfd0]/60 text-sm">2 hours ago</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#73cfd0]/20">
                <div>
                  <p className="text-white font-medium">Document submitted for review</p>
                  <p className="text-[#73cfd0]/60 text-sm">Order #1234 requires approval</p>
                </div>
                <span className="text-[#73cfd0]/60 text-sm">4 hours ago</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white font-medium">System maintenance completed</p>
                  <p className="text-[#73cfd0]/60 text-sm">All services are running normally</p>
                </div>
                <span className="text-[#73cfd0]/60 text-sm">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}