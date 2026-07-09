import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Clock, ArrowLeft, Bell } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
  eta?: string;
}

export default function ComingSoon({ title, description, eta }: ComingSoonProps) {
  const { themeConfig, goBack } = useApp();
  const [notify, setNotify] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: themeConfig.colors.background }}>
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 backdrop-blur-lg border-b"
        style={{ backgroundColor: `${themeConfig.colors.background}ee`, borderColor: themeConfig.colors.border }}>
        <button onClick={goBack} className="w-10 h-10 rounded-xl flex items-center justify-center">
          <ArrowLeft size={22} style={{ color: themeConfig.colors.text }} />
        </button>
        <h1 className="text-base font-bold" style={{ color: themeConfig.colors.text }}>{title}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
          style={{ backgroundColor: themeConfig.colors.primary + '10' }}>
          <Clock size={40} style={{ color: themeConfig.colors.primary }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: themeConfig.colors.text }}>قريباً</h2>
        <p className="text-sm max-w-xs" style={{ color: themeConfig.colors.textMuted }}>
          {description || 'هذه الميزة قيد التطوير وستتوفر في تحديث قادم'}
        </p>
        {eta && (
          <div className="mt-3 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: themeConfig.colors.accent + '15', color: themeConfig.colors.accent }}>
            متوقع: {eta}
          </div>
        )}

        {/* Notify Me */}
        <button
          onClick={() => setNotify(!notify)}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{
            backgroundColor: notify ? themeConfig.colors.success + '15' : themeConfig.colors.primary,
            color: notify ? themeConfig.colors.success : '#fff',
          }}
        >
          <Bell size={16} />
          {notify ? 'تم تفعيل التنبيه' : 'نبهني عند الإطلاق'}
        </button>

        {/* TODO Badge */}
        <div className="mt-4 px-3 py-1 rounded-lg text-[10px] font-mono"
          style={{ backgroundColor: themeConfig.colors.textMuted + '10', color: themeConfig.colors.textMuted }}>
          TODO: Backend integration required
        </div>
      </div>
    </div>
  );
}
