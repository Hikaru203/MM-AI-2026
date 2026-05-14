"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function DataProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { setExpenses, setWallets, setLoading, clearExpenses, setMonthlyGoal } = useAppStore();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [expensesRes, walletsRes, settingsRes] = await Promise.all([
            fetch("/api/expenses"),
            fetch("/api/wallets"),
            fetch("/api/user/settings"),
          ]);

          if (expensesRes.ok && walletsRes.ok && settingsRes.ok) {
            const expenses = await expensesRes.json();
            const wallets = await walletsRes.json();
            const settings = await settingsRes.json();
            
            setExpenses(expenses);
            setWallets(wallets);
            if (settings?.monthlyGoal !== undefined) {
              setMonthlyGoal(settings.monthlyGoal);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else if (status === "unauthenticated") {
      clearExpenses();
    }
  }, [status, session, setExpenses, setWallets, setLoading, clearExpenses]);

  return <>{children}</>;
}
