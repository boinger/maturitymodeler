/**
 * Browser Compatibility Detection
 * Detects ES module support and other modern features
 */

/**
 * Detect if browser supports ES modules
 */
function supportsESModules() {
    try {
        // Check for core ES6+ features
        if (typeof Symbol === 'undefined') return false;
        if (typeof Promise === 'undefined') return false;
        if (typeof Object.assign === 'undefined') return false;
        
        // Test script type="module" support
        const script = document.createElement('script');
        return 'noModule' in script;
    } catch (e) {
        return false;
    }
}

/**
 * Detect async/await support
 */
function supportsAsyncAwait() {
    try {
        eval('(async function() {})');
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Detect arrow function support
 */
function supportsArrowFunctions() {
    try {
        eval('() => {}');
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Get browser compatibility level
 */
function getBrowserCompatibility() {
    return {
        esModules: supportsESModules(),
        asyncAwait: supportsAsyncAwait(),
        arrowFunctions: supportsArrowFunctions(),
        fetch: typeof fetch !== 'undefined',
        promise: typeof Promise !== 'undefined',
        symbol: typeof Symbol !== 'undefined'
    };
}

/**
 * Show browser compatibility warning if needed
 */
function checkBrowserCompatibility() {
    const compat = getBrowserCompatibility();
    
    if (!compat.esModules || !compat.asyncAwait) {
        console.warn('Browser may not fully support modern JavaScript features. Consider using the legacy version.');
        
        // Show a subtle warning to the user
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #fff3cd;
            color: #856404;
            padding: 10px;
            text-align: center;
            font-size: 14px;
            z-index: 1000;
            border-bottom: 1px solid #ffeaa7;
        `;
        warningDiv.innerHTML = `
            Your browser may not support all features. 
            <a href="index-legacy.html" style="color: #856404; text-decoration: underline;">
                Click here for the legacy version
            </a>
            <button onclick="this.parentElement.style.display='none'" style="float: right; background: none; border: none; color: #856404; cursor: pointer;">×</button>
        `;
        
        document.body.insertBefore(warningDiv, document.body.firstChild);
    }
}

// ES Module exports
export {
    supportsESModules,
    supportsAsyncAwait,
    supportsArrowFunctions,
    getBrowserCompatibility,
    checkBrowserCompatibility
};

export default {
    supportsESModules,
    supportsAsyncAwait,
    supportsArrowFunctions,
    getBrowserCompatibility,
    checkBrowserCompatibility
};