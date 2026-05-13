'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, Sparkles, Plus, Settings } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { FloatingAddButton } from '@/components/layout/FloatingAddButton';
import { MemoryCard } from '@/components/expense/MemoryCard';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency } from '@/lib/utils';

import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();
  const { expenses, wallets, addExpense, clearExpenses, monthlyGoal, setMonthlyGoal, updateWallet, privacyMode, updateExpense } = useAppStore();


  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditGoal = () => {
    const newGoal = prompt('Nhập mục tiêu chi tiêu tháng này (VND):', monthlyGoal.toString());
    if (newGoal !== null) {
      setMonthlyGoal(parseInt(newGoal) || 0);
    }
  };

  const handleEditWallet = (id: string, currentBalance: number, name: string) => {
    const newBalance = prompt(`Nhập số dư mới cho ví ${name} (VND):`, currentBalance.toString());
    if (newBalance !== null) {
      updateWallet(id, { balance: parseInt(newBalance) || 0 });
    }
  };

  const [pendingExpense, setPendingExpense] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isAutoSyncing, setIsAutoSyncing] = useState(false);

  React.useEffect(() => {
    const autoSync = async () => {
      // Check if already synced this session
      const hasSynced = sessionStorage.getItem('mm_auto_synced');
      if (hasSynced || !session?.accessToken) return;

      setIsAutoSyncing(true);
      try {
        const res = await fetch('/api/recover-images');
        const { mapping } = await res.json();
        
        const currentExpenses = useAppStore.getState().expenses;
        
        Object.entries(mapping).forEach(([key, data]: [string, any]) => {
          if (key.startsWith('meta|')) {
            const [_, amount, location] = key.split('|');
            const localMatch = currentExpenses.find(e => 
              String(e.amount) === amount && 
              (e.location?.trim() === location || e.location === location) &&
              !e.imageUrl?.startsWith('/') // Don't overwrite if already proxied or has local base64
            );
            if (localMatch) {
              updateExpense(localMatch.id, { imageUrl: data.url });
            }
          } else {
            updateExpense(key, { imageUrl: data.url });
          }
        });
        
        sessionStorage.setItem('mm_auto_synced', 'true');
      } catch (err) {
        console.error('Auto-sync failed:', err);
      } finally {
        setIsAutoSyncing(false);
      }
    };

    autoSync();
  }, [session, updateExpense]);

  const getGreeting = () => {

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Chào buổi sáng';
    if (hour >= 12 && hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const handleConfirm = async () => {
    if (pendingExpense) {
      const finalAmount = isNaN(pendingExpense.amount) ? 0 : pendingExpense.amount;
      const expenseToSave = {
        ...pendingExpense,
        amount: finalAmount,
        imageUrl: previewUrl || pendingExpense.imageUrl
      };

      // 1. Save to local store immediately
      addExpense(expenseToSave);

      // 2. Sync to Google Drive with final data and image
      const formData = new FormData();
      formData.append('expense', JSON.stringify(expenseToSave));
      if (selectedFile) {
        formData.append('image', selectedFile);
      }


      // Close modal and reset state
      setShowConfirmModal(false);

      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          body: formData,
        });
        
        if (res.status === 401) {
          alert('Phiên làm việc với Google đã hết hạn. Khoản chi đã được lưu tạm trên máy, hãy đăng xuất và đăng nhập lại để đồng bộ lên Drive nhé! ⚠️');
          return;
        }

        const data = await res.json();
        
        if (data.imageFileId) {
          // Update with a persistent Proxy link
          const driveProxyUrl = `/api/drive-image?id=${data.imageFileId}`;
          updateExpense(expenseToSave.id, { imageUrl: driveProxyUrl });
        }


      } catch (error) {
        console.error('Final Sync Error:', error);
      }



      setPendingExpense(null);
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  };



  const displayExpenses = expenses;


  return (
    <main className="min-h-screen pb-32 bg-background text-foreground transition-colors duration-300">
      <AnimatePresence>
        {isAutoSyncing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6"
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold mt-8 text-center animate-pulse">
              Đang đồng bộ ký ức...
            </h2>
            <p className="text-gray-500 text-sm mt-2 text-center">
              Vui lòng đợi giây lát để chúng tôi lấy lại hình ảnh từ Drive của bạn
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 pt-12 max-w-md mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{getGreeting()},</p>
            <h1 className="text-3xl font-bold">{session?.user?.name || 'Bạn'} 👋</h1>
          </div>

          <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden">
            <img src={session?.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Dung"} alt="Avatar" />
          </div>
        </header>


        {/* Total Spending Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24 text-primary" />
          </div>
          <div className="relative z-10">
            <span className="text-gray-400 text-sm font-medium">Chi tiêu tháng này</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-black text-gradient">
                {privacyMode ? '********' : formatCurrency(expenses.reduce((acc, curr) => acc + curr.amount, 0))}
              </h2>
            </div>
            <div className="flex gap-4 mt-6">
              <div
                onClick={handleEditGoal}
                className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer active:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Mục tiêu</p>
                  <Settings className="w-3 h-3 text-gray-500" />
                </div>
                <p className="font-bold text-sm">{privacyMode ? '***' : formatCurrency(monthlyGoal)}</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Còn lại</p>
                <p className="font-bold text-sm text-green-400">
                  {privacyMode ? '***' : formatCurrency(Math.max(0, monthlyGoal - expenses.reduce((acc, curr) => acc + curr.amount, 0)))}
                </p>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Wallets */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Ví của tôi</h3>
            <p className="text-[10px] text-gray-500 italic">Chạm để chỉnh số dư</p>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                onClick={() => handleEditWallet(wallet.id, wallet.balance, wallet.name)}
                className="min-w-[140px] p-4 glass-card border-none bg-white/5 cursor-pointer active:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-gray-400">{wallet.name}</p>
                <p className="font-bold">{privacyMode ? '***' : `${formatCurrency(wallet.balance).split(',')[0]}k`}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Memories */}

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-bold">Ký ức chi tiêu</h3>
            </div>
            <button className="text-primary text-sm font-medium">Tất cả</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {displayExpenses.map((expense) => (
              <MemoryCard
                key={expense.id}
                expense={expense as any}
                onClick={() => { }}
              />
            ))}
          </div>
        </section>
      </div >

      <Navbar />
      <FloatingAddButton onClick={() => setShowAddModal(true)} />

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-end justify-center p-0"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-card w-full max-w-md p-8 pt-10 rounded-t-[3rem] text-center bg-background border-t border-glass-border"

              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
                  />
                ) : (
                  <Plus className="w-10 h-10 text-primary" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {isLoading ? 'Đang phân tích...' : 'Ghi chú mới'}
              </h2>
              <p className="text-gray-400 mb-8">
                {isLoading ? 'AI đang đọc hóa đơn và cảm xúc của bạn.' : 'Chụp ảnh hóa đơn hoặc chọn ảnh từ thư viện để AI tự động nhận diện.'}
              </p>

              <div className="space-y-4">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      const url = URL.createObjectURL(file);
                      setPreviewUrl(url);

                      // Create a small thumbnail for local persistence (Base64)
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const MAX_WIDTH = 400;
                          const scale = MAX_WIDTH / img.width;
                          canvas.width = MAX_WIDTH;
                          canvas.height = img.height * scale;
                          const ctx = canvas.getContext('2d');
                          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                          const base64Thumbnail = canvas.toDataURL('image/jpeg', 0.7);
                          
                          setPendingExpense(prev => prev ? {
                            ...prev,
                            imageUrl: base64Thumbnail
                          } : null);
                        };
                        img.src = e.target?.result as string;
                      };
                      reader.readAsDataURL(file);

                      setIsLoading(true);


                      const formData = new FormData();
                      formData.append('image', file);

                      try {
                        const res = await fetch('/api/ocr', {
                          method: 'POST',
                          body: formData,
                        });
                        const data = await res.json();
                        if (data.id) {
                          setPendingExpense(data);
                          setShowAddModal(false);
                          setShowConfirmModal(true);
                        }
                      } catch (error) {
                        console.error('OCR Error:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }
                  }}
                />
                <button
                  onClick={() => document.getElementById('imageUpload')?.click()}
                  className="w-full py-5 bg-primary rounded-2xl font-bold shadow-xl shadow-purple-600/20 active:scale-95 transition-transform"
                >
                  Chọn ảnh ngay
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl font-bold active:scale-95 transition-transform text-gray-400"
                >
                  Bỏ qua
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && pendingExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-sm p-6 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48 -mx-6 -mt-6 mb-6">
                {previewUrl && (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="absolute bottom-4 left-6">
                  <span className="px-3 py-1 bg-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {pendingExpense.category}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Số tiền (VND)</label>
                  <input
                    type="number"
                    value={isNaN(pendingExpense.amount) ? '' : pendingExpense.amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPendingExpense({
                        ...pendingExpense,
                        amount: val === '' ? NaN : parseInt(val)
                      });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-bold text-xl outline-none focus:border-primary transition-colors"
                  />


                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Địa điểm</label>
                  <input
                    type="text"
                    value={pendingExpense.location}
                    onChange={(e) => setPendingExpense({ ...pendingExpense, location: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-medium outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Caption / AI Story</label>
                  <textarea
                    value={pendingExpense.caption}
                    onChange={(e) => setPendingExpense({ ...pendingExpense, caption: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary transition-colors h-20 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => { setShowConfirmModal(false); setPreviewUrl(null); }}
                  className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-[2] py-4 bg-primary rounded-2xl font-bold shadow-lg shadow-purple-600/20"
                >
                  Xác nhận lưu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main >
  );
}
