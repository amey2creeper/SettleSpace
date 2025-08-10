// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    initializeDemo();
});

function initializeAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        initializePasswordToggle();
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        initializePasswordToggle();
        initializeUserTypeChange();
    }
}

function initializePasswordToggle() {
    const toggleButtons = document.querySelectorAll('.password-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

function initializeUserTypeChange() {
    const userTypeSelect = document.getElementById('user_type');
    const upiGroup = document.getElementById('upi-group');
    
    if (userTypeSelect && upiGroup) {
        userTypeSelect.addEventListener('change', function() {
            if (this.value === 'seller') {
                upiGroup.style.display = 'block';
                document.getElementById('upi_id').required = true;
            } else {
                upiGroup.style.display = 'none';
                document.getElementById('upi_id').required = false;
            }
        });
    }
}

function initializeDemo() {
    const demoButtons = document.querySelectorAll('.demo-btn');
    
    demoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const email = this.dataset.email;
            const password = this.dataset.password;
            
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            
            if (emailInput && passwordInput) {
                emailInput.value = email;
                passwordInput.value = password;
                
                // Trigger form submission
                const form = document.getElementById('login-form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        });
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('remember-me');
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoader = submitButton.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    submitButton.disabled = true;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        const users = JSON.parse(localStorage.getItem('settlespace_users') || '[]');
        const hashedPassword = hashPassword(password);
        const user = users.find(u => u.email === email && u.password === hashedPassword);
        
        if (user) {
            // Store user data (without password)
            const { password: _, ...userWithoutPassword } = user;
            localStorage.setItem('settlespace_user', JSON.stringify(userWithoutPassword));
            
            if (rememberMe) {
                localStorage.setItem('settlespace_remember', 'true');
            }
            
            showNotification('Login successful!', 'success');
            
            // Redirect based on user type
            setTimeout(() => {
                switch (user.userType) {
                    case 'admin':
                        window.location.href = 'admin_panel.html';
                        break;
                    case 'seller':
                        window.location.href = 'seller_dashboard.html';
                        break;
                    default:
                        window.location.href = 'index.html';
                }
            }, 1500);
        } else {
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        showNotification(error.message, 'error');
        
        // Reset form state
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        submitButton.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoader = submitButton.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    submitButton.disabled = true;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
        const users = JSON.parse(localStorage.getItem('settlespace_users') || '[]');
        const email = formData.get('email');
        
        // Check if user already exists
        if (users.some(u => u.email === email)) {
            throw new Error('User with this email already exists');
        }
        
        // Dispatch login event for chatbot
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
        
        // Create new user
        const newUser = {
            id: 'user-' + Date.now() + Math.random().toString(36).substr(2, 9),
            name: formData.get('name'),
            email: email,
            phone: formData.get('phone'),
            password: hashPassword(password),
            userType: formData.get('user_type'),
            upiId: formData.get('upi_id') || null,
            verified: false,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('settlespace_users', JSON.stringify(users));
        
        // Auto-login user
        const { password: _, ...userWithoutPassword } = newUser;
        localStorage.setItem('settlespace_user', JSON.stringify(userWithoutPassword));
        
        // Dispatch login event for chatbot
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
        
        showNotification('Account created successfully!', 'success');
        
        // Redirect based on user type
        setTimeout(() => {
            switch (newUser.userType) {
                case 'seller':
                    window.location.href = 'seller_dashboard.html';
                    break;
                default:
                    window.location.href = 'profile.html';
            }
        }, 1500);
        
    } catch (error) {
        showNotification(error.message, 'error');
        
        // Reset form state
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        submitButton.disabled = false;
    }
}

function hashPassword(password) {
    // Simple hash function for demo purposes
    // In production, use proper hashing libraries
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}