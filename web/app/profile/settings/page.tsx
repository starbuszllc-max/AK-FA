'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Bell, Moon, Sun, Globe, Shield, Save, Loader2 } from 'lucide-react';
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
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'app' | 'privacy'>('profile');
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  function saveAppSettings() {
    setSaving(true);
    setMessage(null);

    try {
      localStorage.setItem('app_settings', JSON.stringify(appSettings));

      if (appSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      setMessage({ type: 'success', text: 'Settings saved!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    }
    setSaving(false);
  }

  function toggleDarkMode() {
    const newDarkMode = !appSettings.darkMode;
    setAppSettings(prev => ({ ...prev, darkMode: newDarkMode }));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('app_settings', JSON.stringify({ ...appSettings, darkMode: newDarkMode }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please complete onboarding to access settings.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push('/profile')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('app')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'app'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          <Bell className="w-4 h-4" />
          App
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'privacy'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          Privacy
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 space-y-6">
          <div className="flex items-center gap-6">
            <ProfilePictureUpload
              currentUrl={profile.avatarUrl || undefined}
              onUpload={(url) => setProfile({ ...profile, avatarUrl: url })}
              size="lg"
            />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Profile Picture</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click the image to upload a new photo
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tell us about yourself..."
                maxLength={300}
              />
              <p className="text-xs text-gray-400 mt-1">{profile.bio.length}/300</p>
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Profile
          </button>
        </div>
      )}

      {activeTab === 'app' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {appSettings.darkMode ? (
                <Moon className="w-5 h-5 text-indigo-500" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                appSettings.darkMode ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  appSettings.darkMode ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications</p>
              </div>
            </div>
            <button
              onClick={() => setAppSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                appSettings.notifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  appSettings.notifications ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates</p>
              </div>
            </div>
            <button
              onClick={() => setAppSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                appSettings.emailNotifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  appSettings.emailNotifications ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Public Profile</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Allow others to view your profile</p>
              </div>
            </div>
            <button
              onClick={() => setAppSettings(prev => ({ ...prev, publicProfile: !prev.publicProfile }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                appSettings.publicProfile ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  appSettings.publicProfile ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Show Activity</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Display activity on your profile</p>
              </div>
            </div>
            <button
              onClick={() => setAppSettings(prev => ({ ...prev, showActivity: !prev.showActivity }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                appSettings.showActivity ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  appSettings.showActivity ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
