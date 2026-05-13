import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Expense, Wallet } from '../types';

interface AppState {
  expenses: Expense[];
  wallets: Wallet[];
  isLoading: boolean;

  privacyMode: boolean;
  darkMode: boolean;
  addExpense: (expense: Expense) => void;
  setExpenses: (expenses: Expense[]) => void;
  clearExpenses: () => void;
  updateWalletBalance: (walletId: string, amount: number) => void;
  updateWallet: (walletId: string, updates: Partial<Wallet>) => void;
  setMonthlyGoal: (goal: number) => void;
  setPrivacyMode: (val: boolean) => void;
  setDarkMode: (val: boolean) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;





}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      expenses: [],
      wallets: [
        { id: '1', name: 'Tiền mặt', balance: 0, type: 'Cash' },
        { id: '2', name: 'Momo', balance: 0, type: 'Digital' },
        { id: '3', name: 'Techcombank', balance: 0, type: 'Bank' },
      ],

      isLoading: false,
      monthlyGoal: 0,
      privacyMode: false,
      darkMode: true,


      addExpense: (expense) => set((state) => ({ 
        expenses: [expense, ...state.expenses] 
      })),


      setExpenses: (expenses) => set({ expenses }),

      clearExpenses: () => set({ 
        expenses: [],
        monthlyGoal: 0,
        wallets: [
          { id: '1', name: 'Tiền mặt', balance: 0, type: 'Cash' },
          { id: '2', name: 'Momo', balance: 0, type: 'Digital' },
          { id: '3', name: 'Techcombank', balance: 0, type: 'Bank' },
        ]
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
      name: 'money-memory-storage',
    }
  )
);
