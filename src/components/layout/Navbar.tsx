'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Image as ImageIcon, Calendar, Wallet, User, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: ImageIcon, label: 'Timeline', href: '/timeline' },
  { icon: MessageCircle, label: 'AI Chat', href: '/chat' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 pointer-events-none">
      <nav className="glass max-w-md mx-auto rounded-2xl flex items-center justify-around p-2 pointer-events-auto shadow-2xl shadow-purple-500/10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="relative p-3 group">
              <Icon 
                className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-300"
                )} 
              />
              {isActive && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
