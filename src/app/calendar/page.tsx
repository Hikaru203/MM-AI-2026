'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Image as ImageIcon } from 'lucide-react';

import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

export default function CalendarPage() {
  const { expenses } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate real spending data for heatmap
  const spendingData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(exp => {
      const dateKey = format(parseISO(exp.createdAt), 'yyyy-MM-dd');
      data[dateKey] = (data[dateKey] || 0) + exp.amount;
    });
    return data;
  }, [expenses]);

  const totalMonthly = useMemo(() => {
    return expenses
      .filter(exp => {
        const expDate = parseISO(exp.createdAt);
        return expDate.getMonth() === currentDate.getMonth() &&
          expDate.getFullYear() === currentDate.getFullYear();
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses, currentDate]);

  const getHeatColor = (amount: number) => {
    if (!amount) return 'bg-white/5';
    if (amount > 1000000) return 'bg-purple-600';
    if (amount > 500000) return 'bg-purple-500';
    if (amount > 200000) return 'bg-purple-400';
    return 'bg-purple-300';
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-32 transition-colors duration-300">

      <div className="p-6 pt-12 max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white/5 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold">Lịch chi tiêu</h1>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white/10 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold px-2">{format(currentDate, 'MM/yyyy')}</span>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white/10 rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Summary Card */}
        <div className="glass-card p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tổng cộng tháng này</p>
            <p className="text-2xl font-black">{formatCurrency(totalMonthly)}</p>
          </div>
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-gray-500 py-2">
              {day}
            </div>
          ))}
          {days.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const amount = spendingData[dateStr] || 0;

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.005 }}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center relative overflow-hidden transition-colors border-2",
                  getHeatColor(amount),
                  isToday(day) ? "border-primary shadow-[0_0_10px_rgba(139,92,246,0.3)]" : "border-transparent"
                )}
              >
                <span className={cn(
                  "text-xs font-bold relative z-10",
                  amount > 0 || isToday(day) ? "text-white" : "text-gray-600"
                )}>
                  {format(day, 'd')}
                </span>
                {amount > 0 && (
                  <div className="absolute bottom-1.5 w-1 h-1 bg-white rounded-full" />
                )}
                {isToday(day) && (
                  <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                )}

              </motion.div>
            );
          })}
        </div>

        {/* Day Details */}
        <section>
          <h3 className="text-lg font-bold mb-4">
            Hoạt động {isToday(currentDate) ? 'hôm nay' : format(currentDate, 'dd/MM')}
          </h3>
          <div className="space-y-4">
            {expenses.filter(exp => {
              const expDate = parseISO(exp.createdAt);
              return expDate.getDate() === currentDate.getDate() &&
                expDate.getMonth() === currentDate.getMonth() &&
                expDate.getFullYear() === currentDate.getFullYear();
            }).length === 0 ? (
              <div className="flex items-center gap-3 p-4 glass-card border-none bg-white/5 opacity-50">
                <Info className="w-5 h-5" />
                <p className="text-sm">Không có chi tiêu nào trong ngày này.</p>
              </div>
            ) : (
              expenses
                .filter(exp => {
                  const expDate = parseISO(exp.createdAt);
                  return expDate.getDate() === currentDate.getDate() &&
                    expDate.getMonth() === currentDate.getMonth() &&
                    expDate.getFullYear() === currentDate.getFullYear();
                })
                .map(exp => (
                  <div key={exp.id} className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
                      {exp.imageUrl ? (
                        <img src={exp.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-white/20" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-sm line-clamp-1">{exp.location}</h4>
                      <p className="text-xs text-gray-400">{format(parseISO(exp.createdAt), 'HH:mm')} • {exp.category}</p>
                    </div>
                    <p className="font-bold text-sm">-{formatCurrency(exp.amount)}</p>
                  </div>
                ))
            )}
          </div>
        </section>
      </div>
      <Navbar />
    </main>
  );
}
