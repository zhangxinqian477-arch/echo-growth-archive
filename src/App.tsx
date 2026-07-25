import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatPage from "@/pages/ChatPage";
import GardenPage from "@/pages/GardenPage";
import BottomNav from "@/components/BottomNav";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'garden'>('chat');
  
  // 清理非法日期键与 2024 旧数据，保留合法 YYYY-MM-DD 归档
  useEffect(() => {
    try {
      const archives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
      const dateKeys = Object.keys(archives);
      const isValidDateKey = (key: string) => /^\d{4}-\d{2}-\d{2}$/.test(key) && !key.startsWith('2024-');
      const invalidKeys = dateKeys.filter(key => !isValidDateKey(key));

      if (invalidKeys.length > 0) {
        const cleaned: Record<string, unknown> = {};
        dateKeys.forEach(key => {
          if (isValidDateKey(key)) cleaned[key] = archives[key];
        });
        localStorage.setItem('echo_archives', JSON.stringify(cleaned));
        console.log('App: 已清理非法/过期归档键', invalidKeys);
      }
    } catch (error) {
      console.error('App: 清理旧数据失败', error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
          <div className="w-[430px] h-[85vh] bg-[#F8FAF7] mx-auto shadow-2xl overflow-hidden relative flex flex-col font-sans">
            {activeTab === 'chat' ? <ChatPage /> : <GardenPage />}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
