'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Smile } from 'lucide-react';
import { Expense } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface MemoryCardProps {
  expense: Expense;
  onClick: (expense: Expense) => void;
}

export function MemoryCard({ expense, onClick }: MemoryCardProps) {
  const [imageError, setImageError] = React.useState(false);

  // Reset error state when URL changes (e.g., after recovery)
  React.useEffect(() => {
    setImageError(false);
  }, [expense.imageUrl]);

  return (


    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 0.98 }}
      onClick={() => onClick(expense)}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group"
    >
      {expense.imageUrl && !imageError ? (
        <img
          src={expense.imageUrl}
          alt={expense.location}
          onError={() => setImageError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

      ) : (
        <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-white/20" />
        </div>
      )}



      {/* Overlay Gradient */}
      <div className="absolute inset-0 story-card-gradient opacity-60" />

      {/* Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium px-2 py-1 bg-white/20 backdrop-blur-md rounded-full">
            {expense.category}
          </span>
          <span className="text-xs opacity-80">
            {format(new Date(expense.createdAt), 'dd/MM')}
          </span>
        </div>

        <h3 className="text-lg font-bold leading-tight line-clamp-1">
          {expense.location || 'Unknown Place'}
        </h3>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xl font-extrabold text-primary">
            {formatCurrency(expense.amount)}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Smile className="w-4 h-4 text-purple-400" />
          <span className="text-xs">{expense.mood}</span>
        </div>
      </div>
    </motion.div>
  );
}
