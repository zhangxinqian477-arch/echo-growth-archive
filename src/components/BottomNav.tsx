interface BottomNavProps {
  activeTab: 'chat' | 'garden';
  onTabChange: (tab: 'chat' | 'garden') => void;
}

import { MessageCircle, Calendar } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[430px] bg-white/95 backdrop-blur-md border-t border-green-100 shadow-soft z-50">
      <div className="flex justify-around py-4">
        <button
          onClick={() => onTabChange('chat')}
          className={`flex items-center gap-3 px-8 py-3 rounded-3xl transition-all duration-300 ${
            activeTab === 'chat'
              ? 'bg-green-600 text-white shadow-soft'
              : 'text-gray-500 hover:bg-green-50'
          }`}
        >
          <MessageCircle size={20} strokeWidth={1.5} />
          <span className="font-semibold text-xs">对话</span>
        </button>
        <button
          onClick={() => onTabChange('garden')}
          className={`flex items-center gap-3 px-8 py-3 rounded-3xl transition-all duration-300 ${
            activeTab === 'garden'
              ? 'bg-green-600 text-white shadow-soft'
              : 'text-gray-500 hover:bg-green-50'
          }`}
        >
          <Calendar size={20} strokeWidth={1.5} />
          <span className="font-semibold text-xs">花园</span>
        </button>
      </div>
    </div>
  );
}
