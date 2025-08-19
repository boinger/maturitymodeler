/**
 * Image Optimization and Lazy Loading Utility
 * Improves performance by loading images only when needed
 */

/**
 * Lazy load images when they come into viewport
 */
function setupLazyLoading() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Load the actual image
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Add loading animation
                    img.classList.add('loading');
                    
                    img.onload = () => {
                        img.classList.remove('loading');
                        img.classList.add('loaded');
                    };
                    
                    img.onerror = () => {
                        img.classList.remove('loading');
                        img.classList.add('error');
                        console.warn('Failed to load image:', img.dataset.src || img.src);
                    };
                    
                    // Stop observing this image
                    observer.unobserve(img);
                }
            });
        }, {
            // Start loading when image is 100px away from viewport
            rootMargin: '100px'
        });
        
        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        return imageObserver;
    } else {
        // Fallback for older browsers - load all images immediately
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
        return null;
    }
}

/**
 * Optimize image loading with responsive sizes
 */
function createOptimizedImage(src, alt, options = {}) {
    const {
        width = 'auto',
        height = 'auto',
        maxWidth = '100%',
        lazy = true,
        className = '',
        style = {}
    } = options;
    
    const img = document.createElement('img');
    
    // Set up lazy loading
    if (lazy && 'IntersectionObserver' in window) {
        img.dataset.src = src;
        // Use a tiny placeholder to prevent layout shift
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+';
        img.classList.add('lazy');
    } else {
        img.src = src;
    }
    
    // Set attributes
    img.alt = alt;
    img.style.width = typeof width === 'number' ? `${width}px` : width;
    img.style.height = typeof height === 'number' ? `${height}px` : height;
    img.style.maxWidth = maxWidth;
    img.style.height = 'auto'; // Maintain aspect ratio
    
    // Apply custom styles
    Object.assign(img.style, style);
    
    if (className) {
        img.className = className;
    }
    
    return img;
}

/**
 * Preload critical images
 */
function preloadCriticalImages(imageSrcs) {
    imageSrcs.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

/**
 * Add CSS for loading states
 */
function addImageLoadingStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .lazy {
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }
        
        .loading {
            opacity: 0.7;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        .loaded {
            opacity: 1;
        }
        
        .error {
            opacity: 0.5;
            background: #f5f5f5;
            position: relative;
        }
        
        .error::after {
            content: "⚠️ Image failed to load";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 12px;
            color: #666;
            background: rgba(255, 255, 255, 0.9);
            padding: 5px 10px;
            border-radius: 4px;
        }
        
        @keyframes loading {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
            .lazy, .loading, .loaded {
                transition: none;
            }
            
            .loading {
                animation: none;
                background: #f0f0f0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize image optimization
 */
function initializeImageOptimization() {
    // Add CSS styles
    addImageLoadingStyles();
    
    // Setup lazy loading
    const observer = setupLazyLoading();
    
    // Preload favicon and critical images
    preloadCriticalImages([
        'favicon.png',
        'images/maturity-model-placeholder.svg'
    ]);
    
    console.log('Image optimization initialized');
    
    return observer;
}

/**
 * Update existing images to use lazy loading
 */
function convertToLazyLoading(img) {
    if (img.src && !img.dataset.src) {
        img.dataset.src = img.src;
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+';
        img.classList.add('lazy');
    }
}

// ES Module exports
export {
    setupLazyLoading,
    createOptimizedImage,
    preloadCriticalImages,
    addImageLoadingStyles,
    initializeImageOptimization,
    convertToLazyLoading
};

export default {
    setupLazyLoading,
    createOptimizedImage,
    preloadCriticalImages,
    addImageLoadingStyles,
    initializeImageOptimization,
    convertToLazyLoading
};