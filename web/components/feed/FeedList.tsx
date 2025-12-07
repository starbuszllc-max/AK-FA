'use client';
import React, { useEffect, useState, useCallback } from 'react';
import PostCard from './PostCard';
import { supabaseClient } from '../../lib/supabaseClient';

interface Post {
  id: string;
  user_id: string | null;
  content: string;
  layer: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
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
      const { data: sessionData } = await supabaseClient().auth.getSession();
      setCurrentUserId(sessionData?.session?.user?.id ?? null);

      const { data, error } = await supabaseClient()
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } else {
        const postsWithProfiles = (data ?? []).map((post: any) => ({
          ...post,
          profiles: null
        }));
        
        const userIds = [...new Set(postsWithProfiles.map((p: any) => p.user_id).filter(Boolean))];
        
        if (userIds.length > 0) {
          const { data: profiles } = await supabaseClient()
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);
          
          const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
          
          postsWithProfiles.forEach((post: any) => {
            if (post.user_id && profileMap.has(post.user_id)) {
              post.profiles = profileMap.get(post.user_id);
            }
          });
        }
        
        setPosts(postsWithProfiles as Post[]);
      }
    } catch (err) {
      console.error(err);
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
        ? { ...p, like_count: (p.like_count ?? 0) + 1 }
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
          post={post} 
          currentUserId={currentUserId}
          onLike={handleLikeUpdate}
        />
      ))}
    </div>
  );
}
