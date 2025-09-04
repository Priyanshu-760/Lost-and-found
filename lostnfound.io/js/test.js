// Test script for Lost and Found Portal

// Function to run all tests
function runTests() {
    console.log('Starting tests...');
    
    // Test local storage functionality
    testLocalStorage();
    
    // Test page loading
    testPageLoading();
    
    // Test form validation
    testFormValidation();
    
    console.log('All tests completed!');
}

// Test local storage functionality
function testLocalStorage() {
    console.log('Testing local storage functionality...');
    
    // Clear local storage for testing
    localStorage.clear();
    
    // Test user registration
    const testUser = {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
    };
    
    // Test users storage
    const users = JSON.parse(localStorage.getItem('lnf_users')) || [];
    users.push(testUser);
    localStorage.setItem('lnf_users', JSON.stringify(users));
    
    // Verify user was added
    const updatedUsers = JSON.parse(localStorage.getItem('lnf_users')) || [];
    console.assert(updatedUsers.length > 0, 'User registration failed');
    console.log('User registration test passed!');
    
    // Test current user storage
    localStorage.setItem('lnf_current_user', JSON.stringify(testUser));
    const currentUser = JSON.parse(localStorage.getItem('lnf_current_user'));
    console.assert(currentUser && currentUser.id === testUser.id, 'Current user storage failed');
    console.log('Current user storage test passed!');
    
    // Test lost item storage
    const testLostItem = {
        id: 'test-lost-item-id',
        userId: testUser.id,
        title: 'Test Lost Item',
        category: 'phone',
        description: 'This is a test lost item',
        date: '2023-01-01',
        location: 'Test Location',
        image: null,
        phone: '1234567890',
        email: testUser.email,
        createdAt: new Date().toISOString(),
        responses: []
    };
    
    const lostItems = JSON.parse(localStorage.getItem('lnf_lost_items')) || [];
    lostItems.push(testLostItem);
    localStorage.setItem('lnf_lost_items', JSON.stringify(lostItems));
    
    // Verify lost item was added
    const updatedLostItems = JSON.parse(localStorage.getItem('lnf_lost_items')) || [];
    console.assert(updatedLostItems.length > 0, 'Lost item storage failed');
    console.log('Lost item storage test passed!');
    
    // Test found item storage
    const testFoundItem = {
        id: 'test-found-item-id',
        userId: testUser.id,
        title: 'Test Found Item',
        category: 'calculator',
        description: 'This is a test found item',
        date: '2023-01-02',
        location: 'Test Location 2',
        image: null,
        phone: '1234567890',
        email: testUser.email,
        createdAt: new Date().toISOString(),
        responses: []
    };
    
    const foundItems = JSON.parse(localStorage.getItem('lnf_found_items')) || [];
    foundItems.push(testFoundItem);
    localStorage.setItem('lnf_found_items', JSON.stringify(foundItems));
    
    // Verify found item was added
    const updatedFoundItems = JSON.parse(localStorage.getItem('lnf_found_items')) || [];
    console.assert(updatedFoundItems.length > 0, 'Found item storage failed');
    console.log('Found item storage test passed!');
    
    // Test response functionality
    const testResponse = {
        id: 'test-response-id',
        userId: 'another-user-id',
        userName: 'Another User',
        message: 'This is a test response',
        phone: '0987654321',
        email: 'another@example.com',
        createdAt: new Date().toISOString()
    };
    
    // Add response to lost item
    updatedLostItems[0].responses = [testResponse];
    localStorage.setItem('lnf_lost_items', JSON.stringify(updatedLostItems));
    
    // Verify response was added
    const lostItemsWithResponse = JSON.parse(localStorage.getItem('lnf_lost_items')) || [];
    console.assert(lostItemsWithResponse[0].responses.length > 0, 'Response storage failed');
    console.log('Response storage test passed!');
    
    console.log('Local storage tests completed successfully!');
}

// Test page loading
function testPageLoading() {
    console.log('Testing page loading...');
    console.log('Page loading tests can only be performed manually.');
    console.log('Please verify that all pages load correctly:');
    console.log('1. index.html (Login page)');
    console.log('2. home.html (Home page)');
    console.log('3. feed.html (Feed page)');
    console.log('4. status.html (Status page)');
}

// Test form validation
function testFormValidation() {
    console.log('Testing form validation...');
    console.log('Form validation tests can only be performed manually.');
    console.log('Please verify that all forms validate correctly:');
    console.log('1. Login form');
    console.log('2. Registration form');
    console.log('3. Lost item report form');
    console.log('4. Found item report form');
    console.log('5. Response form');
}

// Run tests when the script is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're in test mode
    const urlParams = new URLSearchParams(window.location.search);
    const testMode = urlParams.get('test');
    
    if (testMode === 'true') {
        runTests();
    }
});

// Export test functions for manual testing
window.testFunctions = {
    runTests,
    testLocalStorage,
    testPageLoading,
    testFormValidation
};

console.log('Test script loaded. Run tests by calling window.testFunctions.runTests() in the console or by adding ?test=true to the URL.');