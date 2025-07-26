// 阿里云 MCP 後端服務器
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Database } = require('./database');

const app = express();
const port = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 初始化數據庫
const db = new Database();

// MCP 健康檢查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'MCP服務器運行正常' });
});

// 獲取所有工單
app.get('/api/tickets', async (req, res) => {
    try {
        const tickets = await db.getAllTickets();
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: '獲取工單失敗' });
    }
});

// 獲取指定用戶的工單
app.get('/api/tickets/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const tickets = await db.getTicketsByUser(userId);
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: '獲取用戶工單失敗' });
    }
});

// 創建新工單
app.post('/api/tickets', async (req, res) => {
    try {
        const ticketData = req.body;
        const ticket = await db.createTicket(ticketData);
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ error: '創建工單失敗' });
    }
});

// 分配維修師傅
app.put('/api/tickets/:id/assign', async (req, res) => {
    try {
        const id = req.params.id;
        const { worker, status } = req.body;
        const result = await db.assignWorker(id, worker, status);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: '分配師傅失敗' });
    }
});

// 標記工單完成
app.put('/api/tickets/:id/complete', async (req, res) => {
    try {
        const id = req.params.id;
        const { status, completedAt } = req.body;
        const result = await db.completeTicket(id, status, completedAt);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: '完成工單失敗' });
    }
});

// 客戶註冊
app.post('/api/customers/register', async (req, res) => {
    try {
        const customerData = req.body;
        const customer = await db.registerCustomer(customerData);
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 客戶登入
app.post('/api/customers/login', async (req, res) => {
    try {
        const { account, password } = req.body;
        const customer = await db.loginCustomer(account, password);
        res.json(customer);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// 獲取所有客戶
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await db.getAllCustomers();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: '獲取客戶失敗' });
    }
});

// 導出工單到Excel
app.get('/api/tickets/export', async (req, res) => {
    try {
        const tickets = await db.getAllTickets();
        
        // 創建CSV格式的Excel文件
        const headers = ['工單ID', '客戶ID', '地點', '樓層', '問題描述', '聯繫電話', '狀態', '維修師傅', '提交時間', '完成時間'];
        const csvContent = [
            headers.join(','),
            ...tickets.map(ticket => [
                ticket.id,
                ticket.customerId,
                ticket.location,
                ticket.floor,
                `"${ticket.issue}"`,
                ticket.contact,
                ticket.status,
                ticket.worker || '',
                new Date(ticket.createdAt).toLocaleString('zh-CN'),
                ticket.completedAt ? new Date(ticket.completedAt).toLocaleString('zh-CN') : ''
            ].join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=工單記錄.csv');
        res.send(csvContent);
    } catch (error) {
        res.status(500).json({ error: '導出失敗' });
    }
});

// MCP 工具定義
const mcpTools = {
    create_ticket: {
        name: 'create_ticket',
        description: '創建新的維修工單',
        input_schema: {
            type: 'object',
            properties: {
                customerId: { type: 'string', description: '客戶ID' },
                location: { type: 'string', description: '報修地點' },
                floor: { type: 'string', description: '樓層' },
                issue: { type: 'string', description: '問題描述' },
                contact: { type: 'string', description: '聯繫電話' }
            },
            required: ['customerId', 'location', 'floor', 'issue', 'contact']
        }
    },
    
    get_tickets: {
        name: 'get_tickets',
        description: '獲取工單列表',
        input_schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', description: '用戶ID（可選）' },
                status: { type: 'string', description: '工單狀態（可選）' }
            }
        }
    },
    
    assign_worker: {
        name: 'assign_worker',
        description: '分配維修師傅',
        input_schema: {
            type: 'object',
            properties: {
                ticketId: { type: 'string', description: '工單ID' },
                worker: { type: 'string', description: '維修師傅姓名' }
            },
            required: ['ticketId', 'worker']
        }
    },
    
    complete_ticket: {
        name: 'complete_ticket',
        description: '標記工單完成',
        input_schema: {
            type: 'object',
            properties: {
                ticketId: { type: 'string', description: '工單ID' }
            },
            required: ['ticketId']
        }
    },

    register_customer: {
        name: 'register_customer',
        description: '客戶註冊',
        input_schema: {
            type: 'object',
            properties: {
                username: { type: 'string', description: '用戶名' },
                account: { type: 'string', description: '帳號' },
                phone: { type: 'string', description: '電話號碼' }
            },
            required: ['username', 'account', 'phone']
        }
    },

    login_customer: {
        name: 'login_customer',
        description: '客戶登入',
        input_schema: {
            type: 'object',
            properties: {
                account: { type: 'string', description: '帳號' },
                password: { type: 'string', description: '密碼（電話號碼）' }
            },
            required: ['account', 'password']
        }
    }
};

// MCP 工具調用接口
app.post('/mcp/tools/call', async (req, res) => {
    try {
        const { name, arguments: args } = req.body;
        
        switch (name) {
            case 'create_ticket':
                const newTicket = await db.createTicket(args);
                res.json({ content: [{ type: 'text', text: `工單創建成功，ID: ${newTicket.id}` }] });
                break;
                
            case 'get_tickets':
                const tickets = args.userId ? 
                    await db.getTicketsByUser(args.userId) : 
                    await db.getAllTickets(args.status);
                res.json({ content: [{ type: 'text', text: JSON.stringify(tickets, null, 2) }] });
                break;
                
            case 'assign_worker':
                await db.assignWorker(args.ticketId, args.worker, '處理中');
                res.json({ content: [{ type: 'text', text: `已分配維修師傅：${args.worker}` }] });
                break;
                
            case 'complete_ticket':
                await db.completeTicket(args.ticketId, '已完成', new Date().toISOString());
                res.json({ content: [{ type: 'text', text: '工單已標記為完成' }] });
                break;

            case 'register_customer':
                const newCustomer = await db.registerCustomer(args);
                res.json({ content: [{ type: 'text', text: `客戶註冊成功，ID: ${newCustomer.id}` }] });
                break;

            case 'login_customer':
                const customer = await db.loginCustomer(args.account, args.password);
                res.json({ content: [{ type: 'text', text: `登入成功，歡迎 ${customer.username}` }] });
                break;
                
            default:
                res.status(404).json({ error: '工具不存在' });
        }
    } catch (error) {
        res.status(500).json({ error: '工具調用失敗' });
    }
});

// 獲取可用工具列表
app.get('/mcp/tools', (req, res) => {
    res.json({ tools: Object.values(mcpTools) });
});

// 啟動服務器
app.listen(port, () => {
    console.log(`新中物業MCP服務器啟動在端口 ${port}`);
    console.log(`訪問 http://localhost:${port}/health 檢查服務器狀態`);
});

module.exports = app;