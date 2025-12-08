'use client';

import { useState, useRef } from 'react';
import { Send, Smile, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const GiphyPicker = dynamic(() => import('@/components/media/GiphyPicker'), { ssr: false });

interface EnhancedCommentInputProps {
  postId: string;
  onSubmit: (content: string, mediaUrl?: string, mediaType?: string, gifUrl?: string) => Promise<void>;
  placeholder?: string;
}

export default function EnhancedCommentInput({ postId, onSubmit, placeholder = 'Write a comment...' }: EnhancedCommentInputProps) {
  const [content, setContent] = useState('');
  const [showGiphyPicker, setShowGiphyPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGifSelect = (url: string, type: 'gif' | 'sticker') => {
    setSelectedGif(url);
    setShowGiphyPicker(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'comment');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedMedia({
          url: data.url,
          type: file.type.startsWith('video/') ? 'video' : 'image'
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedGif && !selectedMedia) return;

    setSubmitting(true);
    try {
      await onSubmit(
        content,
        selectedMedia?.url,
        selectedMedia?.type,
        selectedGif || undefined
      );
      setContent('');
      setSelectedGif(null);
      setSelectedMedia(null);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨', '🙌', '💪', '🤔', '👏'];

  return (
    <div className="space-y-2">
      {(selectedGif || selectedMedia) && (
        <div className="relative inline-block">
          {selectedGif && (
            <img src={selectedGif} alt="Selected GIF" className="max-h-32 rounded-lg" />
          )}
          {selectedMedia && (
            selectedMedia.type === 'video' ? (
              <video src={selectedMedia.url} className="max-h-32 rounded-lg" controls />
            ) : (
              <img src={selectedMedia.url} alt="Selected media" className="max-h-32 rounded-lg" />
            )
          )}
          <button
            onClick={() => {
              setSelectedGif(null);
              setSelectedMedia(null);
            }}
            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-purple-500"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            title="Add photo or video"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Add emoji or GIF"
            >
              <Smile className="w-5 h-5" />
            </button>

            {showEmojiPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                <div className="absolute bottom-12 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 p-3 z-50 w-64">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {commonEmojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => addEmoji(emoji)}
                        className="text-xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setShowEmojiPicker(false);
                      setShowGiphyPicker(true);
                    }}
                    className="w-full px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    Search GIFs & Stickers
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || (!content.trim() && !selectedGif && !selectedMedia)}
            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {showGiphyPicker && (
        <GiphyPicker
          onSelect={handleGifSelect}
          onClose={() => setShowGiphyPicker(false)}
        />
      )}
    </div>
  );
}
