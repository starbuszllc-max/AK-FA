'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import EnhancedPostCard from '@/components/feed/EnhancedPostCard';
import { motion } from 'framer-motion';

interface Post {
  id: string;
  userId: string | null;
  content: string;
  layer: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  mediaUrls?: string[];
  mediaTypes?: string[];
  profiles?: {
    username: string | null;
    avatarUrl: string | null;
  } | null;
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('demo_user_id') : null;
    setCurrentUserId(storedUserId);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const resp = await fetch(`/api/posts/${postId}`);
        
        if (!resp.ok) {
          setError('Post not found');
          return;
        }
        
        const data = await resp.json();
        if (data.post) {
          setPost({
            id: data.post.id,
            userId: data.post.userId,
            content: data.post.content,
            layer: data.post.layer,
            likeCount: data.post.likeCount ?? 0,
            commentCount: data.post.commentCount ?? 0,
            createdAt: data.post.createdAt,
            mediaUrls: data.post.mediaUrls,
            mediaTypes: data.post.mediaTypes,
            profiles: data.post.profiles
          });
        } else {
          setError('Post not found');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-5xl mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Post not found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The post you're looking for doesn't exist.</p>
          <a
            href="/feed"
            className="inline-flex px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Feed
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <a href="/feed" className="text-green-600 hover:text-green-700 mb-6 inline-block text-sm font-medium">
          ← Back to Feed
        </a>
        <EnhancedPostCard
          post={{
            id: post.id,
            user_id: post.userId,
            content: post.content,
            layer: post.layer,
            like_count: post.likeCount,
            comment_count: post.commentCount,
            created_at: post.createdAt,
            mediaUrls: post.mediaUrls,
            mediaTypes: post.mediaTypes,
            profiles: post.profiles ? {
              username: post.profiles.username,
              avatar_url: post.profiles.avatarUrl
            } : null
          }}
          currentUserId={currentUserId}
        />
      </motion.div>
    </main>
  );
}
