/**
 * Modern Spider Chart Implementation - Webpack Version
 * 
 * Uses tree-shaken D3.js imports for optimal bundle size in webpack builds.
 * This is a simple re-export of the main spider implementation.
 * 
 * Original Created by Gary A. Stafford on 1/29/15
 * Modified by Jeff Vier beginning 7 Dec 2020
 * Modernized with SpiderChart class integration
 * https://github.com/boinger/maturitymodeler
 */

// Re-export everything from the main spider module
// The webpack version only differs in which D3 build is used by SpiderChart
export { default } from './spider.js';
export * from './spider.js';