document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const registerLink = document.getElementById('registerLink');
    const registerModal = document.getElementById('registerModal');
    const registerForm = document.getElementById('registerForm');
    const closeBtn = document.querySelector('.close');
    
    // Local Storage Keys
    const USERS_KEY = 'lnf_users';
    const CURRENT_USER_KEY = 'lnf_current_user';
    
    // Initialize users if not exists
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
    
    // Check if user is already logged in
    if (localStorage.getItem(CURRENT_USER_KEY)) {
        navigateWithTransition('home.html');
    }
    
    // Event Listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.style.display = 'block';
            setTimeout(() => {
                registerModal.classList.add('show');
            }, 10);
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            registerModal.classList.remove('show');
            setTimeout(() => {
                registerModal.style.display = 'none';
            }, 300);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === registerModal) {
            registerModal.classList.remove('show');
            setTimeout(() => {
                registerModal.style.display = 'none';
            }, 300);
        }
    });
    
    // Login Handler
    function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const users = JSON.parse(localStorage.getItem(USERS_KEY));
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Set current user
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            window.location.href = 'home.html';
        } else {
            alert('Invalid email or password. Please try again.');
        }
    }
    
    // Register Handler
    function handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem(USERS_KEY));
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            alert('Email already registered. Please use a different email.');
            return;
        }
        
        // Create new user
        const newUser = {
            id: generateId(),
            name,
            email,
            password,
            phone: '',
            department: '',
            bio: '',
            profileImage: 'img/default-avatar.jpeg',
            createdAt: new Date().toISOString()
        };
        
        // Add to users array
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        // Auto login
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        
        alert('Registration successful!');
        window.location.href = 'home.html';
    }
    
    // Helper function to generate ID
    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
});