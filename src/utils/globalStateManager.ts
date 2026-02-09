// 全局状态管理器，用于跨组件共享数据
class GlobalStateManager {
  private static instance: GlobalStateManager;
  private listeners: Array<(archives: any[]) => void> = [];
  private currentArchives: any[] = [];

  private constructor() {
    // 初始化时从localStorage加载数据
    this.loadFromStorage();
    
    // 监听storage事件
    window.addEventListener('storage', () => {
      this.loadFromStorage();
    });
  }

  public static getInstance(): GlobalStateManager {
    if (!GlobalStateManager.instance) {
      GlobalStateManager.instance = new GlobalStateManager();
    }
    return GlobalStateManager.instance;
  }

  private loadFromStorage() {
    try {
      const storedArchives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
      const dateKeys = Object.keys(storedArchives);
      
      // 检查并清理2024年的旧数据
      const hasOldData = dateKeys.some(key => key.startsWith('2024-'));
      if (hasOldData) {
        console.log('GlobalStateManager: 检测到2024年的旧数据，正在清理...');
        const filteredArchives: any = {};
        
        // 只保留非2024年的数据
        dateKeys.forEach(key => {
          if (!key.startsWith('2024-')) {
            filteredArchives[key] = storedArchives[key];
          }
        });
        
        // 保存清理后的数据
        localStorage.setItem('echo_archives', JSON.stringify(filteredArchives));
        console.log('GlobalStateManager: 已清理2024年旧数据');
        
        this.currentArchives = Object.keys(filteredArchives).map(date => filteredArchives[date]);
      } else {
        console.log('GlobalStateManager: 从localStorage读取的日期键:', dateKeys);
        this.currentArchives = dateKeys.map(date => storedArchives[date]);
      }
      
      console.log('GlobalStateManager: 从localStorage加载数据', this.currentArchives);
      this.notifyListeners();
    } catch (error) {
      console.error('GlobalStateManager: 加载数据失败', error);
    }
  }

  public updateArchives(newArchive?: any) {
    // 重新从localStorage加载最新数据
    this.loadFromStorage();
    
    // 如果提供了新归档数据，确保它被包含在当前数据中
    if (newArchive) {
      console.log('GlobalStateManager: 收到新归档数据', newArchive);
      // 再次加载以确保包含最新数据
      setTimeout(() => {
        this.loadFromStorage();
        console.log('GlobalStateManager: 重新加载后的数据', this.currentArchives);
      }, 50);
    }
  }

  public getArchives(): any[] {
    return this.currentArchives;
  }

  public subscribe(listener: (archives: any[]) => void) {
    this.listeners.push(listener);
    // 立即发送当前状态
    listener(this.currentArchives);
    
    // 返回取消订阅函数
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentArchives);
      } catch (error) {
        console.error('GlobalStateManager: 通知监听器失败', error);
      }
    });
  }

  public forceRefresh() {
    console.log('GlobalStateManager: 强制刷新数据');
    console.log('GlobalStateManager: 刷新前的数据:', this.currentArchives);
    this.loadFromStorage();
    console.log('GlobalStateManager: 刷新后的数据:', this.currentArchives);
  }
}

// 暴露到window对象，方便调试
if (typeof window !== 'undefined') {
  (window as any).GlobalStateManager = GlobalStateManager;
}

export default GlobalStateManager;