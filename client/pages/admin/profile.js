
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import gsap from 'gsap';
import toast from 'react-hot-toast';

export default function Profile() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const router = useRouter();
  // Animation ref for card entrance
  const cardRef = useRef(null);


  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  // Animate in card on load
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
      );
    }
  }, [loading]);

  const checkAuthAndLoadProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('https://harmonia-ai-backend.onrender.com/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || ''
        });
      } else {
        localStorage.removeItem('authToken');
        router.push('/login');
      }
    } catch (error) {
      console.error('Profile load error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://harmonia-ai-backend.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        toast.success('Profile updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Profile - StreetLegal-AI</title>
        </Head>
        <div className="min-h-screen bg-[#0f2b2fcc] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <Layout
        title="Profile Settings - StreetLegal-AI"
        description="Manage your profile settings"
    >

      <div className="min-h-screen bg-gradient-to-br from-[#0f2b2f] via-[#1a2332] to-[#0f2b2f] flex flex-col items-center justify-center py-8">
        <main className="w-full max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Animated Card Container */}
          <div ref={cardRef} className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-[#73cfd0]/20 p-8 sm:p-10 flex flex-col items-center relative overflow-hidden animate-fade-in">
            {/* Avatar */}
            <div className="flex items-center justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#73cfd0] to-[#5abdc4] flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-3xl font-bold text-black">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight text-center">Profile Settings</h1>
            <p className="text-center text-base text-[#73cfd0]/80 mb-6">
              Manage your account information and preferences.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#73cfd0] rounded-md shadow-sm focus:outline-none focus:ring-[#73cfd0] focus:border-[#73cfd0] text-black bg-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#73cfd0] rounded-md shadow-sm focus:outline-none focus:ring-[#73cfd0] focus:border-[#73cfd0] text-black bg-white"
                  required
                />
                <p className="mt-1 text-sm text-[#73cfd0]">
                  Your email address is used for account verification and notifications.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="bg-white text-[#0f2b2fcc] border border-[#73cfd0] hover:bg-[#73cfd0] hover:text-black"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#73cfd0] text-black hover:bg-white hover:text-[#0f2b2fcc]"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
            {/* Account Information Section */}
            <div className="mt-8 w-full bg-white/10 rounded-2xl shadow border border-[#73cfd0]/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Account Information</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-[#73cfd0]">Account Created</dt>
                  <dd className="text-sm text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[#73cfd0]">Account Status</dt>
                  <dd className="text-sm text-white">
                    {user?.isVerified ? 'Verified' : 'Unverified'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}