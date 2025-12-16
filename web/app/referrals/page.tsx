'use client';

import React, { useEffect, useState } from 'react';
import { Gift, Copy, Check, Users, Coins, Trophy, Share2 } from 'lucide-react';

interface ReferralStats {
  totalReferrals: number;
  pendingRewards: number;
  totalCoinsEarned: number;
}

export default function ReferralsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats>({ totalReferrals: 0, pendingRewards: 0, totalCoinsEarned: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem('demo_user_id');
    setUserId(uid);
    if (uid) {
      fetchReferralData(uid);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchReferralData(uid: string) {
    try {
      const res = await fetch(`/api/referrals?user_id=${uid}`);
      const data = await res.json();
      if (data.referralCode) {
        setReferralCode(data.referralCode);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching referral data:', err);
    }
    setLoading(false);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  async function shareCode() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Akorfa!',
          text: `Use my referral code ${referralCode} to get 25 bonus coins when you sign up!`,
          url: `${window.location.origin}/signup?ref=${referralCode}`
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      copyCode();
    }
  }

  async function claimRewards() {
    if (!userId || claiming) return;
    
    setClaiming(true);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          action: 'claim'
        })
      });

      const data = await res.json();
      if (data.success) {
        setToast(`Claimed ${data.totalCoins} coins from ${data.claimedCount} referrals!`);
        setStats(prev => ({
          ...prev,
          pendingRewards: 0,
          totalCoinsEarned: prev.totalCoinsEarned + data.totalCoins
        }));
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error('Error claiming rewards:', err);
    }
    setClaiming(false);
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Gift className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Invite & Earn
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Sign up to get your referral code and start earning rewards!
        </p>
        <a
          href="/signup"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all"
        >
          Get Started
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg bg-green-500 text-white font-medium">
          {toast}
        </div>
      )}

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
          <Gift className="w-4 h-4" />
          Invite & Earn
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Refer Friends, Get Coins
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Share your code and earn 50 coins for every friend who joins!
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-orange-500 rounded-2xl p-6 text-white">
        <p className="text-white/80 text-sm mb-2">Your Referral Code</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/20 rounded-xl px-4 py-3 font-mono text-xl font-bold tracking-wider">
            {referralCode}
          </div>
          <button
            onClick={copyCode}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
          </button>
          <button
            onClick={shareCode}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>
        <p className="text-white/80 text-sm mt-4">
          Friends get 25 bonus coins when they sign up with your code!
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white mb-1">
            <Users className="w-5 h-5 text-green-500" />
            {stats.totalReferrals}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Friends Invited</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white mb-1">
            <Gift className="w-5 h-5 text-green-500" />
            {stats.pendingRewards}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Pending Rewards</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white mb-1">
            <Coins className="w-5 h-5 text-green-500" />
            {stats.totalCoinsEarned}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Earned</p>
        </div>
      </div>

      {stats.pendingRewards > 0 && (
        <button
          onClick={claimRewards}
          disabled={claiming}
          className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Trophy className="w-5 h-5" />
          {claiming ? 'Claiming...' : `Claim ${stats.pendingRewards * 50} Coins`}
        </button>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">How It Works</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Share Your Code</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Send your unique code to friends</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">They Sign Up</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Friends enter your code during onboarding</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Both Earn Coins</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">You get 50 coins, they get 25 coins!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
