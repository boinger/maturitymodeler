/**
 * DEPRECATED: Backward Compatibility Wrapper
 * 
 * This file has been moved to js/spider/spider.js
 * Please update your imports to use the new location.
 * 
 * This wrapper will be removed in a future version.
 */

console.warn('DEPRECATED: js/radar/radar.js has moved to js/spider/spider.js. Please update your imports.');

// Re-export from new location
export { default } from '../spider/spider.js';
export * from '../spider/spider.js';