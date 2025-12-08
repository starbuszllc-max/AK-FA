'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { 
  TrendingUp, Users, Eye, Heart, MessageCircle, 
  DollarSign, Award, Zap, Star, Crown, ChevronRight 
} from 'lucide-react';

interface CreatorStats {
  followers: number;
  following: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  estimatedEarnings: number;
  creatorLevel: number;
  levelName: string;
  canMonetize: boolean;
  pointsBalance: number;
  giftsReceived: number;
  postsCount: number;
}

const CREATOR_LEVELS = [
  { level: 1, name: 'Starter', minFollowers: 0, badge: '🌱', perks: ['Basic analytics', 'Points earning'] },
  { level: 2, name: 'Verified Contributor', minFollowers: 500, badge: '✓', perks: ['Monetization unlocked', 'Enhanced analytics', 'Priority support'] },
  { level: 3, name: 'Expert Coach', minFollowers: 1500, badge: '🎓', perks: ['Sell courses', 'Premium payouts', 'Custom badges'] },
  { level: 4, name: 'Akorfa Ambassador', minFollowers: 5000, badge: '👑', perks: ['Highest rates', 'Platform features', 'Exclusive events'] }
];

export default function CreatorDashboardPage() {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'levels' | 'earnings'>('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const mockUserId = 'demo-user';
      const [walletRes, followsRes] = await Promise.all([
        fetch(`/api/wallet?userId=${mockUserId}`),
        fetch(`/api/follows?userId=${mockUserId}`)
      ]);

      const walletData = await walletRes.json();
      const followsData = await followsRes.json();

      setStats({
        followers: followsData.followerCount || 0,
        following: 0,
        totalViews: 1250,
        totalLikes: 340,
        totalComments: 89,
        engagementRate: 12.5,
        estimatedEarnings: parseFloat(walletData.wallet?.cashValue || '0'),
        creatorLevel: followsData.creatorLevel || 1,
        levelName: followsData.levelInfo?.name || 'Starter',
        canMonetize: walletData.wallet?.canMonetize || false,
        pointsBalance: walletData.wallet?.pointsBalance || 0,
        giftsReceived: 15,
        postsCount: 24
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      </div>
    );
  }

  const currentLevel = CREATOR_LEVELS.find(l => l.level === (stats?.creatorLevel || 1));
  const nextLevel = CREATOR_LEVELS.find(l => l.level === (stats?.creatorLevel || 1) + 1);
  const progressToNext = nextLevel 
    ? Math.min(100, ((stats?.followers || 0) / nextLevel.minFollowers) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-400" />
            Creator Dashboard
          </h1>
          <p className="text-gray-400">Track your growth and earnings as a creator</p>
        </div>

        <Card className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-500/30 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-3xl">
                {currentLevel?.badge}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">{currentLevel?.name}</h2>
                  <span className="bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full text-sm">
                    Level {stats?.creatorLevel}
                  </span>
                </div>
                <p className="text-gray-400">{stats?.followers?.toLocaleString()} followers</p>
              </div>
            </div>
            {nextLevel && (
              <div className="w-full md:w-64">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Next: {nextLevel.name}</span>
                  <span className="text-purple-300">{nextLevel.minFollowers - (stats?.followers || 0)} to go</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10 p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Users className="w-4 h-4" /> Followers
            </div>
            <div className="text-2xl font-bold text-white">{stats?.followers?.toLocaleString()}</div>
          </Card>
          <Card className="bg-white/5 border-white/10 p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Eye className="w-4 h-4" /> Total Views
            </div>
            <div className="text-2xl font-bold text-white">{stats?.totalViews?.toLocaleString()}</div>
          </Card>
          <Card className="bg-white/5 border-white/10 p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Heart className="w-4 h-4" /> Likes
            </div>
            <div className="text-2xl font-bold text-white">{stats?.totalLikes?.toLocaleString()}</div>
          </Card>
          <Card className="bg-white/5 border-white/10 p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Zap className="w-4 h-4" /> Engagement
            </div>
            <div className="text-2xl font-bold text-white">{stats?.engagementRate}%</div>
          </Card>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['overview', 'analytics', 'levels', 'earnings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Posts this month</span>
                  <span className="text-white font-medium">{stats?.postsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Gifts received</span>
                  <span className="text-white font-medium">{stats?.giftsReceived}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg. engagement</span>
                  <span className="text-white font-medium">{stats?.engagementRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Points balance</span>
                  <span className="text-green-400 font-medium">{stats?.pointsBalance?.toLocaleString()} AP</span>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a href="/wallet" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="text-white">View Earnings</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </a>
                <a href="/marketplace" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">Marketplace</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </a>
                <a href="/feed" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    <span className="text-white">Create Post</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </a>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Content Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">{stats?.totalViews?.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Total Views</div>
                <div className="text-green-400 text-sm mt-1">+12% this week</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">{stats?.totalLikes?.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Total Likes</div>
                <div className="text-green-400 text-sm mt-1">+8% this week</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">{stats?.totalComments}</div>
                <div className="text-gray-400 text-sm">Comments</div>
                <div className="text-green-400 text-sm mt-1">+15% this week</div>
              </div>
            </div>
            <div className="h-48 bg-white/5 rounded-lg flex items-center justify-center text-gray-500">
              Analytics charts coming soon
            </div>
          </Card>
        )}

        {activeTab === 'levels' && (
          <div className="space-y-4">
            {CREATOR_LEVELS.map((level) => {
              const isCurrentLevel = level.level === stats?.creatorLevel;
              const isUnlocked = (stats?.creatorLevel || 1) >= level.level;

              return (
                <Card 
                  key={level.level}
                  className={`p-6 ${
                    isCurrentLevel 
                      ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-500/50' 
                      : 'bg-white/5 border-white/10'
                  } ${!isUnlocked && 'opacity-60'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        isUnlocked ? 'bg-purple-500/30' : 'bg-gray-700/50'
                      }`}>
                        {level.badge}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{level.name}</h3>
                          {isCurrentLevel && (
                            <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">
                          {level.minFollowers === 0 ? 'Starting level' : `${level.minFollowers}+ followers`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Award className={`w-6 h-6 ${isUnlocked ? 'text-yellow-400' : 'text-gray-600'}`} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {level.perks.map((perk) => (
                      <span 
                        key={perk}
                        className={`text-sm px-3 py-1 rounded-full ${
                          isUnlocked 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : 'bg-gray-700/30 text-gray-500'
                        }`}
                      >
                        {perk}
                      </span>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Earnings Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">From posts</span>
                  <span className="text-white font-medium">+{Math.floor((stats?.pointsBalance || 0) * 0.4)} AP</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">From engagement</span>
                  <span className="text-white font-medium">+{Math.floor((stats?.pointsBalance || 0) * 0.3)} AP</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">From gifts</span>
                  <span className="text-white font-medium">+{Math.floor((stats?.pointsBalance || 0) * 0.2)} AP</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">AI bonuses</span>
                  <span className="text-white font-medium">+{Math.floor((stats?.pointsBalance || 0) * 0.1)} AP</span>
                </div>
                <div className="flex justify-between items-center py-2 text-lg">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-green-400 font-bold">{stats?.pointsBalance?.toLocaleString()} AP</span>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Estimated Earnings</h3>
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-6 text-center mb-4">
                <div className="text-4xl font-bold text-white mb-1">
                  ${stats?.estimatedEarnings?.toFixed(2) || '0.00'}
                </div>
                <div className="text-gray-400">Available to withdraw</div>
              </div>
              <a 
                href="/wallet"
                className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Go to Wallet
              </a>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
