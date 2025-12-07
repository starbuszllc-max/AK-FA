'use client';
import React, { useState } from 'react';
import PostComposer from '../../components/feed/PostComposer';
import FeedList from '../../components/feed/FeedList';

export default function FeedPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <main className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Feed</h1>
        <p className="text-gray-500 mt-1">Share your journey across the 7 layers</p>
      </div>
      <div className="space-y-6">
        <PostComposer onPostCreated={handlePostCreated} />
        <FeedList refreshTrigger={refreshTrigger} />
      </div>
    </main>
  );
}
