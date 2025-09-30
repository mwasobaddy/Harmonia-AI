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
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Search
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { isLoggedIn, loading, user } = useAuth();

  // Animation refs
  const usersRef = useRef(null);

  // Load users
  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      loadUsers();
    }
  }, [isLoggedIn, user]);

  // Animate in on mount
  useEffect(() => {
    if (usersRef.current && !loading && isLoggedIn && user?.role === 'admin') {
      gsap.fromTo(
        usersRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, [loading, isLoggedIn, user, users]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);

      // Fetch all users (admin endpoint)
      const response = await fetch('https://harmonia-ai-backend.onrender.com/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to load users');
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error loading users');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`https://harmonia-ai-backend.onrender.com/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        toast.success('User role updated successfully');
        loadUsers(); // Reload users
      } else {
        toast.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error updating user role');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout title="Users" description="Manage system users">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Users" description="Manage system users">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-[#73cfd0]">Manage and monitor all system users</p>
        </div>

        {/* Search and Stats */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-[#73cfd0]/20">
              <div className="text-[#73cfd0] text-sm font-medium">Total Users</div>
              <div className="text-white text-xl font-bold">{users.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-[#73cfd0]/20">
              <div className="text-[#73cfd0] text-sm font-medium">Admins</div>
              <div className="text-white text-xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div
          ref={usersRef}
          className="bg-white/10 backdrop-blur-lg rounded-xl border border-[#73cfd0]/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f2b2f]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#73cfd0] uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#73cfd0] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#73cfd0] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#73cfd0] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#73cfd0] uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#73cfd0] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#73cfd0]/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#73cfd0] to-[#5abdc4] flex items-center justify-center">
                              <span className="text-black font-medium text-sm">
                                {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.name || 'No name'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {user.role !== 'admin' ? (
                          <button
                            onClick={() => updateUserRole(user.id, 'admin')}
                            className="text-[#73cfd0] hover:text-white transition-colors duration-200"
                            title="Make Admin"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserRole(user.id, 'user')}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                            title="Remove Admin"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'No users have registered yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}