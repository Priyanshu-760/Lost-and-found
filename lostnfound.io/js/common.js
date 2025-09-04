// Common JavaScript functions

// Local Storage Keys
const USERS_KEY = 'lostnfound_users';
const CURRENT_USER_KEY = 'lostnfound_current_user';
const LOST_ITEMS_KEY = 'lostnfound_lost_items';
const FOUND_ITEMS_KEY = 'lostnfound_found_items';
const RESPONSES_KEY = 'lostnfound_responses';

// Page Transition Function
function navigateWithTransition(url) {
    const content = document.querySelector('.content');
    if (content) {
        content.style.opacity = '0';
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    } else {
        window.location.href = url;
    }
}

// Add fade-in effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('.content');
    if (content) {
        // Ensure content starts invisible
        content.style.opacity = '0';
        // Trigger fade in after a short delay
        setTimeout(() => {
            content.style.opacity = '1';
        }, 10);
    }
});