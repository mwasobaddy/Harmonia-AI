import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
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
      setMessage('Failed to load profile');
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
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
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
        setMessage('Profile updated successfully!');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Profile - Harmonia-AI</title>
        </Head>
        <div className="min-h-screen bg-[#0f2b2fcc] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <Layout
        title="Profile Settings - Harmonia-AI"
        description="Manage your profile settings"
    >

      <div className="min-h-screen bg-[#0f2b2fcc]">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-[#73cfd0]">
              <h1 className="text-2xl font-bold text-black">Profile Settings</h1>
              <p className="mt-1 text-sm text-[#73cfd0]">
                Manage your account information and preferences.
              </p>
            </div>

            <div className="px-6 py-6">
              {message && (
                <div className={`mb-6 p-4 rounded-md ${
                  message.includes('successfully')
                    ? 'bg-[#73cfd0] border border-[#0f2b2fcc] text-black'
                    : 'bg-red-100 border border-red-300 text-red-900'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-black">
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
                  <label htmlFor="email" className="block text-sm font-medium text-black">
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
            </div>
          </div>

          {/* Account Information Section */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-[#73cfd0]">
              <h2 className="text-lg font-medium text-black">Account Information</h2>
            </div>
            <div className="px-6 py-4">
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-[#73cfd0]">Account Created</dt>
                  <dd className="text-sm text-black">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[#73cfd0]">Account Status</dt>
                  <dd className="text-sm text-black">
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