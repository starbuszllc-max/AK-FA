'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';

interface MediaItem {
  previewUrl: string;
  serverUrl: string;
  type: string;
  file: File;
}

interface MediaUploadProps {
  onUpload: (urls: string[], types: string[]) => void;
  maxFiles?: number;
  acceptVideo?: boolean;
  className?: string;
}

export default function MediaUpload({ 
  onUpload, 
  maxFiles = 4, 
  acceptVideo = true,
  className = '' 
}: MediaUploadProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = acceptVideo 
    ? 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime'
    : 'image/jpeg,image/png,image/gif,image/webp';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const newItems: MediaItem[] = [];

      for (const file of files.slice(0, maxFiles - mediaItems.length)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', file.type.startsWith('video/') ? 'video' : 'image');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          newItems.push({
            previewUrl: URL.createObjectURL(file),
            serverUrl: data.url,
            type: file.type.startsWith('video/') ? 'video' : 'image',
            file
          });
        }
      }

      const updatedItems = [...mediaItems, ...newItems].slice(0, maxFiles);
      setMediaItems(updatedItems);
      onUpload(
        updatedItems.map(item => item.serverUrl),
        updatedItems.map(item => item.type)
      );
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeItem = (index: number) => {
    const updated = mediaItems.filter((_, i) => i !== index);
    setMediaItems(updated);
    onUpload(
      updated.map(item => item.serverUrl),
      updated.map(item => item.type)
    );
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || mediaItems.length >= maxFiles}
      />

      {mediaItems.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {mediaItems.map((item, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden aspect-video bg-gray-100 dark:bg-slate-700">
              {item.type === 'video' ? (
                <video src={item.previewUrl} className="w-full h-full object-cover" />
              ) : (
                <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => removeItem(index)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              {item.type === 'video' && (
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 rounded text-xs text-white flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  Video
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {mediaItems.length < maxFiles && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span className="text-sm">
            {uploading ? 'Uploading...' : `Add ${acceptVideo ? 'photos or videos' : 'photos'}`}
          </span>
        </button>
      )}
    </div>
  );
}
