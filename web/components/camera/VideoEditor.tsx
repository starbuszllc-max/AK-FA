'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, Type, Music, Smile, Wand2, Undo2, Redo2, Plus, Minus
} from 'lucide-react';
import TextOverlayEditor, { TextOverlay } from './TextOverlayEditor';

interface VideoEditorProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  onComplete: (editedMedia: {
    url: string;
    type: 'image' | 'video';
    textOverlays: TextOverlay[];
    stickers: { type: 'emoji' | 'gif'; content: string; x: number; y: number }[];
    music: { title: string; artist: string; url: string } | null;
    filters: string | null;
    background: string | null;
  }) => void;
  onBack: () => void;
}

const FILTERS = [
  { id: 'none', name: 'None', filter: 'none' },
  { id: 'brightness', name: 'Bright', filter: 'brightness(1.2)' },
  { id: 'contrast', name: 'Contrast', filter: 'contrast(1.3)' },
  { id: 'saturate', name: 'Vivid', filter: 'saturate(1.4)' },
  { id: 'sepia', name: 'Sepia', filter: 'sepia(0.8)' },
  { id: 'grayscale', name: 'B&W', filter: 'grayscale(1)' },
  { id: 'invert', name: 'Invert', filter: 'invert(1)' },
  { id: 'blur', name: 'Blur', filter: 'blur(3px)' },
];

const EMOJIS = ['😀', '😂', '😍', '🔥', '💯', '✨', '🎉', '👍', '❤️', '🎬', '⭐', '🌟'];

const FONTS = [
  { id: 'sans', name: 'Sans', family: '"Helvetica Neue", sans-serif' },
  { id: 'serif', name: 'Serif', family: 'Georgia, serif' },
  { id: 'mono', name: 'Mono', family: '"Courier New", monospace' },
  { id: 'display', name: 'Display', family: '"Impact", display' },
  { id: 'cursive', name: 'Cursive', family: '"Brush Script MT", cursive' },
];

export default function VideoEditor({ mediaUrl, mediaType, onComplete, onBack }: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [stickers, setStickers] = useState<{ type: 'emoji' | 'gif'; content: string; x: number; y: number; id: string }[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'filters' | 'text' | 'stickers' | 'fonts'>('filters');

  const handleAddSticker = (emoji: string) => {
    const newSticker = {
      id: Date.now().toString(),
      type: 'emoji' as const,
      content: emoji,
      x: 50,
      y: 50
    };
    setStickers([...stickers, newSticker]);
  };

  const handleComplete = () => {
    onComplete({
      url: mediaUrl,
      type: mediaType,
      textOverlays,
      stickers: stickers.map(s => ({ type: s.type, content: s.content, x: s.x, y: s.y })),
      music: null,
      filters: selectedFilter !== 'none' ? selectedFilter : null,
      background: null
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-800"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      >
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-white font-semibold">Edit</h1>
        <button
          onClick={handleComplete}
          className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Next
        </button>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="relative w-full max-w-sm aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
          {mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              className="w-full h-full object-cover"
              style={{ filter: FILTERS.find(f => f.id === selectedFilter)?.filter || 'none' }}
              loop
              playsInline
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              style={{ filter: FILTERS.find(f => f.id === selectedFilter)?.filter || 'none' }}
            />
          )}

          {/* Text Overlays */}
          {textOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className="absolute px-2 py-1 rounded cursor-move"
              style={{
                left: `${overlay.x}%`,
                top: `${overlay.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: `${overlay.fontSize}px`,
                fontWeight: overlay.fontWeight,
                fontStyle: overlay.fontStyle,
                textAlign: overlay.textAlign,
                color: overlay.color,
                backgroundColor: overlay.backgroundColor,
                fontFamily: overlay.fontFamily || 'sans-serif',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                zIndex: 10
              }}
            >
              {overlay.text}
            </div>
          ))}

          {/* Stickers */}
          {stickers.map((sticker) => (
            <div
              key={sticker.id}
              className="absolute text-3xl cursor-move select-none"
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 20
              }}
              draggable
              onDragEnd={(e) => {
                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                if (rect) {
                  const newX = ((e.clientX - rect.left) / rect.width) * 100;
                  const newY = ((e.clientY - rect.top) / rect.height) * 100;
                  setStickers(stickers.map(s => 
                    s.id === sticker.id ? { ...s, x: newX, y: newY } : s
                  ));
                }
              }}
            >
              {sticker.content}
            </div>
          ))}
        </div>
      </div>

      {/* Tool Tabs */}
      <div className="border-t border-gray-800 bg-black">
        <div className="flex gap-4 p-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('filters')}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === 'filters'
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4 inline mr-2" />
            Filters
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === 'text'
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Type className="w-4 h-4 inline mr-2" />
            Text
          </button>
          <button
            onClick={() => setActiveTab('stickers')}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === 'stickers'
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Smile className="w-4 h-4 inline mr-2" />
            Stickers
          </button>
        </div>

        {/* Filters Tab */}
        {activeTab === 'filters' && (
          <div className="px-4 pb-4 grid grid-cols-4 gap-2">
            {FILTERS.map((f) => (
              <motion.button
                key={f.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedFilter(f.id)}
                className={`p-3 rounded-lg font-medium text-sm transition-all ${
                  selectedFilter === f.id
                    ? 'bg-green-600 text-white ring-2 ring-green-400'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {f.name}
              </motion.button>
            ))}
          </div>
        )}

        {/* Text Tab */}
        {activeTab === 'text' && (
          <div className="px-4 pb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTextEditor(true)}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Text
            </motion.button>
          </div>
        )}

        {/* Stickers Tab */}
        {activeTab === 'stickers' && (
          <div className="px-4 pb-4 grid grid-cols-6 gap-2">
            {EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAddSticker(emoji)}
                className="p-3 bg-gray-800 rounded-lg text-2xl hover:bg-gray-700 transition-all"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Text Editor Modal */}
      <AnimatePresence>
        {showTextEditor && (
          <TextOverlayEditor
            overlays={textOverlays}
            onUpdate={setTextOverlays}
            onClose={() => setShowTextEditor(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
