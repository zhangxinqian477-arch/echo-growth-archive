// 调试工具 - 用于检查和操作localStorage中的echo_archives数据
// 在浏览器控制台中运行这些命令来诊断问题

// 1. 检查当前localStorage中的所有数据
console.log('=== 当前localStorage中的所有数据 ===');
console.log('localStorage内容:', {
  echo_archives: JSON.parse(localStorage.getItem('echo_archives') || '{}'),
  last_conversation_date: localStorage.getItem('last_conversation_date'),
  echo_messages: localStorage.getItem('echo_messages')
});

// 2. 检查echo_archives的详细信息
console.log('\n=== echo_archives详细信息 ===');
const archives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
console.log('archives对象:', archives);
console.log('archives键值对数量:', Object.keys(archives).length);
console.log('所有日期键:', Object.keys(archives));

// 3. 创建一个测试数据并保存
console.log('\n=== 创建测试数据 ===');
const testData = {
  date: '2026-02-08',
  mood: '平静思考',
  keywords: ['测试', '调试', '同步'],
  records: {
    今日习得: '测试数据保存',
    逻辑突破: '调试同步问题',
    改进点: '确保数据正确显示'
  }
};

// 保存测试数据
archives['2026-02-08'] = testData;
localStorage.setItem('echo_archives', JSON.stringify(archives));
console.log('已保存测试数据，日期键: 2026-02-08');

// 4. 验证保存结果
console.log('\n=== 验证保存结果 ===');
const updatedArchives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
console.log('更新后的archives:', updatedArchives);
console.log('是否包含测试数据:', !!updatedArchives['2026-02-08']);

// 5. 触发storage事件
console.log('\n=== 触发storage事件 ===');
window.dispatchEvent(new Event('storage'));
window.dispatchEvent(new CustomEvent('echo-archives-updated', { 
  detail: { date: '2026-02-08', archive: testData } 
}));

console.log('已触发storage事件，请检查GardenPage是否更新');

// 导出为函数，方便重复使用
window.debugEchoArchives = {
  checkData: () => {
    const archives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
    console.log('当前archives:', archives);
    console.log('所有日期键:', Object.keys(archives));
    return archives;
  },
  
  addTestData: (date = '2026-02-08') => {
    const archives = JSON.parse(localStorage.getItem('echo_archives') || '{}');
    const testData = {
      date: date,
      mood: '平静思考',
      keywords: ['测试', '调试', '同步'],
      records: {
        今日习得: '测试数据保存',
        逻辑突破: '调试同步问题',
        改进点: '确保数据正确显示'
      }
    };
    
    archives[date] = testData;
    localStorage.setItem('echo_archives', JSON.stringify(archives));
    console.log(`已添加测试数据，日期键: ${date}`);
    
    // 触发事件
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('echo-archives-updated', { 
      detail: { date: date, archive: testData } 
    }));
    
    return testData;
  },
  
  clearData: () => {
    localStorage.removeItem('echo_archives');
    console.log('已清除echo_archives数据');
  }
};

console.log('\n=== 调试函数已创建 ===');
console.log('使用 debugEchoArchives.checkData() 检查数据');
console.log('使用 debugEchoArchives.addTestData() 添加测试数据');
console.log('使用 debugEchoArchives.clearData() 清除数据');