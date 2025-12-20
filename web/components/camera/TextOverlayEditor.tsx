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
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-semibold">Add Text</span>
        <button
          onClick={handleDone}
          className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Done
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="relative w-full max-w-sm aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden">
          {/* Existing Overlays */}
          {overlays.map((overlay) => (
            <div
              key={overlay.id}
              className="absolute px-2 py-1 rounded"
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
                textShadow: '0 2px 8px rgba(0,0,0,0.8)'
              }}
            >
              {overlay.text}
            </div>
          ))}

          {/* Current Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={currentOverlay.text}
            onChange={(e) => setCurrentOverlay({ ...currentOverlay, text: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Type text..."
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent border-2 border-green-500 outline-none text-center w-5/6 p-2 rounded"
            style={{
              fontSize: `${currentOverlay.fontSize}px`,
              fontWeight: currentOverlay.fontWeight,
              fontStyle: currentOverlay.fontStyle,
              color: currentOverlay.color,
              fontFamily: currentOverlay.fontFamily || 'sans-serif',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              backgroundColor: currentOverlay.backgroundColor
            }}
            autoFocus
          />
        </div>
      </div>

      {/* Tools */}
      <div className="border-t border-gray-800 bg-black overflow-y-auto max-h-96 space-y-4 p-4">
        {/* Font Family */}
        <div>
          <p className="text-gray-400 text-xs uppercase mb-2 font-semibold">Font</p>
          <div className="grid grid-cols-4 gap-2">
            {FONT_FAMILIES.map((f) => (
              <motion.button
                key={f.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setCurrentOverlay({ ...currentOverlay, fontFamily: f.family })}
                className={`p-2 rounded text-xs font-medium transition-all ${
                  currentOverlay.fontFamily === f.family
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                style={{ fontFamily: f.family }}
              >
                {f.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div>
          <p className="text-gray-400 text-xs uppercase mb-2 font-semibold">Size: {currentOverlay.fontSize}px</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentOverlay({ ...currentOverlay, fontSize: Math.max(16, currentOverlay.fontSize - 4) })}
              className="p-2 bg-gray-800 rounded hover:bg-gray-700"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <div className="flex-1 h-2 bg-gray-700 rounded">
              <div
                className="h-full bg-green-600 rounded transition-all"
                style={{ width: `${((currentOverlay.fontSize - 16) / 72) * 100}%` }}
              />
            </div>
            <button
              onClick={() => setCurrentOverlay({ ...currentOverlay, fontSize: Math.min(80, currentOverlay.fontSize + 4) })}
              className="p-2 bg-gray-800 rounded hover:bg-gray-700"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Text Color */}
        <div>
          <p className="text-gray-400 text-xs uppercase mb-2 font-semibold">Text Color</p>
          <div className="grid grid-cols-6 gap-2">
            {COLORS.map((color) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.1 }}
                onClick={() => setCurrentOverlay({ ...currentOverlay, color })}
                className={`w-10 h-10 rounded transition-all ${
                  currentOverlay.color === color ? 'ring-2 ring-white' : ''
                }`}
                style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #ccc' : 'none' }}
              />
            ))}
          </div>
        </div>

        {/* Background Color */}
        <div>
          <p className="text-gray-400 text-xs uppercase mb-2 font-semibold">Background</p>
          <div className="grid grid-cols-6 gap-2">
            {BG_COLORS.map((color) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.1 }}
                onClick={() => setCurrentOverlay({ ...currentOverlay, backgroundColor: color })}
                className={`w-10 h-10 rounded transition-all border-2 ${
                  currentOverlay.backgroundColor === color ? 'ring-2 ring-white border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: color === 'transparent' ? '#1a1a1a' : color }}
                title={color === 'transparent' ? 'Transparent' : color}
              />
            ))}
          </div>
        </div>

        {/* Style Buttons */}
        <div>
          <p className="text-gray-400 text-xs uppercase mb-2 font-semibold">Style</p>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setCurrentOverlay({ ...currentOverlay, fontWeight: currentOverlay.fontWeight === 'bold' ? 'normal' : 'bold' })}
              className={`flex-1 p-2 rounded transition-all flex items-center justify-center gap-2 ${
                currentOverlay.fontWeight === 'bold'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Bold className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setCurrentOverlay({ ...currentOverlay, fontStyle: currentOverlay.fontStyle === 'italic' ? 'normal' : 'italic' })}
              className={`flex-1 p-2 rounded transition-all flex items-center justify-center gap-2 ${
                currentOverlay.fontStyle === 'italic'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Italic className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Alignment */}
        <div>
          <p className="text-gray-400 text-xs uppercase mb-2 font-semibold">Align</p>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((align) => (
              <motion.button
                key={align}
                whileHover={{ scale: 1.05 }}
                onClick={() => setCurrentOverlay({ ...currentOverlay, textAlign: align })}
                className={`flex-1 p-2 rounded transition-all ${
                  currentOverlay.textAlign === align
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {align === 'left' && <AlignLeft className="w-4 h-4 mx-auto" />}
                {align === 'center' && <AlignCenter className="w-4 h-4 mx-auto" />}
                {align === 'right' && <AlignRight className="w-4 h-4 mx-auto" />}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Add Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
        >
          Add Text to Canvas
        </motion.button>
      </div>
    </motion.div>
  );
}
