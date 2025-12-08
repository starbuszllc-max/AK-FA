'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Sparkles, Sun, Moon, Palette, Zap, RefreshCw, Circle, Video, Image } from 'lucide-react';

interface Filter {
  id: string;
  name: string;
  icon: React.ReactNode;
  style: React.CSSProperties;
}

const FILTERS: Filter[] = [
  { id: 'none', name: 'Normal', icon: <Circle className="w-5 h-5" />, style: {} },
  { id: 'vintage', name: 'Vintage', icon: <Palette className="w-5 h-5" />, style: { filter: 'sepia(0.4) contrast(1.1) brightness(1.1)' } },
  { id: 'bright', name: 'Bright', icon: <Sun className="w-5 h-5" />, style: { filter: 'brightness(1.2) saturate(1.2)' } },
  { id: 'dark', name: 'Moody', icon: <Moon className="w-5 h-5" />, style: { filter: 'brightness(0.9) contrast(1.2) saturate(0.8)' } },
  { id: 'cinematic', name: 'Cinematic', icon: <Sparkles className="w-5 h-5" />, style: { filter: 'contrast(1.15) saturate(1.1) sepia(0.1)' } },
  { id: 'vibrant', name: 'Vibrant', icon: <Zap className="w-5 h-5" />, style: { filter: 'saturate(1.5) contrast(1.1)' } }
];

interface CameraWithFiltersProps {
  onCapture?: (dataUrl: string, type: 'photo' | 'video') => void;
  onClose?: () => void;
}

export default function CameraWithFilters({ onCapture, onClose }: CameraWithFiltersProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  async function startCamera() {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'video'
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please grant permission.');
    }
  }

  function flipCamera() {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const filter = FILTERS.find(f => f.id === selectedFilter);
    if (filter?.style.filter) {
      ctx.filter = filter.style.filter as string;
    }

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
  }

  function retake() {
    setCapturedImage(null);
  }

  function confirmCapture() {
    if (capturedImage && onCapture) {
      onCapture(capturedImage, 'photo');
    }
  }

  const currentFilter = FILTERS.find(f => f.id === selectedFilter);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white p-8">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-4">{error}</p>
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-indigo-600 rounded-xl font-medium"
          >
            Try Again
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="block mx-auto mt-4 text-gray-400 hover:text-white"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 bg-black/50 rounded-full text-white"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <button
        onClick={flipCamera}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white"
      >
        <RefreshCw className="w-6 h-6" />
      </button>

      {capturedImage ? (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="p-6 flex items-center justify-center gap-6">
            <button
              onClick={retake}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium"
            >
              Retake
            </button>
            <button
              onClick={confirmCapture}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium"
            >
              Use Photo
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{
                ...currentFilter?.style,
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
              }}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="absolute bottom-32 left-0 right-0 px-4">
            <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 px-4 bg-black/40 rounded-2xl backdrop-blur-sm">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    selectedFilter === filter.id 
                      ? 'bg-white text-black' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {filter.icon}
                  <span className="text-xs">{filter.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 flex items-center justify-center gap-8">
            <button
              onClick={() => setMode('photo')}
              className={`p-3 rounded-full ${mode === 'photo' ? 'text-white' : 'text-gray-500'}`}
            >
              <Image className="w-6 h-6" />
            </button>

            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full border-4 border-black" />
            </button>

            <button
              onClick={() => setMode('video')}
              className={`p-3 rounded-full ${mode === 'video' ? 'text-white' : 'text-gray-500'}`}
            >
              <Video className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
