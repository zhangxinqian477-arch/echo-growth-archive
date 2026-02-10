import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Sprout, Mic, Camera, Settings, BarChart3, Loader2 } from 'lucide-react';
import { generateReflection, summarizeToArchive } from '../lib/aiService';
import { toast } from 'sonner';
import { getDateKey } from '../utils/dateUtils';

// 简单的聊天响应函数，调用DeepSeek进行普通对话
async function getChatResponse(userMessage: string, conversationHistory: Array<{role: string, content: string}>): Promise<string> {
  try {
    console.log('检查钥匙：', import.meta.env.VITE_DS_KEY ? '已找到' : '未找到');
    console.log('当前所有环境变量：', import.meta.env);
    const apiKey = import.meta.env.VITE_DS_KEY;
    
    if (!apiKey) {
      console.error('DeepSeek API Key未配置');
      return '抱歉，系统配置有问题。';
    }

    // 限制记忆窗口：保留最近15-20轮对话
    const limitedHistory = conversationHistory.slice(-20);
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个经验丰富的前辈工程师，擅长识别用户话语中的情感成分并给予精准回应。请按以下路径响应：

1. 隐藏逻辑缝隙：
   严格禁止在回复中使用任何括号标签或前缀，如(共鸣)、(建议)、(记录)或(识别到中性启动词)。
   自然融入：将"安抚、建议、记录"这三个逻辑步骤，通过转折词自然衔接。
   示例：不再说"(共鸣)这种变卦确实让人疲惫"，改为"这种临时的变卦确实会让人产生巨大的失落感，换做是我也会觉得心累。"

2. 语境化"记录"动作：
   不要生硬地说"可以记入档案"，要赋予它职业发展的意义。
   示例："我会把你今天在代码报错中死磕的这种韧性记录下来。在未来的职业档案里，这不仅是一个Bug的解决，更是你作为工程师抗压能力的证明。"

3. 建议的深度与自然度：
   给出建议时，使用"或许你可以试试..."、"我之前也遇到过类似的..."这种口吻。
   指令：建议必须结合用户具体的职场或学习场景（如项目推进、技能提升、团队协作等）。

4. 对话收尾：
   结尾要像老友聊天一样自然收尾，或带一个轻量级的关联问题，不再进行"审讯式"连环追问。

5. 上下文关联能力：
   你必须具备极强的上下文关联能力。如果用户提到的新话题与之前的讨论有关，AI必须主动引用之前的观点。
   逻辑连点：鼓励AI发现用户不同话语间的潜在线索。

6. 实操类/建议类提问识别与回复：
   当用户提出"如何做"、"给点建议"、"怎么提高"或涉及具体职业技能（如项目推进、技能提升、团队协作）的困惑时：
   
   a) 先承接后拆解：首句依然保持自然温润的过渡。
   
   b) 核心输出：必须使用Markdown列表形式提供1-2点极具实操性的建议。

7. 时间感知与收尾引导：
   当检测到用户表达结束意图（如"结束"、"再见"、"拜拜"、"下次聊"、"总结"、"晚安"、"睡了"、"休息"）时：
   
   a) 如果是晚上12点前，回复要有收尾感和温暖感，如："今天我们的对话就到这里吧，希望今天的交流能给你带来一些启发。夜深了，记得早点休息，明天又是充满可能的一天。"
   
   b) 如果是其他时间，正常回复即可。
   
   c) 单点要求：每一点建议都要包含"方法论+你的具体场景"（例如："利用结构化思维拆解：正如你在完成市场调研报告时梳理数据一样，你可以把每个分析维度也画出逻辑连线..."）。
   
   d) 关联上下文：给建议时，必须搜索并引用用户之前提到的"闪光点"或"痛点"。
   
   e) 范例："针对你之前提到的学习焦虑，你可以试着把今天掌握的沟通技巧，整理成一个1-2-3的实战话术模板。"
   
   f) 结尾总结：说明这几点建议如何助力用户的职业档案增长，语气保持专业且有启发性。

