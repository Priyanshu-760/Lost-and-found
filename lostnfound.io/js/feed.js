document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameElement = document.getElementById('userName');
    const feedItems = document.getElementById('feedItems');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const responseModal = document.getElementById('responseModal');
    const responseForm = document.getElementById('responseForm');
    const responseItemDetails = document.getElementById('responseItemDetails');
    const closeBtns = document.querySelectorAll('.close');
    
    // Search Elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const filterBtn = document.querySelector('.filter-btn');
    const filterContent = document.querySelector('.filter-content');
    
    // Local Storage Keys
    const CURRENT_USER_KEY = 'lnf_current_user';
    const LOST_ITEMS_KEY = 'lnf_lost_items';
    const FOUND_ITEMS_KEY = 'lnf_found_items';
    
    // Current item being responded to
    let currentItem = null;
    let currentItemType = null;
    
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
    
    // Tab Controls
    tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            tabBtns.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Filter items based on tab
            const tabType = this.getAttribute('data-tab');
            displayItems(tabType);
        });
    });
    
    // Close modals
closeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        responseModal.classList.remove('show');
        setTimeout(() => {
            responseModal.style.display = 'none';
        }, 300);
    });
});
    
    // Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === responseModal) {
        responseModal.classList.remove('show');
        setTimeout(() => {
            responseModal.style.display = 'none';
        }, 300);
    }
});
    
    // Response form submission
    if (responseForm) {
        responseForm.addEventListener('submit', handleResponseSubmit);
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
    
    // Check for search parameters from home page
    const searchQuery = sessionStorage.getItem('search_query');
    const searchCategories = JSON.parse(sessionStorage.getItem('search_categories'));
    
    if (searchQuery) {
        searchInput.value = searchQuery;
        
        // Check category filters if any
        if (searchCategories && searchCategories.length > 0) {
            searchCategories.forEach(category => {
                const checkbox = document.querySelector(`.filter-content input[value="${category}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        performSearch();
        
        // Clear session storage
        sessionStorage.removeItem('search_query');
        sessionStorage.removeItem('search_categories');
    } else {
        // Display all items by default
        displayItems('all');
    }
    
    // Functions
    function displayItems(type) {
        // Clear current items
        feedItems.innerHTML = '';
        
        // Get items from storage
        const lostItems = JSON.parse(localStorage.getItem(LOST_ITEMS_KEY)) || [];
        const foundItems = JSON.parse(localStorage.getItem(FOUND_ITEMS_KEY)) || [];
        
        let itemsToDisplay = [];
        
        if (type === 'all' || type === 'lost') {
            itemsToDisplay = [...itemsToDisplay, ...lostItems.map(item => ({ ...item, type: 'lost' }))];
        }
        
        if (type === 'all' || type === 'found') {
            itemsToDisplay = [...itemsToDisplay, ...foundItems.map(item => ({ ...item, type: 'found' }))];
        }
        
        // Sort by date (newest first)
        itemsToDisplay.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (itemsToDisplay.length === 0) {
            feedItems.innerHTML = '<div class="no-items">No items found.</div>';
            return;
        }
        
        // Create HTML for each item
        itemsToDisplay.forEach(item => {
            const itemElement = createItemElement(item);
            feedItems.appendChild(itemElement);
        });
        
        // Add event listeners to respond buttons
        document.querySelectorAll('.btn-respond').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const itemType = this.getAttribute('data-type');
                handleRespond(itemId, itemType);
            });
        });
    }
    
    function createItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = `feed-item ${item.type}-item`;
        
        const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        itemElement.innerHTML = `
            <div class="item-header">
                <div class="item-type">${item.type.toUpperCase()}</div>
                <div class="item-date">${formattedDate}</div>
            </div>
            <div class="item-content">
                <div class="item-image">
                    ${item.image ? `<img src="${item.image}" alt="Item Image">` : '<img src="img/placeholder.jpg" alt="No Image">'}
                </div>
                <div class="item-details">
                    <h3 class="item-title">${item.title}</h3>
                    <p class="item-category"><i class="fas fa-tag"></i> ${item.category}</p>
                    <p class="item-location"><i class="fas fa-map-marker-alt"></i> ${item.location}</p>
                    <p class="item-description">${item.description}</p>
                </div>
            </div>
            <div class="item-footer">
                <button class="btn-respond" data-id="${item.id}" data-type="${item.type}"><i class="fas fa-reply"></i> Respond</button>
                <div class="item-contact">
                    <span><i class="fas fa-phone"></i> Contact: ${item.phone}</span>
                    <span><i class="fas fa-envelope"></i> Email: ${item.email}</span>
                </div>
            </div>
        `;
        
        return itemElement;
    }
    
    function handleRespond(itemId, itemType) {
        // Get items from storage
        const storageKey = itemType === 'lost' ? LOST_ITEMS_KEY : FOUND_ITEMS_KEY;
        const items = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        // Find the item
        const item = items.find(i => i.id === itemId);
        
        if (item) {
            currentItem = item;
            currentItemType = itemType;
            
            // Display item details in the modal
            responseItemDetails.innerHTML = `
                <h3>${item.title}</h3>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Description:</strong> ${item.description}</p>
            `;
            
            // Pre-fill email with user's email
            if (document.getElementById('responseEmail')) {
                document.getElementById('responseEmail').value = currentUser.email;
            }
            
            // Show modal
responseModal.style.display = 'block';
setTimeout(() => {
    responseModal.classList.add('show');
}, 10);
        }
    }
    
    function handleResponseSubmit(e) {
        e.preventDefault();
        
        if (!currentItem || !currentItemType) {
            alert('Error: No item selected.');
            return;
        }
        
        const message = document.getElementById('responseMessage').value;
        const phone = document.getElementById('responsePhone').value;
        const email = document.getElementById('responseEmail').value;
        
        // Create response object
        const response = {
            id: generateId(),
            userId: currentUser.id,
            userName: currentUser.name,
            message,
            phone,
            email,
            createdAt: new Date().toISOString()
        };
        
        // Get items from storage
        const storageKey = currentItemType === 'lost' ? LOST_ITEMS_KEY : FOUND_ITEMS_KEY;
        const items = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        // Find the item and add response
        const itemIndex = items.findIndex(i => i.id === currentItem.id);
        
        if (itemIndex !== -1) {
            // Add response to item
            if (!items[itemIndex].responses) {
                items[itemIndex].responses = [];
            }
            
            items[itemIndex].responses.push(response);
            items[itemIndex].status = 'has-responses';
            
            // Save back to storage
            localStorage.setItem(storageKey, JSON.stringify(items));
            
            alert('Your response has been sent successfully!');
            
            // Close modal and reset form
responseModal.classList.remove('show');
setTimeout(() => {
    responseModal.style.display = 'none';
}, 300);
            responseForm.reset();
            currentItem = null;
            currentItemType = null;
        }
    }
    
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        // Get selected categories
        const selectedCategories = [];
        document.querySelectorAll('.filter-content input[type="checkbox"]:checked').forEach(checkbox => {
            selectedCategories.push(checkbox.value);
        });
        
        // Get selected type (lost/found/all)
        const selectedType = document.querySelector('.filter-content input[name="type"]:checked')?.value || 'all';
        
        // Get items from storage
        const lostItems = JSON.parse(localStorage.getItem(LOST_ITEMS_KEY)) || [];
        const foundItems = JSON.parse(localStorage.getItem(FOUND_ITEMS_KEY)) || [];
        
        let filteredItems = [];
        
        // Filter by type
        if (selectedType === 'all' || selectedType === 'lost') {
            filteredItems = [...filteredItems, ...lostItems.map(item => ({ ...item, type: 'lost' }))];
        }
        
        if (selectedType === 'all' || selectedType === 'found') {
            filteredItems = [...filteredItems, ...foundItems.map(item => ({ ...item, type: 'found' }))];
        }
        
        // Filter by category if selected
        if (selectedCategories.length > 0) {
            filteredItems = filteredItems.filter(item => selectedCategories.includes(item.category));
        }
        
        // Filter by search query
        if (query) {
            filteredItems = filteredItems.filter(item => 
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.location.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            );
        }
        
        // Clear current items
        feedItems.innerHTML = '';
        
        if (filteredItems.length === 0) {
            feedItems.innerHTML = '<div class="no-items">No items found matching your search criteria.</div>';
            return;
        }
        
        // Sort by date (newest first)
        filteredItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Create HTML for each item
        filteredItems.forEach(item => {
            const itemElement = createItemElement(item);
            feedItems.appendChild(itemElement);
        });
        
        // Add event listeners to respond buttons
        document.querySelectorAll('.btn-respond').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const itemType = this.getAttribute('data-type');
                handleRespond(itemId, itemType);
            });
        });
    }
    
    // Helper function to generate ID
    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
});