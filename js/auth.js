// js/auth.js
document.addEventListener('DOMContentLoaded', function() {
    // Get current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // Get form
    const authForm = document.getElementById('auth-form');
    
    // Add form submit event listener
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (currentPage === 'signup.html' || currentPage.includes('signup')) {
                handleSignup();
            } else if (currentPage === 'login.html' || currentPage.includes('login')) {
                handleLogin();
            }
        });
    }
    
    // Check authentication status for dashboard
    if (currentPage === 'dashboard.html' || currentPage.includes('dashboard')) {
        checkAuth();
    }
});

function handleSignup() {
    const fullName = document.querySelector('#name-field input').value;
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[placeholder="Password"]').value;
    const confirmPassword = document.querySelector('input[placeholder="Confirm Password"]').value;
    
    // Validate input
    if (!fullName || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'danger');
        return;
    }
    
    // Make API request
    fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'User created successfully') {
            // Store user data in localStorage for persistence
            localStorage.setItem('user', JSON.stringify({
                userId: data.userId,
                fullName: data.fullName,
                email: data.email
            }));
            
            showAlert('Account created successfully! Redirecting to login...', 'success');
            
            // Redirect to login page after a brief delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showAlert(data.message || 'Something went wrong', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Server error, please try again later', 'danger');
    });
}

function handleLogin() {
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;
    
    // Validate input
    if (!email || !password) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    // Make API request
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Login successful') {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showAlert('Login successful! Redirecting to dashboard...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showAlert(data.message || 'Invalid credentials', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Server error, please try again later', 'danger');
    });
}

function checkAuth() {
    fetch('/api/check-auth')
    .then(response => response.json())
    .then(data => {
        if (!data.isAuthenticated) {
            // Redirect to login if not authenticated
            window.location.href = '/login';
        } else {
            // Update UI with user information
            const user = data.user;
            const userInfoElement = document.getElementById('user-info');
            if (userInfoElement) {
                userInfoElement.textContent = `Welcome, ${user.fullName}!`;
            }
        }
    })
    .catch(error => {
        console.error('Auth check error:', error);
        window.location.href = '/login';
    });
}

function logout() {
    fetch('/api/logout')
    .then(response => response.json())
    .then(data => {
        localStorage.removeItem('user');
        window.location.href = '/';
    })
    .catch(error => {
        console.error('Logout error:', error);
    });
}

function showAlert(message, type) {
    // Create alert element
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type}`;
    alertContainer.textContent = message;
    
    // Find container to insert alert
    const container = document.querySelector('.auth-container');
    const form = document.getElementById('auth-form');
    
    // Insert alert before the form
    container.insertBefore(alertContainer, form);
    
    // Remove alert after 3 seconds
    setTimeout(() => {
        alertContainer.remove();
    }, 3000);
}