请确保即使使用了列表，文字依然保持Echo一贯的温润质感，不要变成冷冰冰的说明书。

8. 今日行动汇总限制（Summary Constraints）：
   
   精简建议：将"今日行动汇总"严格限制在1-2条。只有在内容确实极具深度时才允许出现第2条。
   
   去抽象化：严禁出现"职业长跑"、"不确定性中消解"、"底层特质"等宏大叙事或虚无的辞藻。
   
   具象原则：建议必须是行动导向的。比如："下次开会前先准备议程清单"，而非"要保持耐心"。
   
   严禁过分联想：不要强行把简单的问题联系到人生态度。如果用户只聊了工作汇报，建议就仅限于沟通技巧或汇报方法。

9. 格式要求：
   
   保证records数组中的每一条文字长度不超过40字。
   
   确保卡片生成的JSON结构中，keywords是对话中出现的具体名词的提取，而非抽象形容词。

10. 生成卡片逻辑优化：
   
   当用户说"生成卡片"时，先在对话中显示用户消息，然后询问是否需要生成成长回声卡片，而不是直接生成。
   
   生成卡片后，不要自动关闭，给用户足够时间阅读和选择是否关闭。
   
   关键词提取：必须是具体名词，如"React Hooks"、"状态管理"、"面试准备"等，而非"好"、"棒"、"厉害"等抽象形容词。`
          },
          ...limitedHistory,
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek Error:', error);
    return '抱歉，我现在有点困惑，能再说一遍吗？';
  }
}

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: number, role: 'user' | 'assistant', content: string, timestamp?: string}>>([
    { id: 1, role: 'assistant', content: '今日感觉如何？\n有什么想记录或复盘的吗？', timestamp: new Date().toISOString() }
  ]);
  const [showGrowthCard, setShowGrowthCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [growthContent, setGrowthContent] = useState({
    mood: '能量翠绿',
    keywords: ['学习', '成长', '组件库'],
    reflections: [
      '今天掌握了 React 组件库的核心概念',
      '实践了 Tailwind CSS 的响应式设计',
      '解决了多个状态管理和组件通信问题'
    ]
  });
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGenerateEchoButton, setShowGenerateEchoButton] = useState(false);
  const [hasGeneratedToday, setHasGeneratedToday] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 监听消息变化，自动滚动到底部
  useEffect(() => {
    // 使用setTimeout确保DOM更新后再滚动
    const timer = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages.length]); // 监听消息数量变化

  // 加载聊天历史
  useEffect(() => {
    const today = getDateKey();
    
    // 检查上次对话日期
    const lastConversationDate = localStorage.getItem('last_conversation_date');
    
    // 如果日期不同，执行跨天自动归档
    if (lastConversationDate && lastConversationDate !== today) {
      console.log('检测到新的一天，执行跨天自动归档');
      
      // 获取上一天的对话
      const lastDayMessages = localStorage.getItem(`chat_history_${lastConversationDate}`);
      const existingArchives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
      
      // 如果上一天有对话但未存档，静默归档
      if (lastDayMessages && !existingArchives[lastConversationDate]) {
        try {
          const parsedMessages = JSON.parse(lastDayMessages);
          // 过滤掉欢迎消息
          const conversationContent = parsedMessages.filter((m: any) => m.id !== 1).map((m: any) => ({
            role: m.role,
            content: m.content
          }));
          
          // 创建静默归档对象
          const silentArchive = {
            date: lastConversationDate,
            keywords: ['待补充'],
            mood: '待补充',
            records: {
              今日习得: '今日专注现有进度',
              逻辑突破: '今日专注现有进度',
              改进点: '今日专注现有进度'
            },
            messages: conversationContent,
            isSilent: true // 标记为静默归档
          };
          
          // 存入echo_archives
          existingArchives[lastConversationDate] = silentArchive;
          localStorage.setItem('echo_archives', JSON.stringify(existingArchives));
          
          console.log('已静默归档上一天的对话:', lastConversationDate);
        } catch (error) {
          console.error('静默归档失败:', error);
        }
      }
      
      // 重置对话为新的开场白
      setMessages([
        { id: 1, role: 'assistant', content: '新的一天，有什么想记录的吗？', timestamp: new Date().toISOString() }
      ]);
      setMessageCount(0);
      setShowGenerateEchoButton(false);
      setHasGeneratedToday(false);
      
      // 清除上一天的对话历史
      localStorage.removeItem(`chat_history_${lastConversationDate}`);
      
      console.log('对话已重置');
    } else {
      // 日期相同，加载今天的对话
      const savedMessages = localStorage.getItem(`chat_history_${today}`);
      
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error('加载聊天历史失败:', error);
        }
      }
    }
    
    // 更新最后对话日期
    localStorage.setItem('last_conversation_date', today);
    
    // 检查今日是否已生成卡片
    const existingArchives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
    const existingArchive = existingArchives[today];
    setHasGeneratedToday(!!existingArchive);
  }, []);

  // 监听日期变化，实时检测跨天
  useEffect(() => {
    const checkDateChange = () => {
      const today = getDateKey();
      const lastDate = localStorage.getItem('last_conversation_date');
      
      if (lastDate && lastDate !== today) {
        console.log('检测到日期变化，重新加载页面');
        window.location.reload();
      }
    };
    
    // 立即检查一次
    checkDateChange();
    
    // 每分钟检查一次日期变化
    const interval = setInterval(checkDateChange, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // 保存聊天历史
  useEffect(() => {
    if (messages.length > 1) { // 不保存初始欢迎消息
      const today = getDateKey();
      localStorage.setItem(`chat_history_${today}`, JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = async () => {
    if (message.trim() === '') return;
    
    // 检查是否包含"生成卡片"指令
    if (message.includes('生成卡片')) {
      // 先将用户消息添加到对话中
      const userMessage = {
        id: messages.length + 1,
        role: 'user' as const,
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // 清空输入框
      setMessage('');
      
      // 延迟一点时间后显示生成卡片按钮（和结束对话逻辑一致）
      setTimeout(() => {
        setShowGenerateEchoButton(true);
      }, 500);
      
      return;
    }
    
    // 检查是否包含"结束"或"总结"意图
    const isEnding = message.includes('结束') || message.includes('再见') || message.includes('拜拜') || message.includes('下次聊') || message.includes('总结') || message.includes('晚安') || message.includes('睡了') || message.includes('休息');
    
    // 检查是否是晚上12点前
    const currentHour = new Date().getHours();
    const isBeforeMidnight = currentHour < 24; // 简化判断，实际应该是 < 24
    
    // Step 1: 立即将用户消息推入messages状态
    const userMessage = {
      id: messages.length + 1,
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // 添加消息后立即滚动到底部
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
    
    // Step 2: 立即清空输入框
    const userContent = message;
    setMessage('');
    
    // 更新对话计数
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    
    // Step 3: 创建一个'思考中'的占位消息
    const thinkingMessage = {
      id: messages.length + 2,
      role: 'assistant' as const,
      content: 'Echo 正在思考...',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, thinkingMessage]);
    
    // Step 4: 调用API
    try {
      const aiResponse = await getChatResponse(userContent, messages.map(m => ({ role: m.role, content: m.content })));
      
      // Step 5: 拿到结果后，用真实的AI内容替换掉'思考中'的占位消息
      setMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? { ...msg, content: aiResponse }
            : msg
        )
      );
      
      // 如果是结束意图，显示生成回声按钮
      if (isEnding) {
        setShowGenerateEchoButton(true);
      }
      
      // 不再添加系统提示消息，直接显示按钮
    } catch (error) {
    console.error('Full Error:', error.response?.data || error.message);
    
    // 移除思考消息
    setMessages(prev => 
      prev.filter(msg => msg.id !== thinkingMessage.id)
    );
    
    toast.error('回复失败，请稍后再试');
  }
  };

  const handleGenerateCard = async () => {
    // 检查今日是否已生成卡片
    const dateString = getDateKey();
    const existingArchives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
    const existingArchive = existingArchives[dateString];
    
    if (existingArchive) {
      // 已生成卡片，直接显示弹窗
      setSummaryData(existingArchive);
      setIsModalOpen(true);
      setTimeout(() => {
        toast.success('已加载今日成长回声');
      }, 0);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 调用summarizeToArchive函数获取归档数据
      console.log('正在调用AI服务生成归档数据');
      const archiveData = await summarizeToArchive(messages.map(m => ({ role: m.role, content: m.content })));
      console.log('AI返回归档数据:', archiveData);
      
      // 创建完整的存档对象，包含归档数据和对话历史
      const completeArchive = {
        ...archiveData,
        date: dateString, // 确保使用正确的日期
        messages: messages // 保存当前对话作为历史凭证
      };
      
      // 设置摘要数据（使用completeArchive而不是archiveData）
      setSummaryData(completeArchive);
      
      // 调试信息
      console.log('保存前的archives:', existingArchives);
      console.log('要保存的数据:', completeArchive);
      console.log('使用的日期键:', dateString);
      
      // 以日期为Key存储
      existingArchives[dateString] = completeArchive;
      
      // 调试信息
      console.log('保存后的archives:', existingArchives);
      
      // 保存回localStorage
      localStorage.setItem('echo_archives', JSON.stringify(existingArchives));
      
      // 强制再次保存，确保数据写入
      setTimeout(() => {
        localStorage.setItem('echo_archives', JSON.stringify(existingArchives));
        console.log('二次保存完成');
      }, 100);
      
      // 创建并触发自定义事件，确保同一页面内的组件能接收到通知
      try {
        const storageEvent = new StorageEvent('storage', {
          key: 'echo_archives',
          newValue: JSON.stringify(existingArchives),
          oldValue: localStorage.getItem('echo_archives'),
          storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
        console.log('已触发storage事件，通知花园页面更新');
      } catch (error) {
        console.error('触发storage事件失败:', error);
        // 备用方案：使用自定义事件
        const customEvent = new CustomEvent('echo_archives_updated', {
          detail: { archives: existingArchives }
        });
        window.dispatchEvent(customEvent);
      }
      
      // 更新最后对话日期为今天，防止跨天时重复归档
      localStorage.setItem('last_conversation_date', dateString);
      
      // 弹出摘要卡片
      setIsModalOpen(true);
      
      // 显示成功提示
      setTimeout(() => {
        toast.success('回声已生成并保存到心灵花园');
      }, 0);
    } catch (error) {
      console.error('Full Error:', error.response?.data || error.message);
      setTimeout(() => {
        toast.error('AI分析失败，请稍后再试');
      }, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToArchive = async () => {
    try {
      // 调用summarizeToArchive函数
      const archiveData = await summarizeToArchive(messages.map(m => ({ role: m.role, content: m.content })));
      
      // 强制使用今日日期，严禁让AI自行生成日期
      const dateString = getDateKey();
      console.log('handleSaveToArchive - 使用的日期:', dateString);
      
      // 从localStorage获取现有的归档数据（使用对象格式，与GardenPage保持一致）
      const existingArchives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
      
      // 以日期为Key存储
      existingArchives[dateString] = archiveData;
      
      // 保存回localStorage
      localStorage.setItem('echo_archives', JSON.stringify(existingArchives));
      
      // 强制再次保存，确保数据写入
      setTimeout(() => {
        localStorage.setItem('echo_archives', JSON.stringify(existingArchives));
        console.log('二次保存完成');
      }, 100);
      
      // 创建并触发自定义事件，确保同一页面内的组件能接收到通知
      try {
        const storageEvent = new StorageEvent('storage', {
          key: 'echo_archives',
          newValue: JSON.stringify(existingArchives),
          oldValue: localStorage.getItem('echo_archives'),
          storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
        console.log('已触发storage事件，通知花园页面更新');
      } catch (error) {
        console.error('触发storage事件失败:', error);
        // 备用方案：使用自定义事件
        const customEvent = new CustomEvent('echo_archives_updated', {
          detail: { archives: existingArchives }
        });
        window.dispatchEvent(customEvent);
      }
      
      // 显示成功提示
      setTimeout(() => {
        toast.success('回声已保存到心灵花园');
      }, 0);
      
      // 关闭卡片
      setShowGrowthCard(false);
    } catch (error) {
      console.error('保存归档失败:', error);
      setTimeout(() => {
        toast.error('保存失败，请稍后再试');
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFDFB]">
      <header className="flex-shrink-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-green-100 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl w-6 h-6 flex items-center justify-center">🌱</span>
            <h1 className="text-xl font-semibold text-[#1A2E1A]">Echo</h1>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="hover:opacity-80 transition-opacity p-3 rounded-3xl hover:bg-green-50"
            >
              <Settings size={20} strokeWidth={1.5} className="text-gray-600" />
            </button>
            
            {/* 设置菜单 */}
            {showSettingsMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 min-w-[180px] z-20">
                <button 
                  onClick={() => {
                    setShowSettingsMenu(false);
                    setShowClearDataConfirm(true);
                  }}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  清空所有数据
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => {
          // 检查是否需要显示时间分割线
          const showMessageDate = index === 0 || 
            (msg.timestamp && messages[index - 1]?.timestamp && 
             new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString());
          
          return (
            <div key={msg.id}>
              {/* 时间分割线 */}
              {showMessageDate && msg.timestamp && (
                <div className="flex justify-center my-4">
                  <div className="bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full font-mono">
                    {new Date(msg.timestamp).toLocaleDateString('zh-CN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
              
              <div className={msg.role === 'user' ? "flex justify-end" : "flex justify-start"}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ring-2 ring-green-100">
                    <span className="text-white text-sm">✨</span>
                  </div>
                )}
                <div className={`${
                  msg.role === 'user' 
                    ? "bg-green-600 text-white rounded-3xl rounded-br-sm px-6 py-4 max-w-[75%] shadow-soft mr-3" 
                    : "bg-white rounded-3xl p-6 shadow-sm border border-green-50 max-w-[75%] ml-3"
                }`}>
                  {msg.role === 'assistant' && msg.id === 1 && (
                    <div className="flex-1">
                      <p className="text-[#1A2E1A] text-base font-semibold mb-1">今日感觉如何？</p>
                      <p className="text-[#334155] text-xs mt-1">有什么想记录或复盘的吗？</p>
                    </div>
                  )}
                  {msg.role === 'assistant' && msg.id !== 1 && (
                    msg.content === 'Echo 正在思考...' ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Echo 正在思考...</span>
                      </div>
                    ) : (
                      <p className="text-[#334155] text-base leading-relaxed whitespace-pre-line">{msg.content}</p>
                    )
                  )}
                  {msg.role === 'user' && (
                    <p className="text-[15px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                  )}
                  {/* 检查是否是最后一条AI消息且包含结束意图 */}
                  {msg.role === 'assistant' && index === messages.length - 1 && showGenerateEchoButton && (
                    <div className="mt-4 flex justify-center">
                      <button 
                        onClick={handleGenerateCard}
                        disabled={isLoading}
                        className="flex items-center gap-2 border-2 border-green-600 bg-green-50 text-green-700 px-4 py-2 rounded-full hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles size={16} strokeWidth={2} className="text-green-600" />
                        <span className="text-sm font-semibold">
                          {hasGeneratedToday ? '已生成今日成长回声（点击再次查看）' : '生成今日回声'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">👤</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-t border-green-100 px-4 py-4 z-40 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            <button className="w-6 h-6 flex items-center justify-center p-1 bg-green-100 rounded-full hover:bg-green-200 transition-colors">
              <Mic size={14} strokeWidth={1.5} className="text-green-800" />
            </button>
            <button className="w-6 h-6 flex items-center justify-center p-1 bg-green-100 rounded-full hover:bg-green-200 transition-colors">
              <Camera size={14} strokeWidth={1.5} className="text-green-800" />
            </button>
          </div>
          <div className="flex-1 flex items-center">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="我想说..."
              className="flex-1 min-h-[40px] max-h-[120px] px-4 py-2 bg-gray-50 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-green-300 text-green-900 placeholder-gray-400 text-base resize-none overflow-y-auto"
              style={{ 
                height: 'auto',
                minHeight: '40px',
                maxHeight: '120px'
              }}
            />
          </div>
          <div className="flex-shrink-0">
            <button 
              onClick={handleSend}
              className="w-8 h-8 flex items-center justify-center p-1 bg-green-600 rounded-full hover:bg-green-700 transition-colors"
            >
              <span className="text-white text-sm leading-none">↑</span>
            </button>
          </div>
        </div>
        
        {/* 快捷操作区域 */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            <button 
              onClick={() => {
                setMessage('生成今日卡片');
                handleSend();
              }}
              className="flex-shrink-0 px-3 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors whitespace-nowrap"
            >
              生成今日卡片
            </button>
            <button 
              onClick={() => {
                setMessage('结束对话');
                handleSend();
              }}
              className="flex-shrink-0 px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              结束对话
            </button>
            <button 
              onClick={() => {
                setMessage('总结今日');
                handleSend();
              }}
              className="flex-shrink-0 px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors whitespace-nowrap"
            >
              总结今日
            </button>
          </div>
        </div>
      </div>

      {showGrowthCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="border border-slate-200 border-dashed border-green-200 bg-green-50/90 backdrop-blur-md rounded-3xl shadow-[0_20px_40px_-15px_rgba(22,163,74,0.15)] max-w-[380px] mx-4 max-h-[80vh] overflow-hidden scrollbar-hide">
            {/* 顶部导航栏 */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <button className="flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors font-mono text-xs font-bold">
                <BarChart3 size={16} strokeWidth={1.5} />
                <span>已保存</span>
              </button>
              <button 
                onClick={() => setShowGrowthCard(false)}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* 核心信息区 */}
            <div className="p-6 space-y-4">
              {/* 标题与日期 */}
              <div className="text-center">
                <h3 className="text-base font-semibold text-green-900 flex items-center justify-center gap-2 font-mono">
                  <Sparkles size={20} strokeWidth={1.5} className="text-green-800" />
                  <span>今日成长回声</span>
                  <Sparkles size={20} strokeWidth={1.5} className="text-green-800" />
                </h3>
                <p className="text-xs text-green-600 mt-1 font-sans">
                  {(() => {
                    // 使用标准日期格式，如果数据里没有日期，默认显示当前日期
                    const today = new Date().toISOString().split('T')[0];
                    const [year, month, day] = today.split('-');
                    return `${year}年${month}月${day}日`;
                  })()}
                </p>
              </div>
              
              {/* 情绪标签 */}
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Sprout size={16} strokeWidth={1.5} className="text-green-800" />
                  <span className="text-xs text-green-700 font-mono">{growthContent.mood}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} strokeWidth={1.5} className="text-green-800" />
                  <span className="text-xs text-green-700 font-mono">积极/自豪</span>
                </div>
              </div>
              
              {/* 关键词区 */}
              <div className="text-center">
                <p className="text-green-800 font-mono text-xs mb-2 font-medium">--- 🔑 今日关键词提取 ---</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {growthContent.keywords.map((keyword, index) => (
                    <span key={index} className="font-mono text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full">#{keyword}</span>
                  ))}
                </div>
              </div>
              
              {/* 今日行动汇总 */}
              <div className="bg-green-100/30 rounded-2xl p-4 mt-6">
                <p className="text-green-800 font-mono text-xs mb-3 font-medium">--- 📝 今日行动汇总 ---</p>
                <div className="space-y-3 leading-relaxed">
                  {growthContent.reflections.map((reflection, index) => (
                    <p key={index} className="font-mono text-xs text-slate-800">
                      {index + 1}. {reflection}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 品牌区域 */}
            <div className="border-t border-slate-100 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-700 font-mono text-xs">
                <span>(</span>
                <Sprout size={16} strokeWidth={1.5} />
                <span>Echo · 见证成长</span>
                <span>)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SummaryCard 组件 */}
      {isModalOpen && summaryData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="border border-slate-200 border-dashed border-green-200 bg-green-50/90 backdrop-blur-md rounded-3xl shadow-[0_20px_40px_-15px_rgba(22,163,74,0.15)] max-w-[380px] mx-4 max-h-[80vh] overflow-hidden scrollbar-hide">
            {/* 顶部导航栏 */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <button className="flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors font-mono text-xs font-bold">
                <BarChart3 size={16} strokeWidth={1.5} />
                <span>已保存</span>
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* 核心信息区 */}
            <div className="p-6 space-y-4">
              {/* 标题与日期 */}
              <div className="text-center">
                <h3 className="text-base font-semibold text-green-900 flex items-center justify-center gap-2 font-mono">
                  <Sparkles size={20} strokeWidth={1.5} className="text-green-800" />
                  <span>今日成长回声</span>
                  <Sparkles size={20} strokeWidth={1.5} className="text-green-800" />
                </h3>
                <p className="text-xs text-green-600 mt-1 font-sans">
                  {(() => {
                    const [year, month, day] = summaryData.date.split('-');
                    return `${year}年${month}月${day}日`;
                  })()}
                </p>
              </div>
              
              {/* 情绪标签 */}
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Sprout size={16} strokeWidth={1.5} className="text-green-800" />
                  <span className="text-xs text-green-700 font-mono">{summaryData.mood}</span>
                </div>
              </div>
              
              {/* 关键词区 */}
              <div className="text-center">
                <p className="text-green-800 font-mono text-xs mb-2 font-medium">--- 🔑 今日关键词提取 ---</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {summaryData.keywords.map((keyword: string, index: number) => (
                    <span key={index} className="font-mono text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full">#{keyword}</span>
                  ))}
                </div>
              </div>
              
              {/* 三象限事实记录 */}
              <div className="bg-green-100/30 rounded-2xl p-4 mt-6">
                <p className="text-green-800 font-mono text-xs mb-3 font-medium">--- 🛡️ 今日行动汇总 ---</p>
                <div className="space-y-3 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-mono text-xs">🧪</span>
                    <div>
                      <p className="font-mono text-xs text-green-700 font-medium">今日习得</p>
                      <p className="font-mono text-xs text-slate-800">{summaryData.records.今日习得}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-mono text-xs">✅</span>
                    <div>
                      <p className="font-mono text-xs text-green-700 font-medium">逻辑突破</p>
                      <p className="font-mono text-xs text-slate-800">{summaryData.records.逻辑突破}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-mono text-xs">🔍</span>
                    <div>
                      <p className="font-mono text-xs text-green-700 font-medium">改进点</p>
                      <p className="font-mono text-xs text-slate-800">{summaryData.records.改进点}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 导师建议 */}
              <div className="bg-amber-50/50 rounded-2xl p-4 mt-4 border border-amber-200/50">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-mono text-xs">💡</span>
                  <div>
                    <p className="font-mono text-xs text-amber-700 font-medium">导师建议</p>
                    <p className="font-mono text-xs text-slate-700">{summaryData.导师建议}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 品牌区域 */}
            <div className="border-t border-slate-100 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-700 font-mono text-xs">
                <span>(</span>
                <Sprout size={16} strokeWidth={1.5} />
                <span>Echo · 见证成长</span>
                <span>)</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 清空数据确认弹窗 */}
      {showClearDataConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">确认清空所有数据</h3>
            <p className="text-sm text-slate-600 mb-6">此操作将清除所有对话记录和归档数据，且无法恢复。确定要继续吗？</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowClearDataConfirm(false)}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-medium"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}