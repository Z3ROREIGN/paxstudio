// ==================== MAIN.JS ====================
// Funcionalidades gerais da página

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Smooth scroll para links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user && window.location.pathname === '/login.html') {
        window.location.href = '/dashboard.html';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/index.html';
}

// Export functions for use in other files
window.showToast = showToast;
window.formatCurrency = formatCurrency;
window.formatFileSize = formatFileSize;
window.validateEmail = validateEmail;
window.generateUUID = generateUUID;
window.logout = logout;
