'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { ExternalLink, Clock, TrendingUp, Newspaper, CheckCircle2 } from 'lucide-react';
import CategoryTabs from '@/components/feed/CategoryTabs';

interface NewsArticle {
  id: string;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  sourceUrl: string;
  author: string | null;
  category: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  newsSource: {
    name: string;
    logoUrl: string | null;
    trustScore: number;
  };
}

const newsCategories = [
  { id: 'all', label: 'All News', icon: <Newspaper className="w-4 h-4" />, color: 'text-gray-500' },
  { id: 'technology', label: 'Technology', icon: <TrendingUp className="w-4 h-4" />, color: 'text-blue-500' },
  { id: 'health', label: 'Health', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-500' },
  { id: 'science', label: 'Science', icon: <TrendingUp className="w-4 h-4" />, color: 'text-purple-500' },
  { id: 'environment', label: 'Environment', icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald-500' }
];

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchNews();
  }, [category]);

  const fetchNews = async () => {
    try {
      const params = new URLSearchParams({ category, limit: '20' });
      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="w-8 h-8 text-indigo-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verified News</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">From trusted sources</p>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {newsCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  category === cat.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className={category === cat.id ? cat.color : ''}>{cat.icon}</span>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="aspect-video bg-gray-200 dark:bg-slate-700 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No news articles yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back later for verified news from trusted sources.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
                  {article.imageUrl && (
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 dark:bg-black/90 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        Verified
                      </div>
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      {article.newsSource.logoUrl ? (
                        <img
                          src={article.newsSource.logoUrl}
                          alt={article.newsSource.name}
                          className="w-5 h-5 rounded"
                        />
                      ) : (
                        <Newspaper className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {article.newsSource.name}
                      </span>
                      <span className="ml-auto px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs rounded-full">
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto pt-3 border-t border-gray-100 dark:border-slate-700">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Read more
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
