'use client';

import { useState, useEffect } from 'react';
import { Gift, X, Coins, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GiftType {
  id: string;
  name: string;
  coins: number;
  icon: string;
}

interface TipButtonProps {
  receiverId: string;
  receiverName: string;
  postId?: string;
  size?: 'sm' | 'md';
}

export default function TipButton({ receiverId, receiverName, postId, size = 'sm' }: TipButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [giftTypes, setGiftTypes] = useState<GiftType[]>([]);
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const userId = typeof window !== 'undefined' ? localStorage.getItem('demo_user_id') : null;
  
  useEffect(() => {
    fetch('/api/tips')
      .then(res => res.json())
      .then(data => setGiftTypes(data.giftTypes || []))
      .catch(console.error);
  }, []);
  
  useEffect(() => {
    if (isOpen && userId) {
      fetch(`/api/wallet?userId=${userId}`)
        .then(res => res.json())
        .then(data => setUserCoins(data.wallet?.coinsBalance || 0))
        .catch(console.error);
    }
  }, [isOpen, userId]);
  
  const handleTip = async () => {
    if (!selectedGift || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          receiverId,
          postId,
          giftType: selectedGift.id,
          message
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to send tip');
        return;
      }
      
      setSuccess(true);
      setUserCoins(data.newBalance);
      
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setSelectedGift(null);
        setMessage('');
      }, 2000);
    } catch {
      setError('Failed to send tip');
    } finally {
      setLoading(false);
    }
  };
  
  if (!userId || userId === receiverId) return null;
  
  const buttonClasses = size === 'sm' 
    ? 'p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-full transition-colors'
    : 'px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center gap-1.5 text-sm font-medium hover:opacity-90 transition-opacity';
  
  return (
    <>
      <button onClick={() => setIsOpen(true)} className={buttonClasses} title="Send a tip">
        <Gift className={size === 'sm' ? 'w-4 h-4' : 'w-4 h-4'} />
        {size === 'md' && <span>Tip</span>}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-5 shadow-xl"
            >
              {success ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-6xl mb-4"
                  >
                    {selectedGift?.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Gift Sent!
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    You sent a {selectedGift?.name} to {receiverName}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Send Gift to {receiverName}
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span className="text-sm text-amber-700 dark:text-amber-300">
                      Your balance: <strong>{userCoins} coins</strong>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {giftTypes.map(gift => (
                      <button
                        key={gift.id}
                        onClick={() => setSelectedGift(gift)}
                        disabled={userCoins < gift.coins}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedGift?.id === gift.id
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                            : userCoins < gift.coins
                            ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{gift.icon}</div>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{gift.name}</div>
                        <div className="text-xs text-amber-600 dark:text-amber-400">{gift.coins} coins</div>
                      </button>
                    ))}
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Add a message (optional)"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  
                  {error && (
                    <div className="text-red-500 text-sm mb-3">{error}</div>
                  )}
                  
                  <button
                    onClick={handleTip}
                    disabled={!selectedGift || loading}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        Send {selectedGift ? `${selectedGift.name} (${selectedGift.coins} coins)` : 'Gift'}
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
