'use client';

import { motion } from 'framer-motion';
import { FILTERS, type FilterId } from '../constants';

interface FilterStripProps {
  selectedFilter: FilterId;
  onFilterChange: (filter: FilterId) => void;
  disabled?: boolean;
}

export function FilterStrip({ selectedFilter, onFilterChange, disabled }: FilterStripProps) {
  return (
    <div className="absolute bottom-40 left-0 right-0 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 overflow-x-auto py-2 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {FILTERS.map((filter) => (
          <motion.button
            key={filter.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange(filter.id)}
            disabled={disabled}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedFilter === filter.id
                ? 'bg-white text-black shadow-lg'
                : 'bg-black/50 text-white/90 hover:bg-black/70'
            } ${disabled ? 'opacity-50' : ''}`}
          >
            {filter.name}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
