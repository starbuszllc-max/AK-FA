'use client';
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  postId: string;
  userId: string | null;
  content: string;
  createdAt: string;
  profiles: {
    username: string | null;
    avatarUrl: string | null;
  } | null;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
}

interface PostProps {
  post: {
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
    badges?: Badge[];
  };
  currentUserId: string | null;
  onLike?: (postId: string) => void;
  onCommentAdded?: (postId: string) => void;
}

const layerColors: Record<string, { bg: string; text: string; ring: string; gradient: string }> = {
  environment: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-400', gradient: 'from-emerald-400 to-teal-500' },
  bio: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', ring: 'ring-rose-400', gradient: 'from-rose-400 to-pink-500' },
  internal: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', ring: 'ring-purple-400', gradient: 'from-purple-400 to-violet-500' },
  cultural: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-400', gradient: 'from-amber-400 to-orange-500' },
  social: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', ring: 'ring-blue-400', gradient: 'from-blue-400 to-cyan-500' },
  conscious: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', ring: 'ring-indigo-400', gradient: 'from-indigo-400 to-blue-500' },
  existential: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', ring: 'ring-violet-400', gradient: 'from-violet-400 to-purple-500' },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatExactTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function EnhancedPostCard({ post, currentUserId, onLike, onCommentAdded }: PostProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.comment_count);
  const [localLikeCount, setLocalLikeCount] = useState(post.like_count);
  const [showTimeTooltip, setShowTimeTooltip] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const username = post.profiles?.username || 'Anonymous';
  const avatarUrl = post.profiles?.avatar_url;
  const layerStyle = layerColors[post.layer] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', ring: 'ring-gray-400', gradient: 'from-gray-400 to-gray-500' };

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const resp = await fetch(`/api/comments?post_id=${post.id}`);
      const data = await resp.json();
      if (resp.ok && data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  }, [post.id]);

  async function toggleComments() {
    if (!showComments) {
      await fetchComments();
    }
    setShowComments(!showComments);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const resp = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id,
          user_id: currentUserId,
          content: newComment.trim()
        })
      });

      if (resp.ok) {
        setNewComment('');
        setLocalCommentCount(prev => prev + 1);
        await fetchComments();
        onCommentAdded?.(post.id);
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleLike() {
    if (!currentUserId || isLiking || hasLiked) return;
    
    setIsLiking(true);
    setShowHeartAnimation(true);
    
    try {
      const resp = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id,
          user_id: currentUserId,
          reaction_type: 'like'
        })
      });

      if (resp.ok) {
        setHasLiked(true);
        setLocalLikeCount(prev => prev + 1);
        onLike?.(post.id);
      } else {
        const error = await resp.json();
        if (error.error?.includes('duplicate') || error.error?.includes('unique')) {
          setHasLiked(true);
        }
      }
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      setIsLiking(false);
      setTimeout(() => setShowHeartAnimation(false), 600);
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href + `#post-${post.id}`);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }

  return (
    <motion.article
      id={`post-${post.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="p-4 md:p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`relative p-0.5 rounded-full bg-gradient-to-br ${layerStyle.gradient}`}>
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={username} 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium ring-2 ring-white dark:ring-slate-800">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm">{username}</div>
            <div 
              className="relative"
              onMouseEnter={() => setShowTimeTooltip(true)}
              onMouseLeave={() => setShowTimeTooltip(false)}
            >
              <span className="text-xs text-gray-500 dark:text-gray-400 cursor-help">
                {formatTimeAgo(post.created_at)}
              </span>
              <AnimatePresence>
                {showTimeTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 top-5 z-10 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap"
                  >
                    {formatExactTime(post.created_at)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <motion.span 
          whileHover={{ scale: 1.05 }}
          className={`px-3 py-1 text-xs font-medium rounded-full ${layerStyle.bg} ${layerStyle.text} capitalize`}
        >
          {post.layer}
        </motion.span>
      </div>

      {post.badges && post.badges.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {post.badges.map((badge) => (
            <span 
              key={badge.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium"
            >
              <span>{badge.icon}</span>
              <span>{badge.name}</span>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 relative">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-200 dark:via-gray-700 to-transparent opacity-50" />
        <p className="pl-3 text-gray-800 dark:text-gray-200 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/50 flex items-center gap-4">
        <motion.button 
          onClick={handleLike}
          disabled={!currentUserId || isLiking || hasLiked}
          whileTap={{ scale: 0.9 }}
          className={`relative flex items-center gap-1.5 text-sm transition-colors ${
            hasLiked 
              ? 'text-rose-500 cursor-default' 
              : currentUserId 
                ? 'text-gray-500 dark:text-gray-400 hover:text-rose-500' 
                : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <AnimatePresence>
            {showHeartAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-rose-500 fill-current" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.svg 
            className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} 
            fill={hasLiked ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={hasLiked ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={hasLiked ? 0 : 1.5} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </motion.svg>
          <span>{localLikeCount}</span>
        </motion.button>

        <motion.button 
          onClick={toggleComments}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            showComments ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{localCommentCount}</span>
        </motion.button>

        <motion.button
          onClick={handleShare}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </motion.button>

        {!currentUserId && (
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">Sign in to interact</span>
        )}
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50 overflow-hidden"
          >
            {currentUserId && (
              <form onSubmit={submitComment} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all"
                    maxLength={300}
                  />
                  <motion.button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                  >
                    {submittingComment ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    ) : (
                      'Send'
                    )}
                  </motion.button>
                </div>
              </form>
            )}

            {loadingComments ? (
              <div className="text-center py-4">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-2">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment, idx) => (
                  <motion.div 
                    key={comment.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-white text-xs font-medium shrink-0">
                      {(comment.profiles?.username || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {comment.profiles?.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
