// 在浏览器控制台中运行这个函数来直接测试数据同步
function testDirectSync() {
  console.log('=== 直接测试数据同步 ===');
  
  // 1. 获取今天的日期
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const todayString = todayUTC.toISOString().split('T')[0];
  console.log('今天的日期:', todayString);
  
  // 2. 从localStorage获取当前数据
  const currentData = JSON.parse(localStorage.getItem('echo_archives') || '{}');
  console.log('当前localStorage数据:', currentData);
  console.log('当前日期键:', Object.keys(currentData));
  
  // 3. 创建测试数据
  const testData = {
    date: todayString,
    mood: '平静思考',
    keywords: ['测试', '调试', '同步'],
    records: {
      今日习得: '测试数据保存',
      逻辑突破: '调试同步问题',
      改进点: '确保数据正确显示'
    }
  };
  
  // 4. 直接保存到localStorage
  currentData[todayString] = testData;
  localStorage.setItem('echo_archives', JSON.stringify(currentData));
  console.log('已保存测试数据到localStorage');
  
  // 5. 验证保存
  const verifyData = JSON.parse(localStorage.getItem('echo_archives') || '{}');
  console.log('验证保存结果:', verifyData);
  console.log('是否包含测试数据:', !!verifyData[todayString]);
  
  // 6. 获取全局状态管理器并强制刷新
  if (window.GlobalStateManager) {
    console.log('找到全局状态管理器');
    const globalManager = window.GlobalStateManager.getInstance();
    globalManager.forceRefresh();
  } else {
    console.log('未找到全局状态管理器，尝试通过import获取');
    // 尝试通过React DevTools或其他方式获取
  }
  
  // 7. 触发多个事件
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('echo-archives-updated', { 
    detail: { date: todayString, archive: testData } 
  }));
  window.dispatchEvent(new CustomEvent('echo-archives-force-update', { 
    detail: { 
      date: todayString, 
      archive: testData,
      allArchives: verifyData
    } 
  }));
  
  console.log('已触发所有同步事件');
  
  return {
    todayString,
    testData,
    saved: !!verifyData[todayString]
  };
}

// 运行测试
testDirectSync();