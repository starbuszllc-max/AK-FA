'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { FaceFilterId } from '../constants';

declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

export interface FaceLandmarks {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  leftMouth: { x: number; y: number };
  rightMouth: { x: number; y: number };
  forehead: { x: number; y: number };
  chin: { x: number; y: number };
  leftCheek: { x: number; y: number };
  rightCheek: { x: number; y: number };
  faceWidth: number;
  faceHeight: number;
}

export interface UseFaceDetectionOptions {
  enabled?: boolean;
  smoothing?: number;
}

export interface UseFaceDetectionReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  landmarks: FaceLandmarks | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  startDetection: (video: HTMLVideoElement) => void;
  stopDetection: () => void;
  drawFilter: (filterId: FaceFilterId, ctx: CanvasRenderingContext2D) => void;
}

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
const CAMERA_UTILS_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';

function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

function smoothLandmarks(
  current: FaceLandmarks | null,
  previous: FaceLandmarks | null,
  factor: number
): FaceLandmarks | null {
  if (!current) return null;
  if (!previous) return current;

  return {
    leftEye: {
      x: lerp(previous.leftEye.x, current.leftEye.x, factor),
      y: lerp(previous.leftEye.y, current.leftEye.y, factor),
    },
    rightEye: {
      x: lerp(previous.rightEye.x, current.rightEye.x, factor),
      y: lerp(previous.rightEye.y, current.rightEye.y, factor),
    },
    nose: {
      x: lerp(previous.nose.x, current.nose.x, factor),
      y: lerp(previous.nose.y, current.nose.y, factor),
    },
    leftMouth: {
      x: lerp(previous.leftMouth.x, current.leftMouth.x, factor),
      y: lerp(previous.leftMouth.y, current.leftMouth.y, factor),
    },
    rightMouth: {
      x: lerp(previous.rightMouth.x, current.rightMouth.x, factor),
      y: lerp(previous.rightMouth.y, current.rightMouth.y, factor),
    },
    forehead: {
      x: lerp(previous.forehead.x, current.forehead.x, factor),
      y: lerp(previous.forehead.y, current.forehead.y, factor),
    },
    chin: {
      x: lerp(previous.chin.x, current.chin.x, factor),
      y: lerp(previous.chin.y, current.chin.y, factor),
    },
    leftCheek: {
      x: lerp(previous.leftCheek.x, current.leftCheek.x, factor),
      y: lerp(previous.leftCheek.y, current.leftCheek.y, factor),
    },
    rightCheek: {
      x: lerp(previous.rightCheek.x, current.rightCheek.x, factor),
      y: lerp(previous.rightCheek.y, current.rightCheek.y, factor),
    },
    faceWidth: lerp(previous.faceWidth, current.faceWidth, factor),
    faceHeight: lerp(previous.faceHeight, current.faceHeight, factor),
  };
}

