/**
 * Service Worker Registration and Management
 * Handles registration, updates, and communication with the service worker
 */

/**
 * Register the service worker
 */
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            console.log('Registering service worker...');
            
            // Register relative to <base> so it works regardless of deploy path.
            // sw.js lives in dist/ alongside the other built assets.
            const registration = await navigator.serviceWorker.register('./sw.js', {
                scope: './'
            });
            
            console.log('Service Worker registered successfully:', registration);
            
            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    console.log('New service worker installing...');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New update available
                            showUpdateNotification(newWorker);
                        }
                    });
                }
            });
            
            // Check for existing service worker updates
            if (registration.waiting) {
                showUpdateNotification(registration.waiting);
            }
            
            return registration;
            
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    } else {
        console.log('Service Workers not supported in this browser');
        return null;
    }
}

/**
 * Show update notification to user
 */
function showUpdateNotification(newWorker) {
    // Create update notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #2196F3;
        color: white;
        padding: 15px;
        text-align: center;
        font-size: 14px;
        z-index: 2000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    notification.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
            <span>🔄 A new version of Maturity Modeler is available!</span>
            <button id="sw-update-btn" style="margin-left: 15px; background: white; color: #2196F3; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                Update Now
            </button>
            <button id="sw-dismiss-btn" style="margin-left: 10px; background: transparent; color: white; border: 1px solid white; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                Later
            </button>
        </div>
    `;
    
    document.body.insertBefore(notification, document.body.firstChild);
    
    // Handle update button click
    document.getElementById('sw-update-btn').addEventListener('click', () => {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        
        // Listen for controlling service worker change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
        
        notification.remove();
    });
    
    // Handle dismiss button
    document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}

/**
 * Check if the app is running offline
 */
function isOffline() {
    return !navigator.onLine;
}

/**
 * Show offline status
 */
function showOfflineStatus() {
    const offlineIndicator = document.createElement('div');
    offlineIndicator.id = 'offline-indicator';
    offlineIndicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #ff9800;
        color: white;
        padding: 10px 15px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    offlineIndicator.innerHTML = '📶 You are offline - using cached version';
    
    document.body.appendChild(offlineIndicator);
    
    return offlineIndicator;
}

/**
 * Hide offline status
 */
function hideOfflineStatus() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Setup online/offline event listeners
 */
function setupNetworkStatusListeners() {
    let offlineIndicator = null;
    
    // Handle going offline
    window.addEventListener('offline', () => {
        console.log('Application is now offline');
        offlineIndicator = showOfflineStatus();
    });
    
    // Handle coming back online
    window.addEventListener('online', () => {
        console.log('Application is back online');
        hideOfflineStatus();
        
        // Notify service worker to update cache
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_UPDATE',
                url: window.location.href
            });
        }
    });
    
    // Check initial status
    if (isOffline()) {
        offlineIndicator = showOfflineStatus();
    }
}

/**
 * Preload critical resources
 */
function preloadCriticalResources() {
    const criticalResources = [
        'main.bundle.js',
        'main-built.css'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        
        if (resource.endsWith('.js')) {
            link.as = 'script';
        } else if (resource.endsWith('.css')) {
            link.as = 'style';
        }
        
        link.href = resource;
        document.head.appendChild(link);
    });
}

/**
 * Initialize service worker and related features
 */
async function initializeServiceWorker() {
    // Setup network status listeners
    setupNetworkStatusListeners();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Register service worker
    const registration = await registerServiceWorker();
    
    if (registration) {
        console.log('Service Worker features initialized');
    }
    
    return registration;
}

// ES Module exports
export {
    registerServiceWorker,
    showUpdateNotification,
    isOffline,
    showOfflineStatus,
    hideOfflineStatus,
    setupNetworkStatusListeners,
    preloadCriticalResources,
    initializeServiceWorker
};

export default {
    registerServiceWorker,
    showUpdateNotification,
    isOffline,
    showOfflineStatus,
    hideOfflineStatus,
    setupNetworkStatusListeners,
    preloadCriticalResources,
    initializeServiceWorker
};