'use client';

import { useState, useCallback } from 'react';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Search, X, Smile, Image as ImageIcon } from 'lucide-react';

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || '');

interface GiphyPickerProps {
  onSelect: (url: string, type: 'gif' | 'sticker') => void;
  onClose: () => void;
}

export default function GiphyPicker({ onSelect, onClose }: GiphyPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'gif' | 'sticker'>('gif');

  const fetchGifs = useCallback(
    (offset: number) => {
      if (searchTerm) {
        return activeTab === 'gif'
          ? gf.search(searchTerm, { offset, limit: 10 })
          : gf.search(searchTerm, { offset, limit: 10, type: 'stickers' });
      }
      return activeTab === 'gif'
        ? gf.trending({ offset, limit: 10 })
        : gf.trending({ offset, limit: 10, type: 'stickers' });
    },
    [searchTerm, activeTab]
  );

  const handleGifClick = (gif: any, e: React.SyntheticEvent<HTMLElement, Event>) => {
    e.preventDefault();
    const url = gif.images.fixed_height.url;
    onSelect(url, activeTab);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeTab === 'gif' ? 'Choose a GIF' : 'Choose a Sticker'}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('gif')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'gif'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              GIFs
            </button>
            <button
              onClick={() => setActiveTab('sticker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'sticker'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <Smile className="w-4 h-4" />
              Stickers
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'gif' ? 'GIFs' : 'Stickers'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Grid
            key={`${searchTerm}-${activeTab}`}
            width={400}
            columns={3}
            gutter={6}
            fetchGifs={fetchGifs}
            onGifClick={handleGifClick}
            noLink
          />
        </div>

        <div className="p-2 border-t border-gray-200 dark:border-slate-700 text-center">
          <img src="https://giphy.com/static/img/poweredby_giphy.png" alt="Powered by GIPHY" className="h-4 inline-block opacity-50" />
        </div>
      </div>
    </div>
  );
}
