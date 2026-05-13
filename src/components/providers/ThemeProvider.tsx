'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode } = useAppStore();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!darkMode) {
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    }
  }, [darkMode, mounted]);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return <>{children}</>;
}

