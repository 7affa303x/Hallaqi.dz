import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { forumCategories, mockCompetitions, mockForumPosts } from '@/data/mockData';
import type { ForumCategory } from '@/types';
import {
  MessageCircle, Trophy, Eye, Shield, BadgeCheck, Pin,
  Megaphone, Heart, MessageSquare, Share2, Bookmark,
  Filter, TrendingUp, Users, Award
} from 'lucide-react';

const roleIcons: Record<string, typeof Shield> = { admin: Shield, expert: Award, barber: BadgeCheck, user: Users };
const roleColors: Record<string, string> = { admin: '#EF4444', expert: '#8B5CF6', barber: '#3B82F6', user: '#6B7280' };
const roleLabels: Record<string, string> = { admin: 'إدارة', expert: 'خبير', barber: 'حلاق', user: 'مستخدم' };

export default function ForumTab() {
  const { forumPosts, themeConfig, navigate } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | 'all'>('all');

  const filteredPosts = selectedCategory === 'all'
    ? forumPosts
    : forumPosts.filter(p => p.category === selectedCategory);
  const pinnedPosts = filteredPosts.filter(p => p.isPinned);
  const regularPosts = filteredPosts.filter(p => !p.isPinned);

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-3 pb-3 backdrop-blur-lg" style={{ backgroundColor: `${themeConfig.colors.background}ee` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src="/logo-symbol.png" alt="Hallaqi" className="w-8 h-8 rounded-lg" />
            <div>
              <h1 className="text-lg font-bold leading-tight" style={{ color: themeConfig.colors.text }}>المنتدى</h1>
              <p className="text-[10px]" style={{ color: themeConfig.colors.textMuted }}>نقاشات، نصائح، ومسابقات</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ backgroundColor: themeConfig.colors.surface, borderColor: themeConfig.colors.border, color: themeConfig.colors.textMuted }}>
              <TrendingUp size={16} />
            </button>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ backgroundColor: themeConfig.colors.surface, borderColor: themeConfig.colors.border, color: themeConfig.colors.textMuted }}>
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setSelectedCategory('all')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
            style={{ backgroundColor: selectedCategory === 'all' ? themeConfig.colors.primary : themeConfig.colors.surface, color: selectedCategory === 'all' ? '#fff' : themeConfig.colors.textMuted, border: `1.5px solid ${selectedCategory === 'all' ? themeConfig.colors.primary : themeConfig.colors.border}` }}
          >الكل</button>
          {forumCategories.map(cat => (
            <button key={cat.key} onClick={() => setSelectedCategory(cat.key as ForumCategory)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
              style={{ backgroundColor: selectedCategory === cat.key ? cat.color + '15' : themeConfig.colors.surface, color: selectedCategory === cat.key ? cat.color : themeConfig.colors.textMuted, border: `1.5px solid ${selectedCategory === cat.key ? cat.color : themeConfig.colors.border}` }}
            >{cat.label}</button>
          ))}
        </div>
      </div>

      {/* Competitions Banner */}
      <div className="px-4 mt-2 mb-3">
        <div className="p-3 rounded-2xl border" style={{ backgroundColor: themeConfig.colors.primary + '05', borderColor: themeConfig.colors.primary + '15', borderStyle: 'dashed' }}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} style={{ color: themeConfig.colors.primary }} />
            <span className="text-xs font-bold" style={{ color: themeConfig.colors.primary }}>مسابقات نشطة</span>
          </div>
          <div className="space-y-2">
            {mockCompetitions.map(comp => (
              <div key={comp.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ backgroundColor: themeConfig.colors.surface }}>
                <div>
                  <p className="text-[11px] font-bold" style={{ color: themeConfig.colors.text }}>{comp.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: themeConfig.colors.textMuted }}>{comp.participants.length} مشارك &bull; {comp.prize}</p>
                </div>
                <div className="flex -space-x-2">
                  {comp.participants.slice(0, 3).map((p, i) => (
                    <img key={p.userId} src={p.userAvatar} alt={p.userName} className="w-7 h-7 rounded-full border-2 object-cover" style={{ borderColor: themeConfig.colors.surface, marginLeft: i > 0 ? '-8px' : '0' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="px-4 mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Pin size={12} style={{ color: themeConfig.colors.primary }} />
            <span className="text-xs font-bold" style={{ color: themeConfig.colors.primary }}>منشورات مثبتة</span>
          </div>
          {pinnedPosts.map(post => (
            <ForumPostCard key={post.id} post={post} isPinned navigate={navigate} themeConfig={themeConfig} />
          ))}
        </div>
      )}

      {/* Regular Posts */}
      <div className="px-4 space-y-3">
        <div className="flex items-center gap-1.5 mb-2">
          <MessageCircle size={12} style={{ color: themeConfig.colors.textMuted }} />
          <span className="text-xs font-bold" style={{ color: themeConfig.colors.textMuted }}>أحدث المنشورات</span>
        </div>
        {regularPosts.map(post => (
          <ForumPostCard key={post.id} post={post} navigate={navigate} themeConfig={themeConfig} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <MessageCircle size={48} style={{ color: themeConfig.colors.textMuted + '40' }} />
          <p className="mt-4 text-sm font-medium" style={{ color: themeConfig.colors.textMuted }}>لا توجد منشورات في هذا القسم</p>
        </div>
      )}
    </div>
  );
}

// ====== Forum Post Card ======
interface PostCardProps {
  post: typeof mockForumPosts[0];
  isPinned?: boolean;
  navigate: any;
  themeConfig: any;
}

function ForumPostCard({ post, isPinned = false, navigate, themeConfig }: PostCardProps) {
  const { toggleLike } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const RoleIcon = roleIcons[post.authorRole] || Users;
  const rColor = roleColors[post.authorRole] || '#6B7280';
  const catInfo = forumCategories.find(c => c.key === post.category);

  // Find if post author is a barber and link to their profile
  const isBarberAuthor = post.authorRole === 'barber';
  const nav = navigate;

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all"
      style={{ backgroundColor: themeConfig.colors.surface, borderColor: isPinned ? themeConfig.colors.primary + '30' : themeConfig.colors.border }}
    >
      {/* Author */}
      <div className="p-3 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => isBarberAuthor && nav('barber-detail', { barberId: post.authorId })}
              className="relative"
              style={{ cursor: isBarberAuthor ? 'pointer' : 'default' }}
            >
              <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-xl object-cover" />
              {post.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: themeConfig.colors.surface }}>
                  <BadgeCheck size={14} className="text-sky-500" />
                </div>
              )}
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => isBarberAuthor && nav('barber-detail', { barberId: post.authorId })}
                  className="text-xs font-bold"
                  style={{ color: themeConfig.colors.text, cursor: isBarberAuthor ? 'pointer' : 'default' }}
                >
                  {post.authorName}
                </button>
                <RoleIcon size={12} style={{ color: rColor }} />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: rColor + '10', color: rColor }}>
                  {roleLabels[post.authorRole]}
                </span>
                {catInfo && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: catInfo.color + '10', color: catInfo.color }}>
                    {catInfo.label}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isPinned && <Pin size={12} style={{ color: themeConfig.colors.primary }} />}
            {post.isAnnouncement && <Megaphone size={12} style={{ color: themeConfig.colors.warning }} />}
            <span className="text-[10px]" style={{ color: themeConfig.colors.textMuted }}>{post.createdAt.split('T')[0]}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-2">
        <h3 className="text-sm font-bold mb-1 cursor-pointer" style={{ color: themeConfig.colors.text }}
          onClick={() => nav('post-detail', { postId: post.id })}>
          {post.title}
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: themeConfig.colors.textMuted }}>
          {isExpanded ? post.content : post.content.slice(0, 150) + (post.content.length > 150 ? '...' : '')}
        </p>
        {post.content.length > 150 && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-[11px] font-medium mt-1" style={{ color: themeConfig.colors.primary }}>
            {isExpanded ? 'عرض أقل' : 'قراءة المزيد'}
          </button>
        )}
        <div className="flex gap-1 mt-2 flex-wrap">
          {post.tags.map((tag: string) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md" style={{ backgroundColor: themeConfig.colors.textMuted + '15', color: themeConfig.colors.textMuted }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-3 py-2.5 border-t" style={{ borderColor: themeConfig.colors.border + '60' }}>
        <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1 transition-all">
          <Heart size={16} className={post.isLiked ? 'fill-red-500 text-red-500' : ''} style={{ color: post.isLiked ? '#EF4444' : themeConfig.colors.textMuted }} />
          <span className="text-[11px] font-medium" style={{ color: post.isLiked ? '#EF4444' : themeConfig.colors.textMuted }}>{post.likes}</span>
        </button>
        <button onClick={() => nav('post-detail', { postId: post.id })} className="flex items-center gap-1">
          <MessageSquare size={16} style={{ color: themeConfig.colors.textMuted }} />
          <span className="text-[11px] font-medium" style={{ color: themeConfig.colors.textMuted }}>{post.comments.length}</span>
        </button>
        <div className="flex items-center gap-1">
          <Eye size={16} style={{ color: themeConfig.colors.textMuted }} />
          <span className="text-[11px] font-medium" style={{ color: themeConfig.colors.textMuted }}>{post.views}</span>
        </div>
        <button><Bookmark size={16} style={{ color: themeConfig.colors.textMuted }} /></button>
        <button><Share2 size={16} style={{ color: themeConfig.colors.textMuted }} /></button>
      </div>
    </div>
  );
}
