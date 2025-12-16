'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/50 amoled:from-black amoled:via-black amoled:to-black" />
      
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/20 to-purple-200/20 dark:from-green-900/20 dark:to-purple-900/20 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-rose-200/15 to-green-200/15 dark:from-rose-900/15 dark:to-green-900/15 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <motion.div
        className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-tr from-emerald-200/15 to-cyan-200/15 dark:from-emerald-900/15 dark:to-cyan-900/15 rounded-full blur-3xl"
        animate={{
          x: [0, 20, 0],
          y: [0, -30, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-green-400/20 dark:bg-green-500/20 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}
