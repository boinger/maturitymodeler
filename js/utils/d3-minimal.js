/**
 * D3.js loader for ES modules
 * For ES modules version, we use the full D3.js library
 * For transpiled version, webpack will tree-shake to minimal imports
 */

// Import the full D3.js library for ES modules compatibility
import '../d3/d3.js';

// Create a minimal d3 object with only the functions we need
// This maintains compatibility while ensuring all required functions are available
const d3 = window.d3 || {
  // Fallback functions if D3 isn't loaded
  select: () => ({ selectAll: () => ({ on: () => {}, attr: () => {}, style: () => {}, text: () => {} }) }),
  selectAll: () => ({ on: () => {}, attr: () => {}, style: () => {}, text: () => {} }),
  scaleOrdinal: (colors) => (i) => colors[i % colors.length],
  schemeCategory10: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'],
  max: (arr, accessor) => accessor ? Math.max(...arr.map(accessor)) : Math.max(...arr),
  range: (n) => Array.from({length: n}, (_, i) => i),
  format: () => (n) => n.toString(),
  line: () => () => '',
  curveLinearClosed: 'linear'
};

// Ensure d3 is globally available
if (typeof window !== 'undefined') {
  window.d3 = window.d3 || d3;
}

export default window.d3 || d3;