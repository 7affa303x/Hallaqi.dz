import { lazy, Suspense } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import BookingTab from '@/tabs/BookingTab';
import AppointmentsTab from '@/tabs/AppointmentsTab';
import CameraTab from '@/tabs/CameraTab';
import ForumTab from '@/tabs/ForumTab';
import ProfileTab from '@/tabs/ProfileTab';
import './App.css';

const BarberDetailPage = lazy(() => import('@/pages/BarberDetailPage'));
const BookingFlowPage = lazy(() => import('@/pages/BookingFlowPage'));
const ChatRoomPage = lazy(() => import('@/pages/ChatRoomPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));
const ComingSoonPage = lazy(() => import('@/components/ComingSoon'));

function TabContent({ tab }: { tab: string }) {
  switch (tab) {
    case 'booking': return <BookingTab />;
    case 'appointments': return <AppointmentsTab />;
    case 'camera': return <CameraTab />;
    case 'forum': return <ForumTab />;
    case 'profile': return <ProfileTab />;
    default: return <BookingTab />;
  }
}

function ScreenRouter() {
  const { screen, screenParams, activeTab } = useApp();

  switch (screen) {
    case 'barber-detail':
      return <Suspense fallback={<LoadingFallback />}><BarberDetailPage /></Suspense>;
    case 'booking-flow':
      return <Suspense fallback={<LoadingFallback />}><BookingFlowPage /></Suspense>;
    case 'chat-room':
      return <Suspense fallback={<LoadingFallback />}><ChatRoomPage /></Suspense>;
    case 'notifications':
      return <Suspense fallback={<LoadingFallback />}><NotificationsPage /></Suspense>;
    case 'post-detail':
      return <Suspense fallback={<LoadingFallback />}><PostDetailPage /></Suspense>;
    default: {
      const params = screenParams as any;
      if (params?.title) {
        return <Suspense fallback={<LoadingFallback />}><ComingSoonPage title={params.title} description={params.description} eta={params.eta} /></Suspense>;
      }
      return <TabContent tab={activeTab} />;
    }
  }
}

function LoadingFallback() {
  const { themeConfig } = useApp();
  return (
    <div className="h-screen flex items-center justify-center" style={{ backgroundColor: themeConfig.colors.background }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: themeConfig.colors.primary, borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: themeConfig.colors.textMuted }}>جاري التحميل...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { themeConfig, animationStyle, screen } = useApp();
  const showNav = screen === 'home';

  const cssVars = {
    '--primary': themeConfig.colors.primary,
    '--secondary': themeConfig.colors.secondary,
    '--accent': themeConfig.colors.accent,
    '--background': themeConfig.colors.background,
    '--surface': themeConfig.colors.surface,
    '--text': themeConfig.colors.text,
    '--text-muted': themeConfig.colors.textMuted,
    '--border': themeConfig.colors.border,
    '--success': themeConfig.colors.success,
    '--warning': themeConfig.colors.warning,
    '--error': themeConfig.colors.error,
    '--info': themeConfig.colors.info,
    '--radius': themeConfig.borderRadius,
    '--font-family': themeConfig.fontFamily,
    ...(themeConfig.colors.gradient ? { '--gradient': themeConfig.colors.gradient } : {}),
  } as React.CSSProperties;

  return (
    <div className={`min-h-screen anim-${animationStyle}`} style={{ ...cssVars, backgroundColor: themeConfig.colors.background, color: themeConfig.colors.text, fontFamily: themeConfig.fontFamily, transition: 'background-color 0.5s ease, color 0.5s ease' }}>
      <main className={`max-w-lg mx-auto min-h-screen ${showNav ? 'pb-16' : ''}`}>
        <ScreenRouter />
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
