'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Send, Sparkles, User, Bot, ChevronLeft, Cloud } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatPage() {
  const { data: session } = useSession();
  const { expenses, darkMode } = useAppStore();

  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Chào ${session?.user?.name?.split(' ').pop() || 'bạn'}! Mình là MoneyMemory AI. Hôm nay bạn muốn hỏi gì về chi tiêu của mình nào?` },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const syncChat = async () => {
    if (messages.length <= 1) return;
    setIsSyncing(true);
    try {
      await fetch('/api/sync-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, chatId: Date.now() })
      });
      alert('Đã đồng bộ cuộc trò chuyện lên Google Drive! ✅');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Đồng bộ thất bại. Vui lòng thử lại.');
    } finally {
      setIsSyncing(false);
    }
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          expenses: expenses,
        }),
      });
      
      const data = await res.json();
      
      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="h-screen bg-background text-foreground flex flex-col overflow-hidden transition-colors duration-300">
      <header className="p-4 pt-12 flex items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-md z-10">

        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white/5 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              MoneyMemory AI
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </h1>
            <p className="text-xs text-green-500">Đang trực tuyến</p>
          </div>
        </div>

        <button 
          onClick={syncChat}
          disabled={isSyncing || messages.length <= 1}
          className={`p-3 rounded-xl transition-all ${isSyncing ? 'bg-primary/20 animate-pulse' : 'bg-white/5 active:scale-95'}`}
        >
          {isSyncing ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Cloud className="w-5 h-5 text-primary" />
          )}
        </button>
      </header>


      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-10">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-primary' : 'bg-white/10'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : `glass rounded-tl-none ${darkMode ? 'text-gray-200' : 'text-foreground font-medium'}`
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                ) : (
                  <div className={`prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-primary prose-strong:font-black ${darkMode ? 'prose-invert' : ''}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                )}
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass p-4 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 pb-32 bg-gradient-to-t from-background via-background/80 to-transparent">
        <div className="max-w-md mx-auto glass rounded-2xl p-2 flex items-center gap-2 border border-glass-border">

          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi AI về thói quen chi tiêu..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-foreground"

          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 bg-primary rounded-xl text-white active:scale-95 transition-transform disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Navbar />
    </main>
  );
}