export function useFaceDetection(options: UseFaceDetectionOptions = {}): UseFaceDetectionReturn {
  const { enabled = true, smoothing = 0.6 } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animationRef = useRef<number>();
  const previousLandmarksRef = useRef<FaceLandmarks | null>(null);

  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScript = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(script);
    });
  }, []);

  const extractLandmarks = useCallback((results: any, width: number, height: number): FaceLandmarks | null => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      return null;
    }

    const face = results.multiFaceLandmarks[0];

    const leftEyeCenter = face[468];
    const rightEyeCenter = face[473];
    const noseTip = face[4];
    const leftMouthCorner = face[61];
    const rightMouthCorner = face[291];
    const forehead = face[10];
    const chin = face[152];
    const leftCheek = face[234];
    const rightCheek = face[454];

    const faceWidth = Math.abs(rightCheek.x - leftCheek.x) * width;
    const faceHeight = Math.abs(chin.y - forehead.y) * height;

    return {
      leftEye: { x: leftEyeCenter.x * width, y: leftEyeCenter.y * height },
      rightEye: { x: rightEyeCenter.x * width, y: rightEyeCenter.y * height },
      nose: { x: noseTip.x * width, y: noseTip.y * height },
      leftMouth: { x: leftMouthCorner.x * width, y: leftMouthCorner.y * height },
      rightMouth: { x: rightMouthCorner.x * width, y: rightMouthCorner.y * height },
      forehead: { x: forehead.x * width, y: forehead.y * height },
      chin: { x: chin.x * width, y: chin.y * height },
      leftCheek: { x: leftCheek.x * width, y: leftCheek.y * height },
      rightCheek: { x: rightCheek.x * width, y: rightCheek.y * height },
      faceWidth,
      faceHeight,
    };
  }, []);

  const stopDetection = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    setIsReady(false);
    setLandmarks(null);
    previousLandmarksRef.current = null;
  }, []);

  const startDetection = useCallback(async (video: HTMLVideoElement) => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      await loadScript(MEDIAPIPE_CDN);
      await loadScript(CAMERA_UTILS_CDN);

      await new Promise(resolve => setTimeout(resolve, 100));

      if (!window.FaceMesh) {
        throw new Error('FaceMesh not loaded');
      }

      const faceMesh = new window.FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: any) => {
        const width = video.videoWidth;
        const height = video.videoHeight;
        const newLandmarks = extractLandmarks(results, width, height);

        const smoothed = smoothLandmarks(newLandmarks, previousLandmarksRef.current, smoothing);
        previousLandmarksRef.current = smoothed;
        setLandmarks(smoothed);
      });

      await faceMesh.initialize();
      faceMeshRef.current = faceMesh;

      const camera = new window.Camera(video, {
        onFrame: async () => {
          if (faceMeshRef.current) {
            await faceMeshRef.current.send({ image: video });
          }
        },
        width: video.videoWidth || 640,
        height: video.videoHeight || 480,
      });

      cameraRef.current = camera;
      await camera.start();

      setIsReady(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Face detection error:', err);
      setError('Failed to initialize face detection');
      setIsLoading(false);
    }
  }, [enabled, loadScript, extractLandmarks, smoothing]);

  const drawFilter = useCallback((filterId: FaceFilterId, ctx: CanvasRenderingContext2D) => {
    if (!landmarks || filterId === 'none') return;

    const { leftEye, rightEye, nose, forehead, faceWidth, faceHeight } = landmarks;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const eyeDistance = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
    );
    const scale = eyeDistance / 80;
    const fontSize = Math.max(24, Math.min(80, scale * 40));

    ctx.font = `${fontSize}px Arial`;

    switch (filterId) {
      case 'glasses':
      case 'sunglasses': {
        const emoji = filterId === 'glasses' ? '👓' : '🕶️';
        const centerX = (leftEye.x + rightEye.x) / 2;
        const centerY = (leftEye.y + rightEye.y) / 2;
        ctx.font = `${fontSize * 1.5}px Arial`;
        ctx.fillText(emoji, centerX, centerY);
        break;
      }
      case 'crown': {
        const crownY = forehead.y - faceHeight * 0.15;
        const crownX = (leftEye.x + rightEye.x) / 2;
        ctx.font = `${fontSize * 1.8}px Arial`;
        ctx.fillText('👑', crownX, crownY);
        break;
      }
      case 'cat': {
        const earOffset = faceWidth * 0.35;
        const earY = forehead.y - faceHeight * 0.1;
        ctx.font = `${fontSize * 1.2}px Arial`;
        ctx.fillText('🐱', leftEye.x - earOffset * 0.5, earY);
        ctx.fillText('🐱', rightEye.x + earOffset * 0.5, earY);
        ctx.font = `${fontSize * 0.6}px Arial`;
        ctx.fillText('👃', nose.x, nose.y + 5);
        break;
      }
      case 'dog': {
        const earOffset = faceWidth * 0.4;
        const earY = forehead.y - faceHeight * 0.05;
        ctx.font = `${fontSize * 1.3}px Arial`;
        ctx.fillText('🐶', leftEye.x - earOffset * 0.3, earY);
        ctx.fillText('🐶', rightEye.x + earOffset * 0.3, earY);
        ctx.font = `${fontSize * 0.7}px Arial`;
        ctx.fillText('🐽', nose.x, nose.y + 10);
        break;
      }
      case 'sparkle': {
        const positions = [
          { x: leftEye.x - 20, y: leftEye.y - 20 },
          { x: rightEye.x + 20, y: rightEye.y - 20 },
          { x: forehead.x, y: forehead.y - 30 },
          { x: leftEye.x - 40, y: forehead.y },
          { x: rightEye.x + 40, y: forehead.y },
        ];
        const now = Date.now() / 200;
        ctx.font = `${fontSize * 0.8}px Arial`;
        positions.forEach((pos, i) => {
          const offset = Math.sin(now + i) * 5;
          const alpha = 0.5 + Math.sin(now + i * 0.5) * 0.5;
          ctx.globalAlpha = alpha;
          ctx.fillText('✨', pos.x + offset, pos.y + offset);
        });
        ctx.globalAlpha = 1;
        break;
      }
      case 'hearts': {
        const positions = [
          { x: leftEye.x, y: leftEye.y },
          { x: rightEye.x, y: rightEye.y },
        ];
        ctx.font = `${fontSize * 1.2}px Arial`;
        positions.forEach(pos => {
          ctx.fillText('💖', pos.x, pos.y);
        });
        break;
      }
      case 'fire': {
        const centerX = (leftEye.x + rightEye.x) / 2;
        const fireY = forehead.y - faceHeight * 0.3;
        ctx.font = `${fontSize * 2}px Arial`;
        ctx.fillText('🔥', centerX, fireY);
        break;
      }
      case 'butterfly': {
        const positions = [
          { x: leftEye.x - faceWidth * 0.3, y: forehead.y - 10 },
          { x: rightEye.x + faceWidth * 0.3, y: forehead.y - 10 },
        ];
        const now = Date.now() / 300;
        ctx.font = `${fontSize * 1.1}px Arial`;
        positions.forEach((pos, i) => {
          const flutter = Math.sin(now + i * Math.PI) * 8;
          ctx.fillText('🦋', pos.x + flutter, pos.y + flutter * 0.5);
        });
        break;
      }
    }

    ctx.restore();
  }, [landmarks]);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    canvasRef,
    landmarks,
    isLoading,
    isReady,
    error,
    startDetection,
    stopDetection,
    drawFilter,
  };
}
