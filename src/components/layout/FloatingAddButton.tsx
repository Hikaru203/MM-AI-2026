'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-purple-600/40 text-white"
    >
      <Plus className="w-8 h-8" />
    </motion.button>
  );
}
