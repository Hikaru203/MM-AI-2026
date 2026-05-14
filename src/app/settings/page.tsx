'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { ChevronLeft, Bell, Shield, HelpCircle, Trash2, CreditCard, Moon, Sun, RefreshCw } from 'lucide-react';


import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency } from '@/lib/utils';

export default function SettingsPage() {
  const { monthlyGoal, setMonthlyGoal, clearExpenses, privacyMode, setPrivacyMode, darkMode, setDarkMode, updateExpense } = useAppStore();



  const handleEditGoal = () => {
    const newGoal = prompt('Nhập mục tiêu chi tiêu tháng này (VND):', monthlyGoal.toString());
    if (newGoal !== null) {
      setMonthlyGoal(parseInt(newGoal) || 0);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('MoneyMemory AI', {
          body: 'Thông báo đã được kích hoạt thành công! 🚀',
          icon: '/favicon.ico'
        });
      }
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-32 transition-colors duration-300">

      <div className="p-6 pt-12 max-w-md mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/profile" className="p-2 bg-white/5 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Cài đặt ứng dụng</h1>
        </header>

        <section className="space-y-6">
          {/* Budget Setting */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 mb-4">Quản lý ngân sách</h3>
            <button
              onClick={handleEditGoal}
              className="w-full flex items-center justify-between p-4 glass-card border-none bg-white/5 active:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Ngân sách tháng này</p>
                  <p className="text-xs text-gray-500">{formatCurrency(monthlyGoal)}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-primary">Thay đổi</span>
            </button>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 mb-4">Trải nghiệm ứng dụng</h3>
            <div className="space-y-3">
              <ToggleItem
                icon={darkMode ? Moon : Sun}
                label={darkMode ? "Chế độ tối" : "Chế độ tối"}
                checked={darkMode}
                onChange={(val) => setDarkMode(val)}
              />
              <ToggleItem
                icon={Bell}
                label="Thông báo trình duyệt"
                onChange={handleNotificationToggle}
              />
              <ToggleItem
                icon={Shield}
                label="Chế độ riêng tư (Ẩn số dư)"
                checked={privacyMode}
                onChange={(val) => setPrivacyMode(val)}
              />
            </div>
          </div>

          {/* Data Recovery Section */}

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 mb-4">Dữ liệu & Khôi phục</h3>
            <button
              onClick={async (e) => {
                const btn = e.currentTarget;
                const originalContent = btn.innerHTML;
                btn.innerHTML = '<div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center animate-spin"><div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div></div><span class="font-bold text-sm">Đang quét Drive...</span>';
                btn.disabled = true;

                try {
                  const res = await fetch('/api/recover-images');
                  const { mapping, foundFiles } = await res.json();
                  const { expenses, updateExpense } = useAppStore.getState();
                  
                  let count = 0;
                  let debugInfo: string[] = [];
                  
                  Object.entries(mapping).forEach(([key, data]: [string, any]) => {
                    if (key.startsWith('meta|')) {
                      // Metadata match: meta|amount|location
                      const [_, amount, location] = key.split('|');
                      const localMatch = expenses.find(e => 
                        String(e.amount) === amount && 
                        (e.location?.trim() === location || e.location === location)
                      );
                      
                      if (localMatch) {
                        updateExpense(localMatch.id, { imageUrl: data.url });
                        count++;
                      } else {
                        debugInfo.push(`Found on Drive: ${amount}đ at "${location}" - But it doesn't match any of your local expenses.`);
                      }
                    } else {
                      // Direct ID match
                      const localMatch = expenses.find(e => String(e.id) === key);
                      if (localMatch) {
                        updateExpense(key, { imageUrl: data.url });
                        count++;
                      }
                    }
                  });
                  
                  if (count > 0) {
                    alert(`Đã quét ${foundFiles} tệp trên Drive và khôi phục thành công ${count} hình ảnh! 🎉`);
                  } else {
                    const message = [`Đã quét ${foundFiles} tệp nhưng không tìm thấy khoản chi nào khớp hoàn toàn.`, ...debugInfo].join('\n\n');
                    alert(message);
                  }


                } catch (err) {
                  alert('Không thể khôi phục ảnh. Vui lòng thử lại sau.');
                } finally {
                  btn.innerHTML = originalContent;
                  btn.disabled = false;
                }
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-sm">Tìm lại ảnh bị mất</span>
                <span className="block text-xs text-gray-400">Quét Drive để khôi phục các ảnh chưa hiện</span>
              </div>
            </button>
          </div>

          {/* Danger Zone */}

          <div>
            <h3 className="text-xs font-bold text-red-500/50 uppercase tracking-widest px-2 mb-4">Vùng nguy hiểm</h3>
            <button
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Dữ liệu sẽ được ẩn đi nhưng vẫn lưu trên hệ thống.')) {
                  fetch('/api/user/clear-data', { method: 'POST' })
                    .then(() => {
                      clearExpenses();
                      alert('Đã ẩn toàn bộ dữ liệu!');
                      window.location.reload();
                    })
                    .catch(() => alert('Có lỗi xảy ra khi xóa dữ liệu.'));
                }
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">Xóa toàn bộ dữ liệu ứng dụng</span>
            </button>
          </div>
        </section>
      </div>
      <Navbar />
    </main>
  );
}

function ToggleItem({
  icon: Icon,
  label,
  checked = false,
  onChange
}: {
  icon: any,
  label: string,
  checked?: boolean,
  onChange?: (val: boolean) => void
}) {
  const handleToggle = () => {
    if (onChange) onChange(!checked);
  };

  return (
    <div className="w-full flex items-center justify-between p-4 glass-card border-none bg-white/5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <span className="font-medium text-sm">{label}</span>
      </div>
      <button
        onClick={handleToggle}
        className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-primary' : 'bg-gray-400/30'}`}
      >
        <div className={`w-4 h-4 bg-white shadow-sm rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />

      </button>
    </div>
  );
}


