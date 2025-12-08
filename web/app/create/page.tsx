'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CameraWithFilters from '@/components/camera/CameraWithFilters';
import { Camera, Type, Image, Video, X } from 'lucide-react';

export default function CreatePage() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  async function handleCapture(dataUrl: string, type: 'photo' | 'video') {
    setCapturedMedia(dataUrl);
    setShowCamera(false);
  }

  async function handlePost() {
    const userId = localStorage.getItem('demo_user_id');
    if (!userId) {
      router.push('/onboarding');
      return;
    }

    if (!content.trim() && !capturedMedia) return;

    setPosting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          content: content.trim() || 'Check out my post!',
          media_urls: capturedMedia ? [capturedMedia] : [],
          media_types: capturedMedia ? ['image'] : []
        })
      });

      if (res.ok) {
        router.push('/feed');
      }
    } catch (err) {
      console.error('Error posting:', err);
    }
    setPosting(false);
  }

  if (showCamera) {
    return (
      <CameraWithFilters 
        onCapture={handleCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h1>
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {capturedMedia ? (
          <div className="relative">
            <img 
              src={capturedMedia} 
              alt="Captured" 
              className="w-full aspect-video object-cover"
            />
            <button
              onClick={() => setCapturedMedia(null)}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCamera(true)}
            className="w-full aspect-video bg-gray-100 dark:bg-slate-700 flex flex-col items-center justify-center gap-3 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Camera className="w-12 h-12 text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              Open Camera
            </span>
          </button>
        )}

        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-32 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none"
          />
        </div>

        <div className="px-4 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCamera(true)}
              className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
            >
              <Camera className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
              <Image className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
              <Video className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={handlePost}
            disabled={posting || (!content.trim() && !capturedMedia)}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
