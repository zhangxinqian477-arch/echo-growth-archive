// AI服务：连接DeepSeek API进行深度复盘分析

interface ReflectionResult {
  mood: string;
  keywords: string[];
  reflections: string[];
}

interface ArchiveResult {
  date: string;
  keywords: string[];
  mood: string;
  records: {
    今日习得: string;
    逻辑突破: string;
    改进点: string;
  };
  导师建议: string;
}

/**
 * 调用DeepSeek API生成深度复盘
 * @param content 用户输入的内容
 * @returns 包含心情、关键词和复盘建议的对象
 */
export async function generateReflection(content: string): Promise<ReflectionResult> {
  try {
    console.log('检查钥匙：', import.meta.env.VITE_DS_KEY ? '已找到' : '未找到');
    console.log('当前所有环境变量：', import.meta.env);
    const apiKey = import.meta.env.VITE_DS_KEY;
    
    if (!apiKey) {
      console.error('DeepSeek API Key未配置');
      throw new Error('DeepSeek API Key未配置');
    }

    console.log('开始调用DeepSeek API...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        thinking: { type: 'disabled' },
        messages: [
          {
            role: 'system',
            content: '你是一个严谨且温润的逻辑复盘专家。用户的输入是其当天的随笔或情绪。请你：\n\n提炼一个【能量心情】（如：能级翠绿、明黄暖意等）。\n\n提取3个【高频关键词】（加#号）。\n\n给出3点深度逻辑复盘总结。每一点都要精准、有启发性，且符合1.2.3.的逻辑结构。\n\n最终生成的总结卡片，必须是一份"职业成长档案"：\n\n档案标题：基于今日对话的主题（如："关于智能驾驶售前资料的逻辑复盘"）。\n\n核心内容：包含今日习得的硬技能、情绪能量波、以及一个面向未来的逻辑改进建议。\n\n输出格式：要求AI必须只返回JSON格式，结构如下：{ "mood": "...", "keywords": ["...", "...", "..."], "reflections": ["...", "...", "..."] }'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    console.log('API响应状态:', response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API返回数据:', data);
    
    // 尝试解析JSON响应
    let result: ReflectionResult;
    try {
      const content = data.choices[0].message.content;
      console.log('AI返回内容:', content);
      result = JSON.parse(content);
      console.log('解析后的结果:', result);
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      throw new Error('API响应格式错误');
    }
    
    // 验证返回的数据结构
    if (!result.mood || !Array.isArray(result.keywords) || !Array.isArray(result.reflections)) {
      console.error('数据结构不完整:', result);
      throw new Error('API返回数据结构不完整');
    }
    
    console.log('最终返回结果:', result);
    return result;
  } catch (error) {
    console.error('Full Error:', error.response?.data || error.message);
    
    // 返回默认值，确保应用不会崩溃
    return {
      mood: '平静思考',
      keywords: ['记录', '复盘', '成长'],
      reflections: [
        '还没有今天的记录',
        '点击对话页面开始记录',
        '让每一天都有成长痕迹'
      ]
    };
  }
}

/**
 * 将对话历史提炼为归档JSON对象
 * @param messages 对话历史数组
 * @returns 包含日期、关键词、心情和结构化记录的归档对象
 */
export async function summarizeToArchive(messages: Array<{role: string, content: string}>): Promise<ArchiveResult> {
  try {
    console.log('检查钥匙：', import.meta.env.VITE_DS_KEY ? '已找到' : '未找到');
    const apiKey = import.meta.env.VITE_DS_KEY;
    
    if (!apiKey) {
      console.error('DeepSeek API Key未配置');
      throw new Error('DeepSeek API Key未配置');
    }

    // 提取对话内容用于分析
    const conversationContent = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    console.log('当前日期:', today);
    
    console.log('开始调用DeepSeek API进行对话总结...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        thinking: { type: 'disabled' },
        messages: [
          {
            role: 'system',
            content: `你是一个严谨的事实提取专家，必须遵循以下规则：

1. 【事实过滤器模式】：
   - 严格禁止引用'assistant:'、'user:'或任何对话格式
   - 必须先对原始对话进行'逻辑清洗'，剥离情绪词和废话，仅保留核心动宾结构的事实

2. 【三象限事实提取模型】：
   必须从对话中挖掘并精准归纳出以下三点（如果没有则写'今日专注现有进度'）：
   
   🧪 今日习得：提取用户今天学到的知识点、技能或新概念
   ✅ 逻辑突破：提取用户解决问题的关键思路或方法论突破
   🔍 改进点：提取用户发现的不足、需要改进的地方或未来优化方向

3. 【强制简洁性约束】：
   - 每项字数必须控制在15-25字之间
   - 严禁出现'总共完成了446项'这种虚假的统计幻觉

4. 【输出格式】：
   必须返回严格的JSON格式，包含以下字段：
   {
     "date": "${today}",
     "keywords": ["关键词1", "关键词2", "关键词3"],
     "mood": "积极开心/焦虑压力/平静专注/疲惫一般",
     "records": {
       "今日习得": "15-25字的事实描述",
       "逻辑突破": "15-25字的事实描述",
       "改进点": "15-25字的事实描述"
     },
     "导师建议": "30字以内的画龙点睛建议"
   }`
          },
          {
            role: 'user',
            content: `请对以下对话进行事实提取：\n\n${conversationContent}`
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    console.log('API响应状态:', response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API返回数据:', data);
    
    // 尝试解析JSON响应
    let result: ArchiveResult;
    try {
      let content = data.choices[0].message.content;
      console.log('AI返回原始内容:', content);
      
      // 移除可能的markdown代码块标记
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/```\n?/, '').replace(/```\n?$/, '');
      }
      
      // 移除可能的换行符和空格
      content = content.trim();
      
      console.log('处理后的内容:', content);
      result = JSON.parse(content);
      console.log('解析后的结果:', result);
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      console.error('原始响应:', data.choices[0].message.content);
      throw new Error('API响应格式错误');
    }
    
    // 验证返回的数据结构
    if (!result.date || !Array.isArray(result.keywords) || !result.mood || !result.records || !result.导师建议) {
      console.error('数据结构不完整:', result);
      throw new Error('API返回数据结构不完整');
    }
    
    // 确保日期格式正确
    result.date = result.date || today;
    
    console.log('最终返回结果:', result);
    return result;
  } catch (error) {
    console.error('Full Error:', error.response?.data || error.message);
    
    // 返回默认值，确保应用不会崩溃
    return {
      date: today,
      keywords: ['记录', '复盘', '成长'],
      mood: '平静专注',
      records: {
        今日习得: '今日专注现有进度',
        逻辑突破: '今日专注现有进度',
        改进点: '今日专注现有进度'
      },
      导师建议: '保持记录习惯，持续反思成长'
    };
  }
}