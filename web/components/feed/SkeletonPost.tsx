'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function SkeletonPost() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-slate-700"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-700 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-3 w-16 bg-gray-100 dark:bg-slate-700/50 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-100 dark:bg-slate-700/50 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-gray-100 dark:bg-slate-700/50 rounded animate-pulse" />
            <div className="h-4 w-3/5 bg-gray-100 dark:bg-slate-700/50 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-16 bg-gray-100 dark:bg-slate-700/50 rounded-full animate-pulse" />
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center gap-4">
        <div className="h-5 w-12 bg-gray-100 dark:bg-slate-700/50 rounded animate-pulse" />
        <div className="h-5 w-12 bg-gray-100 dark:bg-slate-700/50 rounded animate-pulse" />
        <div className="h-5 w-12 bg-gray-100 dark:bg-slate-700/50 rounded animate-pulse" />
      </div>
    </motion.div>
  );
}
