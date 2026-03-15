/**
 * Modern Spider Chart Implementation
 * 
 * LEGACY WRAPPER: This file provides backward compatibility for legacy radar chart API.
 * All new development should use SpiderChart directly.
 * 
 * Original Created by Gary A. Stafford on 1/29/15
 * Modified by Jeff Vier beginning 7 Dec 2020
 * Modernized with SpiderChart class integration
 * https://github.com/boinger/maturitymodeler
 */

import SpiderChart from './SpiderChart.js';
import { DEFAULT_COLOR_PALETTE } from '../config/configSchema.js';

"use strict";

// Global chart instance for backward compatibility
let currentChart = null;

/**
 * Color scale function - now sourced from configSchema
 */
const sharedColorScale = (index) => DEFAULT_COLOR_PALETTE[index % DEFAULT_COLOR_PALETTE.length];

/**
 * Legacy draw function - now delegates to SpiderChart
 * 
 * @param {string} id - Container selector
 * @param {Array} data - Chart data
 * @param {Object} options - Chart options
 * @returns {SpiderChart} Chart instance
 */
const draw = (id, data, options = {}) => {
    try {
        // Clean up previous chart
        if (currentChart) {
            currentChart.destroy();
        }
        currentChart = null;
        window.spider = null;
        
        // Convert legacy options to new format, injecting app metadata
        // so SpiderChart doesn't need window.currentDataRadar
        const dataRadar = window.currentDataRadar || {};
        const config = {
            ...options,
            color: options.color || sharedColorScale,
            applications: options.applications || dataRadar.applications || [],
            categories: options.categories || dataRadar.categories || [],
            averageTitle: options.averageTitle || dataRadar.averageTitle || 'Category Averages',
            averageId: options.averageId ?? dataRadar.idAverageCategories ?? 100
        };
        
        // Create and render new chart
        currentChart = new SpiderChart(id, config);
        currentChart.render(data);
        
        // Make chart instance globally available for menu interactions
        window.spider = currentChart;
        
        return currentChart;
        
    } catch (error) {
        console.error('Chart rendering failed:', error);
        
        // Fallback to basic error display
        const container = document.querySelector(id);
        if (container) {
            container.textContent = '';
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'padding: 20px; text-align: center; color: #d62728;';
            const heading = document.createElement('h3');
            heading.textContent = 'Chart Rendering Error';
            const msg = document.createElement('p');
            msg.textContent = 'Unable to render the spider chart. Please check the data format.';
            const details = document.createElement('details');
            const summary = document.createElement('summary');
            summary.textContent = 'Error Details';
            const pre = document.createElement('pre');
            pre.textContent = error.message;
            details.appendChild(summary);
            details.appendChild(pre);
            wrapper.appendChild(heading);
            wrapper.appendChild(msg);
            wrapper.appendChild(details);
            container.appendChild(wrapper);
        }
        
        return null;
    }
};

/**
 * Get the current chart instance
 * @returns {SpiderChart|null} Current chart instance
 */
const getCurrentChart = () => currentChart;

/**
 * Get the color scale function
 * @returns {Function} Color scale function
 */
const getColorScale = () => sharedColorScale;

/**
 * Clean up resources
 */
const cleanup = () => {
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
        window.spider = null;
    }
};

// Backward compatibility: ensure cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', cleanup);
}

// ES Module exports
export { draw, sharedColorScale as getColorScale, getCurrentChart, cleanup };

// Default export for compatibility
export default {
    draw,
    getColorScale,
    getCurrentChart,
    cleanup
};