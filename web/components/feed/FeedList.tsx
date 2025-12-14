'use client';
import React, { useEffect, useState, useCallback } from 'react';
import PostCard from './PostCard';

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

interface FeedListProps {
  refreshTrigger?: number;
}

export default function FeedList({ refreshTrigger }: FeedListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('demo_user_id') : null;
      setCurrentUserId(storedUserId);

      const resp = await fetch('/api/posts');
      const data = await resp.json();

      if (resp.ok && data.posts) {
        console.log('Fetched posts from API:', data.posts);
        setPosts(data.posts);
      } else {
        console.error('Error fetching posts:', data.error);
        setPosts([]);
      }
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, refreshTrigger]);

  const handleLikeUpdate = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, likeCount: (p.likeCount ?? 0) + 1 }
        : p
    ));
  };

  const handleCommentAdded = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, commentCount: (p.commentCount ?? 0) + 1 }
        : p
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500">Loading feed...</span>
        </div>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <div className="text-4xl mb-3">📝</div>
        <h3 className="font-medium text-gray-800 mb-1">No posts yet</h3>
        <p className="text-gray-500">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={{
            id: post.id,
            user_id: post.userId,
            content: post.content,
            layer: post.layer,
            like_count: post.likeCount ?? 0,
            comment_count: post.commentCount ?? 0,
            created_at: post.createdAt,
            media_urls: post.mediaUrls || [],
            media_types: post.mediaTypes || [],
            profiles: post.profiles ? {
              username: post.profiles.username,
              avatar_url: post.profiles.avatarUrl
            } : null
          }} 
          currentUserId={currentUserId}
          onLike={handleLikeUpdate}
          onCommentAdded={handleCommentAdded}
        />
      ))}
    </div>
  );
}
