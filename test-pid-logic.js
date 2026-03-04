// 临时测试文件：验证pid参数的行为
// 在浏览器控制台运行这些命令来测试不同的pid值

console.log('🧪 PID逻辑测试');

// 假设你有一个用户ID，替换为实际的用户ID
const TEST_USER_ID = 123; // 请替换为实际用户ID

// 测试函数：检查不同pid值的返回结果
async function testPidLogic() {
  console.log('📊 开始测试不同pid值的API行为...');

  // 测试1: 不传pid参数
  console.log('\n1️⃣ 测试不传pid参数:');
  try {
    const response1 = await fetch('https://api-test.copus.network/client/article/space/pageMySpaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 需要添加实际的Authorization token
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        targetUserId: TEST_USER_ID,
        pageIndex: 1,
        pageSize: 100
        // 不传pid参数
      })
    });
    const data1 = await response1.json();
    console.log('不传pid参数的结果:', data1);
  } catch (error) {
    console.error('测试1失败:', error);
  }

  // 测试2: pid=0
  console.log('\n2️⃣ 测试pid=0:');
  try {
    const response2 = await fetch('https://api-test.copus.network/client/article/space/pageMySpaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        targetUserId: TEST_USER_ID,
        pageIndex: 1,
        pageSize: 100,
        pid: 0
      })
    });
    const data2 = await response2.json();
    console.log('pid=0的结果:', data2);
  } catch (error) {
    console.error('测试2失败:', error);
  }

  // 测试3: pid=具体数值（假设有一个父空间ID为456）
  console.log('\n3️⃣ 测试pid=456（假设的父空间ID）:');
  try {
    const response3 = await fetch('https://api-test.copus.network/client/article/space/pageMySpaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        targetUserId: TEST_USER_ID,
        pageIndex: 1,
        pageSize: 100,
        pid: 456
      })
    });
    const data3 = await response3.json();
    console.log('pid=456的结果:', data3);
  } catch (error) {
    console.error('测试3失败:', error);
  }
}

// 使用说明
console.log(`
🔧 使用说明：
1. 打开浏览器开发者工具
2. 替换TEST_USER_ID为实际的用户ID
3. 替换YOUR_TOKEN_HERE为实际的token
4. 运行testPidLogic()函数
5. 观察不同pid值的返回结果

💡 预期行为：
- 不传pid或pid=0：返回所有空间？
- pid>0：返回特定父空间的子空间？

🚀 运行: testPidLogic()
`);