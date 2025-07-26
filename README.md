# 新中物業工單系統

## 系統架構
- **前端**: GitHub Pages 靜態網站
- **後端**: 阿里云 MCP (Model Context Protocol) 服務
- **數據存儲**: 阿里云函數計算 + 雲數據庫

## 快速開始

### 1. 部署前端到 GitHub Pages
1. Fork 這個倉庫到你的 GitHub
2. 在倉庫設置中啟用 GitHub Pages
3. 訪問 `https://[你的用戶名].github.io/[倉庫名]/`

### 2. 部署後端到阿里云 MCP
1. 登錄 [阿里云百煉控制台](https://bailian.console.aliyun.com/)
2. 進入 MCP 市場，創建新的 MCP 服務
3. 上傳後端代碼文件
4. 獲取 MCP 服務地址，更新前端配置

## 項目結構
```
├── index.html          # 主頁面
├── admin.html          # 管理員頁面
├── css/               # 樣式文件
├── js/                # JavaScript 文件
├── backend/           # MCP 後端代碼
│   ├── mcp-server.js  # MCP 服務器
│   └── database.js    # 數據庫操作
└── README.md          # 說明文檔
```

## 賬號系統
### 管理員賬號
- **用戶名**: `XINZHONG`
- **密碼**: `xinzhong`

### 客戶賬號
**註冊流程**:
1. 客戶需先註冊賬號
2. 註冊時需提供：用戶名、賬號、電話號碼
3. 電話號碼即為登入密碼

**登入方式**:
- 賬號：註冊時填寫的賬號
- 密碼：註冊時填寫的電話號碼

## 功能特性
- 📱 響應式設計，支持手機/電腦/平板
- 🔐 簡單賬號系統
- 📊 工單狀態實時更新
- 📋 Excel 導出功能
- 🚀 阿里云 MCP 後端服務

## 技術棧
- **前端**: HTML5 + CSS3 + JavaScript
- **後端**: Node.js + MCP 協議
- **部署**: GitHub Pages + 阿里云函數計算