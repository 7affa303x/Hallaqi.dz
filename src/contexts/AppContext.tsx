import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  ThemeName, AnimationStyle, TabName, AppSettings, AppNotification,
  Booking, Barber, Chat, ForumPost, ScreenName, ScreenParams
} from '@/types';
import { themes } from '@/data/themes';
import {
  mockBarbers, mockBookings, mockChats, mockForumPosts,
  mockNotifications, mockCurrentUser
} from '@/data/mockData';

/* ------------------------------------------------------------------ */
/*  Screen history entry                                               */
/* ------------------------------------------------------------------ */
interface HistoryEntry {
  screen: ScreenName;
  params?: ScreenParams;
}

/* ------------------------------------------------------------------ */
/*  App State                                                          */
/* ------------------------------------------------------------------ */
interface AppState {
  /* Navigation */
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
  prevTab: TabName | null;

  /* Stack navigation */
  screen: ScreenName;
  screenParams: ScreenParams | undefined;
  navigate: (screen: ScreenName, params?: ScreenParams) => void;
  goBack: () => void;

  /* Theme */
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themeConfig: typeof themes[ThemeName];

  /* Animation */
  animationStyle: AnimationStyle;
  setAnimationStyle: (style: AnimationStyle) => void;

  /* Data */
  barbers: Barber[];
  bookings: Booking[];
  chats: Chat[];
  forumPosts: ForumPost[];
  notifications: AppNotification[];
  currentUser: typeof mockCurrentUser;

  /* Actions */
  toggleFollow: (barberId: string) => void;
  toggleLike: (postId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
  sendMessage: (chatId: string, message: string) => void;
  getBarberById: (id: string) => Barber | undefined;
  getPostById: (id: string) => ForumPost | undefined;

  /* UI State */
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  unreadCount: number;

  /* Settings */
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */
export function AppProvider({ children }: { children: ReactNode }) {
  /* ---- Tab navigation ---- */
  const [activeTab, setActiveTabState] = useState<TabName>('booking');
  const [prevTab, setPrevTab] = useState<TabName | null>(null);

  const setActiveTab = useCallback((tab: TabName) => {
    setPrevTab(activeTab);
    setActiveTabState(tab);
    setScreen('home');
    setScreenParams(undefined);
  }, [activeTab]);

  /* ---- Stack navigation ---- */
  const [screen, setScreen] = useState<ScreenName>('home');
  const [screenParams, setScreenParams] = useState<ScreenParams | undefined>(undefined);
  const [, setHistory] = useState<HistoryEntry[]>([{ screen: 'home' }]);

  const navigate = useCallback((nextScreen: ScreenName, params?: ScreenParams) => {
    setScreen(nextScreen);
    setScreenParams(params);
    setHistory(prev => [...prev, { screen: nextScreen, params }]);
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      const last = next[next.length - 1];
      setScreen(last.screen);
      setScreenParams(last.params);
      return next;
    });
  }, []);

  /* ---- Theme ---- */
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('hallaqi');
  const [animationStyle, setAnimationStyle] = useState<AnimationStyle>('modern');

  const setTheme = useCallback((theme: ThemeName) => {
    setCurrentTheme(theme);
  }, []);

  /* ---- Data ---- */
  const [barbers, setBarbers] = useState<Barber[]>(mockBarbers);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(mockForumPosts);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [currentUser] = useState(mockCurrentUser);

  /* ---- UI State ---- */
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  /* ---- Settings ---- */
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'modern',
    animationStyle: 'modern',
    language: 'ar',
    notifications: {
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      bookingReminders: true,
      promotions: true,
      forumReplies: true,
      competitionUpdates: true,
      newFollowers: true,
    },
    privacy: {
      profileVisible: true,
      showLocation: true,
      showBookings: false,
      allowMessages: 'all',
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
    },
  });

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  /* ---- Actions ---- */
  const toggleFollow = useCallback((barberId: string) => {
    setBarbers(prev => prev.map(b =>
      b.id === barberId
        ? { ...b, isFollowing: !b.isFollowing, followers: b.isFollowing ? b.followers - 1 : b.followers + 1 }
        : b
    ));
  }, []);

  const toggleLike = useCallback((postId: string) => {
    setForumPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const addBooking = useCallback((booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b));
  }, []);

  const sendMessage = useCallback((chatId: string, content: string) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        const newMessage = {
          id: `m-${Date.now()}`,
          senderId: 'me',
          content,
          timestamp: timeStr,
          type: 'text' as const,
          isRead: false,
        };
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: content,
          lastMessageTime: timeStr,
        };
      }
      return c;
    }));
  }, []);

  const getBarberById = useCallback((id: string) => {
    return barbers.find(b => b.id === id);
  }, [barbers]);

  const getPostById = useCallback((id: string) => {
    return forumPosts.find(p => p.id === id);
  }, [forumPosts]);

  const themeConfig = themes[currentTheme];

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        prevTab,
        screen,
        screenParams,
        navigate,
        goBack,
        currentTheme,
        setTheme,
        themeConfig,
        animationStyle,
        setAnimationStyle,
        barbers,
        bookings,
        chats,
        forumPosts,
        notifications,
        currentUser,
        toggleFollow,
        toggleLike,
        markNotificationRead,
        markAllNotificationsRead,
        addBooking,
        cancelBooking,
        sendMessage,
        getBarberById,
        getPostById,
        isSearchOpen,
        setIsSearchOpen,
        showNotifications,
        setShowNotifications,
        unreadCount,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
