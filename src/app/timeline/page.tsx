'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { MemoryCard } from '@/components/expense/MemoryCard';
import { useAppStore } from '@/store/useAppStore';
import { ChevronLeft, Search, ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function TimelinePage() {
  const { expenses } = useAppStore();

  return (
    <main className="min-h-screen pb-32 bg-background text-foreground">
      <div className="p-6 pt-12 max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white/5 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold">Ký ức</h1>
          </div>
          <button className="p-2 bg-white/5 rounded-full">
            <Search className="w-5 h-5 text-gray-400" />
          </button>
        </header>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-30">
            <ImageIcon className="w-16 h-16 mb-4" />
            <p className="text-sm">Chưa có ký ức chi tiêu nào.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-4">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">Dòng thời gian</h2>
              <div className="grid grid-cols-2 gap-4">
                {expenses.map((expense) => (
                  <MemoryCard key={expense.id} expense={expense as any} onClick={() => {}} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Navbar />
    </main>
  );
}
