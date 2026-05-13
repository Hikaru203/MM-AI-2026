'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { ChevronLeft, PieChart as ChartIcon, TrendingUp, DollarSign, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency } from '@/lib/utils';

export default function StatsPage() {
  const { expenses } = useAppStore();

  const stats = useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Category Breakdown
    const categories: Record<string, number> = {};
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });

    const categoryData = Object.entries(categories)
      .map(([name, amount]) => ({ name, amount, percent: (amount / total) * 100 }))
      .sort((a, b) => b.amount - a.amount);

    // Location Breakdown
    const locations: Record<string, number> = {};
    expenses.forEach(exp => {
      locations[exp.location] = (locations[exp.location] || 0) + 1;
    });

    const locationData = Object.entries(locations)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { total, categoryData, locationData };
  }, [expenses]);

  return (
    <main className="min-h-screen bg-background text-foreground pb-32 transition-colors duration-300">

      <div className="p-6 pt-12 max-w-md mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/profile" className="p-2 bg-white/5 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Thống kê chi tiết</h1>
        </header>

        {/* Total Card */}
        <div className="glass-card p-6 mb-8 bg-gradient-to-br from-primary/20 to-background border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Tổng chi tiêu</span>
          </div>
          <h2 className="text-4xl font-black text-foreground">{formatCurrency(stats.total)}</h2>
          <p className="text-xs text-gray-400 mt-2">Dựa trên {expenses.length} ký ức đã lưu</p>
        </div>


        {/* Category Breakdown */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <ChartIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold">Theo danh mục</h3>
          </div>
          
          <div className="space-y-6">
            {stats.categoryData.length === 0 ? (
              <p className="text-center text-gray-500 py-10 italic">Chưa có dữ liệu chi tiêu</p>
            ) : (
              stats.categoryData.map((cat, i) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-300">{cat.name}</span>
                    <span className="font-bold">{formatCurrency(cat.amount)} ({cat.percent.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percent}%` }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Location Insights */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-bold">Địa điểm quen thuộc</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {stats.locationData.length === 0 ? (
              <p className="text-center text-gray-500 py-10 italic">Chưa có địa điểm nào</p>
            ) : (
              stats.locationData.map((loc, i) => (
                <motion.div 
                  key={loc.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-500">{i + 1}</span>
                    </div>
                    <span className="font-medium text-sm">{loc.name}</span>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {loc.count} lần
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
      <Navbar />
    </main>
  );
}
