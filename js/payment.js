// ==================== PAYMENT.JS ====================
// Funcionalidades de pagamento

// Check authentication
const user = localStorage.getItem('user');
if (!user) {
    window.location.href = '/login.html';
}

const currentUser = JSON.parse(user);
const currentTicket = JSON.parse(sessionStorage.getItem('currentTicket'));

if (!currentTicket) {
    window.location.href = '/dashboard.html';
}

// Load ticket data
document.getElementById('summaryFileName').textContent = currentTicket.fileName;
document.getElementById('summaryFileSize').textContent = formatFileSize(currentTicket.fileSize);
document.getElementById('summaryTotal').textContent = formatCurrency(currentTicket.amount);

const sizeInMB = currentTicket.fileSize / (1024 * 1024);
document.getElementById('summaryServiceType').textContent = 
    sizeInMB >= 1 
        ? `Correção de código (${Math.ceil(sizeInMB)} MB)`
        : 'Correção de código (até 1 MB)';

// Payment form
const paymentForm = document.getElementById('paymentForm');
const processingModal = document.getElementById('processingModal');

paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const cardName = document.getElementById('cardName').value;
    const cardEmail = document.getElementById('cardEmail').value;
    
    // Validate
    if (!cardName || !cardEmail) {
        showToast('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    if (!validateEmail(cardEmail)) {
        showToast('Email inválido', 'error');
        return;
    }
    
    // Show processing modal
    processingModal.style.display = 'flex';
    
    // Simulate payment processing
    setTimeout(() => {
        // Update ticket status
        StorageManager.updateTicket(currentTicket.id, {
            paymentStatus: 'completed',
            status: 'active'
        });
        
        // Hide modal
        processingModal.style.display = 'none';
        
        // Show success message
        showToast('Pagamento realizado com sucesso!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            sessionStorage.removeItem('currentTicket');
            window.location.href = `/dashboard.html?section=chat`;
        }, 1500);
    }, 3000);
});

// Format card number
document.getElementById('cardNumber').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '');
    let formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    e.target.value = formatted;
});

// Format expiry
document.getElementById('cardExpiry').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});

// Limit CVV
document.getElementById('cardCVV').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});
