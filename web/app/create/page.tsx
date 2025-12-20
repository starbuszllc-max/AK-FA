'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import VideoEditor from '@/components/camera/VideoEditor';
import { Upload, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type EditorStep = 'selection' | 'editor' | 'caption';

interface EditedMedia {
  url: string;
  type: 'image' | 'video';
  textOverlays: any[];
  stickers: any[];
  music: any | null;
  filters: any | null;
  background: any | null;
}

const LAYER_OPTIONS = [
  { id: 'environment', label: 'Environment', emoji: '🌍', color: 'from-emerald-500 to-teal-500' },
  { id: 'bio', label: 'Biological', emoji: '🧬', color: 'from-rose-500 to-pink-500' },
  { id: 'internal', label: 'Internal', emoji: '🧠', color: 'from-purple-500 to-indigo-500' },
  { id: 'cultural', label: 'Cultural', emoji: '🎭', color: 'from-green-500 to-emerald-500' },
  { id: 'social', label: 'Social', emoji: '👥', color: 'from-blue-500 to-cyan-500' },
  { id: 'conscious', label: 'Conscious', emoji: '💭', color: 'from-green-500 to-lime-500' },
  { id: 'existential', label: 'Existential', emoji: '✨', color: 'from-violet-500 to-purple-500' },
];

export default function CreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<EditorStep>('selection');
  const [capturedMedia, setCapturedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [editedMedia, setEditedMedia] = useState<EditedMedia | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('social');
  const [posting, setPosting] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleEditorComplete = (data: EditedMedia) => {
    setEditedMedia(data);
    setStep('caption');
    generateAICaptions();
  };

  const generateAICaptions = async () => {
    setGeneratingCaption(true);
    try {
      const res = await fetch('/api/ai-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate 3 creative, engaging captions for a social media post in the ${selectedLayer} layer of the Human Stack. Each caption should be 1-2 sentences, inspiring and authentic. Return only the captions as a JSON array of strings.`,
          type: 'captions'
        })
      });

      if (res.ok) {
        const data = await res.json();
        try {
          const parsed = JSON.parse(data.response || '[]');
          setAiSuggestions(Array.isArray(parsed) ? parsed : []);
        } catch {
          setAiSuggestions([
            `Sharing my ${selectedLayer} journey today ✨`,
            `Growth happens one step at a time 🌱`,
            `Embracing the process 💪`
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to generate captions:', error);
    }
    setGeneratingCaption(false);
  };

  const handlePost = async () => {
    if (!user) {
      router.push('/onboarding');
      return;
    }

    if (!caption.trim() && !editedMedia) return;

    setPosting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          content: caption.trim() || 'Check out my post!',
          layer: selectedLayer,
          media_urls: editedMedia ? [editedMedia.url] : [],
          media_types: editedMedia ? [editedMedia.type] : [],
          metadata: editedMedia ? {
            textOverlays: editedMedia.textOverlays,
            stickers: editedMedia.stickers,
            music: editedMedia.music,
            filters: editedMedia.filters,
            background: editedMedia.background
          } : undefined
        })
      });

      if (res.ok) {
        router.push('/');
      }
    } catch (err) {
      console.error('Error posting:', err);
    }
    setPosting(false);
  };

  const handleFileSelect = (type: 'video' | 'image') => {
    if (type === 'video') {
      videoInputRef.current?.click();
    } else {
      photoInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCapturedMedia({ url, type });
      setStep('editor');
    }
  };

  // Selection screen
  if (step === 'selection') {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-semibold">Create</h1>
          <div className="w-6" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleFileSelect('image')}
            className="w-full rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg"
          >
            <Upload className="w-12 h-12 text-white" />
            <div>
              <p className="text-white font-bold text-lg">Upload Photo</p>
              <p className="text-purple-100 text-sm">Choose from your device</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleFileSelect('video')}
            className="w-full rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg"
          >
            <Upload className="w-12 h-12 text-white" />
            <div>
              <p className="text-white font-bold text-lg">Upload Video</p>
              <p className="text-blue-100 text-sm">Choose from your device</p>
            </div>
          </motion.button>
        </div>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileChange(e, 'video')}
          className="hidden"
        />
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'image')}
          className="hidden"
        />
      </div>
    );
  }

  if (step === 'editor' && capturedMedia) {
    return (
      <AnimatePresence>
        <VideoEditor
          mediaUrl={capturedMedia.url}
          mediaType={capturedMedia.type}
          onComplete={handleEditorComplete}
          onBack={() => {
            setCapturedMedia(null);
            setStep('selection');
          }}
        />
      </AnimatePresence>
    );
  }

  if (step === 'caption') {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <button onClick={() => setStep('editor')} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-white font-semibold">Post</h1>
          <button
            onClick={handlePost}
            disabled={posting || !caption.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {editedMedia && (
            <div className="flex gap-4">
              <div className="w-20 h-28 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                {editedMedia.type === 'video' ? (
                  <video src={editedMedia.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={editedMedia.url} alt="Preview" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What's on your mind?"
                  maxLength={2200}
                  className="w-full h-24 bg-gray-900 text-white rounded-lg p-3 text-sm placeholder-gray-500 border border-gray-800 focus:border-green-600 outline-none resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{caption.length}/2200</p>
              </div>
            </div>
          )}

          {generatingCaption ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-green-500" />
              <span className="text-gray-400 text-sm ml-2">Generating captions...</span>
            </div>
          ) : aiSuggestions.length > 0 && !caption ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">AI Suggestions</p>
              {aiSuggestions.map((suggestion, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setCaption(suggestion)}
                  className="w-full text-left p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm border border-gray-800 transition-all"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Human Stack Layer</p>
            <div className="grid grid-cols-3 gap-3">
              {LAYER_OPTIONS.map((layer) => (
                <motion.button
                  key={layer.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`p-3 rounded-lg transition-all ${
                    selectedLayer === layer.id
                      ? `bg-gradient-to-br ${layer.color} ring-2 ring-white`
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  <div className="text-2xl mb-1">{layer.emoji}</div>
                  <p className={`text-xs font-medium ${selectedLayer === layer.id ? 'text-white' : 'text-gray-400'}`}>
                    {layer.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
