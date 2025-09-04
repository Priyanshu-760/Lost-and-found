document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameElement = document.getElementById('userName');
    
    // Modal Elements
    const lostItemBtn = document.getElementById('lostItemBtn');
    const foundItemBtn = document.getElementById('foundItemBtn');
    const checkStatusBtn = document.getElementById('checkStatusBtn');
    const lostItemModal = document.getElementById('lostItemModal');
    const foundItemModal = document.getElementById('foundItemModal');
    const closeBtns = document.querySelectorAll('.close');
    
    // Form Elements
    const lostItemForm = document.getElementById('lostItemForm');
    const foundItemForm = document.getElementById('foundItemForm');
    const lostImage = document.getElementById('lostImage');
    const foundImage = document.getElementById('foundImage');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewFound = document.getElementById('imagePreviewFound');
    
    // Search Elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const filterBtn = document.querySelector('.filter-btn');
    const filterContent = document.querySelector('.filter-content');
    
    // Local Storage Keys
    const CURRENT_USER_KEY = 'lnf_current_user';
    const LOST_ITEMS_KEY = 'lnf_lost_items';
    const FOUND_ITEMS_KEY = 'lnf_found_items';
    
    // Initialize storage if not exists
    if (!localStorage.getItem(LOST_ITEMS_KEY)) {
        localStorage.setItem(LOST_ITEMS_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(FOUND_ITEMS_KEY)) {
        localStorage.setItem(FOUND_ITEMS_KEY, JSON.stringify([]));
    }
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (!currentUser) {
        navigateWithTransition('index.html');
    } else if (userNameElement) {
        userNameElement.textContent = currentUser.name;
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            if (currentUser.profileImage) {
                userAvatar.src = currentUser.profileImage;
            } else {
                userAvatar.src = 'img/default-avatar.jpeg';
            }
        }
    }
    
    // Event Listeners
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
        });
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem(CURRENT_USER_KEY);
            window.location.href = 'index.html';
        });
    }
    
    // Modal Controls
    if (lostItemBtn) {
        lostItemBtn.addEventListener('click', function() {
            lostItemModal.style.display = 'block';
            setTimeout(() => {
                lostItemModal.classList.add('show');
            }, 10);
            // Pre-fill email with user's email
            if (document.getElementById('lostEmail')) {
                document.getElementById('lostEmail').value = currentUser.email;
            }
        });
    }
    
    if (foundItemBtn) {
        foundItemBtn.addEventListener('click', function() {
            foundItemModal.style.display = 'block';
            setTimeout(() => {
                foundItemModal.classList.add('show');
            }, 10);
            // Pre-fill email with user's email
            if (document.getElementById('foundEmail')) {
                document.getElementById('foundEmail').value = currentUser.email;
            }
        });
    }
    
    if (checkStatusBtn) {
        checkStatusBtn.addEventListener('click', function() {
            navigateWithTransition('status.html');
        });
    }
    
    // Close modals
    closeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            lostItemModal.classList.remove('show');
            foundItemModal.classList.remove('show');
            setTimeout(() => {
                lostItemModal.style.display = 'none';
                foundItemModal.style.display = 'none';
            }, 300);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === lostItemModal) {
            lostItemModal.classList.remove('show');
            setTimeout(() => {
                lostItemModal.style.display = 'none';
            }, 300);
        }
        if (e.target === foundItemModal) {
            foundItemModal.classList.remove('show');
            setTimeout(() => {
                foundItemModal.style.display = 'none';
            }, 300);
        }
    });
    
    // Image Preview for Lost Item
    if (lostImage) {
        lostImage.addEventListener('change', function() {
            previewImage(this, imagePreview);
        });
    }
    
    // Image Preview for Found Item
    if (foundImage) {
        foundImage.addEventListener('change', function() {
            previewImage(this, imagePreviewFound);
        });
    }
    
    // Form Submissions
    if (lostItemForm) {
        lostItemForm.addEventListener('submit', handleLostItemSubmit);
    }
    
    if (foundItemForm) {
        foundItemForm.addEventListener('submit', handleFoundItemSubmit);
    }
    
    // Filter dropdown
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            filterContent.style.display = filterContent.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close filter dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.filter-dropdown')) {
                filterContent.style.display = 'none';
            }
        });
    }
    
    // Search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Functions
    function previewImage(input, previewElement) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                previewElement.innerHTML = `<img src="${e.target.result}" alt="Image Preview">`;
            };
            
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    function handleLostItemSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('lostTitle').value;
        const category = document.getElementById('lostCategory').value;
        const description = document.getElementById('lostDescription').value;
        const date = document.getElementById('lostDate').value;
        const location = document.getElementById('lostLocation').value;
        const phone = document.getElementById('lostPhone').value;
        const email = document.getElementById('lostEmail').value;
        
        // Get image if available
        let imageData = null;
        if (lostImage.files && lostImage.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(lostImage.files[0]);
            reader.onload = function() {
                imageData = reader.result;
                saveItem('lost', title, category, description, date, location, phone, email, imageData);
            };
        } else {
            saveItem('lost', title, category, description, date, location, phone, email, imageData);
        }
    }
    
    function handleFoundItemSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('foundTitle').value;
        const category = document.getElementById('foundCategory').value;
        const description = document.getElementById('foundDescription').value;
        const date = document.getElementById('foundDate').value;
        const location = document.getElementById('foundLocation').value;
        const phone = document.getElementById('foundPhone').value;
        const email = document.getElementById('foundEmail').value;
        
        // Get image if available
        let imageData = null;
        if (foundImage.files && foundImage.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(foundImage.files[0]);
            reader.onload = function() {
                imageData = reader.result;
                saveItem('found', title, category, description, date, location, phone, email, imageData);
            };
        } else {
            saveItem('found', title, category, description, date, location, phone, email, imageData);
        }
    }
    
    function saveItem(type, title, category, description, date, location, phone, email, imageData) {
        const storageKey = type === 'lost' ? LOST_ITEMS_KEY : FOUND_ITEMS_KEY;
        const items = JSON.parse(localStorage.getItem(storageKey));
        
        const newItem = {
            id: generateId(),
            userId: currentUser.id,
            title,
            category,
            description,
            date,
            location,
            phone,
            email,
            image: imageData,
            createdAt: new Date().toISOString(),
            status: 'pending',
            responses: []
        };
        
        items.push(newItem);
        localStorage.setItem(storageKey, JSON.stringify(items));
        
        alert(`Your ${type} item report has been submitted successfully!`);
        
        // Close modal and reset form
        if (type === 'lost') {
            lostItemModal.style.display = 'none';
            lostItemForm.reset();
            imagePreview.innerHTML = '';
        } else {
            foundItemModal.style.display = 'none';
            foundItemForm.reset();
            imagePreviewFound.innerHTML = '';
        }
    }
    
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            // Get selected categories
            const selectedCategories = [];
            document.querySelectorAll('.filter-content input[type="checkbox"]:checked').forEach(checkbox => {
                selectedCategories.push(checkbox.value);
            });
            
            // Store search parameters in session storage
            sessionStorage.setItem('search_query', query);
            sessionStorage.setItem('search_categories', JSON.stringify(selectedCategories));
            
            // Redirect to feed page with search results
            navigateWithTransition('feed.html');
        }
    }
    
    // Helper function to generate ID
    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
});