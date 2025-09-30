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
  Settings,
  Save,
  Key,
  Mail,
  Shield,
  Database,
  Globe,
  Bell
} from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    // API Settings
    claudeApiKey: '',
    pineconeApiKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',

    // System Settings
    jwtSecret: '',
    clientUrl: 'http://localhost:3000',
    backendUrl: 'http://localhost:5000',

    // Email Settings
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',

    // Security Settings
    sessionTimeout: 24, // hours
    maxLoginAttempts: 5,
    passwordMinLength: 8,

    // Notification Settings
    emailNotifications: true,
    adminAlerts: true,
    systemAlerts: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('api');
  const secretKeys = [
    'claudeApiKey',
    'pineconeApiKey',
    'stripeSecretKey',
    'stripeWebhookSecret',
    'jwtSecret'
  ];

  // Track which secret fields are currently in edit mode and their input values
  const [secretEditing, setSecretEditing] = useState({});
  const [secretInputs, setSecretInputs] = useState({});
  const router = useRouter();
  const { isLoggedIn, loading, user } = useAuth();

  // Animation refs
  const settingsRef = useRef(null);

  // Load settings
  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      loadSettings();
    }
  }, [isLoggedIn, user]);

  // Animate in on mount
  useEffect(() => {
    if (settingsRef.current && !loading && isLoggedIn && user?.role === 'admin') {
      gsap.fromTo(
        settingsRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, [loading, isLoggedIn, user]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);

      // Fetch current settings (this would be a real API call)
      const response = await fetch('https://harmonia-ai-backend.onrender.com/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Initialize settings and secret editing state
        const incoming = data.settings || {};
        const nextSettings = { ...settings };
        const nextSecretInputs = {};
        const nextSecretEditing = {};

        Object.keys(incoming).forEach(k => {
          if (secretKeys.includes(k)) {
            // server returns masked secrets by default; keep them in settings but clear input
            nextSettings[k] = incoming[k];
            nextSecretInputs[k] = '';
            nextSecretEditing[k] = false;
          } else {
            nextSettings[k] = incoming[k];
          }
        });

        setSettings(prev => ({ ...prev, ...nextSettings }));
        setSecretInputs(prev => ({ ...prev, ...nextSecretInputs }));
        setSecretEditing(prev => ({ ...prev, ...nextSecretEditing }));
      } else {
        // For demo purposes, load from .env values
        console.log('Using demo settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Error loading settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);

      // Build payload: include non-secret fields; include secret fields only when edited
      const payload = {};
      Object.keys(settings).forEach((key) => {
        if (secretKeys.includes(key)) {
          if (secretEditing[key] && secretInputs[key]) {
            payload[key] = secretInputs[key];
          }
        } else {
          payload[key] = settings[key];
        }
      });

      const response = await fetch('https://harmonia-ai-backend.onrender.com/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ settings: payload })
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecretInputChange = (field, value) => {
    setSecretInputs(prev => ({ ...prev, [field]: value }));
  };

  const toggleSecretEdit = (field) => {
    setSecretEditing(prev => ({ ...prev, [field]: !prev[field] }));
    // clear input when toggling off
    if (secretEditing[field]) {
      setSecretInputs(prev => ({ ...prev, [field]: '' }));
    }
  };

  const tabs = [
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  if (isLoading) {
    return (
      <AdminLayout title="Settings" description="System configuration and settings">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings" description="System configuration and settings">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
          <p className="text-[#73cfd0]">Configure system parameters and integrations</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-lg p-1 border border-[#73cfd0]/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#73cfd0] text-black'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Form */}
        <div
          ref={settingsRef}
          className="bg-white/10 backdrop-blur-lg rounded-xl border border-[#73cfd0]/20 p-6"
        >
          {activeTab === 'api' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">API Configuration</h3>

              <div>
                <label className="block text-sm font-medium text-[#73cfd0] mb-2">
                  Claude API Key
                </label>
                {!secretEditing.claudeApiKey ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      value={settings.claudeApiKey || ''}
                      readOnly
                      className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 opacity-70"
                      placeholder="************"
                    />
                    <Button onClick={() => toggleSecretEdit('claudeApiKey')} className="px-3 py-2">Change</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      value={secretInputs.claudeApiKey || ''}
                      onChange={(e) => handleSecretInputChange('claudeApiKey', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
                      placeholder="Enter new Claude API key"
                    />
                    <Button onClick={() => toggleSecretEdit('claudeApiKey')} className="px-3 py-2">Cancel</Button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#73cfd0] mb-2">
                  Pinecone API Key
                </label>
                {!secretEditing.pineconeApiKey ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      value={settings.pineconeApiKey || ''}
                      readOnly
                      className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 opacity-70"
                      placeholder="************"
                    />
                    <Button onClick={() => toggleSecretEdit('pineconeApiKey')} className="px-3 py-2">Change</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      value={secretInputs.pineconeApiKey || ''}
                      onChange={(e) => handleSecretInputChange('pineconeApiKey', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
                      placeholder="Enter new Pinecone API key"
                    />
                    <Button onClick={() => toggleSecretEdit('pineconeApiKey')} className="px-3 py-2">Cancel</Button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#73cfd0] mb-2">
                  Stripe Secret Key
                </label>
                {!secretEditing.stripeSecretKey ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      value={settings.stripeSecretKey || ''}
                      readOnly
                      className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 opacity-70"
                      placeholder="************"
                    />
                    <Button onClick={() => toggleSecretEdit('stripeSecretKey')} className="px-3 py-2">Change</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      value={secretInputs.stripeSecretKey || ''}
                      onChange={(e) => handleSecretInputChange('stripeSecretKey', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
                      placeholder="Enter new Stripe secret key"
                    />
                    <Button onClick={() => toggleSecretEdit('stripeSecretKey')} className="px-3 py-2">Cancel</Button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#73cfd0] mb-2">
                  Stripe Webhook Secret
                </label>
                {!secretEditing.stripeWebhookSecret ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      value={settings.stripeWebhookSecret || ''}
                      readOnly
                      className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 opacity-70"
                      placeholder="************"
                    />
                    <Button onClick={() => toggleSecretEdit('stripeWebhookSecret')} className="px-3 py-2">Change</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      value={secretInputs.stripeWebhookSecret || ''}
                      onChange={(e) => handleSecretInputChange('stripeWebhookSecret', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
                      placeholder="Enter new Stripe webhook secret"
                    />
                    <Button onClick={() => toggleSecretEdit('stripeWebhookSecret')} className="px-3 py-2">Cancel</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">System Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#73cfd0] mb-2">
                    JWT Secret
                  </label>
                  <input
                    type="password"
                    value={settings.jwtSecret}
                    onChange={(e) => handleInputChange('jwtSecret', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#73cfd0] mb-2">
                    Client URL
                  </label>
                  <input
                    type="url"
                    value={settings.clientUrl}
                    onChange={(e) => handleInputChange('clientUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#73cfd0] mb-2">
                    Backend URL
                  </label>
                  <input
                    type="url"
                    value={settings.backendUrl}
                    onChange={(e) => handleInputChange('backendUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Security Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#73cfd0] mb-2">
                    Session Timeout (hours)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#73cfd0] mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#73cfd0] mb-2">
                    Min Password Length
                  </label>
                  <input
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white/5 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Email Notifications</h4>
                    <p className="text-gray-400 text-sm">Receive email notifications for important events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#73cfd0]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#73cfd0]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Admin Alerts</h4>
                    <p className="text-gray-400 text-sm">Get notified about admin-level activities</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.adminAlerts}
                      onChange={(e) => handleInputChange('adminAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#73cfd0]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#73cfd0]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">System Alerts</h4>
                    <p className="text-gray-400 text-sm">Receive alerts about system health and errors</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.systemAlerts}
                      onChange={(e) => handleInputChange('systemAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#73cfd0]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#73cfd0]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-[#73cfd0]/20">
            <Button
              onClick={saveSettings}
              disabled={isSaving}
              className="bg-[#73cfd0] text-black hover:bg-white disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}