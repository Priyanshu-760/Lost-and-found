document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileForm = document.getElementById('profileForm');
    const profileImageUpload = document.getElementById('profileImageUpload');
    const profileImage = document.getElementById('profileImage');
    const userNameDisplay = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    // Local Storage Keys
    const USERS_KEY = 'lnf_users';
    const CURRENT_USER_KEY = 'lnf_current_user';
    
    // Check if user is logged in
    if (!localStorage.getItem(CURRENT_USER_KEY)) {
        navigateWithTransition('index.html');
        return;
    }
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    
    // Populate user info in header
    userNameDisplay.textContent = currentUser.name;
    if (currentUser.profileImage) {
        userAvatar.src = currentUser.profileImage;
    } else {
        userAvatar.src = 'img/default-avatar.jpeg';
    }
    
    // Populate form with user data
    populateProfileForm();
    
    // Event Listeners
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.style.left = '0';
        });
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', function() {
            sidebar.style.left = '-250px';
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem(CURRENT_USER_KEY);
            window.location.href = 'index.html';
        });
    }
    
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    if (profileImageUpload) {
        profileImageUpload.addEventListener('change', handleImageUpload);
    }
    
    // Functions
    function populateProfileForm() {
        document.getElementById('fullName').value = currentUser.name || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('phone').value = currentUser.phone || '';
        document.getElementById('department').value = currentUser.department || '';
        document.getElementById('bio').value = currentUser.bio || '';
        
        if (currentUser.profileImage) {
            profileImage.src = currentUser.profileImage;
        } else {
            profileImage.src = 'img/default-avatar.jpeg';
        }
    }
    
    function handleProfileUpdate(e) {
        e.preventDefault();
        
        const name = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const department = document.getElementById('department').value;
        const bio = document.getElementById('bio').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords if provided
        if (password && password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Get all users
        const users = JSON.parse(localStorage.getItem(USERS_KEY));
        
        // Find and update current user
        const updatedUsers = users.map(user => {
            if (user.id === currentUser.id) {
                // Update user data
                user.name = name;
                user.phone = phone;
                user.department = department;
                user.bio = bio;
                
                // Update password if provided
                if (password) {
                    user.password = password;
                }
                
                // Update profile image if changed
                if (currentUser.profileImage) {
                    user.profileImage = currentUser.profileImage;
                }
            }
            return user;
        });
        
        // Update users in local storage
        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        
        // Update current user
        const updatedCurrentUser = {
            ...currentUser,
            name,
            phone,
            department,
            bio
        };
        
        if (password) {
            updatedCurrentUser.password = password;
        }
        
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrentUser));
        
        // Update display name
        userNameDisplay.textContent = name;
        
        alert('Profile updated successfully!');
    }
    
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file is an image
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }
        
        // Read and display the image
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            
            // Update profile image and user avatar
            profileImage.src = imageData;
            userAvatar.src = imageData;
            
            // Update current user
            currentUser.profileImage = imageData;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
            
            // Update user in users array
            const users = JSON.parse(localStorage.getItem(USERS_KEY));
            const updatedUsers = users.map(user => {
                if (user.id === currentUser.id) {
                    user.profileImage = imageData;
                }
                return user;
            });
            
            localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        };
        
        reader.readAsDataURL(file);
    }
});