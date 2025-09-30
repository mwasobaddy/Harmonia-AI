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
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalDocuments: 0,
    pendingReviews: 0,
    activeConversations: 0,
    revenue: 0,
    userGrowth: [],
    orderGrowth: [],
    documentGrowth: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const router = useRouter();
  const { isLoggedIn, loading, user } = useAuth();

  // Animation refs
  const analyticsRef = useRef(null);

  // Load analytics
  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      loadAnalytics();
    }
  }, [isLoggedIn, user, timeRange]);

  // Animate in on mount
  useEffect(() => {
    if (analyticsRef.current && !loading && isLoggedIn && user?.role === 'admin') {
      gsap.fromTo(
        analyticsRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, [loading, isLoggedIn, user, analytics]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      // Fetch analytics data
      const response = await fetch(`https://harmonia-ai-backend.onrender.com/api/admin/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Map server response into the flat shape this component expects
        const mapped = {
          totalUsers: data?.overview?.totalUsers ?? 0,
          previousUsers: data?.overview?.previousUsers ?? 0,

          totalOrders: data?.overview?.totalOrders ?? 0,
          previousOrders: data?.overview?.previousOrders ?? 0,

          totalDocuments: data?.overview?.totalDocuments ?? 0,
          previousDocuments: data?.overview?.previousDocuments ?? 0,

          // Document counters (fallbacks)
          pendingReviews: data?.pendingReviews ?? 0,
          approvedDocuments: data?.approvedDocuments ?? 0,
          rejectedDocuments: data?.rejectedDocuments ?? 0,

          activeConversations: data?.activeConversations ?? 0,

          // Revenue fields
          revenue: data?.revenue ?? 0,
          previousRevenue: data?.previousRevenue ?? 0,

          // Growth arrays / chart data
          userGrowth: data?.charts?.userRegistrations ?? [],
          orderGrowth: data?.charts?.orderData ?? [],
          documentGrowth: data?.charts?.documentData ?? [],

          // Keep any other properties if present
          ...data
        };

        setAnalytics(mapped);
      } else {
        console.error('Failed to load analytics');
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Error loading analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthPercentage = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Analytics" description="System analytics and insights">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics" description="System analytics and insights">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-[#73cfd0]">Comprehensive insights into system performance</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-[#73cfd0]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div
          ref={analyticsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-[#73cfd0]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#73cfd0] text-sm font-medium">Total Users</p>
                <p className="text-white text-2xl font-bold">{formatNumber(analytics.totalUsers)}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{getGrowthPercentage(analytics.totalUsers, analytics.previousUsers)}%
                </p>
              </div>
              <Users className="h-8 w-8 text-[#73cfd0]" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-[#73cfd0]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#73cfd0] text-sm font-medium">Total Orders</p>
                <p className="text-white text-2xl font-bold">{formatNumber(analytics.totalOrders)}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{getGrowthPercentage(analytics.totalOrders, analytics.previousOrders)}%
                </p>
              </div>
              <FileText className="h-8 w-8 text-[#73cfd0]" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-[#73cfd0]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#73cfd0] text-sm font-medium">Documents Generated</p>
                <p className="text-white text-2xl font-bold">{formatNumber(analytics.totalDocuments)}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{getGrowthPercentage(analytics.totalDocuments, analytics.previousDocuments)}%
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-[#73cfd0]" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-[#73cfd0]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#73cfd0] text-sm font-medium">Revenue</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(analytics.revenue)}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{getGrowthPercentage(analytics.revenue, analytics.previousRevenue)}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-[#73cfd0]" />
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-[#73cfd0]/20 p-6">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-[#73cfd0]" />
              User Growth
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would go here</p>
                <p className="text-sm">Integration with charting library needed</p>
              </div>
            </div>
          </div>

          {/* Order Trends */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-[#73cfd0]/20 p-6">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#73cfd0]" />
              Order Trends
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p>Trend analysis would go here</p>
                <p className="text-sm">Showing order patterns over time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-[#73cfd0]/20 p-6">
            <h3 className="text-white text-lg font-semibold mb-4">Document Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Pending Review</span>
                <span className="text-yellow-400 font-semibold">{analytics.pendingReviews}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Approved</span>
                <span className="text-green-400 font-semibold">{analytics.approvedDocuments || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Rejected</span>
                <span className="text-red-400 font-semibold">{analytics.rejectedDocuments || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-[#73cfd0]/20 p-6">
            <h3 className="text-white text-lg font-semibold mb-4">Active Conversations</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#73cfd0] mb-2">
                {analytics.activeConversations}
              </div>
              <p className="text-gray-400 text-sm">Currently active chat sessions</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-[#73cfd0]/20 p-6">
            <h3 className="text-white text-lg font-semibold mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Uptime</span>
                <span className="text-green-400 font-semibold">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Response Time</span>
                <span className="text-green-400 font-semibold">&lt; 200ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Error Rate</span>
                <span className="text-green-400 font-semibold">0.1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => toast('Export functionality would be implemented here')}
            className="bg-[#73cfd0] text-black hover:bg-white"
          >
            Export Analytics Report
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}