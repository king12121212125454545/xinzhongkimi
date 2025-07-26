// MCP服務器地址 - 部署後需要更新
const MCP_SERVER_URL = 'https://your-mcp-server.aliyun.com';

// 當前登入用戶
let currentUser = null;

// 標籤切換功能
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // 移除所有活動狀態
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // 激活目標標籤
            button.classList.add('active');
            document.getElementById(`${targetTab}Tab`).classList.add('active');
        });
    });

    // 檢查登入狀態
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        document.querySelector('.auth-section').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        currentUser = userData.id;
        loadUserTickets(userData.id);
    }
});

// 客戶註冊
async function registerCustomer(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const account = document.getElementById('registerAccount').value;
    const phone = document.getElementById('registerPhone').value;

    try {
        const response = await fetch(`${MCP_SERVER_URL}/api/customers/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, account, phone })
        });

        const result = await response.json();
        
        if (response.ok) {
            alert('註冊成功！請使用您的帳號和電話號碼登入。');
            document.getElementById('registerForm').reset();
            // 切換到登入標籤
            document.querySelector('[data-tab="login"]').click();
        } else {
            alert(`註冊失敗：${result.error}`);
        }
    } catch (error) {
        alert('註冊失敗，請檢查網絡連接');
    }
}

// 客戶登入
async function loginCustomer(event) {
    event.preventDefault();
    
    const account = document.getElementById('loginAccount').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${MCP_SERVER_URL}/api/customers/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ account, password })
        });

        const customer = await response.json();
        
        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(customer));
            document.querySelector('.auth-section').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            currentUser = customer.id;
            loadUserTickets(customer.id);
            document.getElementById('loginForm').reset();
        } else {
            alert(`登入失敗：${customer.error}`);
        }
    } catch (error) {
        alert('登入失敗，請檢查網絡連接');
    }
}

// 註冊表單處理
document.getElementById('registerForm').addEventListener('submit', registerCustomer);

// 登入表單處理
document.getElementById('loginForm').addEventListener('submit', loginCustomer);

// 提交新工單
document.getElementById('ticketForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const ticketData = {
        customerId: currentUser,
        location: document.getElementById('location').value,
        floor: document.getElementById('floor').value,
        issue: document.getElementById('issue').value,
        contact: document.getElementById('contact').value,
        status: '待處理',
        createdAt: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${MCP_SERVER_URL}/api/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticketData)
        });
        
        if (response.ok) {
            alert('工單提交成功！');
            document.getElementById('ticketForm').reset();
            loadUserTickets(currentUser);
        } else {
            alert('提交失敗，請稍後再試');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('網絡錯誤，請檢查網絡連接');
    }
});

// 加載用戶工單
async function loadUserTickets(customerId) {
    if (!customerId) return;
    
    try {
        const response = await fetch(`${MCP_SERVER_URL}/api/tickets/user/${customerId}`);
        const tickets = await response.json();
        
        displayUserTickets(tickets);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('myTickets').innerHTML = '<p>加載失敗，請稍後再試</p>';
    }
}

// 顯示用戶工單
function displayUserTickets(tickets) {
    const container = document.getElementById('myTickets');
    
    if (tickets.length === 0) {
        container.innerHTML = '<p>暫無工單記錄</p>';
        return;
    }
    
    container.innerHTML = tickets.map(ticket => `
        <div class="ticket-card">
            <h3>工單 #${ticket.id}</h3>
            <div class="ticket-info">
                <span><strong>地點：</strong>${ticket.location} ${ticket.floor}</span>
                <span><strong>問題：</strong>${ticket.issue}</span>
                <span><strong>提交時間：</strong>${new Date(ticket.createdAt).toLocaleString()}</span>
                <span><strong>狀態：</strong><span class="status status-${ticket.status}">${ticket.status}</span></span>
                ${ticket.worker ? `<span><strong>維修師傅：</strong>${ticket.worker}</span>` : ''}
                ${ticket.completedAt ? `<span><strong>完成時間：</strong>${new Date(ticket.completedAt).toLocaleString()}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// 登出
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    document.querySelector('.auth-section').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginForm').reset();
}