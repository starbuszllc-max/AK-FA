'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Bell, Moon, Sun, Globe, Shield, Save, Loader2,
  Palette, Lock, CreditCard, HelpCircle, LogOut, ChevronRight,
  Smartphone, Mail, Eye, EyeOff, Trash2, Download, Languages
} from 'lucide-react';
import ProfilePictureUpload from '@/components/media/ProfilePictureUpload';

interface ProfileSettings {
  username: string;
  fullName: string;
  bio: string;
  avatarUrl: string | null;
  email: string;
  location: string;
  website: string;
}

interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  emailNotifications: boolean;
  publicProfile: boolean;
  showActivity: boolean;
  language: string;
}

type TabType = 'account' | 'appearance' | 'notifications' | 'privacy' | 'help';

const tabs = [
  { id: 'account' as TabType, label: 'Account', icon: User },
  { id: 'appearance' as TabType, label: 'Appearance', icon: Palette },
  { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
  { id: 'privacy' as TabType, label: 'Privacy & Security', icon: Shield },
  { id: 'help' as TabType, label: 'Help & Support', icon: HelpCircle },
];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [profile, setProfile] = useState<ProfileSettings>({
    username: '',
    fullName: '',
    bio: '',
    avatarUrl: null,
    email: '',
    location: '',
    website: '',
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    darkMode: false,
    notifications: true,
    emailNotifications: true,
    publicProfile: true,
    showActivity: true,
    language: 'en',
  });

  useEffect(() => {
    const uid = localStorage.getItem('demo_user_id');
    setUserId(uid);

    if (!uid) {
      setLoading(false);
      return;
    }

    fetchProfile(uid);
    loadAppSettings();
  }, []);

  async function fetchProfile(uid: string) {
    try {
      const res = await fetch(`/api/profiles?user_id=${uid}`);
      const data = await res.json();
      if (data.profile && !data.error) {
        setProfile({
          username: data.profile.username || '',
          fullName: data.profile.fullName || '',
          bio: data.profile.bio || '',
          avatarUrl: data.profile.avatarUrl || null,
          email: data.profile.email || '',
          location: data.profile.location || '',
          website: data.profile.website || '',
        });
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
    setLoading(false);
  }

  function loadAppSettings() {
    try {
      const saved = localStorage.getItem('app_settings');
      if (saved) {
        setAppSettings(JSON.parse(saved));
      }
      const isDark = document.documentElement.classList.contains('dark');
      setAppSettings(prev => ({ ...prev, darkMode: isDark }));
    } catch (err) {
      console.error('Load settings error:', err);
    }
  }

  async function saveProfile() {
    if (!userId) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          username: profile.username,
          full_name: profile.fullName,
          bio: profile.bio,
          avatar_url: profile.avatarUrl,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
    setSaving(false);
  }

  function toggleDarkMode() {
    const newDarkMode = !appSettings.darkMode;
    const newSettings = { ...appSettings, darkMode: newDarkMode };
    setAppSettings(newSettings);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
  }

  function updateSetting(key: keyof AppSettings, value: boolean | string) {
    const newSettings = { ...appSettings, [key]: value };
    setAppSettings(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
  }

  function handleLogout() {
    localStorage.removeItem('demo_user_id');
    localStorage.removeItem('app_settings');
    router.push('/');
  }

  function handleExportData() {
    const data = { profile, appSettings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'akorfa-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Data exported successfully!' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Please sign up to access settings.</p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/profile')}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 shrink-0">
          <nav className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-l-4 border-green-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
            <div className="border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>
                    
                    <div className="flex items-center gap-6 mb-6">
                      <ProfilePictureUpload
                        currentUrl={profile.avatarUrl || undefined}
                        onUpload={(url) => setProfile({ ...profile, avatarUrl: url })}
                        size="lg"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Profile Picture</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload a new photo</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                        <input
                          type="text"
                          value={profile.username}
                          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          placeholder="Your username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                        placeholder="Tell us about yourself..."
                        maxLength={300}
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">{profile.bio.length}/300</p>
                    </div>

                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="mt-6 w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data & Storage</h2>
                    <div className="space-y-3">
                      <button
                        onClick={handleExportData}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="w-5 h-5 text-green-500" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">Export Your Data</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Download a copy of your data</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Appearance</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${appSettings.darkMode ? 'bg-slate-700' : 'bg-green-100'}`}>
                          {appSettings.darkMode ? <Moon className="w-6 h-6 text-green-400" /> : <Sun className="w-6 h-6 text-green-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{appSettings.darkMode ? 'Dark mode enabled' : 'Light mode enabled'}</p>
                        </div>
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className={`relative w-14 h-8 rounded-full transition-colors ${appSettings.darkMode ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                      >
                        <motion.span
                          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
                          animate={{ x: appSettings.darkMode ? 24 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          {appSettings.darkMode ? <Moon className="w-3 h-3 text-green-600" /> : <Sun className="w-3 h-3 text-green-500" />}
                        </motion.span>
                      </button>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                          <Languages className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Language</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred language</p>
                        </div>
                      </div>
                      <select
                        value={appSettings.language}
                        onChange={(e) => setAppSettings({ ...appSettings, language: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-green-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="pt">Portuguese</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications on your device</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAppSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                        className={`relative w-14 h-8 rounded-full transition-colors ${appSettings.notifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                      >
                        <motion.span
                          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                          animate={{ x: appSettings.notifications ? 24 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                          <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAppSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                        className={`relative w-14 h-8 rounded-full transition-colors ${appSettings.emailNotifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                      >
                        <motion.span
                          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                          animate={{ x: appSettings.emailNotifications ? 24 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Privacy Settings</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Public Profile</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow others to view your profile</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setAppSettings(prev => ({ ...prev, publicProfile: !prev.publicProfile }))}
                          className={`relative w-14 h-8 rounded-full transition-colors ${appSettings.publicProfile ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                        >
                          <motion.span
                            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                            animate={{ x: appSettings.publicProfile ? 24 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            {appSettings.showActivity ? <Eye className="w-6 h-6 text-green-600 dark:text-green-400" /> : <EyeOff className="w-6 h-6 text-green-600 dark:text-green-400" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Activity</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display your activity on your profile</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setAppSettings(prev => ({ ...prev, showActivity: !prev.showActivity }))}
                          className={`relative w-14 h-8 rounded-full transition-colors ${appSettings.showActivity ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                        >
                          <motion.span
                            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                            animate={{ x: appSettings.showActivity ? 24 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security</h2>
                    <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-green-500" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6">
                    <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">Danger Zone</h2>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <div className="text-left">
                          <p className="font-medium text-red-700 dark:text-red-400">Delete Account</p>
                          <p className="text-sm text-red-500 dark:text-red-500/70">Permanently delete your account and data</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'help' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Help & Support</h2>
                  
                  <div className="space-y-3">
                    <a href="#" className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-gray-900 dark:text-white">FAQ</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-gray-900 dark:text-white">Contact Support</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-gray-900 dark:text-white">Privacy Policy</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-gray-900 dark:text-white">Terms of Service</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Akorfa v1.0.0</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Made with care for human growth</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Delete Account?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                This action cannot be undone. All your data, posts, and progress will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('demo_user_id');
                    router.push('/');
                  }}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
