// User authentication and session management

// Check if user is logged in
function checkAuth() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Get all users
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Sign up a new user
function signUp(name, email, password) {
    const users = getUsers();
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        return { success: false, message: 'Email already in use' };
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In a real app, passwords should be hashed
        bookings: [],
        rewardsPoints: 100, // Starting bonus
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto-login
    localStorage.setItem('currentUser', JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
    }));
    
    return { success: true, user: newUser };
}

// Sign in a user
function signIn(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return { success: false, message: 'Invalid email or password' };
    }
    
    // Set current user
    localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
    }));
    
    return { success: true, user };
}

// Sign out
function signOut() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Add a booking to user's account
function addBooking(booking) {
    const users = getUsers();
    const currentUser = getCurrentUser();
    
    if (!currentUser) return false;
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return false;
    
    // Add booking
    users[userIndex].bookings.unshift({
        ...booking,
        id: 'BK-' + Date.now().toString().slice(-6),
        bookingDate: new Date().toISOString(),
        status: 'Confirmed'
    });
    
    // Add rewards points (1 point per $10 spent)
    const pointsEarned = Math.floor(parseFloat(booking.amount.replace('$', '')) / 10);
    users[userIndex].rewardsPoints = (users[userIndex].rewardsPoints || 0) + pointsEarned;
    
    saveUsers(users);
    return true;
}

// Get user's bookings
function getUserBookings() {
    const users = getUsers();
    const currentUser = getCurrentUser();
    
    if (!currentUser) return [];
    
    const user = users.find(u => u.id === currentUser.id);
    return user ? user.bookings || [] : [];
}

// Initialize users array if it doesn't exist
if (!localStorage.getItem('users')) {
    saveUsers([]);
}

// Handle signup form submission
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        const result = signUp(name, email, password);
        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            alert(result.message);
        }
    });
}

// Handle signin form submission
if (document.getElementById('signinForm')) {
    document.getElementById('signinForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        const result = signIn(email, password);
        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            alert(result.message);
        }
    });
}

// Handle logout
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        signOut();
    });
}

// Redirect to login if trying to access dashboard while not authenticated
if (window.location.pathname.includes('dashboard.html') && !checkAuth()) {
    window.location.href = 'signin.html';
}

// Redirect to dashboard if already logged in
if ((window.location.pathname.includes('signin.html') || 
     window.location.pathname.includes('signup.html')) && checkAuth()) {
    window.location.href = 'dashboard.html';
}
