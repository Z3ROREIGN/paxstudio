// ==================== AUTH.JS ====================
// Funcionalidades de autenticação (login/registro)

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Tab links
document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = link.dataset.tab;
        
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to target tab
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Validate
        if (!email || !password) {
            showToast('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showToast('Email inválido', 'error');
            return;
        }
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user) {
            showToast('Usuário não encontrado', 'error');
            return;
        }
        
        // Simple password check (in production, use bcrypt on server)
        if (user.password !== password) {
            showToast('Senha incorreta', 'error');
            return;
        }
        
        // Store user session
        localStorage.setItem('user', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }));
        
        localStorage.setItem('token', generateUUID());
        
        showToast('Login realizado com sucesso!', 'success');
        
        // Redirect based on role
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = '/dashboard.html?section=admin';
            } else {
                window.location.href = '/dashboard.html';
            }
        }, 1000);
    });
}

// Register form submission
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        
        // Validate
        if (!name || !email || !password || !passwordConfirm) {
            showToast('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showToast('Email inválido', 'error');
            return;
        }
        
        if (password.length < 6) {
            showToast('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }
        
        if (password !== passwordConfirm) {
            showToast('As senhas não correspondem', 'error');
            return;
        }
        
        // Get existing users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            showToast('Este email já está registrado', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: generateUUID(),
            name: name,
            email: email,
            password: password, // In production, hash this!
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        // Add user to storage
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Store user session
        localStorage.setItem('user', JSON.stringify({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        }));
        
        localStorage.setItem('token', generateUUID());
        
        showToast('Conta criada com sucesso!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1000);
    });
}

// Initialize demo data
function initializeDemoData() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if admin user exists
    if (!users.some(u => u.email === 'admin@paxstudio.com')) {
        users.push({
            id: generateUUID(),
            name: 'Administrador',
            email: 'admin@paxstudio.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDemoData();
});
