/**
 * Modern Spider/Spiderweb Chart Implementation
 * Refactored for ES6+, performance, and maintainability
 * @module SpiderChart
 */

import d3 from '../utils/d3-minimal.js';
import memoryManager from '../utils/memoryManager.js';

/**
 * @typedef {Object} ChartConfig
 * @property {number} radius - Circle radius for data points
 * @property {number} w - Chart width
 * @property {number} h - Chart height
 * @property {number} factor - Scaling factor
 * @property {number} factorLegend - Legend position factor
 * @property {number} levels - Number of concentric levels
 * @property {number} maxValue - Maximum data value
 * @property {number} radians - Full circle in radians (2π)
 * @property {number} opacityArea - Polygon fill opacity
 * @property {number} ToRight - Text position adjustment
 * @property {number} TranslateX - Chart X translation
 * @property {number} TranslateY - Chart Y translation
 * @property {number} ExtraWidthX - Extra width padding
 * @property {number} ExtraWidthY - Extra height padding
 * @property {Function} color - Color scale function
 */

/**
 * @typedef {Object} DataPoint
 * @property {string} app - Application name
 * @property {string} axis - Category/axis name
 * @property {number} value - Numeric value
 * @property {number} [originalIndex] - Original array index for color consistency
 */

/**
 * Default configuration for spider chart
 */
const DEFAULT_CONFIG = {
    radius: 5,
    w: 800,
    h: 800,
    factor: 1,
    factorLegend: 0.85,
    levels: 3,
    maxValue: 100,
    radians: 2 * Math.PI,
    opacityArea: 0.5,
    ToRight: 5,
    TranslateX: 90,
    TranslateY: 30,
    ExtraWidthX: 100,
    ExtraWidthY: 100
};

/**
 * Custom color palette for better distinction
 */
const COLOR_PALETTE = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
    "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
    "#c49c94", "#f7b6d3", "#c7c7c7", "#dbdb8d", "#9edae5"
];

/**
 * SpiderChart class - Modern implementation of spider/spiderweb chart
 */
class SpiderChart {
    /**
     * Create a SpiderChart instance
     * @param {string} containerId - DOM element ID for chart container
     * @param {ChartConfig} [config={}] - Configuration overrides
     */
    constructor(containerId, config = {}) {
        this.containerId = containerId;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.colorScale = this.initColorScale();
        this.format = d3.format("d");
        
        // Cache frequently used values
        this.centerX = this.config.w / 2;
        this.centerY = this.config.h / 2;
        
        // D3 selections
        this.container = null;
        this.svg = null;
        this.g = null;
        this.tooltip = null;
    }

    /**
     * Initialize color scale
     * @private
     */
    initColorScale() {
        if (this.config.color) {
            return this.config.color;
        }
        
        if (typeof d3 !== 'undefined' && d3.scaleOrdinal) {
            return d3.scaleOrdinal(COLOR_PALETTE);
        }
        
        // Fallback for testing
        return (index) => COLOR_PALETTE[index % COLOR_PALETTE.length];
    }

    /**
     * Validate input data
     * @private
     * @param {Array<Array<DataPoint>>} data - Chart data
     * @returns {boolean} True if valid
     */
    validateData(data) {
        if (!Array.isArray(data) || data.length === 0) {
            console.error("SpiderChart: Data must be a non-empty array");
            return false;
        }

        if (!data[0] || !Array.isArray(data[0])) {
            console.error("SpiderChart: Invalid data structure - expected array of arrays");
            return false;
        }

        // Validate data points
        for (const series of data) {
            for (const point of series) {
                if (!point || typeof point.value !== 'number') {
                    console.warn("SpiderChart: Invalid data point", point);
                }
            }
        }

        return true;
    }

