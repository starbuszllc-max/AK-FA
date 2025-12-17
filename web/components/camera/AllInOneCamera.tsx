'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

import { useCamera, useMediaRecorder, useFaceDetection } from './hooks';
import { CameraControls, FilterStrip, AIEffectsPanel, LayerPicker } from './ui';
import {
  FILTERS,
  BACKGROUNDS,
  MAX_VIDEO_DURATION,
  type FilterId,
  type FaceFilterId,
  type BackgroundId,
  type LayerId,
} from './constants';

export interface AllInOneCameraProps {
  onClose: () => void;
  onCapture?: (data: CaptureResult) => void;
  userId?: string;
}

export interface CaptureResult {
  blob: Blob;
  type: 'photo' | 'video';
  layer: LayerId;
  filter: FilterId;
  previewUrl: string;
}

export default function AllInOneCamera({ onClose, onCapture, userId }: AllInOneCameraProps) {
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [selectedFilter, setSelectedFilter] = useState<FilterId>('none');
  const [selectedFaceFilter, setSelectedFaceFilter] = useState<FaceFilterId>('none');
  const [selectedBackground, setSelectedBackground] = useState<BackgroundId>('none');
  const [selectedLayer, setSelectedLayer] = useState<LayerId>('social');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showLayerPicker, setShowLayerPicker] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const isClosingRef = useRef(false);

  const {
    videoRef,
    stream,
    isReady: isCameraReady,
    error: cameraError,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    hasMultipleCameras,
  } = useCamera({ audio: mode === 'video' });

  const {
    isRecording,
    recordingTime,
    progress,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isPaused,
  } = useMediaRecorder({
    maxDuration: MAX_VIDEO_DURATION,
    onRecordingComplete: handleRecordingComplete,
  });

  const {
    landmarks,
    isLoading: isFaceDetectionLoading,
    isReady: isFaceDetectionReady,
    startDetection,
    stopDetection,
    drawFilter: drawFaceFilter,
  } = useFaceDetection({ enabled: selectedFaceFilter !== 'none', smoothing: 0.6 });

  useEffect(() => {
    startCamera();
    return () => {
      isClosingRef.current = true;
      stopCamera();
      stopDetection();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!capturedMedia) {
      startCamera();
    }
  }, [facingMode, mode, capturedMedia, startCamera]);

  useEffect(() => {
    if (selectedFaceFilter !== 'none' && isCameraReady && videoRef.current) {
      startDetection(videoRef.current);
    } else {
      stopDetection();
    }
  }, [selectedFaceFilter, isCameraReady, startDetection, stopDetection, videoRef]);

  useEffect(() => {
    if (selectedFaceFilter !== 'none' && landmarks && overlayCanvasRef.current && videoRef.current) {
      const canvas = overlayCanvasRef.current;
      const video = videoRef.current;

      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawFaceFilter(selectedFaceFilter, ctx);
        }
      }
    }
  }, [landmarks, selectedFaceFilter, drawFaceFilter, videoRef]);

  useEffect(() => {
    if (countdown > 0) {
      const timerId = setTimeout(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleCaptureAfterTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [countdown]);

  const handleCaptureAfterTimer = useCallback(() => {
    if (mode === 'photo') {
      takePhoto();
    } else {
      handleStartRecording();
    }
  }, [mode]);

  function handleRecordingComplete(blob: Blob) {
    setCapturedBlob(blob);
    setCapturedMedia(URL.createObjectURL(blob));
    setShowLayerPicker(true);
  }

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (flashEnabled) {
      const flashEl = document.createElement('div');
      flashEl.style.cssText = 'position:fixed;inset:0;background:white;z-index:9999;pointer-events:none;';
      document.body.appendChild(flashEl);
      setTimeout(() => flashEl.remove(), 100);
    }

    const filter = FILTERS.find(f => f.id === selectedFilter);
    if (filter && filter.style !== 'none') {
      ctx.filter = filter.style;
    }
    ctx.drawImage(video, 0, 0);
    ctx.filter = 'none';

    if (selectedFaceFilter !== 'none' && landmarks) {
      drawFaceFilter(selectedFaceFilter, ctx);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        setCapturedMedia(URL.createObjectURL(blob));
        setShowLayerPicker(true);
      }
    }, 'image/jpeg', 0.92);
  }, [videoRef, selectedFilter, selectedFaceFilter, landmarks, drawFaceFilter, flashEnabled]);

  const handleStartRecording = useCallback(() => {
    if (stream) {
      startRecording(stream);
    }
  }, [stream, startRecording]);

  const handleCapture = useCallback(() => {
    if (timer > 0) {
      setCountdown(timer);
    } else if (mode === 'photo') {
      takePhoto();
    } else {
      handleStartRecording();
    }
  }, [timer, mode, takePhoto, handleStartRecording]);

  const handleRetake = useCallback(() => {
    if (capturedMedia) {
      URL.revokeObjectURL(capturedMedia);
    }
    setCapturedMedia(null);
    setCapturedBlob(null);
    setShowLayerPicker(false);
    startCamera();
  }, [capturedMedia, startCamera]);

  const handleConfirm = useCallback(async () => {
    if (!capturedBlob) return;

    setIsUploading(true);

    try {
      const result: CaptureResult = {
        blob: capturedBlob,
        type: mode,
        layer: selectedLayer,
        filter: selectedFilter,
        previewUrl: capturedMedia || '',
      };

      onCapture?.(result);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [capturedBlob, capturedMedia, mode, selectedLayer, selectedFilter, onCapture, onClose]);

  const handleClose = useCallback(() => {
    isClosingRef.current = true;
    stopCamera();
    stopDetection();
    stopRecording();

    if (capturedMedia) {
      URL.revokeObjectURL(capturedMedia);
    }

    onClose();
  }, [stopCamera, stopDetection, stopRecording, capturedMedia, onClose]);

  const handleModeChange = useCallback((newMode: 'photo' | 'video') => {
    if (newMode !== mode) {
      setMode(newMode);
    }
  }, [mode]);

  const handleSwitchCamera = useCallback(() => {
    stopDetection();
    switchCamera();
  }, [stopDetection, switchCamera]);

  const getFilterStyle = useCallback(() => {
    const filter = FILTERS.find(f => f.id === selectedFilter);
    return filter && filter.style !== 'none' ? filter.style : undefined;
  }, [selectedFilter]);

  const getBackgroundStyle = useCallback(() => {
    if (selectedBackground === 'none' || selectedBackground === 'blur') return undefined;
    const bg = BACKGROUNDS.find(b => b.id === selectedBackground);
    if (!bg || !('gradient' in bg)) return undefined;
    return { background: bg.gradient };
  }, [selectedBackground]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pt-safe"
           style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white shadow-lg"
        >
          <X className="w-5 h-5" />
        </motion.button>

        {(selectedFaceFilter !== 'none' || selectedBackground !== 'none') && (
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
            {isFaceDetectionLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span className="text-white text-xs">Loading AI...</span>
              </>
            ) : isFaceDetectionReady ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-xs">AI Active</span>
              </>
            ) : null}
          </div>
        )}

        <div className="w-10" />
      </div>

      <div className="flex-1 relative overflow-hidden">
        {!capturedMedia ? (
          <>
            <div
              className="absolute inset-0 transition-all duration-300"
              style={getBackgroundStyle()}
            />

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ filter: getFilterStyle() }}
            />

            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />

            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          mode === 'photo' ? (
            <img
              src={capturedMedia}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={capturedMedia}
              controls
              autoPlay
              loop
              className="w-full h-full object-cover"
            />
          )
        )}

        {cameraError && !capturedMedia && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="text-center text-white p-6 max-w-sm">
              <p className="mb-4 text-lg">{cameraError}</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={startCamera}
                className="px-6 py-3 bg-green-600 rounded-xl font-medium"
              >
                Try Again
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {!capturedMedia && !showLayerPicker && (
        <>
          <AIEffectsPanel
            selectedFaceFilter={selectedFaceFilter}
            selectedBackground={selectedBackground}
            flashEnabled={flashEnabled}
            isFaceDetectionLoading={isFaceDetectionLoading}
            isFaceDetectionReady={isFaceDetectionReady}
            hasMultipleCameras={hasMultipleCameras}
            onFaceFilterChange={setSelectedFaceFilter}
            onBackgroundChange={setSelectedBackground}
            onFlashToggle={() => setFlashEnabled(!flashEnabled)}
            onSwitchCamera={handleSwitchCamera}
            disabled={isRecording || countdown > 0}
          />

          <FilterStrip
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            disabled={isRecording || countdown > 0}
          />

          <CameraControls
            mode={mode}
            isRecording={isRecording}
            isPaused={isPaused}
            recordingTime={recordingTime}
            progress={progress}
            timer={timer}
            countdown={countdown}
            maxDuration={MAX_VIDEO_DURATION}
            onModeChange={handleModeChange}
            onCapture={handleCapture}
            onStopRecording={stopRecording}
            onPauseRecording={pauseRecording}
            onResumeRecording={resumeRecording}
            onTimerChange={setTimer}
          />
        </>
      )}

      <LayerPicker
        isOpen={showLayerPicker}
        selectedLayer={selectedLayer}
        onLayerChange={setSelectedLayer}
        onConfirm={handleConfirm}
        onRetake={handleRetake}
        onClose={() => setShowLayerPicker(false)}
        isUploading={isUploading}
        capturedMediaUrl={capturedMedia}
        mediaType={mode}
      />
    </motion.div>
  );
}
