'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, User } from 'lucide-react';

interface ProfilePictureUploadProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProfilePictureUpload({ 
  currentUrl, 
  onUpload, 
  size = 'lg' 
}: ProfilePictureUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        onUpload(data.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setPreview(null);
    } finally {
      setUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer relative group border-4 border-white dark:border-slate-700 shadow-lg`}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <User className="w-1/2 h-1/2 text-white/80" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute -bottom-1 -right-1 p-2 bg-purple-600 rounded-full text-white shadow-lg hover:bg-purple-700 transition-colors"
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
