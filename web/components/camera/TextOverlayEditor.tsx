'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Plus, Minus } from 'lucide-react';

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  backgroundColor: string;
  fontFamily?: string;
}

const FONT_FAMILIES = [
  { id: 'sans', name: 'Sans', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'serif', name: 'Serif', family: '"Georgia", "Times New Roman", serif' },
  { id: 'mono', name: 'Mono', family: '"Courier New", "Courier", monospace' },
  { id: 'display', name: 'Display', family: '"Impact", "Arial Black", sans-serif' },
  { id: 'cursive', name: 'Cursive', family: '"Comic Sans MS", cursive' },
  { id: 'modern', name: 'Modern', family: '"Trebuchet MS", sans-serif' },
  { id: 'bold', name: 'Bold', family: '"Arial", sans-serif' },
  { id: 'elegant', name: 'Elegant', family: '"Palatino Linotype", serif' },
];

const COLORS = [
  '#ffffff', '#000000', '#ff0000', '#ff6b6b', '#ffa500', '#ffd93d',
  '#00ff00', '#6bcb77', '#00bfff', '#4d96ff', '#9b59b6', '#ff69b4'
];

const BG_COLORS = [
  'transparent', '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff6b6b', '#4d96ff', '#9b59b6'
];

interface TextOverlayEditorProps {
  overlays: TextOverlay[];
  onUpdate: (overlays: TextOverlay[]) => void;
  onClose: () => void;
}

