/**
 * Tree-shaken D3 imports for webpack bundle
 * Only imports the specific D3 modules we actually use
 */

// Import only the D3 modules we actually use for webpack bundling
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