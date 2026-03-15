/**
 * Mock of d3-tree-shaken.js for Jest tests.
 * Provides the same API surface with minimal implementations
 * so SpiderChart can be tested without real D3 DOM manipulation.
 */

const mockSelection = {
  data: () => mockSelection,
  enter: () => mockSelection,
  exit: () => mockSelection,
  append: () => mockSelection,
  remove: () => mockSelection,
  attr: () => mockSelection,
  style: () => mockSelection,
  text: () => mockSelection,
  on: () => mockSelection,
  merge: () => mockSelection,
  selectAll: () => mockSelection,
  select: () => mockSelection,
  filter: () => mockSelection,
  datum: () => mockSelection,
  transition: () => mockSelection,
  duration: () => mockSelection,
  node: () => document.createElement('g'),
  empty: () => false,
  size: () => 0
};

const d3 = {
  select: () => mockSelection,
  selectAll: () => mockSelection,
  pointer: () => [0, 0],
  scaleOrdinal: (colors) => {
    const palette = colors || ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
    return (i) => palette[i % palette.length];
  },
  schemeCategory10: [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ],
  max: (arr, fn) => Math.max(...(fn ? arr.map(fn) : arr)),
  range: (n) => Array.from({ length: n }, (_, i) => i),
  format: (spec) => (val) => String(val),
  line: () => {
    const l = () => '';
    l.x = () => l;
    l.y = () => l;
    l.curve = () => l;
    return l;
  },
  curveLinearClosed: {}
};

export default d3;
