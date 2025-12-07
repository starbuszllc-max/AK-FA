'use client';
import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

const layers = [
  { value: 'environment', label: 'Environment', emoji: '🌍' },
  { value: 'bio', label: 'Biological', emoji: '🧬' },
  { value: 'internal', label: 'Internal', emoji: '🧠' },
  { value: 'cultural', label: 'Cultural', emoji: '🎭' },
  { value: 'social', label: 'Social', emoji: '👥' },
  { value: 'conscious', label: 'Conscious', emoji: '💭' },
  { value: 'existential', label: 'Existential', emoji: '✨' },
] as const;

interface PostComposerProps {
  onPostCreated?: () => void;
}

export default function PostComposer({ onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [layer, setLayer] = useState('social');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('demo_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setDemoMode(true);
    }
  }, []);

  async function enableDemoMode() {
    const demoId = crypto.randomUUID();
    
    try {
      const resp = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: demoId })
      });
      
      if (resp.ok) {
        localStorage.setItem('demo_user_id', demoId);
        setUserId(demoId);
        setDemoMode(false);
      } else {
        console.error('Failed to create demo profile');
      }
    } catch (err) {
      console.error('Error creating demo profile:', err);
    }
  }

  async function submitPost(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const resp = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, layer, user_id: userId })
      });

      if (resp.ok) {
        setContent('');
        onPostCreated?.();
      } else {
        const error = await resp.json();
        console.error('Error creating post:', error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (demoMode && !userId) {
    return (
      <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-gray-200 text-center">
        <div className="text-2xl mb-2">✍️</div>
        <h3 className="font-medium text-gray-800 mb-1">Join the conversation</h3>
        <p className="text-gray-500 text-sm mb-4">Start sharing your thoughts and connect with others</p>
        <button 
          onClick={enableDemoMode}
          className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Start Posting (Demo Mode)
        </button>
      </div>
    );
  }

  const selectedLayer = layers.find(l => l.value === layer);

  return (
    <form onSubmit={submitPost} className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium shrink-0">
          👤
        </div>
        <div className="flex-1">
          <textarea
            aria-label="Create post"
            className="w-full border-0 p-0 resize-none focus:ring-0 focus:outline-none text-gray-800 placeholder:text-gray-400"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your journey..."
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Layer:</span>
          <select
            value={layer}
            onChange={(e) => setLayer(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {layers.map(l => (
              <option key={l.value} value={l.value}>
                {l.emoji} {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{content.length}/500</span>
          <Button 
            type="submit" 
            disabled={loading || !content.trim() || content.length > 500}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Posting...
              </span>
            ) : (
              'Post'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
