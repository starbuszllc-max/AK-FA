'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Globe, Lock, ArrowLeft, UserPlus, UserMinus, MessageCircle, Settings } from 'lucide-react';

interface GroupMember {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  role: string;
}

interface GroupPost {
  id: string;
  content: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

interface GroupDetails {
  id: string;
  name: string;
  description: string;
  layer: string;
  avatarUrl: string | null;
  memberCount: number;
  isPublic: boolean;
  isMember: boolean;
  isAdmin: boolean;
  createdAt: string;
}

const layerColors: Record<string, string> = {
  environment: 'from-green-500 to-emerald-500',
  biological: 'from-blue-500 to-cyan-500',
  internal: 'from-purple-500 to-violet-500',
  cultural: 'from-orange-500 to-amber-500',
  social: 'from-pink-500 to-rose-500',
  conscious: 'from-indigo-500 to-blue-500',
  existential: 'from-red-500 to-pink-500',
};

const layerIcons: Record<string, string> = {
  environment: '🌍',
  biological: '🧬',
  internal: '🧠',
  cultural: '🎭',
  social: '👥',
  conscious: '✨',
  existential: '🌌',
};

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'members'>('posts');
  const [userId] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('demo_user_id') : null);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  async function fetchGroupDetails() {
    try {
      const res = await fetch(`/api/groups?user_id=${userId || ''}`);
      const data = await res.json();
      
      if (data.groups) {
        const foundGroup = data.groups.find((g: any) => g.id === groupId);
        if (foundGroup) {
          setGroup({
            ...foundGroup,
            isAdmin: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('Fetch group error:', err);
    }
    setLoading(false);
  }

  async function handleJoin() {
    if (!userId || !group) return;
    try {
      await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, group_id: groupId }),
      });
      setGroup({ ...group, isMember: true, memberCount: group.memberCount + 1 });
    } catch (err) {
      console.error('Join group error:', err);
    }
  }

  async function handleLeave() {
    if (!userId || !group) return;
    try {
      await fetch('/api/groups/join', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, group_id: groupId }),
      });
      setGroup({ ...group, isMember: false, memberCount: Math.max(0, group.memberCount - 1) });
    } catch (err) {
      console.error('Leave group error:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Group not found
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This group may have been removed or doesn't exist.
        </p>
        <button
          onClick={() => router.push('/groups')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Communities
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.push('/groups')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Communities
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className={`h-32 bg-gradient-to-r ${layerColors[group.layer] || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
          <span className="text-6xl">{layerIcons[group.layer] || '👥'}</span>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {group.name}
                {group.isPublic ? (
                  <Globe className="w-5 h-5 text-gray-400" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
              </h1>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                <Users className="w-4 h-4" />
                {group.memberCount} members
              </div>
            </div>
            
            {userId && (
              group.isMember ? (
                <button
                  onClick={handleLeave}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                >
                  <UserMinus className="w-4 h-4" />
                  Leave
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Join Group
                </button>
              )
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-300">{group.description}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'posts'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Posts
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'members'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Members
        </button>
      </div>

      {activeTab === 'posts' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {group.isMember 
                ? 'No posts yet. Be the first to share something!'
                : 'Join this group to see and create posts.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {group.memberCount} member{group.memberCount !== 1 ? 's' : ''} in this group
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
