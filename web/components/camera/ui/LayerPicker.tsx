'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { LAYERS, type LayerId } from '../constants';

interface LayerPickerProps {
  isOpen: boolean;
  selectedLayer: LayerId;
  onLayerChange: (layer: LayerId) => void;
  onConfirm: () => void;
  onRetake: () => void;
  onClose: () => void;
  isUploading?: boolean;
  capturedMediaUrl?: string | null;
  mediaType?: 'photo' | 'video';
}

export function LayerPicker({
  isOpen,
  selectedLayer,
  onLayerChange,
  onConfirm,
  onRetake,
  onClose,
  isUploading,
  capturedMediaUrl,
  mediaType = 'photo',
}: LayerPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm z-30 flex flex-col"
        >
          <div className="flex items-center justify-between p-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <X className="w-5 h-5" />
            </motion.button>
            <h2 className="text-white font-semibold">Choose Layer</h2>
            <div className="w-10" />
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            {capturedMediaUrl && (
              <div className="w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl">
                {mediaType === 'photo' ? (
                  <img
                    src={capturedMediaUrl}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={capturedMediaUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
          </div>

          <div className="p-4">
            <p className="text-white/70 text-sm text-center mb-3">
              Which layer does this relate to?
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {LAYERS.map((layer) => (
                <motion.button
                  key={layer.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onLayerChange(layer.id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-full flex items-center gap-2 transition-all ${
                    selectedLayer === layer.id
                      ? `bg-gradient-to-r ${layer.color} text-white shadow-lg`
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <span className="text-lg">{layer.emoji}</span>
                  <span className="text-sm font-medium">{layer.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="p-4 pb-safe flex gap-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onRetake}
              disabled={isUploading}
              className="flex-1 py-4 rounded-xl bg-white/10 text-white font-semibold transition-all hover:bg-white/20 disabled:opacity-50"
            >
              Retake
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onConfirm}
              disabled={isUploading}
              className={`flex-1 py-4 rounded-xl bg-gradient-to-r ${
                LAYERS.find(l => l.id === selectedLayer)?.color || 'from-blue-500 to-cyan-600'
              } text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Share
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
