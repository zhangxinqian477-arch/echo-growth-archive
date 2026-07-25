import { useState, useEffect } from 'react';
import { X, Sparkles, Sprout, BrainCircuit, Hash, Calendar, TrendingUp, Key, Camera, Download, Check, MessageCircle, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { getDaysInMonth, makeDateKey, startOfLocalDay } from '../utils/dateUtils';
import { getMoodSurface } from '../utils/moodStyles';

export default function GardenPage() {
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showGrowthCard, setShowGrowthCard] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<Array<{role: string, content: string}>>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate() - 1);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [archives, setArchives] = useState<Array<{date: string, keywords: string[], mood: string, records: {今日习得: string, 逻辑突破: string, 改进点: string}, messages?: Array<{role: string, content: string}>}>>([]);

  const isCurrentViewMonth = () => {
    const now = new Date();
    return viewYear === now.getFullYear() && viewMonth === now.getMonth();
  };

  const canGoNextMonth = () => {
    const now = new Date();
    if (viewYear < now.getFullYear()) return true;
    if (viewYear === now.getFullYear() && viewMonth < now.getMonth()) return true;
    return false;
  };

  const shiftMonth = (delta: number) => {
    const now = new Date();
    let newYear = viewYear;
    let newMonth = viewMonth + delta;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    // 不允许切换到未来月份
    if (newYear > now.getFullYear() || (newYear === now.getFullYear() && newMonth > now.getMonth())) {
      return;
    }
    setViewYear(newYear);
    setViewMonth(newMonth);
    const isNow = newYear === now.getFullYear() && newMonth === now.getMonth();
    setSelectedDate(isNow ? now.getDate() - 1 : 0);
    setShowGrowthCard(false);
  };

  const dateKeyForDay = (dayIndex: number) => makeDateKey(viewYear, viewMonth, dayIndex + 1);

  const isFutureDay = (dayIndex: number) => {
    const day = startOfLocalDay(new Date(viewYear, viewMonth, dayIndex + 1));
    const today = startOfLocalDay();
    return day.getTime() > today.getTime();
  };

  useEffect(() => {
    // 检查localStorage是否可用
    try {
      const testKey = 'test_localstorage';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      console.log('localStorage可用');
    } catch (error) {
      console.error('localStorage不可用:', error);
      toast.error('浏览器存储功能不可用，请检查设置');
      return;
    }
    
    // 定义加载数据的函数
    const loadData = () => {
      console.log('开始加载数据...');
      
      // 尝试多种方式获取数据
      let storedArchives = {};
      
      // 方法1：直接从localStorage获取
      try {
        const data = localStorage.getItem('echo_archives');
        if (data) {
          storedArchives = JSON.parse(data);
          console.log('方法1成功：从localStorage获取数据');
        }
      } catch (error) {
        console.error('方法1失败:', error);
      }
      
      // 方法2：如果方法1失败，尝试从备份获取
      if (Object.keys(storedArchives).length === 0) {
        try {
          const backupData = localStorage.getItem('echo_archives_backup');
          if (backupData) {
            storedArchives = JSON.parse(backupData);
            console.log('方法2成功：从备份获取数据');
            // 恢复到主存储
            localStorage.setItem('echo_archives', backupData);
          }
        } catch (error) {
          console.error('方法2失败:', error);
        }
      }
      
      // 方法3：如果前两种方法都失败，尝试遍历localStorage
      if (Object.keys(storedArchives).length === 0) {
        try {
          console.log('尝试方法3：遍历localStorage');
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('echo_archives')) {
              const data = localStorage.getItem(key);
              if (data) {
                storedArchives = JSON.parse(data);
                console.log(`方法3成功：从${key}获取数据`);
                break;
              }
            }
          }
        } catch (error) {
          console.error('方法3失败:', error);
        }
      }
      
      console.log('GardenPage初始化: 从localStorage读取的archives:', storedArchives);
      console.log('GardenPage初始化: archives键的数量:', Object.keys(storedArchives).length);
      
      // 确保每个archive都有必要的字段
      const validArchives = {};
      Object.keys(storedArchives).forEach(date => {
        const archive = storedArchives[date];
        if (archive && (archive.date || archive.mood || archive.keywords)) {
          validArchives[date] = archive;
        }
      });
      
      const archivesArray = Object.keys(validArchives).map(date => validArchives[date]);
      console.log('GardenPage初始化: 转换后的archivesArray:', archivesArray);
      console.log('GardenPage初始化: archivesArray长度:', archivesArray.length);
      setArchives(archivesArray);
      
      // 保存一份到localStorage作为备份
      try {
        localStorage.setItem('echo_archives_backup', JSON.stringify(validArchives));
      } catch (error) {
        console.error('保存备份失败:', error);
      }
    };
    
    // 立即加载数据
    loadData();
    
    // 延迟再次加载数据（解决某些浏览器加载时机问题）
    setTimeout(loadData, 500);
    setTimeout(loadData, 1000);
    setTimeout(loadData, 2000);
    
    // 监听storage事件，确保数据一旦变动，花园立刻重新计算
    const handleStorageChange = (event: StorageEvent) => {
      console.log('GardenPage: Storage事件触发，重新读取数据', event);
      loadData();
    };
    
    // 监听自定义事件作为备用方案
    const handleCustomEvent = (event: CustomEvent) => {
      console.log('GardenPage: 自定义事件触发', event);
      loadData();
    };
    
    // 监听页面可见性变化，当页面从隐藏变为可见时重新加载数据
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('页面变为可见，重新加载数据');
        // 延迟一点时间再加载，确保localStorage已经更新
        setTimeout(loadData, 100);
      }
    };
    
    // 监听焦点事件，当页面获得焦点时重新加载数据
    const handleFocus = () => {
      console.log('页面获得焦点，重新加载数据');
      loadData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('echo_archives_updated', handleCustomEvent);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // 定期检查数据一致性（每5秒）
    const interval = setInterval(() => {
      const currentArchives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
      const currentArray = Object.keys(currentArchives).map(date => currentArchives[date]);
      if (currentArray.length !== archives.length) {
        console.log('检测到数据不一致，重新加载');
        loadData();
      }
    }, 5000);
    
    // 添加触摸事件监听，解决移动端刷新问题
    const handleTouchStart = () => {
      console.log('触摸开始，检查数据');
      setTimeout(loadData, 100);
    };
    
    // 添加滚动事件监听，解决移动端滚动后数据丢失问题
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        console.log('滚动结束，检查数据');
        loadData();
      }, 500);
    };
    
    // 监听触摸和滚动事件
    document.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('scroll', handleScroll);
    
    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('echo_archives_updated', handleCustomEvent);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
      document.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  // 手动刷新数据的函数
  const refreshData = () => {
    console.log('GardenPage: 手动刷新数据');
    
    // 直接从localStorage读取数据
    const directArchives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
    const archivesArray = Object.keys(directArchives).map(date => directArchives[date]);
    setArchives(archivesArray);
    
    toast.success('数据已刷新');
  };

  const handleGenerateReport = () => {
    setShowWeeklyReport(true);
  };

  const handleSaveCard = () => {
    // 获取当前选中的日期
    const dateString = dateKeyForDay(selectedDate);
    
    // 从localStorage获取现有的归档数据
    const allArchives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
    
    // 检查是否已有该日期的数据
    if (allArchives[dateString]) {
      toast('该日期已有记录，无需重复保存');
      return;
    }
    
    // 如果growthContent不存在或为null，则不保存
    if (!growthContent) {
      toast('无有效内容可保存');
      return;
    }
    
    // 检查是否是默认内容（没有真实记录）
    if (growthContent.title === '这一天，你忙于奔跑，忘了给灵魂留下回声。' && 
        (!growthContent.keywords || growthContent.keywords.length === 0)) {
      toast('该日期无真实记录，无法保存');
      return;
    }
    
    // 创建新的归档数据
    const newArchive = {
      date: dateString,
      mood: growthContent.mood || '平静',
      keywords: growthContent.keywords || [],
      records: {
        今日习得: growthContent.summary?.[0] || '',
        逻辑突破: growthContent.summary?.[1] || '',
        改进点: growthContent.summary?.[2] || ''
      }
    };
    
    // 保存到localStorage
    allArchives[dateString] = newArchive;
    localStorage.setItem('echo_archives', JSON.stringify(allArchives));
    
    // 显示成功提示
    toast('卡片已保存');
    
    // 关闭卡片显示
    setShowGrowthCard(false);
    
    // 强制刷新页面以更新日历显示
    window.location.reload();
  };

  const handleSaveWeeklyReport = () => {
    // 周报保存逻辑 - 生成一个图片或下载功能
    toast('周报已保存到本地');
    setShowWeeklyReport(false);
  };

  const handlePixelClick = (dayIndex: number) => {
    setSelectedDate(dayIndex);
    
    // 直接检查日期状态，避免使用getArchiveForDay函数
    const isFuture = isFutureDay(dayIndex);
    
    // 从状态中查找归档数据
    const dateString = dateKeyForDay(dayIndex);
    const archive = archives.find(a => a.date === dateString);
    const hasArchive = !!archive;
    
    // 调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('handlePixelClick - 查找日期:', dateString);
      console.log('handlePixelClick - 所有archives:', archives);
      console.log('handlePixelClick - 找到的archive:', archive);
      console.log('handlePixelClick - 是否有archive:', hasArchive);
    }
    
    // 三态判定
    if (isFuture) {
      // 未来日期：不做任何操作
      return;
    } else if (hasArchive && archive) {
      // 过去有记录日期：显示卡片
      setShowGrowthCard(true);
    } else {
      // 过去无记录日期：显示空卡片
      setShowGrowthCard(true);
    }
  };

  const getArchiveForDay = (dayIndex: number) => {
    // 验证dayIndex是否有效
    if (dayIndex === null || dayIndex === undefined || isNaN(dayIndex)) {
      return {
        isFuture: false,
        hasArchive: false,
        archive: null
      };
    }
    
    const dateString = dateKeyForDay(dayIndex);
    const isFuture = isFutureDay(dayIndex);
    
    // 从状态中查找归档数据
    const archive = archives.find(a => a.date === dateString);
    
    return {
      isFuture,
      hasArchive: !!archive,
      archive
    };
  };

  const getGrowthCardContent = (dayIndex: number) => {
    const dateString = dateKeyForDay(dayIndex);
    const isFuture = isFutureDay(dayIndex);
    
    // 从状态中查找归档数据
    const archive = archives.find(a => a.date === dateString);
    const hasArchive = !!archive;
    
    // 调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('GardenPage - 查找日期:', dateString);
      console.log('GardenPage - 所有archives:', archives);
      console.log('GardenPage - 找到的archive:', archive);
      console.log('GardenPage - 是否有archive:', hasArchive);
    }
    
    // 三态判定
    if (isFuture) {
      // 未来日期：不显示内容
      return null;
    } else if (hasArchive && archive) {
      // 过去有记录日期：显示归档数据
      return {
        title: archive.mood,
        mood: archive.mood,
        keywords: archive.keywords,
        summary: [
          archive.records.今日习得,
          archive.records.逻辑突破,
          archive.records.改进点
        ],
        messages: archive.messages // 添加对话历史
      };
    } else {
      // 过去无记录日期：显示固定内容
      return {
        title: '这一天，你忙于奔跑，忘了给灵魂留下回声。',
        keywords: [], // 空关键词数组
        summary: [
          '还没有今天的记录',
          '点击对话页面开始记录',
          '让每一天都有成长痕迹'
        ]
      };
    }
  };

  // 获取心情对应的颜色类
  const getMoodColorClass = (mood?: string) => {
    if (!mood) return 'text-green-800';
    
    if (mood.includes('积极') || mood.includes('开心')) {
      return 'text-green-800';
    } else if (mood.includes('焦虑') || mood.includes('压力')) {
      return 'text-red-600';
    } else if (mood.includes('平静') || mood.includes('专注')) {
      return 'text-blue-600';
    } else if (mood.includes('疲惫') || mood.includes('一般')) {
      return 'text-yellow-600';
    }
    return 'text-green-800';
  };

  // 获取心情对应的文字颜色类
  const getMoodTextColorClass = (mood?: string) => {
    if (!mood) return 'text-green-700';
    
    if (mood.includes('积极') || mood.includes('开心')) {
      return 'text-green-700';
    } else if (mood.includes('焦虑') || mood.includes('压力')) {
      return 'text-red-700';
    } else if (mood.includes('平静') || mood.includes('专注')) {
      return 'text-blue-700';
    } else if (mood.includes('疲惫') || mood.includes('一般')) {
      return 'text-yellow-700';
    }
    return 'text-green-700';
  };

  // 获取心情对应的背景颜色类
  const getMoodBgColorClass = (mood?: string) => {
    if (!mood) return 'bg-green-50';
    
    if (mood.includes('积极') || mood.includes('开心')) {
      return 'bg-green-50';
    } else if (mood.includes('焦虑') || mood.includes('压力')) {
      return 'bg-red-50';
    } else if (mood.includes('平静') || mood.includes('专注')) {
      return 'bg-blue-50';
    } else if (mood.includes('疲惫') || mood.includes('一般')) {
      return 'bg-yellow-50';
    }
    return 'bg-green-50';
  };

  // 获取心情对应的按钮文字颜色类
  const getMoodButtonTextColorClass = (mood?: string) => {
    if (!mood) return 'text-green-700 hover:text-green-800';
    
    if (mood.includes('积极') || mood.includes('开心')) {
      return 'text-green-700 hover:text-green-800';
    } else if (mood.includes('焦虑') || mood.includes('压力')) {
      return 'text-red-700 hover:text-red-800';
    } else if (mood.includes('平静') || mood.includes('专注')) {
      return 'text-blue-700 hover:text-blue-800';
    } else if (mood.includes('疲惫') || mood.includes('一般')) {
      return 'text-yellow-700 hover:text-yellow-800';
    }
    return 'text-green-700 hover:text-green-800';
  };

  // 获取心情对应的按钮背景颜色类
  const getMoodButtonBgColorClass = (mood?: string) => {
    if (!mood) return 'bg-green-50 hover:bg-green-100';
    
    if (mood.includes('积极') || mood.includes('开心')) {
      return 'bg-green-50 hover:bg-green-100';
    } else if (mood.includes('焦虑') || mood.includes('压力')) {
      return 'bg-red-50 hover:bg-red-100';
    } else if (mood.includes('平静') || mood.includes('专注')) {
      return 'bg-blue-50 hover:bg-blue-100';
    } else if (mood.includes('疲惫') || mood.includes('一般')) {
      return 'bg-yellow-50 hover:bg-yellow-100';
    }
    return 'bg-green-50 hover:bg-green-100';
  };

  // 获取心情对应的边框颜色类
  const getMoodBorderColorClass = (mood?: string) => {
    if (!mood) return 'border-green-200';
    
    if (mood.includes('积极') || mood.includes('开心')) {
      return 'border-green-200';
    } else if (mood.includes('焦虑') || mood.includes('压力')) {
      return 'border-red-200';
    } else if (mood.includes('平静') || mood.includes('专注')) {
      return 'border-blue-200';
    } else if (mood.includes('疲惫') || mood.includes('一般')) {
      return 'border-yellow-200';
    }
    return 'border-green-200';
  };

  // 计算当前查看月份的统计数据
  const getMonthlyStats = () => {
    // 获取查看月份的所有日期
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const monthDates = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      monthDates.push(makeDateKey(viewYear, viewMonth, i));
    }
    
    // 从状态获取归档数据
    const allArchives = {};
    archives.forEach(archive => {
      allArchives[archive.date] = archive;
    });
    
    // 统计有记录的日期
    const recordedDates = monthDates.filter(date => allArchives[date]);
    const recordedDays = recordedDates.length;
    
    // 统计情绪分布
    const moodCounts = {
      '积极开心': 0,
      '焦虑压力': 0,
      '平静专注': 0,
      '疲惫一般': 0
    };
    
    // 统计关键词频率
    const keywordCounts = {};
    
    recordedDates.forEach(date => {
      const archive = allArchives[date];
      if (archive) {
        // 统计情绪
        if (archive.mood.includes('积极') || archive.mood.includes('开心')) {
          moodCounts['积极开心']++;
        } else if (archive.mood.includes('焦虑') || archive.mood.includes('压力')) {
          moodCounts['焦虑压力']++;
        } else if (archive.mood.includes('平静') || archive.mood.includes('专注')) {
          moodCounts['平静专注']++;
        } else if (archive.mood.includes('疲惫') || archive.mood.includes('一般')) {
          moodCounts['疲惫一般']++;
        }
        
        // 统计关键词
        if (archive.keywords && Array.isArray(archive.keywords)) {
          archive.keywords.forEach(keyword => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
          });
        }
      }
    });
    
    // 找出主导情绪
    let dominantMood = '平静专注';
    let maxCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood;
      }
    });
    
    // 获取前3个高频关键词
    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([keyword]) => keyword);
    
    // 情绪对应的icon
    const moodIcons = {
      '积极开心': <TrendingUp size={16} strokeWidth={1.5} className="text-green-600" />,
      '焦虑压力': <Sparkles size={16} strokeWidth={1.5} className="text-red-400" />,
      '平静专注': <BrainCircuit size={16} strokeWidth={1.5} className="text-blue-400" />,
      '疲惫一般': <Calendar size={16} strokeWidth={1.5} className="text-yellow-600" />
    };
    
    return {
      recordedDays,
      dominantMood,
      moodIcon: moodIcons[dominantMood],
      topKeywords
    };
  };

  const growthContent = getGrowthCardContent(selectedDate);
  const monthlyStats = getMonthlyStats();

  return (
    <div className="flex flex-col h-full bg-[#FBFDFB]">
      <header className="flex-shrink-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-green-100 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sprout size={24} strokeWidth={1.5} className="text-green-600" />
            <h1 className="text-xl font-semibold text-[#1A2E1A]">心灵花园</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={refreshData}
              className="p-2 rounded-full hover:bg-green-50 transition-colors"
              title="刷新数据"
            >
              <TrendingUp size={16} strokeWidth={1.5} className="text-green-600" />
            </button>
            <button 
              onClick={() => {
                // 强制从localStorage重新加载数据
                console.log('强制刷新数据');
                const forcedArchives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
                console.log('强制刷新 - 从localStorage读取的archives:', forcedArchives);
                const forcedArray = Object.keys(forcedArchives).map(date => forcedArchives[date]);
                console.log('强制刷新 - 转换后的archivesArray:', forcedArray);
                setArchives(forcedArray);
                toast.success('数据已强制刷新');
              }}
              className="px-3 py-2 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors font-medium"
              title="强制刷新数据"
            >
              刷新
            </button>
            <button className="px-5 py-2.5 bg-green-50 text-[#1A2E1A] rounded-3xl text-xs hover:bg-green-100 transition-colors font-medium">
              + 补卡
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-green-50">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="p-2 rounded-full hover:bg-green-50 transition-colors text-[#1A2E1A]"
              aria-label="上个月"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <h2 className="text-[#1A2E1A] font-semibold text-lg">
              {viewYear}年{viewMonth + 1}月心情走势
            </h2>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              disabled={!canGoNextMonth()}
              className={`p-2 rounded-full transition-colors ${canGoNextMonth() ? 'hover:bg-green-50 text-[#1A2E1A]' : 'text-slate-300 cursor-not-allowed'}`}
              aria-label="下个月"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#334155] mb-3">
            <span>日</span>
            <span>一</span>
            <span>二</span>
            <span>三</span>
            <span>四</span>
            <span>五</span>
            <span>六</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {/* 计算本月第一天是星期几（本地时区） */}
            {(() => {
              const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
              const firstDayWeek = firstDayOfMonth.getDay();
              const daysInMonth = getDaysInMonth(viewYear, viewMonth);
              
              // 创建空格子数组，用于填充月初的空白
              const emptyCells = Array(firstDayWeek).fill(null);
              
              // 创建日期格子数组，包含本月所有天数
              const dateCells = [...emptyCells, ...Array.from({length: daysInMonth}, (_, i) => i)];
              
              return dateCells.map((dayIndex, index) => {
                if (dayIndex === null) {
                  // 空白格子
                  return <div key={`empty-${index}`} style={{ aspectRatio: '1 / 1' }} />;
                }
                
                const dateString = dateKeyForDay(dayIndex);
                const isFuture = isFutureDay(dayIndex);
                
                // 从状态中查找归档数据
                const archive = archives.find(a => a.date === dateString);
                const hasArchive = !!archive;
                
                // 仅在开发模式下且为今天时输出调试信息
                if (process.env.NODE_ENV === 'development') {
                  const todayString = makeDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
                  if (dateString === todayString) {
                    console.log('日历格子 - 查找日期:', dateString);
                    console.log('日历格子 - 所有archives:', archives);
                    console.log('日历格子 - 所有archives的日期:', archives.map(a => a.date));
                    console.log('日历格子 - 是否有archive:', hasArchive);
                    if (archive) {
                      console.log('日历格子 - archive mood:', archive.mood);
                    }
                  }
                }
                
                let bgColor = 'bg-slate-100'; // 默认颜色
                let cursorClass = 'cursor-pointer';
                let pointerEvents = 'auto';
                
                // 三态判定
                if (isFuture) {
                  // 未来日期：灰色，不可点击
                  bgColor = 'bg-gray-200';
                  cursorClass = 'cursor-not-allowed';
                  pointerEvents = 'none';
                  // 添加额外的样式确保未来日期完全不可点击
                  return (
                    <div
                      key={`day-${dayIndex}`}
                      className={`rounded-sm ${cursorClass} ${bgColor} opacity-30`}
                      style={{ aspectRatio: '1 / 1', pointerEvents: pointerEvents as any }}
                    />
                  );
                } else if (hasArchive && archive) {
                  // 过去有记录日期：根据心情设置颜色
                  console.log('设置色块颜色 - mood:', archive.mood);
                  if (archive.mood.includes('积极') || archive.mood.includes('开心')) {
                    bgColor = 'bg-green-400 hover:bg-green-500';
                    console.log('设置绿色');
                  } else if (archive.mood.includes('焦虑') || archive.mood.includes('压力')) {
                    bgColor = 'bg-red-400 hover:bg-red-500';
                    console.log('设置红色');
                  } else if (archive.mood.includes('平静') || archive.mood.includes('专注')) {
                    bgColor = 'bg-blue-400 hover:bg-blue-500';
                    console.log('设置蓝色');
                  } else if (archive.mood.includes('疲惫') || archive.mood.includes('一般')) {
                    bgColor = 'bg-yellow-300 hover:bg-yellow-400';
                    console.log('设置黄色');
                  } else {
                    bgColor = 'bg-green-300 hover:bg-green-400';
                    console.log('设置默认绿色');
                  }
                } else {
                  // 过去无记录日期：浅灰色
                  bgColor = 'bg-slate-100 hover:bg-slate-200 hover:shadow-md';
                  console.log('设置灰色');
                }
                
                return (
                  <div
                    key={`day-${dayIndex}`}
                    onClick={() => !isFuture && handlePixelClick(dayIndex)}
                    className={`rounded-sm ${cursorClass} hover:scale-110 transition-all ${bgColor}`}
                    style={{ aspectRatio: '1 / 1', pointerEvents: pointerEvents as any }}
                  />
                );
              });
            })()}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-green-50">
          <h2 className="text-[#1A2E1A] font-semibold text-lg mb-5">
            {isCurrentViewMonth() ? '本月洞察' : `${viewMonth + 1}月洞察`}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Calendar size={20} strokeWidth={1.5} className="text-green-600" />
              <span className="text-[15px] leading-relaxed text-[#334155]">已持续记录：<span className="font-semibold text-[#1A2E1A]">{monthlyStats.recordedDays} 天</span></span>
            </div>
            <div className="flex items-center gap-4">
              <BarChart3 size={20} strokeWidth={1.5} className="text-green-600" />
              <span className="text-[15px] leading-relaxed text-[#334155]">主导情绪：<span className="font-semibold text-[#1A2E1A]">{monthlyStats.dominantMood}</span></span>
            </div>
            <div className="flex items-center gap-4">
              <Key size={20} strokeWidth={1.5} className="text-green-600" />
              <span className="text-[15px] leading-relaxed text-[#334155]">高频关键词：
                {monthlyStats.topKeywords.length > 0 ? (
                  monthlyStats.topKeywords.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-green-50 text-[#334155] rounded-full text-xs mr-2">#{keyword}</span>
                  ))
                ) : (
                  <span className="text-gray-500 text-xs">暂无记录</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleGenerateReport}
          className="w-full bg-green-600 text-white py-5 rounded-3xl font-semibold text-lg hover:bg-green-700 transition-colors shadow-soft"
        >
          📊 一键生成本周成长周报
        </button>
      </div>

      {showWeeklyReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative border border-green-200 bg-green-50/90 backdrop-blur-md rounded-3xl shadow-[0_20px_40px_-15px_rgba(22,163,74,0.15)] w-full max-w-[380px] max-h-[70vh] overflow-y-auto scrollbar-hide">
            <button 
              onClick={() => setShowWeeklyReport(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 hover:bg-white rounded-md flex items-center justify-center text-slate-500 transition-colors"
            >
              <X size={18} />
            </button>
            
            {/* 主信息区 */}
            <div className="px-6 pt-5 pb-6 space-y-5">
              {/* 标题区 */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-900">
                  Echo · 成长周报
                </h3>
                <p className="text-xs text-green-600 mt-1">
                  {(() => {
                    // 动态计算本周日期范围
                    const today = new Date();
                    
                    // 获取本周的第一天（周一）
                    const firstDayOfWeek = new Date(today);
                    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // 周日=7，其他=实际值
                    firstDayOfWeek.setDate(today.getDate() - dayOfWeek + 1);
                    
                    // 获取本周的最后一天（周日）
                    const lastDayOfWeek = new Date(firstDayOfWeek);
                    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                    
                    // 格式化日期
                    const formatDate = (date: Date) => {
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${month}.${day}`;
                    };
                    
                    return `${formatDate(firstDayOfWeek)} - ${formatDate(lastDayOfWeek)}`;
                  })()}
                </p>
              </div>
              
              {/* 组件 A：周心情走势图 */}
              <div className="flex justify-center gap-2">
                {(() => {
                  // 从localStorage获取本周的归档数据
                  const today = new Date();
                  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
                  const firstDayOfWeek = new Date(today);
                  firstDayOfWeek.setDate(today.getDate() - dayOfWeek + 1);
                  
                  const archives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
                  const weekData = [];
                  
                  // 遍历本周7天
                  for (let i = 0; i < 7; i++) {
                    // 每次创建新的Date对象，避免重复使用同一对象
                    const currentDate = new Date(firstDayOfWeek);
                    currentDate.setDate(firstDayOfWeek.getDate() + i);
                    const dateKey = currentDate.toISOString().split('T')[0];
                    
                    if (archives[dateKey]) {
                      weekData.push(archives[dateKey]);
                    } else {
                      weekData.push(null);
                    }
                  }
                  
                  // 根据数据生成色块
                  return weekData.map((data, index) => {
                    if (data) {
                      let bgColor = 'bg-green-200';
                      let icon = <TrendingUp size={12} strokeWidth={1.5} className="text-green-600" />;
                      
                      if (data.mood && (data.mood.includes('积极') || data.mood.includes('开心'))) {
                        bgColor = 'bg-green-600';
                        icon = <TrendingUp size={12} strokeWidth={1.5} className="text-white" />;
                      } else if (data.mood && (data.mood.includes('焦虑') || data.mood.includes('压力'))) {
                        bgColor = 'bg-red-300';
                        icon = <Sparkles size={12} strokeWidth={1.5} className="text-red-600" />;
                      } else if (data.mood && (data.mood.includes('平静') || data.mood.includes('专注'))) {
                        bgColor = 'bg-blue-300';
                        icon = <BrainCircuit size={12} strokeWidth={1.5} className="text-blue-600" />;
                      } else if (data.mood && (data.mood.includes('疲惫') || data.mood.includes('一般'))) {
                        bgColor = 'bg-yellow-200';
                        icon = <Calendar size={12} strokeWidth={1.5} className="text-yellow-600" />;
                      } else {
                        bgColor = 'bg-green-300';
                        icon = <Sprout size={12} strokeWidth={1.5} className="text-green-600" />;
                      }
                      
                      return (
                        <div key={index} className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
                          <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                            {icon}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={index} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-xs"> </span>
                          </div>
                        </div>
                      );
                    }
                  });
                })()}
              </div>
              
              {/* 组件 B：本周概览（横向排列模块） */}
              <div className="flex justify-center gap-4">
                <div className="bg-green-50/50 rounded-xl p-3 flex flex-col items-center gap-1">
                  <BrainCircuit size={16} strokeWidth={1.5} className="text-green-800" />
                  <span className="text-xs text-green-700 font-medium">深度思考</span>
                  <span className="text-lg font-semibold text-green-900">
                    {(() => {
                      // 从localStorage获取本周的归档数据
                      const today = new Date();
                      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
                      const firstDayOfWeek = new Date(today);
                      firstDayOfWeek.setDate(today.getDate() - dayOfWeek + 1);
                      
                      const archives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
                      let weekCount = 0;
                      
                      // 遍历本周7天
                      for (let i = 0; i < 7; i++) {
                        // 每次创建新的Date对象，避免重复使用同一对象
                        const currentDate = new Date(firstDayOfWeek);
                        currentDate.setDate(firstDayOfWeek.getDate() + i);
                        const dateKey = currentDate.toISOString().split('T')[0];
                        
                        if (archives[dateKey]) {
                          weekCount++;
                        }
                      }
                      
                      return weekCount;
                    })()}
                  </span>
                  <span className="text-xs text-green-600">次</span>
                </div>
                <div className="bg-green-50/50 rounded-xl p-3 flex flex-col items-center gap-1">
                  <Hash size={16} strokeWidth={1.5} className="text-green-800" />
                  <span className="text-xs text-green-700 font-medium">关键词</span>
                  <span className="text-lg font-semibold text-green-900">
                    {(() => {
                      // 从localStorage获取本周的归档数据
                      const today = new Date();
                      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
                      const firstDayOfWeek = new Date(today);
                      firstDayOfWeek.setDate(today.getDate() - dayOfWeek + 1);
                      
                      const archives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
                      const allKeywords = new Set();
                      
                      // 遍历本周7天
                      for (let i = 0; i < 7; i++) {
                        // 每次创建新的Date对象，避免重复使用同一对象
                        const currentDate = new Date(firstDayOfWeek);
                        currentDate.setDate(firstDayOfWeek.getDate() + i);
                        const dateKey = currentDate.toISOString().split('T')[0];
                        
                        if (archives[dateKey] && archives[dateKey].keywords) {
                          archives[dateKey].keywords.forEach((keyword: string) => allKeywords.add(keyword));
                        }
                      }
                      
                      return allKeywords.size;
                    })()}
                  </span>
                  <span className="text-xs text-green-600">个</span>
                </div>
              </div>
              
              {/* 组件 C：最具启发的一句回声 */}
              <div className="text-center">
                <p className="text-green-800 text-xs mb-2 font-medium">✨ 最具启发的一句回声：</p>
                <div className="text-sm text-green-900 font-bold italic bg-green-50 rounded-2xl p-4 mx-4 leading-relaxed">
                  {(() => {
                    // 从localStorage获取本周的归档数据
                    const today = new Date();
                    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
                    const firstDayOfWeek = new Date(today);
                    firstDayOfWeek.setDate(today.getDate() - dayOfWeek + 1);
                    
                    const archives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
                    let allRecords = [];
                    
                    // 遍历本周7天
                    for (let i = 0; i < 7; i++) {
                      // 每次创建新的Date对象，避免重复使用同一对象
                      const currentDate = new Date(firstDayOfWeek);
                      currentDate.setDate(firstDayOfWeek.getDate() + i);
                      const dateKey = currentDate.toISOString().split('T')[0];
                      
                      if (archives[dateKey] && archives[dateKey].records) {
                        // 添加今日习得、逻辑突破、改进点到数组
                        if (archives[dateKey].records.今日习得) {
                          allRecords.push(archives[dateKey].records.今日习得);
                        }
                        if (archives[dateKey].records.逻辑突破) {
                          allRecords.push(archives[dateKey].records.逻辑突破);
                        }
                        if (archives[dateKey].records.改进点) {
                          allRecords.push(archives[dateKey].records.改进点);
                        }
                      }
                    }
                    
                    // 如果有记录，返回第一个记录；否则返回默认值
                    if (allRecords.length > 0) {
                      return `"${allRecords[0]}"`;
                    } else {
                      return '"所有的不确定，都在实践中消解。"';
                    }
                  })()}
                </div>
              </div>
            </div>
            
            {/* 底部品牌区 */}
            <div className="border-t border-green-100 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-700 text-xs">
                <Sprout size={24} strokeWidth={1.5} className="text-green-600" />
                <span>Echo · 见证成长</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGrowthCard && growthContent && (() => {
        const mood = getMoodSurface(growthContent?.mood);
        return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`border ${mood.border} ${mood.card} backdrop-blur-md rounded-3xl shadow-[0_20px_40px_-15px_rgba(15,23,42,0.12)] max-w-[380px] mx-4 max-h-[80vh] overflow-hidden scrollbar-hide`}>
            <div className="flex justify-end items-center p-4">
              <button 
                onClick={() => setShowGrowthCard(false)}
                className="w-8 h-8 bg-white/70 hover:bg-white rounded-lg flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="px-6 pb-6 space-y-5">
              {/* 标题与日期 */}
              <div className="text-center">
                <h3 className={`text-base font-semibold ${mood.title} text-center`}>
                  今日成长回声
                </h3>
                <p className={`text-xs ${mood.muted} mt-1.5`}>
                  {(() => {
                    const dateString = dateKeyForDay(selectedDate);
                    const [year, month, day] = dateString.split('-');
                    return `${year}年${month}月${day}日`;
                  })()}
                </p>
              </div>
              
              {/* 情绪标签 */}
              <div className="flex justify-center gap-2">
                {growthContent?.keywords && growthContent.keywords.length === 0 ? (
                  <>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${mood.chip}`}>
                      <Hash size={14} strokeWidth={1.5} />
                      未记录
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${mood.chip}`}>
                      <Sparkles size={14} strokeWidth={1.5} />
                      待补充
                    </span>
                  </>
                ) : (
                  <>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${mood.chip}`}>
                      <Sprout size={14} strokeWidth={1.5} />
                      {growthContent?.mood}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${mood.chip}`}>
                      <Sparkles size={14} strokeWidth={1.5} />
                      已记录
                    </span>
                  </>
                )}
              </div>
              
              {/* 关键词区 */}
              <div>
                <p className={`text-xs mb-2.5 font-medium text-center ${mood.accent}`}>今日关键词</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {growthContent?.keywords && growthContent.keywords.length > 0 ? (
                    growthContent.keywords.map((keyword: string, index: number) => (
                      <span key={index} className={`text-xs px-3 py-1 rounded-full ${mood.chip}`}>
                        #{keyword}
                      </span>
                    ))
                  ) : (
                    <span className={`text-xs px-3 py-1 rounded-full ${mood.chip}`}>
                      暂无
                    </span>
                  )}
                </div>
              </div>
              
              {/* 深度复盘子组件（Card-in-Card） */}
              <div className={`${mood.panel} rounded-2xl p-4`}>
                <p className={`text-xs mb-3 font-medium ${mood.accent}`}>今日行动汇总</p>
                <div className="space-y-3">
                  {growthContent?.summary.map((item: string, index: number) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${mood.chip}`}>
                        {index + 1}
                      </span>
                      <p className="text-[13px] leading-relaxed text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 查看往日对话入口 */}
              {growthContent?.messages && (
                <div className="mt-2 text-center">
                  <button 
                    onClick={() => {
                      setHistoryMessages(growthContent.messages);
                      setShowHistoryDialog(true);
                    }}
                    className={`text-xs transition-colors ${mood.accent} hover:opacity-80`}
                  >
                    查看当日对话记录 →
                  </button>
                </div>
              )}
            </div>
            
            {/* 品牌区域 */}
            <div className="px-4 pb-4 text-center">
              <div className={`inline-flex items-center justify-center gap-2 text-xs ${mood.accent}`}>
                <Sprout size={14} strokeWidth={1.5} />
                <span>Echo · 见证成长</span>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
      
      {/* 历史对话弹窗 */}
      {showHistoryDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[380px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">当日对话记录</h3>
              <button 
                onClick={() => setShowHistoryDialog(false)}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {historyMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-green-600 text-white rounded-br-sm' 
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
