import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Phone, Info, Send, Image,
  Mic, Check, CheckCheck
} from 'lucide-react';

export default function ChatRoomPage() {
  const { themeConfig, screenParams, chats, sendMessage, goBack, navigate } = useApp();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = chats.find(c => c.id === screenParams?.chatId);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat?.messages.length]);

  // Simulate typing indicator
  useEffect(() => {
    if (!chat?.isOnline) return;
    const t = setTimeout(() => setIsTyping(false), 3000);
    return () => clearTimeout(t);
  }, [chat?.messages.length, chat?.isOnline]);

  if (!chat) {
    return (
      <div className="h-screen flex flex-col items-center justify-center" style={{ backgroundColor: themeConfig.colors.background }}>
        <img src="/logo-icon.png" alt="Hallaqi" className="w-16 h-16 mb-4 opacity-30" />
        <p style={{ color: themeConfig.colors.textMuted }}>الدردشة غير موجودة</p>
        <button onClick={goBack} className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: themeConfig.colors.primary }}>رجوع</button>
      </div>
    );
  }

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessage(chat.id, messageText.trim());
    setMessageText('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-screen flex flex-col" style={{ backgroundColor: themeConfig.colors.background }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b backdrop-blur-lg flex-shrink-0"
        style={{ backgroundColor: `${themeConfig.colors.surface}ee`, borderColor: themeConfig.colors.border }}>
        <button onClick={goBack} className="w-10 h-10 rounded-xl flex items-center justify-center">
          <ArrowLeft size={22} style={{ color: themeConfig.colors.text }} />
        </button>
        <button onClick={() => navigate('barber-detail', { barberId: chat.participantId })} className="relative">
          <img src={chat.participantAvatar} alt={chat.participantName} className="w-10 h-10 rounded-xl object-cover" />
          {chat.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2" style={{ borderColor: themeConfig.colors.surface }} />
          )}
        </button>
        <button onClick={() => navigate('barber-detail', { barberId: chat.participantId })} className="flex-1 min-w-0 text-right">
          <p className="text-sm font-bold truncate" style={{ color: themeConfig.colors.text }}>{chat.participantName}</p>
          <p className="text-[10px]" style={{ color: chat.isOnline ? '#22C55E' : themeConfig.colors.textMuted }}>
            {chat.isOnline ? (isTyping ? 'يكتب...' : 'متصل الآن') : 'آخر ظهور ' + chat.lastMessageTime}
          </p>
        </button>
        <div className="flex gap-1">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center"><Phone size={18} style={{ color: themeConfig.colors.textMuted }} /></button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center"><Info size={18} style={{ color: themeConfig.colors.textMuted }} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Date separator */}
        <div className="flex items-center justify-center">
          <span className="text-[10px] px-3 py-1 rounded-full" style={{ backgroundColor: themeConfig.colors.border, color: themeConfig.colors.textMuted }}>اليوم</span>
        </div>

        {chat.messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[75%] ${isMe ? 'order-1' : 'order-2'}`}>
                <div className="px-3.5 py-2.5 rounded-2xl"
                  style={{
                    backgroundColor: isMe ? themeConfig.colors.primary : themeConfig.colors.surface,
                    color: isMe ? '#fff' : themeConfig.colors.text,
                    borderBottomRightRadius: isMe ? '4px' : undefined,
                    borderBottomLeftRadius: !isMe ? '4px' : undefined,
                    border: !isMe ? `1px solid ${themeConfig.colors.border}` : undefined,
                  }}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                  <span className="text-[9px]" style={{ color: themeConfig.colors.textMuted }}>{msg.timestamp}</span>
                  {isMe && (msg.isRead ? <CheckCheck size={10} className="text-sky-500" /> : <Check size={10} style={{ color: themeConfig.colors.textMuted }} />)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && chat.isOnline && (
          <div className="flex justify-end">
            <div className="px-4 py-3 rounded-2xl border" style={{ backgroundColor: themeConfig.colors.surface, borderColor: themeConfig.colors.border, borderBottomLeftRadius: '4px' }}>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: themeConfig.colors.textMuted, animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: themeConfig.colors.textMuted, animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: themeConfig.colors.textMuted, animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 px-4 pb-1">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {['هل أنت متوفر غداً؟', 'ما هي أوقات العمل؟', 'شكراً!'].map(q => (
            <button key={q} onClick={() => { setMessageText(q); }}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap border flex-shrink-0"
              style={{ borderColor: themeConfig.colors.border, color: themeConfig.colors.textMuted, backgroundColor: themeConfig.colors.surface }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-3 border-t backdrop-blur-lg"
        style={{ backgroundColor: `${themeConfig.colors.surface}ee`, borderColor: themeConfig.colors.border }}>
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: themeConfig.colors.background }}>
            <Image size={18} style={{ color: themeConfig.colors.textMuted }} />
          </button>
          <div className="flex-1 relative">
            <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)}
              placeholder="اكتب رسالة..."
              className="w-full h-10 px-4 text-sm rounded-xl outline-none"
              style={{ backgroundColor: themeConfig.colors.background, color: themeConfig.colors.text }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
          </div>
          {messageText.trim() ? (
            <button onClick={handleSend} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: themeConfig.colors.primary }}>
              <Send size={18} className="text-white" />
            </button>
          ) : (
            <button className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: themeConfig.colors.background }}>
              <Mic size={18} style={{ color: themeConfig.colors.textMuted }} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