export default function TextOverlayEditor({ overlays, onUpdate, onClose }: TextOverlayEditorProps) {
  const [currentOverlay, setCurrentOverlay] = useState<TextOverlay>({
    id: Date.now().toString(),
    text: '',
    x: 50,
    y: 50,
    fontSize: 32,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: 'transparent',
    fontFamily: FONT_FAMILIES[0].family
  });
  const [activeTab, setActiveTab] = useState<'font' | 'size' | 'color' | 'bg' | 'style' | 'align'>('font');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (currentOverlay.text.trim()) {
      onUpdate([...overlays, currentOverlay]);
      setCurrentOverlay({
        ...currentOverlay,
        id: Date.now().toString(),
        text: ''
      });
      inputRef.current?.focus();
    }
  };

  const handleDone = () => {
    if (currentOverlay.text.trim()) {
      onUpdate([...overlays, currentOverlay]);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex flex-col"
    >
      {/* Header - Compact */}
      <div className="flex items-center justify-between p-3 gap-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <button onClick={onClose} className="text-white hover:text-gray-300 flex-shrink-0">
          <X className="w-5 h-5" />
        </button>
        <span className="text-white font-semibold text-sm flex-1 text-center">Add Text</span>
        <button
          onClick={handleDone}
          className="px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-700 flex items-center gap-1 flex-shrink-0"
        >
          <Check className="w-3 h-3" />
          Done
        </button>
      </div>

      {/* Preview - Transparent Background, Smaller Canvas */}
      <div className="flex-1 flex items-center justify-center px-3 py-4">
        <div className="relative w-full max-w-xs aspect-[9/16] rounded-lg overflow-hidden shadow-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
          {/* Existing Overlays */}
          {overlays.map((overlay) => (
            <div
              key={overlay.id}
              className="absolute px-1 py-0.5"
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
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                pointerEvents: 'none'
              }}
            >
              {overlay.text}
            </div>
          ))}

          {/* Current Text Input - No Border Background */}
          <input
            ref={inputRef}
            type="text"
            value={currentOverlay.text}
            onChange={(e) => setCurrentOverlay({ ...currentOverlay, text: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Type here..."
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent border-none outline-none text-center w-5/6 p-1"
            style={{
              fontSize: `${currentOverlay.fontSize}px`,
              fontWeight: currentOverlay.fontWeight,
              fontStyle: currentOverlay.fontStyle,
              color: currentOverlay.color,
              fontFamily: currentOverlay.fontFamily || 'sans-serif',
              textShadow: '0 2px 6px rgba(0,0,0,0.9)',
              backgroundColor: currentOverlay.backgroundColor
            }}
            autoFocus
          />
        </div>
      </div>

      {/* Tabs - Horizontal */}
      <div className="flex gap-2 px-3 pb-2 overflow-x-auto border-t border-white/10">
        {[
          { id: 'font', label: 'Font', icon: 'Aa' },
          { id: 'size', label: 'Size', icon: '↔️' },
          { id: 'color', label: 'Color', icon: '🎨' },
          { id: 'bg', label: 'BG', icon: '⬜' },
          { id: 'style', label: 'Style', icon: '✨' },
          { id: 'align', label: 'Align', icon: '⏐' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {tab.icon}
          </motion.button>
        ))}
      </div>

      {/* Tools - Compact Horizontal Panels */}
      <div className="bg-black/50 backdrop-blur border-t border-white/10 overflow-y-auto max-h-40 p-3 space-y-3">
        {/* Font Family Tab */}
        {activeTab === 'font' && (
          <div>
            <p className="text-gray-400 text-xs uppercase mb-1.5 font-semibold">Font</p>
            <div className="grid grid-cols-4 gap-1.5">
              {FONT_FAMILIES.map((f) => (
                <motion.button
                  key={f.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentOverlay({ ...currentOverlay, fontFamily: f.family })}
                  className={`p-1.5 rounded text-xs font-medium transition-all ${
                    currentOverlay.fontFamily === f.family
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                  style={{ fontFamily: f.family }}
                >
                  {f.name}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Font Size Tab */}
        {activeTab === 'size' && (
          <div>
            <p className="text-gray-400 text-xs uppercase mb-1.5 font-semibold">Size: {currentOverlay.fontSize}px</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentOverlay({ ...currentOverlay, fontSize: Math.max(16, currentOverlay.fontSize - 4) })}
                className="p-1 bg-white/10 rounded hover:bg-white/20"
              >
                <Minus className="w-3 h-3 text-white" />
              </button>
              <input
                type="range"
                min="16"
                max="80"
                value={currentOverlay.fontSize}
                onChange={(e) => setCurrentOverlay({ ...currentOverlay, fontSize: parseInt(e.target.value) })}
                className="flex-1 h-1.5 bg-white/20 rounded cursor-pointer"
              />
              <button
                onClick={() => setCurrentOverlay({ ...currentOverlay, fontSize: Math.min(80, currentOverlay.fontSize + 4) })}
                className="p-1 bg-white/10 rounded hover:bg-white/20"
              >
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Text Color Tab */}
        {activeTab === 'color' && (
          <div>
            <p className="text-gray-400 text-xs uppercase mb-1.5 font-semibold">Text Color</p>
            <div className="grid grid-cols-6 gap-1.5">
              {COLORS.map((color) => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setCurrentOverlay({ ...currentOverlay, color })}
                  className={`w-7 h-7 rounded transition-all ${
                    currentOverlay.color === color ? 'ring-2 ring-white' : ''
                  }`}
                  style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #999' : 'none' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Background Color Tab */}
        {activeTab === 'bg' && (
          <div>
            <p className="text-gray-400 text-xs uppercase mb-1.5 font-semibold">Background</p>
            <div className="grid grid-cols-6 gap-1.5">
              {BG_COLORS.map((color) => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setCurrentOverlay({ ...currentOverlay, backgroundColor: color })}
                  className={`w-7 h-7 rounded transition-all border-2 ${
                    currentOverlay.backgroundColor === color ? 'ring-2 ring-white border-white' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color === 'transparent' ? 'rgba(0,0,0,0.3)' : color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Style Tab */}
        {activeTab === 'style' && (
          <div>
            <p className="text-gray-400 text-xs uppercase mb-1.5 font-semibold">Style</p>
            <div className="flex gap-1.5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setCurrentOverlay({ ...currentOverlay, fontWeight: currentOverlay.fontWeight === 'bold' ? 'normal' : 'bold' })}
                className={`flex-1 p-2 rounded transition-all flex items-center justify-center text-xs font-medium ${
                  currentOverlay.fontWeight === 'bold'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Bold className="w-3 h-3" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setCurrentOverlay({ ...currentOverlay, fontStyle: currentOverlay.fontStyle === 'italic' ? 'normal' : 'italic' })}
                className={`flex-1 p-2 rounded transition-all flex items-center justify-center text-xs font-medium ${
                  currentOverlay.fontStyle === 'italic'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Italic className="w-3 h-3" />
              </motion.button>
            </div>
          </div>
        )}

        {/* Alignment Tab */}
        {activeTab === 'align' && (
          <div>
            <p className="text-gray-400 text-xs uppercase mb-1.5 font-semibold">Align</p>
            <div className="flex gap-1.5">
              {(['left', 'center', 'right'] as const).map((align) => (
                <motion.button
                  key={align}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentOverlay({ ...currentOverlay, textAlign: align })}
                  className={`flex-1 p-2 rounded transition-all text-xs font-medium ${
                    currentOverlay.textAlign === align
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {align === 'left' && <AlignLeft className="w-3 h-3 mx-auto" />}
                  {align === 'center' && <AlignCenter className="w-3 h-3 mx-auto" />}
                  {align === 'right' && <AlignRight className="w-3 h-3 mx-auto" />}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Add Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="w-full py-2 bg-green-600 text-white rounded font-medium text-sm hover:bg-green-700 transition-all"
        >
          Add Text
        </motion.button>
      </div>
    </motion.div>
  );
}
