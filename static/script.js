// Get form and role elements
const loginForm = document.getElementById('loginForm');
const studentRole = document.getElementById('student');
const adminRole = document.getElementById('admin');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');

const credentials = {
    student: {
        username: 'student',
        password: 'student123'
    },
    admin: {
        username: 'admin',
        password: 'admin123'
    }
};

// Add role selection animation
const roleOptions = document.querySelectorAll('.role-option');
roleOptions.forEach(option => {
    option.addEventListener('click', function() {
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;
        
        // Add visual feedback
        roleOptions.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
    });
});


loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const selectedRole = studentRole.checked ? 'student' : 'admin';
    const rememberMe = rememberCheckbox.checked;
    
    // Validate credentials
    if (validateLogin(username, password, selectedRole)) {
       
        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
            localStorage.setItem('rememberedRole', selectedRole);
        }
        
        
        showSuccess(selectedRole);
        
        setTimeout(() => {
            if (selectedRole === 'student') {
                window.location.href = '/studentdash/';
            } else {
                window.location.href = '/admindash/';
            }
        }, 1500);
    } else {
        showError('Invalid username or password for the selected role');
    }
});


function validateLogin(username, password, role) {
    // Check against demo credentials
    return (
        username === credentials[role].username &&
        password === credentials[role].password
    );
}


function showSuccess(role) {
    const message = document.createElement('div');
    message.className = 'alert alert-success';
    message.textContent = `Successfully logged in as ${role}!`;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Show error message
function showError(errorMessage) {
    const message = document.createElement('div');
    message.className = 'alert alert-error';
    message.textContent = errorMessage;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(message);
    
    // Shake animation for form
    loginForm.style.animation = 'shake 0.5s';
    setTimeout(() => {
        loginForm.style.animation = '';
    }, 500);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);


window.addEventListener('load', function() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const rememberedRole = localStorage.getItem('rememberedRole');
    
    if (rememberedUser && rememberedRole) {
        usernameInput.value = rememberedUser;
        rememberCheckbox.checked = true;
        
        if (rememberedRole === 'admin') {
            adminRole.checked = true;
        } else {
            studentRole.checked = true;
        }
    }
});

// Password visibility toggle (optional enhancement)
const passwordField = document.getElementById('password');
passwordField.addEventListener('dblclick', function() {
    this.type = this.type === 'password' ? 'text' : 'password';
});


console.log('Demo Credentials:');
console.log('Student - Username: student123, Password: student123');
console.log('Admin - Username: admin, Password: admin123');