    /**
     * Calculate coordinates for a data point
     * @private
     * @param {number} value - Data value
     * @param {number} index - Axis index
     * @param {number} total - Total number of axes
     * @returns {[number, number]} [x, y] coordinates
     */
    calculateCoordinates(value, index, total) {
        const normalizedValue = Math.max(0, value) / this.config.maxValue;
        const angle = index * this.config.radians / total;
        
        return [
            this.centerX * (1 - normalizedValue * this.config.factor * Math.sin(angle)),
            this.centerY * (1 - normalizedValue * this.config.factor * Math.cos(angle))
        ];
    }

    /**
     * Generate polygon path string from data series
     * @private
     * @param {Array<DataPoint>} series - Data series
     * @returns {string} SVG path string
     */
    generatePolygonPath(series) {
        const total = series.length;
        const coordinates = series.map((point, i) => 
            this.calculateCoordinates(point.value, i, total)
        );
        
        // Close the polygon
        coordinates.push(coordinates[0]);
        
        return coordinates.map(coord => coord.join(',')).join(' ');
    }

    /**
     * Create chart axes
     * @private
     * @param {Array<string>} axisNames - Axis labels
     */
    createAxes(axisNames) {
        const total = axisNames.length;
        const radius = this.config.factor * Math.min(this.centerX, this.centerY);

        // Create axis lines
        const axes = this.g.selectAll('.axis')
            .data(axisNames)
            .enter()
            .append('g')
            .attr('class', 'axis');

        axes.append('line')
            .attr('x1', this.centerX)
            .attr('y1', this.centerY)
            .attr('x2', (d, i) => this.centerX * (1 - this.config.factor * Math.sin(i * this.config.radians / total)))
            .attr('y2', (d, i) => this.centerY * (1 - this.config.factor * Math.cos(i * this.config.radians / total)))
            .attr('class', 'axis-line')
            .style('stroke', '#999999')
            .style('stroke-width', '0.75px');

        // Add axis labels
        axes.append('text')
            .attr('class', 'axis-label')
            .text(d => d)
            .style('font-family', 'sans-serif')
            .style('font-size', '11px')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.5em')
            .attr('transform', 'translate(0, -10)')
            .attr('x', (d, i) => {
                const angle = i * this.config.radians / total;
                return this.centerX * (1 - this.config.factorLegend * Math.sin(angle)) - 
                       60 * Math.sin(angle);
            })
            .attr('y', (d, i) => {
                const angle = i * this.config.radians / total;
                return this.centerY * (1 - Math.cos(angle)) - 
                       20 * Math.cos(angle);
            });
    }

    /**
     * Create circular grid levels
     * @private
     * @param {number} total - Total number of axes
     */
    createGridLevels(total) {
        const radius = this.config.factor * Math.min(this.centerX, this.centerY);
        
        for (let level = 0; level < this.config.levels; level++) {
            const levelFactor = radius * ((level + 1) / this.config.levels);
            
            // Create level lines
            const levelData = Array.from({ length: total }, (_, i) => ({
                x1: levelFactor * (1 - this.config.factor * Math.sin(i * this.config.radians / total)),
                y1: levelFactor * (1 - this.config.factor * Math.cos(i * this.config.radians / total)),
                x2: levelFactor * (1 - this.config.factor * Math.sin((i + 1) * this.config.radians / total)),
                y2: levelFactor * (1 - this.config.factor * Math.cos((i + 1) * this.config.radians / total))
            }));

            this.g.selectAll(`.level-${level}`)
                .data(levelData)
                .enter()
                .append('line')
                .attr('class', `grid-line level-${level}`)
                .attr('x1', d => d.x1)
                .attr('y1', d => d.y1)
                .attr('x2', d => d.x2)
                .attr('y2', d => d.y2)
                .style('stroke', '#999999')
                .style('stroke-opacity', '0.75')
                .style('stroke-width', '0.5px')
                .attr('transform', `translate(${this.centerX - levelFactor}, ${this.centerY - levelFactor})`);

            // Add level labels
            if (level > 0 || this.config.levels === 1) {
                this.g.append('text')
                    .attr('class', `level-label level-${level}`)
                    .attr('x', levelFactor * (1 - this.config.factor * Math.sin(0)))
                    .attr('y', levelFactor * (1 - this.config.factor * Math.cos(0)))
                    .style('font-family', 'sans-serif')
                    .style('font-size', '11px')
                    .attr('transform', `translate(${this.centerX - levelFactor + this.config.ToRight}, ${this.centerY - levelFactor})`)
                    .attr('fill', '#999999')
                    .text(this.format((level + 1) * this.config.maxValue / this.config.levels));
            }
        }
    }

