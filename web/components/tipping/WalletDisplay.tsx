'use client';

import { useState, useEffect } from 'react';
import { Coins, TrendingUp, Gift, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface CoinTransaction {
  id: string;
  amount: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

interface PointsTransaction {
  id: string;
  amount: number;
  action: string;
  description: string;
  createdAt: string;
}

interface WalletData {
  pointsBalance: number;
  coinsBalance: number;
  totalEarned: number;
  cashValue: string;
  creatorLevel: number;
}

export default function WalletDisplay() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [coinHistory, setCoinHistory] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userId = typeof window !== 'undefined' ? localStorage.getItem('demo_user_id') : null;
  
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    fetch(`/api/wallet?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setWallet(data.wallet);
        setCoinHistory(data.coinHistory || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      </div>
    );
  }
  
  if (!wallet) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Coins className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Your Wallet</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/20 backdrop-blur rounded-lg p-3"
          >
            <div className="text-sm opacity-80">Coins</div>
            <div className="text-2xl font-bold">{wallet.coinsBalance}</div>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/20 backdrop-blur rounded-lg p-3"
          >
            <div className="text-sm opacity-80">Akorfa Points</div>
            <div className="text-2xl font-bold">{wallet.pointsBalance}</div>
          </motion.div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>Total Earned: {wallet.totalEarned}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Level {wallet.creatorLevel}</span>
          </div>
        </div>
        
        {coinHistory.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coin Activity</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {coinHistory.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-2">
                    <Gift className={`w-4 h-4 ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="text-gray-600 dark:text-gray-400">{tx.description}</span>
                  </div>
                  <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-500'}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
