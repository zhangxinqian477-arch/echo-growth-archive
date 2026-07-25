/** 成长卡片按当日心情的表面色 */
export function getMoodSurface(mood?: string) {
  if (mood && (mood.includes('焦虑') || mood.includes('压力'))) {
    return {
      card: 'bg-rose-50',
      border: 'border-rose-100',
      title: 'text-rose-900',
      muted: 'text-rose-600',
      chip: 'bg-white/80 text-rose-700',
      panel: 'bg-white/55',
      accent: 'text-rose-700',
    };
  }
  if (mood && (mood.includes('平静') || mood.includes('专注'))) {
    return {
      card: 'bg-sky-50',
      border: 'border-sky-100',
      title: 'text-sky-900',
      muted: 'text-sky-600',
      chip: 'bg-white/80 text-sky-700',
      panel: 'bg-white/55',
      accent: 'text-sky-700',
    };
  }
  if (mood && (mood.includes('疲惫') || mood.includes('一般'))) {
    return {
      card: 'bg-amber-50',
      border: 'border-amber-100',
      title: 'text-amber-900',
      muted: 'text-amber-700',
      chip: 'bg-white/80 text-amber-800',
      panel: 'bg-white/55',
      accent: 'text-amber-800',
    };
  }
  // 积极 / 开心 / 默认
  return {
    card: 'bg-emerald-50',
    border: 'border-emerald-100',
    title: 'text-emerald-900',
    muted: 'text-emerald-600',
    chip: 'bg-white/80 text-emerald-700',
    panel: 'bg-white/55',
    accent: 'text-emerald-700',
  };
}
