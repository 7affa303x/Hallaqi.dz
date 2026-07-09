import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { barberTags, serviceCategories } from '@/data/mockData';
import type { BarberTag } from '@/types';
import {
  Search, SlidersHorizontal, MapPin, Star, Clock, Car,
  Scissors, BadgeCheck, Zap, TrendingUp, ChevronLeft, X,
  Filter, Navigation, Globe
} from 'lucide-react';

const tagIcons: Record<string, typeof Zap> = {
  active: Zap, 'old-school': Scissors, 'scissors-user': Scissors,
  mobile: Car, verified: BadgeCheck, trending: TrendingUp,
};

/** Open location in Google Maps (deep link or web fallback) */
function openInMaps(location: string, isMobile: boolean) {
  const query = encodeURIComponent(`${location}, Algeria`);
  if (isMobile) {
    // Mobile: try app first, fallback to web
    window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  } else {
    // Desktop: open in new tab
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }
}

export default function BookingTab() {
  const { barbers, themeConfig, toggleFollow, navigate } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<BarberTag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price' | 'newest'>('rating');

  const filteredBarbers = useMemo(() => {
    let filtered = [...barbers];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.wilaya.toLowerCase().includes(q) ||
        b.services.some(s => s.name.toLowerCase().includes(q))
      );
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter(b => selectedTags.some(tag => b.tags.includes(tag)));
    }
    if (selectedCategory) {
      filtered = filtered.filter(b => b.services.some(s => s.category === selectedCategory));
    }
    switch (sortBy) {
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'distance': filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)); break;
      case 'price':
        filtered.sort((a, b) => {
          const aMin = Math.min(...a.services.map(s => s.price));
          const bMin = Math.min(...b.services.map(s => s.price));
          return aMin - bMin;
        });
        break;
      case 'newest': filtered.sort((a, b) => (b.tags.includes('new') ? 1 : 0) - (a.tags.includes('new') ? 1 : 0)); break;
    }
    return filtered;
  }, [barbers, searchQuery, selectedTags, selectedCategory, sortBy]);

  const toggleTag = (tag: BarberTag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="pb-20">
      {/* === HEADER === */}
      <div className="sticky top-0 z-30 px-4 pt-3 pb-3 backdrop-blur-lg" style={{ backgroundColor: `${themeConfig.colors.background}ee` }}>
        {/* Logo Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src="/logo-symbol.png" alt="Hallaqi" className="w-8 h-8 rounded-lg" />
            <div>
              <h1 className="text-lg font-bold leading-tight" style={{ color: themeConfig.colors.text }}>HALLAQI</h1>
              <p className="text-[10px]" style={{ color: themeConfig.colors.textMuted }}>حلاقي</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Map Quick Action */}
            <button
              onClick={() => openInMaps('الجزائر العاصمة', false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border"
              style={{ backgroundColor: themeConfig.colors.surface, borderColor: themeConfig.colors.border, color: themeConfig.colors.text }}
              title="عرض الحلاقين على الخريطة"
            >
              <Navigation size={14} />
              <span className="hidden sm:inline">خريطة</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border"
              style={{
                backgroundColor: showFilters ? themeConfig.colors.primary : themeConfig.colors.surface,
                color: showFilters ? '#fff' : themeConfig.colors.text,
                borderColor: themeConfig.colors.border,
              }}
            >
              <SlidersHorizontal size={16} />
              <span>فلتر</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3" style={{ borderRadius: themeConfig.borderRadius }}>
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: themeConfig.colors.textMuted }} />
          <input
            type="text"
            placeholder="ابحث عن حلاق، خدمة، أو منطقة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-10 pl-10 text-sm outline-none transition-all"
            style={{
              backgroundColor: themeConfig.colors.surface,
              color: themeConfig.colors.text,
              borderRadius: themeConfig.borderRadius,
              border: `1.5px solid ${searchQuery ? themeConfig.colors.primary : themeConfig.colors.border}`,
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2">
              <X size={16} style={{ color: themeConfig.colors.textMuted }} />
            </button>
          )}
        </div>

        {/* Quick Tags */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {barberTags.slice(0, 6).map(tag => {
            const isSelected = selectedTags.includes(tag.key as BarberTag);
            const Icon = tagIcons[tag.key] || Zap;
            return (
              <button
                key={tag.key}
                onClick={() => toggleTag(tag.key as BarberTag)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: isSelected ? tag.color + '20' : themeConfig.colors.surface,
                  color: isSelected ? tag.color : themeConfig.colors.textMuted,
                  border: `1.5px solid ${isSelected ? tag.color : themeConfig.colors.border}`,
                }}
              >
                <Icon size={12} />
                {tag.label}
              </button>
            );
          })}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-3 p-3 rounded-xl border" style={{ backgroundColor: themeConfig.colors.surface, borderColor: themeConfig.colors.border }}>
            <div className="mb-3">
              <p className="text-xs font-medium mb-2" style={{ color: themeConfig.colors.textMuted }}>نوع الخدمة</p>
              <div className="flex gap-2 flex-wrap">
                {serviceCategories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: selectedCategory === cat.key ? themeConfig.colors.primary + '20' : themeConfig.colors.background,
                      color: selectedCategory === cat.key ? themeConfig.colors.primary : themeConfig.colors.textMuted,
                      border: `1px solid ${selectedCategory === cat.key ? themeConfig.colors.primary : themeConfig.colors.border}`,
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: themeConfig.colors.textMuted }}>الترتيب حسب</p>
              <div className="flex gap-2">
                {[
                  { key: 'rating' as const, label: 'التقييم', icon: Star },
                  { key: 'distance' as const, label: 'المسافة', icon: MapPin },
                  { key: 'price' as const, label: 'السعر', icon: Filter },
                  { key: 'newest' as const, label: 'الأحدث', icon: Clock },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: sortBy === opt.key ? themeConfig.colors.accent + '20' : themeConfig.colors.background,
                      color: sortBy === opt.key ? themeConfig.colors.accent : themeConfig.colors.textMuted,
                      border: `1px solid ${sortBy === opt.key ? themeConfig.colors.accent : themeConfig.colors.border}`,
                    }}
                  >
                    <opt.icon size={12} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === BARBERS LIST === */}
      <div className="px-4 space-y-3 mt-2">
        {filteredBarbers.map(barber => (
          <div
            key={barber.id}
            className="rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-md"
            style={{ backgroundColor: themeConfig.colors.surface, borderColor: themeConfig.colors.border }}
          >
            {/* Cover */}
            <div className="relative h-32 overflow-hidden">
              <img src={barber.coverImage} alt={barber.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-2 left-2 flex gap-1">
                {barber.isActive && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-green-500">
                    <Zap size={10} /> متصل
                  </span>
                )}
                {barber.isMobile && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-blue-500">
                    <Car size={10} /> متنقل
                  </span>
                )}
                {barber.isVerified && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-sky-500">
                    <BadgeCheck size={10} /> موثق
                  </span>
                )}
              </div>
              <div className="absolute bottom-2 right-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: themeConfig.colors.primary }}>
                  {barber.priceRange}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={barber.avatar} alt={barber.name}
                    className="w-12 h-12 rounded-xl object-cover border-2"
                    style={{ borderColor: themeConfig.colors.primary + '40' }}
                  />
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: themeConfig.colors.text }}>{barber.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium" style={{ color: themeConfig.colors.text }}>{barber.rating}</span>
                      <span className="text-[10px]" style={{ color: themeConfig.colors.textMuted }}>({barber.reviewCount})</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow(barber.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    backgroundColor: barber.isFollowing ? themeConfig.colors.primary + '15' : themeConfig.colors.primary,
                    color: barber.isFollowing ? themeConfig.colors.primary : '#fff',
                  }}
                >
                  {barber.isFollowing ? 'متابَع' : 'متابعة'}
                </button>
              </div>

              {/* Location + Map Link */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <MapPin size={12} style={{ color: themeConfig.colors.textMuted }} />
                  <span className="text-[11px]" style={{ color: themeConfig.colors.textMuted }}>{barber.location}, {barber.wilaya}</span>
                </div>
                <button
                  onClick={() => openInMaps(`${barber.location}, ${barber.wilaya}`, barber.isMobile)}
                  className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-all"
                  style={{ backgroundColor: themeConfig.colors.success + '15', color: themeConfig.colors.success }}
                >
                  <Navigation size={9} /> {barber.distance}
                </button>
              </div>

              {/* Tags */}
              <div className="flex gap-1 mt-2 flex-wrap">
                {barber.tags.map(tag => {
                  const tagInfo = barberTags.find(t => t.key === tag);
                  if (!tagInfo) return null;
                  return (
                    <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ backgroundColor: tagInfo.color + '15', color: tagInfo.color }}>
                      {tagInfo.label}
                    </span>
                  );
                })}
              </div>

              {/* Services */}
              <div className="mt-2 space-y-1">
                {barber.services.slice(0, 2).map(svc => (
                  <div key={svc.id} className="flex items-center justify-between py-1">
                    <span className="text-xs" style={{ color: themeConfig.colors.textMuted }}>{svc.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: themeConfig.colors.textMuted }}>
                        <Clock size={10} className="inline ml-0.5" />{svc.duration}د
                      </span>
                      <span className="text-xs font-bold" style={{ color: themeConfig.colors.primary }}>{svc.price} دج</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => navigate('booking-flow', { barberId: barber.id })}
                  className="flex-1 h-10 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: themeConfig.colors.primary }}
                >
                  احجز الآن
                </button>
                <button
                  onClick={() => openInMaps(`${barber.location}, ${barber.wilaya}`, barber.isMobile)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl border transition-all"
                  style={{ borderColor: themeConfig.colors.border, color: themeConfig.colors.success }}
                  title="فتح في الخريطة"
                >
                  <Globe size={18} />
                </button>
                <button
                  onClick={() => navigate('barber-detail', { barberId: barber.id })}
                  className="h-10 w-10 flex items-center justify-center rounded-xl border transition-all"
                  style={{ borderColor: themeConfig.colors.border, color: themeConfig.colors.textMuted }}
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBarbers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Search size={48} style={{ color: themeConfig.colors.textMuted + '40' }} />
          <p className="mt-4 text-sm font-medium" style={{ color: themeConfig.colors.textMuted }}>لا توجد نتائج مطابقة</p>
          <p className="mt-1 text-xs" style={{ color: themeConfig.colors.textMuted + '80' }}>جرب تغيير كلمات البحث أو الفلاتر</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedTags([]); setSelectedCategory(null); }}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold"
            style={{ backgroundColor: themeConfig.colors.primary, color: '#fff' }}
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}
    </div>
  );
}
