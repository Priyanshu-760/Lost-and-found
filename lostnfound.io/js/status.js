document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameElement = document.getElementById('userName');
    const statusItems = document.getElementById('statusItems');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const responsesModal = document.getElementById('responsesModal');
    const itemDetailsForResponses = document.getElementById('itemDetailsForResponses');
    const responsesList = document.getElementById('responsesList');
    const editItemModal = document.getElementById('editItemModal');
    const editItemForm = document.getElementById('editItemForm');
    const closeBtns = document.querySelectorAll('.close');
    
    // Search Elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // Local Storage Keys
    const CURRENT_USER_KEY = 'lnf_current_user';
    const LOST_ITEMS_KEY = 'lnf_lost_items';
    const FOUND_ITEMS_KEY = 'lnf_found_items';
    
    // Current item being edited
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
        responsesModal.classList.remove('show');
        editItemModal.classList.remove('show');
        setTimeout(() => {
            responsesModal.style.display = 'none';
            editItemModal.classList.remove('show');
setTimeout(() => {
    editItemModal.style.display = 'none';
}, 300);
        }, 300);
    });
});
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
    if (e.target === responsesModal) {
        responsesModal.classList.remove('show');
        setTimeout(() => {
            responsesModal.style.display = 'none';
        }, 300);
    }
    if (e.target === editItemModal) {
        editItemModal.classList.remove('show');
        setTimeout(() => {
            editItemModal.style.display = 'none';
        }, 300);
    }
});
    
    // Edit form submission
    if (editItemForm) {
        editItemForm.addEventListener('submit', handleEditItemSubmit);
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
    
    // Display all items by default
    displayItems('all');
    
    // Functions
    function displayItems(type) {
        // Clear current items
        statusItems.innerHTML = '';
        
        // Get items from storage
        const lostItems = JSON.parse(localStorage.getItem(LOST_ITEMS_KEY)) || [];
        const foundItems = JSON.parse(localStorage.getItem(FOUND_ITEMS_KEY)) || [];
        
        let itemsToDisplay = [];
        
        // Filter by user ID
        const userLostItems = lostItems.filter(item => item.userId === currentUser.id);
        const userFoundItems = foundItems.filter(item => item.userId === currentUser.id);
        
        // Filter by type
        if (type === 'all' || type === 'lost') {
            itemsToDisplay = [...itemsToDisplay, ...userLostItems.map(item => ({ ...item, type: 'lost' }))];
        }
        
        if (type === 'all' || type === 'found') {
            itemsToDisplay = [...itemsToDisplay, ...userFoundItems.map(item => ({ ...item, type: 'found' }))];
        }
        
        // Filter by responses (items with responses)
        if (type === 'responses') {
            const lostWithResponses = userLostItems.filter(item => item.responses && item.responses.length > 0);
            const foundWithResponses = userFoundItems.filter(item => item.responses && item.responses.length > 0);
            
            itemsToDisplay = [
                ...lostWithResponses.map(item => ({ ...item, type: 'lost' })),
                ...foundWithResponses.map(item => ({ ...item, type: 'found' }))
            ];
        }
        
        // Sort by date (newest first)
        itemsToDisplay.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (itemsToDisplay.length === 0) {
            statusItems.innerHTML = '<div class="no-items">No items found.</div>';
            return;
        }
        
        // Create HTML for each item
        itemsToDisplay.forEach(item => {
            const itemElement = createItemElement(item);
            statusItems.appendChild(itemElement);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.btn-view-responses').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const itemType = this.getAttribute('data-type');
                viewResponses(itemId, itemType);
            });
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const itemType = this.getAttribute('data-type');
                editItem(itemId, itemType);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const itemType = this.getAttribute('data-type');
                deleteItem(itemId, itemType);
            });
        });
    }
    
    function createItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = `status-item ${item.type}-item`;
        
        const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const responseCount = item.responses ? item.responses.length : 0;
        const statusClass = responseCount > 0 ? 'has-responses' : 'pending';
        const statusText = responseCount > 0 ? `Responses (${responseCount})` : 'Pending';
        
        itemElement.innerHTML = `
            <div class="item-header">
                <div class="item-type">${item.type.toUpperCase()}</div>
                <div class="item-date">${formattedDate}</div>
                <div class="item-status ${statusClass}">${statusText}</div>
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
                <button class="btn-view-responses" data-id="${item.id}" data-type="${item.type}">
                    <i class="fas fa-comments"></i> View Responses (${responseCount})
                </button>
                <button class="btn-edit" data-id="${item.id}" data-type="${item.type}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" data-id="${item.id}" data-type="${item.type}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        return itemElement;
    }
    
    function viewResponses(itemId, itemType) {
        // Get items from storage
        const storageKey = itemType === 'lost' ? LOST_ITEMS_KEY : FOUND_ITEMS_KEY;
        const items = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        // Find the item
        const item = items.find(i => i.id === itemId);
        
        if (item) {
            // Display item details in the modal
            itemDetailsForResponses.innerHTML = `
                <h3>${item.title}</h3>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Description:</strong> ${item.description}</p>
            `;
            
            // Display responses
            responsesList.innerHTML = '';
            
            if (!item.responses || item.responses.length === 0) {
                responsesList.innerHTML = '<div class="no-responses">No responses yet.</div>';
            } else {
                item.responses.forEach(response => {
                    const responseDate = new Date(response.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    const responseElement = document.createElement('div');
                    responseElement.className = 'response-item';
                    responseElement.innerHTML = `
                        <div class="response-header">
                            <div class="response-user">${response.userName}</div>
                            <div class="response-date">${responseDate}</div>
                        </div>
                        <div class="response-content">
                            <p>${response.message}</p>
                        </div>
                        <div class="response-footer">
                            <div class="response-contact">
                                <span><i class="fas fa-phone"></i> ${response.phone}</span>
                                <span><i class="fas fa-envelope"></i> ${response.email}</span>
                            </div>
                            <button class="btn-reply" data-email="${response.email}">
                                <i class="fas fa-reply"></i> Reply
                            </button>
                        </div>
                    `;
                    
                    responsesList.appendChild(responseElement);
                });
                
                // Add event listeners to reply buttons
                document.querySelectorAll('.btn-reply').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const email = this.getAttribute('data-email');
                        window.location.href = `mailto:${email}`;
                    });
                });
            }
            
            // Show modal
            responsesModal.style.display = 'block';
setTimeout(() => {
    responsesModal.classList.add('show');
}, 10);
        }
    }
    
    function editItem(itemId, itemType) {
        // Get items from storage
        const storageKey = itemType === 'lost' ? LOST_ITEMS_KEY : FOUND_ITEMS_KEY;
        const items = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        // Find the item
        const item = items.find(i => i.id === itemId);
        
        if (item) {
            currentItem = item;
            currentItemType = itemType;
            
            // Create form fields based on item type
            const formTitle = itemType === 'lost' ? 'Edit Lost Item' : 'Edit Found Item';
            const dateLabel = itemType === 'lost' ? 'Date Lost' : 'Date Found';
            
            editItemForm.innerHTML = `
                <div class="form-group">
                    <label for="editTitle">Title</label>
                    <input type="text" id="editTitle" name="editTitle" value="${item.title}" required>
                </div>
                <div class="form-group">
                    <label for="editCategory">Category</label>
                    <select id="editCategory" name="editCategory" required>
                        <option value="">Select Category</option>
                        <option value="calculator" ${item.category === 'calculator' ? 'selected' : ''}>Calculator</option>
                        <option value="phone" ${item.category === 'phone' ? 'selected' : ''}>Phone</option>
                        <option value="notebook" ${item.category === 'notebook' ? 'selected' : ''}>Notebook</option>
                        <option value="pens" ${item.category === 'pens' ? 'selected' : ''}>Pens</option>
                        <option value="earphones" ${item.category === 'earphones' ? 'selected' : ''}>Earphones</option>
                        <option value="charger" ${item.category === 'charger' ? 'selected' : ''}>Charger</option>
                        <option value="other" ${item.category === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editDescription">Description</label>
                    <textarea id="editDescription" name="editDescription" required>${item.description}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group half">
                        <label for="editDate">${dateLabel}</label>
                        <input type="date" id="editDate" name="editDate" value="${item.date}" required>
                    </div>
                    <div class="form-group half">
                        <label for="editLocation">Location</label>
                        <input type="text" id="editLocation" name="editLocation" value="${item.location}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group half">
                        <label for="editPhone">Phone Number</label>
                        <input type="tel" id="editPhone" name="editPhone" value="${item.phone}" required>
                    </div>
                    <div class="form-group half">
                        <label for="editEmail">Email</label>
                        <input type="email" id="editEmail" name="editEmail" value="${item.email}" required>
                    </div>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn-submit">Save Changes</button>
                </div>
            `;
            
            // Show modal
            editItemModal.style.display = 'block';
setTimeout(() => {
    editItemModal.classList.add('show');
}, 10);
        }
    }
    
    function handleEditItemSubmit(e) {
        e.preventDefault();
        
        if (!currentItem || !currentItemType) {
            alert('Error: No item selected.');
            return;
        }
        
        const title = document.getElementById('editTitle').value;
        const category = document.getElementById('editCategory').value;
        const description = document.getElementById('editDescription').value;
        const date = document.getElementById('editDate').value;
        const location = document.getElementById('editLocation').value;
        const phone = document.getElementById('editPhone').value;
        const email = document.getElementById('editEmail').value;
        
        // Get items from storage
        const storageKey = currentItemType === 'lost' ? LOST_ITEMS_KEY : FOUND_ITEMS_KEY;
        const items = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        // Find the item and update
        const itemIndex = items.findIndex(i => i.id === currentItem.id);
        
        if (itemIndex !== -1) {
            // Update item
            items[itemIndex].title = title;
            items[itemIndex].category = category;
            items[itemIndex].description = description;
            items[itemIndex].date = date;
            items[itemIndex].location = location;
            items[itemIndex].phone = phone;
            items[itemIndex].email = email;
            
            // Save back to storage
            localStorage.setItem(storageKey, JSON.stringify(items));
            
            alert('Item updated successfully!');
            
            // Close modal
            editItemModal.style.display = 'none';
            currentItem = null;
            currentItemType = null;
            
            // Refresh display
            displayItems(document.querySelector('.tab-btn.active').getAttribute('data-tab'));
        }
    }
    
    function deleteItem(itemId, itemType) {
        if (confirm('Are you sure you want to delete this item?')) {
            // Get items from storage
            const storageKey = itemType === 'lost' ? LOST_ITEMS_KEY : FOUND_ITEMS_KEY;
            const items = JSON.parse(localStorage.getItem(storageKey)) || [];
            
            // Filter out the item
            const updatedItems = items.filter(i => i.id !== itemId);
            
            // Save back to storage
            localStorage.setItem(storageKey, JSON.stringify(updatedItems));
            
            alert('Item deleted successfully!');
            
            // Refresh display
            displayItems(document.querySelector('.tab-btn.active').getAttribute('data-tab'));
        }
    }
    
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            displayItems(document.querySelector('.tab-btn.active').getAttribute('data-tab'));
            return;
        }
        
        // Get items from storage
        const lostItems = JSON.parse(localStorage.getItem(LOST_ITEMS_KEY)) || [];
        const foundItems = JSON.parse(localStorage.getItem(FOUND_ITEMS_KEY)) || [];
        
        // Filter by user ID
        const userLostItems = lostItems.filter(item => item.userId === currentUser.id);
        const userFoundItems = foundItems.filter(item => item.userId === currentUser.id);
        
        // Combine all user items
        let userItems = [
            ...userLostItems.map(item => ({ ...item, type: 'lost' })),
            ...userFoundItems.map(item => ({ ...item, type: 'found' }))
        ];
        
        // Filter by search query
        const filteredItems = userItems.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        );
        
        // Clear current items
        statusItems.innerHTML = '';
        
        if (filteredItems.length === 0) {
            statusItems.innerHTML = '<div class="no-items">No items found matching your search criteria.</div>';
            return;
        }
        
        // Sort by date (newest first)
        filteredItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Create HTML for each item
        filteredItems.forEach(item => {
            const itemElement = createItemElement(item);
            statusItems.appendChild(itemElement);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.btn-view-responses').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const itemType = this.getAttribute('data-type');
                viewResponses(itemId, itemType);
            });
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const itemType = this.getAttribute('data-type');
                editItem(itemId, itemType);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const itemType = this.getAttribute('data-type');
                deleteItem(itemId, itemType);
            });
        });
    }
});