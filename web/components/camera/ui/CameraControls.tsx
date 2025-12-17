'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Pause, Play } from 'lucide-react';
import { TIMER_OPTIONS } from '../constants';

interface CameraControlsProps {
  mode: 'photo' | 'video';
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  progress: number;
  timer: number;
  countdown: number;
  maxDuration: number;
  onModeChange: (mode: 'photo' | 'video') => void;
  onCapture: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onTimerChange: (timer: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function CameraControls({
  mode,
  isRecording,
  isPaused,
  recordingTime,
  progress,
  timer,
  countdown,
  maxDuration,
  onModeChange,
  onCapture,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onTimerChange,
}: CameraControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 pb-safe">
      <div className="p-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
        {isRecording && (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-red-500"
              />
              <span className="text-white font-medium text-lg">
                {formatTime(recordingTime)} / {formatTime(maxDuration)}
              </span>
            </div>
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-red-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-center gap-8 mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onModeChange('photo')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              mode === 'photo'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
            disabled={isRecording}
          >
            Photo
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onModeChange('video')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              mode === 'video'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
            disabled={isRecording}
          >
            Video
          </motion.button>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const currentIndex = TIMER_OPTIONS.indexOf(timer as any);
                const nextIndex = (currentIndex + 1) % TIMER_OPTIONS.length;
                onTimerChange(TIMER_OPTIONS[nextIndex]);
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                timer > 0 ? 'bg-yellow-500 text-black' : 'bg-black/40 text-white'
              }`}
              disabled={isRecording}
            >
              <Timer className="w-5 h-5" />
            </motion.button>
            {timer > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full text-xs font-bold text-black flex items-center justify-center">
                {timer}
              </span>
            )}
          </div>

          <div className="relative">
            {mode === 'photo' ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={onCapture}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center shadow-2xl"
                disabled={countdown > 0}
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-white"
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={isRecording ? onStopRecording : onCapture}
                className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center shadow-2xl transition-all ${
                  isRecording ? 'bg-red-500/20' : ''
                }`}
                disabled={countdown > 0}
              >
                {isRecording ? (
                  <motion.div
                    initial={{ scale: 1, borderRadius: '50%' }}
                    animate={{ scale: 0.5, borderRadius: '4px' }}
                    className="w-16 h-16 bg-red-500"
                  />
                ) : (
                  <motion.div
                    className="w-16 h-16 rounded-full bg-red-500"
                    whileTap={{ scale: 0.85 }}
                  />
                )}
              </motion.button>
            )}
          </div>

          {isRecording ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={isPaused ? onResumeRecording : onPauseRecording}
              className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center text-white"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </motion.button>
          ) : (
            <div className="w-12 h-12" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {countdown > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-white text-9xl font-bold drop-shadow-2xl"
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
