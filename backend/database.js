// 簡單的內存數據庫實現
class Database {
    constructor() {
        this.tickets = [];
        this.customers = [];
        this.nextId = 1;
        this.nextCustomerId = 20001;
        
        // 添加一些示例數據
        this.initializeSampleData();
    }
    
    initializeSampleData() {
        // 添加示例客戶數據
        const sampleCustomers = [
            {
                id: 20001,
                username: '張三',
                account: 'zhangsan',
                phone: '13800138001',
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 20002,
                username: '李四',
                account: 'lisi',
                phone: '13800138002',
                createdAt: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: 20003,
                username: '王五',
                account: 'wangwu',
                phone: '13800138003',
                createdAt: new Date(Date.now() - 259200000).toISOString()
            }
        ];

        this.customers = sampleCustomers;

        const sampleTickets = [
            {
                id: this.nextId++,
                customerId: '20001',
                location: 'A棟',
                floor: '5樓',
                issue: '水管漏水，需要緊急維修',
                contact: '13800138001',
                status: '待處理',
                worker: null,
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 昨天
                completedAt: null
            },
            {
                id: this.nextId++,
                customerId: '20002',
                location: 'B棟',
                floor: '3樓',
                issue: '電燈不亮，可能是線路問題',
                contact: '13800138002',
                status: '處理中',
                worker: '李師傅',
                createdAt: new Date(Date.now() - 172800000).toISOString(), // 前天
                completedAt: null
            },
            {
                id: this.nextId++,
                customerId: '20003',
                location: 'C棟',
                floor: '8樓',
                issue: '空調故障，不制冷',
                contact: '13800138003',
                status: '已完成',
                worker: '王師傅',
                createdAt: new Date(Date.now() - 259200000).toISOString(), // 3天前
                completedAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
        
        this.tickets = sampleTickets;
    }
    
    // 獲取所有工單
    async getAllTickets(status = null) {
        if (status) {
            return this.tickets.filter(ticket => ticket.status === status);
        }
        return [...this.tickets];
    }
    
    // 獲取指定用戶的工單
    async getTicketsByUser(userId) {
        return this.tickets.filter(ticket => ticket.customerId === userId);
    }
    
    // 獲取單個工單
    async getTicketById(id) {
        return this.tickets.find(ticket => ticket.id === parseInt(id));
    }
    
    // 創建新工單
    async createTicket(ticketData) {
        const newTicket = {
            id: this.nextId++,
            customerId: ticketData.customerId,
            location: ticketData.location,
            floor: ticketData.floor,
            issue: ticketData.issue,
            contact: ticketData.contact,
            status: ticketData.status || '待處理',
            worker: ticketData.worker || null,
            createdAt: ticketData.createdAt || new Date().toISOString(),
            completedAt: ticketData.completedAt || null
        };
        
        this.tickets.push(newTicket);
        return newTicket;
    }
    
    // 更新工單
    async updateTicket(id, updates) {
        const ticketIndex = this.tickets.findIndex(ticket => ticket.id === parseInt(id));
        if (ticketIndex === -1) {
            throw new Error('工單不存在');
        }
        
        this.tickets[ticketIndex] = {
            ...this.tickets[ticketIndex],
            ...updates
        };
        
        return this.tickets[ticketIndex];
    }
    
    // 分配維修師傅
    async assignWorker(id, worker, status) {
        return this.updateTicket(id, {
            worker: worker,
            status: status
        });
    }
    
    // 標記工單完成
    async completeTicket(id, status, completedAt) {
        return this.updateTicket(id, {
            status: status,
            completedAt: completedAt
        });
    }
    
    // 刪除工單
    async deleteTicket(id) {
        const ticketIndex = this.tickets.findIndex(ticket => ticket.id === parseInt(id));
        if (ticketIndex === -1) {
            throw new Error('工單不存在');
        }
        
        this.tickets.splice(ticketIndex, 1);
        return { success: true };
    }
    
    // 獲取統計數據
    async getStatistics() {
        const total = this.tickets.length;
        const pending = this.tickets.filter(t => t.status === '待處理').length;
        const processing = this.tickets.filter(t => t.status === '處理中').length;
        const completed = this.tickets.filter(t => t.status === '已完成').length;
        
        return {
            total,
            pending,
            processing,
            completed
        };
    }
    
    // 搜索工單
    async searchTickets(query) {
        const searchTerm = query.toLowerCase();
        return this.tickets.filter(ticket => 
            ticket.location.toLowerCase().includes(searchTerm) ||
            ticket.issue.toLowerCase().includes(searchTerm) ||
            ticket.customerId.toLowerCase().includes(searchTerm) ||
            (ticket.worker && ticket.worker.toLowerCase().includes(searchTerm))
        );
    }
    
    // 備份數據到JSON
    async backupData() {
        return JSON.stringify(this.tickets, null, 2);
    }
    
    // 從JSON恢復數據
    async restoreData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.tickets = data;
            
            // 更新下一個ID
            if (data.length > 0) {
                this.nextId = Math.max(...data.map(t => t.id)) + 1;
            }
            
            return { success: true, count: data.length };
        } catch (error) {
            throw new Error('數據恢復失敗：' + error.message);
        }
    }

    // 客戶註冊
    async registerCustomer(customerData) {
        const existingCustomer = this.customers.find(c => c.account === customerData.account);
        if (existingCustomer) {
            throw new Error('該帳號已被註冊');
        }

        const newCustomer = {
            id: this.nextCustomerId++,
            username: customerData.username,
            account: customerData.account,
            phone: customerData.phone,
            createdAt: new Date().toISOString()
        };

        this.customers.push(newCustomer);
        return newCustomer;
    }

    // 客戶登入驗證
    async loginCustomer(account, password) {
        const customer = this.customers.find(c => c.account === account);
        if (!customer) {
            throw new Error('帳號不存在');
        }

        // 使用電話號碼作為密碼
        if (customer.phone !== password) {
            throw new Error('密碼錯誤');
        }

        return customer;
    }

    // 獲取客戶信息
    async getCustomerById(id) {
        return this.customers.find(customer => customer.id === parseInt(id));
    }

    // 獲取所有客戶
    async getAllCustomers() {
        return [...this.customers];
    }
}

module.exports = { Database };