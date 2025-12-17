'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap, ZapOff, Sparkles, ImageIcon, Loader2 } from 'lucide-react';
import { FACE_FILTERS, BACKGROUNDS, type FaceFilterId, type BackgroundId } from '../constants';

interface AIEffectsPanelProps {
  selectedFaceFilter: FaceFilterId;
  selectedBackground: BackgroundId;
  flashEnabled: boolean;
  isFaceDetectionLoading: boolean;
  isFaceDetectionReady: boolean;
  hasMultipleCameras: boolean;
  onFaceFilterChange: (filter: FaceFilterId) => void;
  onBackgroundChange: (background: BackgroundId) => void;
  onFlashToggle: () => void;
  onSwitchCamera: () => void;
  disabled?: boolean;
}

export function AIEffectsPanel({
  selectedFaceFilter,
  selectedBackground,
  flashEnabled,
  isFaceDetectionLoading,
  isFaceDetectionReady,
  hasMultipleCameras,
  onFaceFilterChange,
  onBackgroundChange,
  onFlashToggle,
  onSwitchCamera,
  disabled,
}: AIEffectsPanelProps) {
  const [showFaceFilters, setShowFaceFilters] = useState(false);
  const [showBackgrounds, setShowBackgrounds] = useState(false);

  const handleFaceFilterToggle = () => {
    setShowFaceFilters(!showFaceFilters);
    setShowBackgrounds(false);
  };

  const handleBackgroundToggle = () => {
    setShowBackgrounds(!showBackgrounds);
    setShowFaceFilters(false);
  };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleFaceFilterToggle}
          disabled={disabled}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
            selectedFaceFilter !== 'none'
              ? 'bg-pink-500 text-white'
              : 'bg-black/50 text-white backdrop-blur-sm'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          {isFaceDetectionLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
        </motion.button>

        <AnimatePresence>
          {showFaceFilters && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="absolute right-14 top-0 bg-black/80 backdrop-blur-xl rounded-2xl p-3 w-52 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <p className="text-white text-sm font-medium">Face Filters</p>
                {isFaceDetectionReady && (
                  <span className="ml-auto text-xs text-green-400">AI Ready</span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {FACE_FILTERS.map((filter) => (
                  <motion.button
                    key={filter.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      onFaceFilterChange(filter.id);
                      setShowFaceFilters(false);
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      selectedFaceFilter === filter.id
                        ? 'bg-pink-500 shadow-lg shadow-pink-500/30'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xl">{filter.emoji}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleBackgroundToggle}
          disabled={disabled}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
            selectedBackground !== 'none'
              ? 'bg-green-500 text-white'
              : 'bg-black/50 text-white backdrop-blur-sm'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          <ImageIcon className="w-5 h-5" />
        </motion.button>

        <AnimatePresence>
          {showBackgrounds && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="absolute right-14 top-0 bg-black/80 backdrop-blur-xl rounded-2xl p-3 w-52 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-green-400" />
                <p className="text-white text-sm font-medium">Background</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {BACKGROUNDS.map((bg) => (
                  <motion.button
                    key={bg.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      onBackgroundChange(bg.id);
                      setShowBackgrounds(false);
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      selectedBackground === bg.id
                        ? 'bg-green-500 shadow-lg shadow-green-500/30'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xl">{bg.emoji}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onFlashToggle}
        disabled={disabled}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
          flashEnabled
            ? 'bg-yellow-500 text-black'
            : 'bg-black/50 text-white backdrop-blur-sm'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        {flashEnabled ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
      </motion.button>

      {hasMultipleCameras && (
        <motion.button
          whileTap={{ scale: 0.9, rotate: 180 }}
          onClick={onSwitchCamera}
          disabled={disabled}
          className={`w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white shadow-lg ${
            disabled ? 'opacity-50' : ''
          }`}
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}
