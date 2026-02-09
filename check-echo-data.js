// 在浏览器控制台中运行这个函数来检查和测试数据同步
function checkEchoData() {
  console.log('=== 检查Echo数据同步 ===');
  
  // 1. 检查localStorage中的原始数据
  const rawData = localStorage.getItem('echo_archives');
  console.log('localStorage原始数据:', rawData);
  
  // 2. 解析后的数据
  const parsedData = JSON.parse(rawData || '{}');
  console.log('解析后的数据:', parsedData);
  
  // 3. 所有日期键
  const dateKeys = Object.keys(parsedData);
  console.log('所有日期键:', dateKeys);
  
  // 4. 检查是否包含今天的日期
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const todayString = todayUTC.toISOString().split('T')[0];
  console.log('今天的日期:', todayString);
  console.log('是否包含今天的日期:', dateKeys.includes(todayString));
  
  // 5. 创建测试数据
  console.log('\n=== 创建测试数据 ===');
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
  
  // 6. 保存测试数据
  parsedData[todayString] = testData;
  localStorage.setItem('echo_archives', JSON.stringify(parsedData));
  console.log('已保存测试数据，日期:', todayString);
  
  // 7. 验证保存结果
  const updatedData = JSON.parse(localStorage.getItem('echo_archives') || '{}');
  console.log('更新后的数据:', updatedData);
  console.log('是否包含测试数据:', !!updatedData[todayString]);
  
  // 8. 触发事件
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('echo-archives-updated', { 
    detail: { date: todayString, archive: testData } 
  }));
  
  console.log('已触发storage事件，请检查GardenPage是否更新');
  
  return {
    todayString,
    testData,
    allDates: Object.keys(updatedData)
  };
}

// 运行函数
checkEchoData();