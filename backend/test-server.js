// 本地測試腳本
const app = require('./mcp-server');
const port = 3000;

console.log('🚀 啟動本地測試服務器...');
console.log('📱 訪問 http://localhost:3000 測試後端API');
console.log('📋 測試接口：');
console.log('  GET  /health - 健康檢查');
console.log('  GET  /api/tickets - 獲取所有工單');
console.log('  POST /api/tickets - 創建新工單');
console.log('  PUT  /api/tickets/:id/assign - 分配師傅');
console.log('  PUT  /api/tickets/:id/complete - 標記完成');
console.log('  GET  /api/tickets/export - 導出Excel');

// 自動創建測試數據
setTimeout(() => {
    const axios = require('axios');
    
    // 測試創建工單
    axios.post('http://localhost:3000/api/tickets', {
        customerId: '20001',
        location: 'A棟',
        floor: '5樓',
        issue: '測試水管漏水',
        contact: '13800138001'
    }).then(() => {
        console.log('✅ 測試數據已創建');
    }).catch(err => {
        console.log('⚠️  測試數據創建失敗:', err.message);
    });
}, 1000);

app.listen(port, () => {
    console.log(`✅ 服務器啟動成功！端口：${port}`);
});