    /**
     * Create data polygons
     * @private
     * @param {Array<Array<DataPoint>>} data - Chart data
     */
    createPolygons(data) {
        const total = data[0].length;
        
        // Remove existing polygons
        this.g.selectAll('polygon').remove();
        
        // Create new polygons
        data.forEach((series, seriesIndex) => {
            const originalIndex = series[0]?.originalIndex ?? seriesIndex;
            const polygonPath = this.generatePolygonPath(series);
            
            const polygon = this.g.append('polygon')
                .datum(series)
                .attr('class', `spider-series spider-series-${seriesIndex}`)
                .attr('points', polygonPath)
                .style('stroke-width', '2px')
                .style('stroke', this.colorScale(originalIndex))
                .style('fill', this.colorScale(originalIndex))
                .style('fill-opacity', this.config.opacityArea);
            
            // Add hover effects
            this.addPolygonInteractions(polygon, seriesIndex);
        });
    }

    /**
     * Add interaction handlers to polygon
     * @private
     * @param {Object} polygon - D3 polygon selection
     * @param {number} seriesIndex - Series index
     */
    addPolygonInteractions(polygon, seriesIndex) {
        polygon
            .on('mouseover', () => {
                // Dim other polygons
                this.g.selectAll('polygon')
                    .transition()
                    .duration(200)
                    .style('fill-opacity', 0.1);
                
                // Highlight this polygon
                this.g.selectAll(`.spider-series-${seriesIndex}`)
                    .transition()
                    .duration(200)
                    .style('fill-opacity', 0.7);
            })
            .on('mouseout', () => {
                // Restore all polygons
                this.g.selectAll('polygon')
                    .transition()
                    .duration(200)
                    .style('fill-opacity', this.config.opacityArea);
            });
    }

    /**
     * Create data point circles
     * @private
     * @param {Array<Array<DataPoint>>} data - Chart data
     */
    createDataPoints(data) {
        const total = data[0].length;
        
        // Remove existing circles
        this.g.selectAll('circle').remove();
        
        data.forEach((series, seriesIndex) => {
            const originalIndex = series[0]?.originalIndex ?? seriesIndex;
            
            this.g.selectAll(`.points-${seriesIndex}`)
                .data(series)
                .enter()
                .append('circle')
                .attr('class', `spider-point spider-series-${seriesIndex}`)
                .attr('r', this.config.radius)
                .attr('cx', (d, i) => this.calculateCoordinates(d.value, i, total)[0])
                .attr('cy', (d, i) => this.calculateCoordinates(d.value, i, total)[1])
                .style('fill', this.colorScale(originalIndex))
                .style('fill-opacity', 0.9)
                .on('mouseover', (event, d) => this.showTooltip(event, d, seriesIndex))
                .on('mouseout', () => this.hideTooltip());
        });
    }

    /**
     * Show tooltip for data point
     * @private
     * @param {Event} event - Mouse event
     * @param {DataPoint} dataPoint - Data point
     * @param {number} seriesIndex - Series index
     */
    showTooltip(event, dataPoint, seriesIndex) {
        const [x, y] = d3.pointer(event, this.g.node());
        
        this.tooltip
            .attr('x', x - 10)
            .attr('y', y - 5)
            .text(dataPoint.value)
            .transition()
            .duration(200)
            .style('opacity', 1);
        
        // Highlight related polygon
        this.g.selectAll('polygon')
            .transition()
            .duration(200)
            .style('fill-opacity', 0.1);
        
        this.g.selectAll(`.spider-series-${seriesIndex}`)
            .transition()
            .duration(200)
            .style('fill-opacity', 0.7);
    }

