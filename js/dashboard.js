// ==================== DASHBOARD.JS ====================
// Funcionalidades do dashboard

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = '/login.html';
        return null;
    }
    return JSON.parse(user);
}

// Initialize dashboard
const currentUser = checkAuth();

if (currentUser) {
    // Set user name
    document.getElementById('userName').textContent = currentUser.name;
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
    });
}

// Section switching
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        
        // Remove active class
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        
        // Add active class
        item.classList.add('active');
        document.getElementById(`${section}-section`).classList.add('active');
        
        // Load section data
        loadSectionData(section);
    });
});

// Load section data
function loadSectionData(section) {
    switch(section) {
        case 'upload':
            initUpload();
            break;
        case 'tickets':
            loadTickets();
            break;
        case 'chat':
            loadChat();
            break;
        case 'admin':
            if (currentUser.role === 'admin') {
                loadAdmin();
            } else {
                showToast('Acesso negado', 'error');
            }
            break;
    }
}

// ==================== UPLOAD SECTION ====================
function initUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const pricingInfo = document.getElementById('pricingInfo');
    
    let selectedFile = null;
    
    // Click to select
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    function handleFileSelect(file) {
        const validation = validateFile(file);
        
        if (!validation.valid) {
            showToast(validation.error, 'error');
            return;
        }
        
        selectedFile = file;
        
        // Show file info
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = formatFileSize(file.size);
        
        uploadArea.style.display = 'none';
        fileInfo.style.display = 'flex';
        
        // Show pricing
        const price = calculatePrice(file.size);
        const sizeInMB = file.size / (1024 * 1024);
        
        document.getElementById('priceValue').textContent = formatCurrency(price);
        document.getElementById('priceInfo').textContent = 
            sizeInMB >= 1 
                ? `R$ 1,00 por MB (${Math.ceil(sizeInMB)} MB)`
                : 'Taxa fixa para arquivos até 1 MB';
        
        pricingInfo.style.display = 'block';
    }
    
    // Remove file
    document.getElementById('removeFile').addEventListener('click', () => {
        selectedFile = null;
        uploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        pricingInfo.style.display = 'none';
        fileInput.value = '';
    });
    
    // Proceed to payment
    document.getElementById('proceedBtn').addEventListener('click', () => {
        if (!selectedFile) return;
        
        // Create ticket
        const ticket = {
            id: generateUUID(),
            userId: currentUser.id,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            amount: calculatePrice(selectedFile.size),
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: new Date().toISOString()
        };
        
        StorageManager.addTicket(ticket);
        
        // Store file in session
        sessionStorage.setItem('currentTicket', JSON.stringify(ticket));
        
        // Redirect to payment
        window.location.href = '/payment.html';
    });
}

// ==================== TICKETS SECTION ====================
function loadTickets() {
    const ticketsList = document.getElementById('ticketsList');
    const tickets = StorageManager.getTicketsByUser(currentUser.id);
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = '<p class="empty-state">Nenhum ticket encontrado</p>';
        return;
    }
    
    ticketsList.innerHTML = tickets.map(ticket => `
        <div class="ticket-card">
            <div class="ticket-header">
                <h3>${ticket.fileName}</h3>
                <span class="ticket-status ${ticket.status}">${ticket.status}</span>
            </div>
            <div class="ticket-info">
                <p>Tamanho: ${formatFileSize(ticket.fileSize)}</p>
                <p>Valor: ${formatCurrency(ticket.amount)}</p>
                <p>Pagamento: <span class="${ticket.paymentStatus}">${ticket.paymentStatus}</span></p>
                <p>Data: ${new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <button class="btn btn-primary" onclick="openChat('${ticket.id}')">
                Abrir Chat
            </button>
        </div>
    `).join('');
}

