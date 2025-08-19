/**
 * Debug utility for conditional logging
 */

// Check if debug mode is enabled via URL parameter
const isDebugMode = () => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'true';
};

// Debug logger that only logs when debug=true
const debugLog = (...args) => {
    if (isDebugMode()) {
        console.log('[DEBUG]', ...args);
    }
};

export { isDebugMode, debugLog };