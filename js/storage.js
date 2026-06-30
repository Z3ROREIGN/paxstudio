// ==================== STORAGE.JS ====================
// Gerenciamento de dados no localStorage

// Storage Manager
const StorageManager = {
    // Users
    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    },
    
    addUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    },
    
    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('users', JSON.stringify(users));
        }
    },
    
    // Tickets
    getTickets() {
        return JSON.parse(localStorage.getItem('tickets') || '[]');
    },
    
    addTicket(ticket) {
        const tickets = this.getTickets();
        tickets.push(ticket);
        localStorage.setItem('tickets', JSON.stringify(tickets));
    },
    
    updateTicket(ticketId, updates) {
        const tickets = this.getTickets();
        const index = tickets.findIndex(t => t.id === ticketId);
        if (index !== -1) {
            tickets[index] = { ...tickets[index], ...updates };
            localStorage.setItem('tickets', JSON.stringify(tickets));
        }
    },
    
    getTicketsByUser(userId) {
        return this.getTickets().filter(t => t.userId === userId);
    },
    
    // Messages
    getMessages() {
        return JSON.parse(localStorage.getItem('messages') || '[]');
    },
    
    addMessage(message) {
        const messages = this.getMessages();
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
    },
    
    getMessagesByTicket(ticketId) {
        return this.getMessages().filter(m => m.ticketId === ticketId);
    },
    
    // Settings
    getSettings() {
        return JSON.parse(localStorage.getItem('settings') || JSON.stringify({
            rateMB: 1.00,
            rateFixed: 3.50,
            maxFileSize: 500 // MB
        }));
    },
    
    updateSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    }
};

// Calculate price based on file size
function calculatePrice(fileSize) {
    const settings = StorageManager.getSettings();
    const sizeInMB = fileSize / (1024 * 1024);
    
    if (sizeInMB >= 1) {
        return Math.ceil(sizeInMB) * settings.rateMB;
    } else {
        return settings.rateFixed;
    }
}

// Validate file
function validateFile(file) {
    const settings = StorageManager.getSettings();
    const maxSizeBytes = settings.maxFileSize * 1024 * 1024;
    
    if (!file.name.endsWith('.zip')) {
        return { valid: false, error: 'Apenas arquivos .ZIP são permitidos' };
    }
    
    if (file.size > maxSizeBytes) {
        return { valid: false, error: `Arquivo muito grande. Máximo: ${settings.maxFileSize}MB` };
    }
    
    return { valid: true };
}

// Export for global use
window.StorageManager = StorageManager;
window.calculatePrice = calculatePrice;
window.validateFile = validateFile;
