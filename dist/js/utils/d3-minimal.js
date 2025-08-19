/**
 * Minimal D3 imports - only the functions we actually use
 * This reduces bundle size significantly by tree-shaking unused D3 modules
 */

// Import only the D3 modules we actually use
import { select, selectAll } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { max, range } from 'd3-array';
import { format } from 'd3-format';
import { line, curveLinearClosed } from 'd3-shape';

// Create a minimal d3 object with only the functions we need
const d3 = {
  select,
  selectAll,
  scaleOrdinal,
  schemeCategory10,
  max,
  range,
  format,
  line,
  curveLinearClosed
};

// Make it globally available for existing code
if (typeof window !== 'undefined') {
  window.d3 = d3;
}

export default d3;