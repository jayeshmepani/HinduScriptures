document.addEventListener('DOMContentLoaded', () => {
    function handleURLCleanup() {
        // Check if the current URL contains .html
        if (window.location.pathname.includes('.html')) {
            // Remove .html from the URL
            const cleanURL = window.location.pathname.replace(/\.html$/, '');
            
            // Construct the full clean URL with protocol, domain, and path
            const fullCleanURL = window.location.origin + cleanURL + window.location.search + window.location.hash;
            
            // Replace the current URL without .html
            window.history.replaceState({}, '', fullCleanURL);
        }
    }

    function handleReload(event) {
        // F5 key press
        const isF5Reload = (
            event.type === 'keydown' && 
            event.key === 'F5'
        );

        // Ctrl+R or Cmd+R (for Mac) reload
        const isCtrlRReload = (
            event.type === 'keydown' && 
            (event.ctrlKey || event.metaKey) && 
            event.key === 'r'
        );

        // Check if any reload action is detected
        if (isF5Reload || isCtrlRReload) {
            event.preventDefault();
            
            // Construct reload URL with .html
            const pathname = window.location.pathname;
            const reloadURL = pathname.endsWith('/') 
                ? pathname + 'index.html' 
                : pathname + '.html';
            
            // Reload the page with .html
            window.location.href = window.location.origin + reloadURL + window.location.search + window.location.hash;
        }
    }

    // Initial URL cleanup on page load
    handleURLCleanup();

    // Add event listeners for reload
    document.addEventListener('keydown', handleReload);
    document.addEventListener('click', handleReload);
});