    /**
     * Hide tooltip
     * @private
     */
    hideTooltip() {
        this.tooltip
            .transition()
            .duration(200)
            .style('opacity', 0);
        
        this.g.selectAll('polygon')
            .transition()
            .duration(200)
            .style('fill-opacity', this.config.opacityArea);
    }

    /**
     * Initialize chart structure
     * @private
     */
    initChart() {
        // Clean up any existing chart
        memoryManager.cleanupChart(this.containerId);
        
        // Select container
        this.container = d3.select(this.containerId);
        if (this.container.empty()) {
            throw new Error(`SpiderChart: Container not found: ${this.containerId}`);
        }
        
        // Track for memory management
        memoryManager.trackD3Selection(this.container, `spider-${this.containerId}`);
        
        // Create SVG
        this.svg = this.container.selectAll('svg').data([null]);
        const svgEnter = this.svg.enter().append('svg');
        this.svg = this.svg.merge(svgEnter)
            .attr('width', this.config.w + this.config.ExtraWidthX)
            .attr('height', this.config.h + this.config.ExtraWidthY);
        
        // Create main group
        const gEnter = svgEnter.append('g');
        this.g = this.svg.select('g').merge(gEnter)
            .attr('transform', `translate(${this.config.TranslateX}, ${this.config.TranslateY})`);
        
        // Create tooltip
        this.tooltip = this.g.append('text')
            .attr('class', 'spider-tooltip')
            .style('opacity', 0)
            .style('font-family', 'sans-serif')
            .style('font-size', '13px');
    }

    /**
     * Render the spider chart
     * @public
     * @param {Array<Array<DataPoint>>} data - Chart data
     * @returns {SpiderChart} Returns this for chaining
     */
    render(data) {
        // Initialize chart structure
        this.initChart();
        
        // Check if we have data to render
        const hasData = Array.isArray(data) && data.length > 0 && Array.isArray(data[0]);
        
        if (!hasData) {
            // Still show skeleton/axes even with no data
            // Use default categories if available
            if (window.currentDataRadar && window.currentDataRadar.categories) {
                const axisNames = window.currentDataRadar.categories;
                const total = axisNames.length;
                this.createGridLevels(total);
                this.createAxes(axisNames);
            }
            return this;
        }
        
        // Validate data structure
        if (!this.validateData(data)) {
            return this;
        }
        
        // Update max value if needed
        const dataMax = Math.max(...data.flat().map(d => d.value));
        this.config.maxValue = Math.max(this.config.maxValue, dataMax);
        
        // Extract axis names
        const axisNames = data[0].map(d => d.axis);
        const total = axisNames.length;
        
        // Create chart elements
        this.createGridLevels(total);
        this.createAxes(axisNames);
        this.createPolygons(data);
        this.createDataPoints(data);
        
        return this;
    }

    /**
     * Update chart configuration
     * @public
     * @param {ChartConfig} config - New configuration
     * @returns {SpiderChart} Returns this for chaining
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.centerX = this.config.w / 2;
        this.centerY = this.config.h / 2;
        return this;
    }

    /**
     * Destroy the chart and clean up resources
     * @public
     */
    destroy() {
        if (this.container) {
            this.container.selectAll('*').remove();
            memoryManager.cleanupChart(this.containerId);
        }
        
        this.container = null;
        this.svg = null;
        this.g = null;
        this.tooltip = null;
    }
}

// Factory function for backward compatibility
export function createSpiderChart(containerId, data, options = {}) {
    const chart = new SpiderChart(containerId, options);
    return chart.render(data);
}

// Legacy alias for backward compatibility
export function createRadarChart(containerId, data, options = {}) {
    console.warn('createRadarChart is deprecated, use createSpiderChart instead');
    return createSpiderChart(containerId, data, options);
}

// Export the class as default
export default SpiderChart;