# 新中物業工單系統部署指南

## 🎯 部署概述

本系統採用前後端分離架構：
- **前端**：GitHub Pages（免費靜態網站託管）
- **後端**：阿里云 MCP（Model Context Protocol）服務

## 📋 前置準備

### 1. 創建GitHub倉庫
1. 登錄 [GitHub](https://github.com)
2. 創建新倉庫，命名為 `xinzhong-property-system`
3. 設置為公開倉庫

### 2. 阿里云賬號準備
1. 註冊 [阿里云賬號](https://www.aliyun.com)
2. 完成實名認證
3. 開通 [函數計算FC](https://fc.console.aliyun.com)

## 🚀 步驟一：部署後端到阿里云MCP

### 方法一：使用阿里云百煉控制台（推薦小白使用）

#### 1. 登錄百煉控制台
- 訪問 [阿里云百煉](https://bailian.console.aliyun.com/?tab=mcp#/mcp-market)
- 使用阿里云賬號登錄

#### 2. 創建MCP服務
1. 點擊「創建MCP服務」
2. 選擇「空白項目」
3. 填寫信息：
   - 服務名稱：`xinzhong-property-mcp`
   - 描述：新中物業工單系統後端
   - 運行時：Node.js 14

#### 3. 上傳後端代碼
1. 將 `backend/` 文件夾壓縮為 `backend.zip`
2. 在控制台選擇「上傳代碼包」
3. 上傳 `backend.zip`

#### 4. 配置環境變量
```bash
NODE_ENV=production
PORT=9000
```

#### 5. 獲取服務地址
部署完成後，複製生成的URL：
```
https://[服務名稱]-[隨機字符串].cn-hangzhou.fcapp.run
```

### 方法二：使用Serverless CLI（進階用戶）

#### 1. 安裝Serverless CLI
```bash
npm install -g serverless
```

#### 2. 配置阿里云憑證
```bash
serverless config credentials --provider aliyun --key [AccessKeyID] --secret [AccessKeySecret]
```

#### 3. 部署後端
```bash
cd backend
npm install
serverless deploy
```

## 🌐 步驟二：部署前端到GitHub Pages

### 1. 上傳代碼到GitHub
```bash
# 在本地項目目錄執行
git init
git add .
git commit -m "Initial commit: 新中物業工單系統"
git remote add origin https://github.com/[你的用戶名]/xinzhong-property-system.git
git push -u origin main
```

### 2. 配置GitHub Pages
1. 進入GitHub倉庫頁面
2. 點擊「Settings」→「Pages」
3. Source選擇「Deploy from a branch」
4. Branch選擇「main」和「/ (root)」
5. 點擊「Save」

### 3. 更新前端配置
編輯 `js/app.js` 和 `js/admin.js`，將 `MCP_SERVER_URL` 替換為你的後端地址：
```javascript
const MCP_SERVER_URL = 'https://你的後端地址.cn-hangzhou.fcapp.run';
```

### 4. 推送更新
```bash
git add .
git commit -m "更新後端地址配置"
git push origin main
```

## 🔧 步驟三：系統配置

### 1. 測試系統
訪問你的GitHub Pages地址：
```
https://[你的用戶名].github.io/xinzhong-property-system/
```

### 2. 驗證功能
- 使用客戶賬號登入（如：20001，密碼：4991001）
- 使用管理員賬號登入（XINZHONG，密碼：xinzhong）
- 測試工單創建、分配、完成功能

## 📱 手機端優化

系統已經內置響應式設計，支持：
- 📱 手機瀏覽器
- 📱 微信內置瀏覽器
- 💻 電腦瀏覽器
- 📱 平板設備

## 🔐 賬號系統說明

### 管理員賬號
- 用戶名：`XINZHONG`
- 密碼：`xinzhong`

### 客戶賬號
- 用戶名：`20001` 到 `20999`
- 密碼規則：`4991` + 三位數字
  - 20001 → 4991001
  - 20050 → 4991050
  - 20999 → 4991999

## 🛠️ 故障排除

### 常見問題

#### 1. 後端無法訪問
- 檢查阿里云函數計算服務狀態
- 確認URL正確無誤
- 查看函數日誌獲取錯誤信息

#### 2. 前端無法連接後端
- 確認 `MCP_SERVER_URL` 配置正確
- 檢查CORS設置（已自動配置）
- 使用瀏覽器開發者工具查看網絡請求

#### 3. 數據丟失
- 當前使用內存數據庫，重啟後數據會重置
- 如需持久化，可考慮升級到阿里云RDS

### 升級建議

#### 數據持久化（可選）
如需數據持久化，可升級到阿里云RDS：
```javascript
// 在database.js中替換為RDS連接
const mysql = require('mysql2/promise');
```

#### 自定義域名（可選）
1. 購買域名
2. 在阿里云配置自定義域名
3. 更新前端配置

## 📞 技術支持

如有問題，請檢查：
1. 瀏覽器控制台錯誤信息
2. 阿里云函數日誌
3. GitHub Pages部署狀態

## ✅ 部署完成檢查清單

- [ ] 後端MCP服務正常運行
- [ ] 前端GitHub Pages部署成功
- [ ] 客戶端功能測試通過
- [ ] 管理員功能測試通過
- [ ] 手機端響應式測試通過
- [ ] 數據導出功能正常
- [ ] 賬號登入驗證通過

🎉 恭喜！系統部署完成，開始使用吧！