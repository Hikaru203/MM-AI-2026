import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Expense, Wallet } from '../types';

interface AppState {
  expenses: Expense[];
  wallets: Wallet[];
  isLoading: boolean;
  monthlyGoal: number;
  privacyMode: boolean;
  darkMode: boolean;
  addExpense: (expense: Expense) => void;
  setExpenses: (expenses: Expense[]) => void;
  setWallets: (wallets: Wallet[]) => void;
  clearExpenses: () => void;
  updateWalletBalance: (walletId: string, amount: number) => void;
  updateWallet: (walletId: string, updates: Partial<Wallet>) => void;
  setMonthlyGoal: (goal: number) => void;
  setPrivacyMode: (val: boolean) => void;
  setDarkMode: (val: boolean) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      expenses: [],
      wallets: [],

      isLoading: false,
      monthlyGoal: 0,
      privacyMode: false,
      darkMode: true,

      addExpense: (expense) => set((state) => ({ 
        expenses: [expense, ...state.expenses] 
      })),

      setExpenses: (expenses) => set({ expenses }),

      setWallets: (wallets) => set({ wallets }),

      setLoading: (loading) => set({ isLoading: loading }),

      clearExpenses: () => set({ 
        expenses: [],
        monthlyGoal: 0,
        wallets: []
      }),

      updateWalletBalance: (walletId, amount) => set((state) => ({
        wallets: state.wallets.map((w) => 
          w.id === walletId ? { ...w, balance: w.balance - amount } : w
        )
      })),

      updateWallet: (walletId, updates) => set((state) => ({
        wallets: state.wallets.map((w) => 
          w.id === walletId ? { ...w, ...updates } : w
        )
      })),

      setMonthlyGoal: (goal) => set({ monthlyGoal: goal }),

      setPrivacyMode: (val) => set({ privacyMode: val }),

      setDarkMode: (val) => set({ darkMode: val }),

      updateExpense: (id, updates) => set((state) => ({
        expenses: state.expenses.map((e) => 
          String(e.id) === String(id) ? { ...e, ...updates } : e
        )
      })),
    }),
    {
      name: 'money-memory-storage-v2', // New name to avoid collision with old data
    }
  )
);
