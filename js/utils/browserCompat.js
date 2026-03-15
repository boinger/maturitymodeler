/**
 * Browser Compatibility Detection
 * Detects ES module support and other modern features.
 *
 * All checks use structural feature detection (typeof / 'in' checks)
 * rather than code evaluation, so they work under strict CSP.
 */

/**
 * Detect if browser supports ES modules (script type="module")
 */
function supportsESModules() {
    try {
        if (typeof Symbol === 'undefined') return false;
        if (typeof Promise === 'undefined') return false;
        if (typeof Object.assign === 'undefined') return false;

        const script = document.createElement('script');
        return 'noModule' in script;
    } catch (e) {
        return false;
    }
}

/**
 * Detect async/await support via structural checks.
 * Browsers that support async/await also support these APIs.
 */
function supportsAsyncAwait() {
    try {
        // async/await shipped alongside Promise.prototype.finally and
        // Array.prototype.includes in all major engines (Chrome 63+,
        // Firefox 58+, Safari 11.1+, Edge 18+).
        return typeof Promise.prototype.finally === 'function' &&
               typeof Array.prototype.includes === 'function';
    } catch (e) {
        return false;
    }
}

/**
 * Detect arrow function support via structural checks.
 * Arrow functions shipped alongside Symbol and Map in all major engines.
 */
function supportsArrowFunctions() {
    try {
        return typeof Symbol !== 'undefined' &&
               typeof Map !== 'undefined' &&
               typeof Array.prototype.find === 'function';
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

        const msg = document.createTextNode('Your browser may not support all features. ');
        warningDiv.appendChild(msg);

        const link = document.createElement('a');
        link.href = 'index-legacy.html';
        link.style.cssText = 'color: #856404; text-decoration: underline;';
        link.textContent = 'Click here for the legacy version';
        warningDiv.appendChild(link);

        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = 'float: right; background: none; border: none; color: #856404; cursor: pointer;';
        closeBtn.textContent = '\u00D7';
        closeBtn.addEventListener('click', () => {
            warningDiv.style.display = 'none';
        });
        warningDiv.appendChild(closeBtn);

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
