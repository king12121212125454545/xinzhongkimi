// MCP服務器地址 - 部署後需要更新
const MCP_SERVER_URL = 'https://your-mcp-server.aliyun.com';

// 當前篩選狀態
let currentFilter = '';

// DOM 加載完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    checkAdminLogin();
    setupEventListeners();
});

// 設置事件監聽器
function setupEventListeners() {
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('statusFilter').addEventListener('change', handleFilterChange);
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    document.getElementById('assignForm').addEventListener('submit', handleAssignWorker);
    
    // 關閉模態框
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// 管理員登入
function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === 'XINZHONG' && password === 'xinzhong') {
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
        loadAllTickets();
    } else {
        alert('管理員賬號或密碼錯誤！');
    }
}

// 顯示管理面板
function showAdminPanel() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

// 檢查管理員登入狀態
function checkAdminLogin() {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showAdminPanel();
        loadAllTickets();
    }
}

// 加載所有工單
async function loadAllTickets() {
    try {
        const response = await fetch(`${MCP_SERVER_URL}/api/tickets`);
        const tickets = await response.json();
        
        updateStats(tickets);
        displayTickets(tickets);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('allTickets').innerHTML = '<p>加載失敗，請稍後再試</p>';
    }
}

// 更新統計數據
function updateStats(tickets) {
    const total = tickets.length;
    const pending = tickets.filter(t => t.status === '待處理').length;
    const processing = tickets.filter(t => t.status === '處理中').length;
    const completed = tickets.filter(t => t.status === '已完成').length;
    
    document.getElementById('totalTickets').textContent = total;
    document.getElementById('pendingTickets').textContent = pending;
    document.getElementById('processingTickets').textContent = processing;
    document.getElementById('completedTickets').textContent = completed;
}

// 顯示工單列表
function displayTickets(tickets) {
    const container = document.getElementById('allTickets');
    
    let filteredTickets = tickets;
    if (currentFilter) {
        filteredTickets = tickets.filter(t => t.status === currentFilter);
    }
    
    if (filteredTickets.length === 0) {
        container.innerHTML = '<p>暫無工單記錄</p>';
        return;
    }
    
    container.innerHTML = filteredTickets.map(ticket => `
        <div class="ticket-card">
            <h3>工單 #${ticket.id}</h3>
            <div class="ticket-info">
                <span><strong>客戶：</strong>${ticket.customerId}</span>
                <span><strong>地點：</strong>${ticket.location} ${ticket.floor}</span>
                <span><strong>問題：</strong>${ticket.issue}</span>
                <span><strong>聯繫：</strong>${ticket.contact}</span>
                <span><strong>提交時間：</strong>${new Date(ticket.createdAt).toLocaleString()}</span>
                <span><strong>狀態：</strong><span class="status status-${ticket.status}">${ticket.status}</span></span>
                ${ticket.worker ? `<span><strong>維修師傅：</strong>${ticket.worker}</span>` : ''}
                ${ticket.completedAt ? `<span><strong>完成時間：</strong>${new Date(ticket.completedAt).toLocaleString()}</span>` : ''}
            </div>
            <div class="ticket-actions">
                ${ticket.status === '待處理' ? 
                    `<button class="assign-btn" onclick="openAssignModal('${ticket.id}')">分配師傅</button>` : ''}
                ${ticket.status === '處理中' ? 
                    `<button class="complete-btn" onclick="markComplete('${ticket.id}')">標記完成</button>` : ''}
            </div>
        </div>
    `).join('');
}

// 篩選工單
function handleFilterChange(e) {
    currentFilter = e.target.value;
    loadAllTickets();
}

// 打開分配師傅模態框
function openAssignModal(ticketId) {
    document.getElementById('ticketId').value = ticketId;
    document.getElementById('assignModal').style.display = 'flex';
}

// 關閉模態框
function closeModal() {
    document.getElementById('assignModal').style.display = 'none';
    document.getElementById('assignForm').reset();
}

// 分配維修師傅
async function handleAssignWorker(e) {
    e.preventDefault();
    
    const ticketId = document.getElementById('ticketId').value;
    const workerName = document.getElementById('workerName').value;
    
    try {
        const response = await fetch(`${MCP_SERVER_URL}/api/tickets/${ticketId}/assign`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                worker: workerName,
                status: '處理中'
            })
        });
        
        if (response.ok) {
            alert('分配成功！');
            closeModal();
            loadAllTickets();
        } else {
            alert('分配失敗，請稍後再試');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('網絡錯誤，請檢查網絡連接');
    }
}

// 標記工單完成
async function markComplete(ticketId) {
    if (!confirm('確認標記此工單為已完成？')) return;
    
    try {
        const response = await fetch(`${MCP_SERVER_URL}/api/tickets/${ticketId}/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: '已完成',
                completedAt: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            alert('工單已完成！');
            loadAllTickets();
        } else {
            alert('操作失敗，請稍後再試');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('網絡錯誤，請檢查網絡連接');
    }
}

// 導出Excel
function exportToExcel() {
    fetch(`${MCP_SERVER_URL}/api/tickets/export`)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `工單記錄_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('導出失敗，請稍後再試');
        });
}

// 管理員登出
function handleLogout() {
    localStorage.removeItem('adminLoggedIn');
    location.reload();
}