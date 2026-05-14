'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { User, Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight, PieChart, Camera, LogIn } from 'lucide-react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';


export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { expenses, clearExpenses } = useAppStore();

  // Calculate real stats
  const totalMemories = expenses.length;
  const uniqueDays = new Set(expenses.map(e => e.createdAt.split('T')[0])).size;

  return (
    <main className="min-h-screen bg-background text-foreground pb-32 transition-colors duration-300">

      <div className="p-6 pt-12 max-w-md mx-auto">
        <header className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-primary p-1">
              <img
                src={session?.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Dung"}
                alt="Profile"
                className="w-full h-full rounded-full bg-white/10"
              />
            </div>
            {session && (
              <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full shadow-lg">
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold">{session?.user?.name || 'Khách'}</h1>
          <p className="text-gray-400 text-sm">{session?.user?.email || 'Chưa đăng nhập'}</p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Chuỗi ngày</p>
            <p className="text-xl font-black">{session ? `${uniqueDays} Ngày` : '--'}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Ký ức</p>
            <p className="text-xl font-black">{session ? totalMemories : '--'}</p>
          </div>
        </div>


        {/* Menu Items */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Tài khoản & Bảo mật</h3>

          <Link href="/stats">
            <MenuItem icon={PieChart} label="Thống kê chi tiết" />
          </Link>

          <Link href="/settings">
            <MenuItem icon={Settings} label="Cài đặt ứng dụng" />
          </Link>

          <div className="pt-4 space-y-4">

            <button
              onClick={async (e) => {
                if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu chi tiêu trên máy này? Dữ liệu sẽ được ẩn đi nhưng vẫn lưu trên Drive.')) {
                  const btn = e.currentTarget;
                  const originalContent = btn.innerHTML;
                  btn.disabled = true;
                  btn.innerHTML = '<span>Đang xóa...</span>';
                  
                  try {
                    await fetch('/api/user/clear-data', { method: 'POST' });
                    clearExpenses();
                    alert('Đã ẩn dữ liệu thành công!');
                    window.location.reload();
                  } catch (err) {
                    alert('Có lỗi xảy ra.');
                    btn.disabled = false;
                    btn.innerHTML = originalContent;
                  }
                }
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 text-gray-400 font-bold border border-white/10 active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-4">
                <Settings className="w-5 h-5" />
                <span>Xóa toàn bộ dữ liệu</span>
              </div>
            </button>

            {session ? (

              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold border border-red-500/20 active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-4">
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-purple-600/20 active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-4">
                  <LogIn className="w-5 h-5" />
                  <span>Đăng nhập với Google</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>
            )}
          </div>
        </section>
      </div>
      <Navbar />
    </main>
  );
}


function MenuItem({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 glass-card border-none bg-white/5 active:bg-white/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-600" />
    </button>
  );
}