// ==================== CHAT SECTION ====================
function loadChat() {
    const chatMessages = document.getElementById('chatMessages');
    const tickets = StorageManager.getTicketsByUser(currentUser.id);
    
    if (tickets.length === 0) {
        chatMessages.innerHTML = '<p class="empty-state">Nenhum ticket encontrado</p>';
        return;
    }
    
    // Show first ticket's chat
    if (tickets.length > 0) {
        openChat(tickets[0].id);
    }
}

function openChat(ticketId) {
    const chatMessages = document.getElementById('chatMessages');
    const messages = StorageManager.getMessagesByTicket(ticketId);
    
    if (messages.length === 0) {
        chatMessages.innerHTML = '<p class="empty-state">Nenhuma mensagem ainda</p>';
    } else {
        chatMessages.innerHTML = messages.map(msg => `
            <div class="chat-message ${msg.userId === currentUser.id ? 'sent' : 'received'}">
                <p>${msg.text}</p>
                <span class="timestamp">${new Date(msg.createdAt).toLocaleTimeString('pt-BR')}</span>
            </div>
        `).join('');
    }
    
    // Show input area
    document.querySelector('.chat-input-area').style.display = 'flex';
    
    // Send message
    document.getElementById('sendBtn').onclick = () => {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        
        if (!text) return;
        
        const message = {
            id: generateUUID(),
            ticketId: ticketId,
            userId: currentUser.id,
            text: text,
            createdAt: new Date().toISOString()
        };
        
        StorageManager.addMessage(message);
        input.value = '';
        
        // Reload chat
        openChat(ticketId);
    };
}

// ==================== ADMIN SECTION ====================
function loadAdmin() {
    if (currentUser.role !== 'admin') {
        showToast('Acesso negado', 'error');
        return;
    }
    
    // Admin tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            if (tabName === 'admin-tickets') {
                loadAdminTickets();
            } else if (tabName === 'admin-users') {
                loadAdminUsers();
            }
        });
    });
    
    // Load initial data
    loadAdminTickets();
}

function loadAdminTickets() {
    const list = document.getElementById('adminTicketsList');
    const tickets = StorageManager.getTickets();
    
    if (tickets.length === 0) {
        list.innerHTML = '<p class="empty-state">Nenhum ticket encontrado</p>';
        return;
    }
    
    list.innerHTML = tickets.map(ticket => `
        <div class="admin-item">
            <h4>${ticket.fileName}</h4>
            <p>Cliente: ${ticket.userId}</p>
            <p>Status: ${ticket.status}</p>
            <p>Pagamento: ${ticket.paymentStatus}</p>
            <p>Valor: ${formatCurrency(ticket.amount)}</p>
            <button class="btn btn-primary" onclick="updateTicketStatus('${ticket.id}', 'completed')">
                Marcar como Completo
            </button>
        </div>
    `).join('');
}

function loadAdminUsers() {
    const list = document.getElementById('adminUsersList');
    const users = StorageManager.getUsers();
    
    if (users.length === 0) {
        list.innerHTML = '<p class="empty-state">Nenhum usuário encontrado</p>';
        return;
    }
    
    list.innerHTML = users.map(user => `
        <div class="admin-item">
            <h4>${user.name}</h4>
            <p>Email: ${user.email}</p>
            <p>Role: ${user.role}</p>
            <button class="btn btn-secondary" onclick="banUser('${user.id}')">
                ${user.banned ? 'Desbanir' : 'Banir'}
            </button>
        </div>
    `).join('');
}

function updateTicketStatus(ticketId, status) {
    StorageManager.updateTicket(ticketId, { status });
    showToast('Ticket atualizado', 'success');
    loadAdminTickets();
}

function banUser(userId) {
    const user = StorageManager.getUsers().find(u => u.id === userId);
    if (user) {
        StorageManager.updateUser(userId, { banned: !user.banned });
        showToast('Usuário atualizado', 'success');
        loadAdminUsers();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial section
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section') || 'upload';
    
    document.querySelector(`[data-section="${section}"]`).click();
});

// Export functions for global use
window.openChat = openChat;
window.updateTicketStatus = updateTicketStatus;
window.banUser = banUser;
