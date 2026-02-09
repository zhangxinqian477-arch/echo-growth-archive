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
  
  // 在App初始化时清理脏数据
  useEffect(() => {
    try {
      const archives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
      const dateKeys = Object.keys(archives);
      
      // 检查是否有不符合YYYY-MM-DD格式的Key（包含'0', '1'或'2024'）
      const hasInvalidData = dateKeys.some(key => 
        key.includes('0') || 
        key.includes('1') || 
        key.includes('2024')
      );
      
      if (hasInvalidData) {
        console.log('App: 检测到无效数据，正在清理...');
        // 直接清空echo_archives
        localStorage.removeItem('echo_archives');
        console.log('App: 已清理echo_archives中的无效数据');
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="w-[430px] h-[85vh] bg-[#F8FAF7] mx-auto shadow-2xl overflow-hidden relative flex flex-col">
            {activeTab === 'chat' ? <ChatPage /> : <GardenPage />}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
