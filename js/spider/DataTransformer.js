/**
 * Modern Data Transformation Utility
 *
 * Handles data transformations for maturity model visualization.
 * Scale transformation is dynamic, derived from config.scale.min / config.scale.max.
 *
 * Default scale: -2 to 3 -> 0 to 100  (legacy formula: 20x + 40)
 * Generic formula: (value - min) / (max - min) * 100
 *
 * @module DataTransformer
 */

"use strict";

/**
 * @typedef {Object} DataPoint
 * @property {string} app - Application name
 * @property {string} axis - Category/axis name
 * @property {number} value - Raw maturity value
 * @property {number} [originalIndex] - Original index for color consistency
 */

/**
 * @typedef {Object} MaturityData
 * @property {string} pageTitle - Page title
 * @property {string} legendTitle - Legend title
 * @property {string} averageTitle - Average category title
 * @property {number} idAverageCategories - ID for average categories
 * @property {Array<string>} categories - Category names
 * @property {Array<string>} applications - Application names
 * @property {Array<Array<DataPoint>>} maturityData - Raw maturity data
 * @property {Array<Array<DataPoint>>} emptyDataSet - Empty dataset template
 */

/**
 * @typedef {Object} ScaleConfig
 * @property {number} min - Minimum scale value
 * @property {number} max - Maximum scale value
 * @property {Array<{score: number, label: string}>} [levels] - Scale level definitions
 */

// Default scale parameters (legacy -2 to 3 range)
const DEFAULT_SCALE_MIN = -2;
const DEFAULT_SCALE_MAX = 3;

/**
 * DataTransformer class - Handles all data transformations for maturity visualization
 */
class DataTransformer {
    /**
     * Create a DataTransformer instance
     * @param {MaturityData} [initialData] - Initial data source
     * @param {ScaleConfig} [scaleConfig] - Scale configuration
     */
    constructor(initialData = null, scaleConfig = null) {
        this.currentData = null;
        this.transformedData = null;
        this.cache = new Map();
        this.scaleConfig = null;

        if (scaleConfig) {
            this.setScale(scaleConfig);
        }

        if (initialData) {
            this.setDataSource(initialData);
        }
    }

    /**
     * Set scale configuration
     * @param {ScaleConfig} scaleConfig - Scale config with min, max, levels
     */
    setScale(scaleConfig) {
        if (!scaleConfig || typeof scaleConfig.min !== 'number' || typeof scaleConfig.max !== 'number') {
            throw new Error('DataTransformer: Scale config must have numeric min and max');
        }
        if (scaleConfig.min >= scaleConfig.max) {
            throw new Error('DataTransformer: scale.min must be less than scale.max');
        }
        this.scaleConfig = { ...scaleConfig };

        // If data is already loaded, re-transform with new scale
        if (this.currentData) {
            this.transformedData = this.transformMaturityData(this.currentData.maturityData);
            this.clearCache();
        }
    }

    /**
     * Get the effective scale min
     * @returns {number}
     */
    getScaleMin() {
        if (this.scaleConfig) return this.scaleConfig.min;
        return this._deriveScaleMin();
    }

    /**
     * Get the effective scale max
     * @returns {number}
     */
    getScaleMax() {
        if (this.scaleConfig) return this.scaleConfig.max;
        return this._deriveScaleMax();
    }

    /**
     * Get the scale levels (for ring labels)
     * @returns {Array<{score: number, label: string}>}
     */
    getScaleLevels() {
        if (this.scaleConfig?.levels) return this.scaleConfig.levels;
        // Derive from legacy maturityLevels if available
        if (this.currentData?.maturityLevels) {
            return this.currentData.maturityLevels.map(ml => ({
                score: ml.score,
                label: ml.definition
            }));
        }
        return [];
    }

    /**
     * Get the number of chart ring levels (rings between min and max)
     * @returns {number}
     */
    getRingCount() {
        const levels = this.getScaleLevels();
        if (levels.length > 1) {
            // Rings = number of levels minus one (the center/min level has no ring)
            return levels.length - 1;
        }
        // Fallback: scale range
        return this.getScaleMax() - this.getScaleMin();
    }

    /**
     * Derive scale min from legacy maturityLevels
     * @private
     */
    _deriveScaleMin() {
        if (this.currentData?.maturityLevels?.length > 0) {
            return Math.min(...this.currentData.maturityLevels.map(l => l.score));
        }
        return DEFAULT_SCALE_MIN;
    }

    /**
     * Derive scale max from legacy maturityLevels
     * @private
     */
    _deriveScaleMax() {
        if (this.currentData?.maturityLevels?.length > 0) {
            return Math.max(...this.currentData.maturityLevels.map(l => l.score));
        }
        return DEFAULT_SCALE_MAX;
    }

    /**
     * Set the data source and clear cache
     * @param {MaturityData} dataSource - New data source
     */
    setDataSource(dataSource) {
        if (!dataSource) {
            throw new Error('DataTransformer: Data source cannot be null');
        }

        this.validateDataSource(dataSource);
        this.currentData = this.deepClone(dataSource);

        // Auto-detect scale from legacy maturityLevels if no explicit scale set
        if (!this.scaleConfig && dataSource.maturityLevels?.length > 0) {
            const sorted = [...dataSource.maturityLevels].sort((a, b) => a.score - b.score);
            this.scaleConfig = {
                min: sorted[0].score,
                max: sorted[sorted.length - 1].score,
                levels: sorted.map(ml => ({ score: ml.score, label: ml.definition }))
            };
        }

        this.transformedData = this.transformMaturityData(this.currentData.maturityData);
        this.clearCache();
    }

    /**
     * Validate data source structure
     * @private
     * @param {MaturityData} dataSource - Data to validate
     */
    validateDataSource(dataSource) {
        const required = ['categories', 'applications', 'maturityData'];

        for (const field of required) {
            if (!dataSource[field]) {
                throw new Error(`DataTransformer: Missing required field: ${field}`);
            }
        }

        if (!Array.isArray(dataSource.maturityData) || dataSource.maturityData.length === 0) {
            throw new Error('DataTransformer: maturityData must be a non-empty array');
        }
    }

    /**
     * Deep clone an object
     * @private
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Clear all cached results
     * @private
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Transform a raw maturity value to the 0-100 internal range.
     * Uses dynamic formula: (value - min) / (max - min) * 100
     *
     * Instance method that uses this transformer's scale config.
     *
     * @param {number} value - Raw maturity value
     * @returns {number} Transformed value (0 to 100)
     */
    transformValue(value) {
        if (typeof value !== 'number') {
            console.warn('DataTransformer: Invalid scale value, using 0');
            const min = this.getScaleMin();
            const max = this.getScaleMax();
            return Math.round((0 - min) / (max - min) * 100);
        }
        const min = this.getScaleMin();
        const max = this.getScaleMax();
        return Math.round((value - min) / (max - min) * 100);
    }

    /**
     * Reverse transform from 0-100 internal range to raw scale.
     * Uses dynamic formula: value / 100 * (max - min) + min
     *
     * Instance method that uses this transformer's scale config.
     *
     * @param {number} value - Transformed value (0 to 100)
     * @returns {number} Raw maturity value
     */
    reverseTransformValue(value) {
        if (typeof value !== 'number') {
            console.warn('DataTransformer: Invalid scale value');
            return this.getScaleMin();
        }
        const min = this.getScaleMin();
        const max = this.getScaleMax();
        return Math.round(value / 100 * (max - min) + min);
    }

    /**
     * Transform maturity scale using legacy static formula: 20x + 40
     * Kept for backward compatibility. Maps -2→0, 0→40, 3→100.
     *
     * @param {number} value - Raw maturity value (-2 to 3)
     * @returns {number} Transformed value (0 to 100)
     */
    static transformScale(value) {
        if (typeof value !== 'number') {
            console.warn('DataTransformer: Invalid scale value, using 0');
            return 40; // Transform 0 = 40
        }
        return Math.round(20 * value + 40);
    }

    /**
     * Reverse transform using legacy static formula: (x - 40) / 20
     * Kept for backward compatibility.
     *
     * @param {number} value - Transformed value (0 to 100)
     * @returns {number} Raw maturity value (-2 to 3)
     */
    static transformScaleReverse(value) {
        if (typeof value !== 'number') {
            console.warn('DataTransformer: Invalid scale value, using 40');
            return 0; // Reverse transform 40 = 0
        }
        return Math.round((value - 40) / 20);
    }

    /**
     * Transform raw maturity data with scale transformation
     * @private
     * @param {Array<Array<DataPoint>>} rawData - Raw maturity data
     * @returns {Array<Array<DataPoint>>} Transformed data
     */
    transformMaturityData(rawData) {
        return rawData.map((appData, appIndex) =>
            appData.map(point => ({
                ...point,
                value: this.transformValue(point.value),
                originalIndex: point.originalIndex ?? appIndex
            }))
        );
    }

    /**
     * Get all application names
     * @returns {Array<string>} Application names
     */
    getAppNames() {
        const cacheKey = 'appNames';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.currentData) {
            throw new Error('DataTransformer: No data source set');
        }

        const appNames = [...this.currentData.applications].sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
        );

        this.cache.set(cacheKey, appNames);
        return appNames;
    }

    /**
     * Get all category names (legend names)
     * @returns {Array<string>} Category names
     */
    getLegendNames() {
        const cacheKey = 'legendNames';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.currentData) {
            throw new Error('DataTransformer: No data source set');
        }

        const legendNames = [...this.currentData.categories];
        this.cache.set(cacheKey, legendNames);
        return legendNames;
    }

    /**
     * Get transformed and sorted data for all applications
     * @returns {Array<Array<DataPoint>>} Sorted transformed data
     */
    getTransformedSortedData() {
        const cacheKey = 'transformedSortedData';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.transformedData) {
            throw new Error('DataTransformer: No transformed data available');
        }

        // Sort data by application names
        const appNames = this.getAppNames();
        const sortedData = appNames.map(appName => {
            const appData = this.transformedData.find(data =>
                data.length > 0 && data[0].app === appName
            );
            return appData || [];
        }).filter(data => data.length > 0);

        this.cache.set(cacheKey, sortedData);
        return sortedData;
    }

    /**
     * Get data for selected applications by indices
     * @param {Array<number>} selectedIndices - Array of application indices
     * @param {boolean} useRawValues - If true, return raw values instead of transformed
     * @returns {Array<Array<DataPoint>>} Selected application data
     */
    getSelectedData(selectedIndices, useRawValues = false) {
        if (!Array.isArray(selectedIndices)) {
            console.warn('DataTransformer: selectedIndices must be an array');
            return [];
        }

        if (selectedIndices.length === 0) {
            return [];
        }

        const allData = useRawValues ? this.getRawSortedData() : this.getTransformedSortedData();
        const averageId = this.currentData?.idAverageCategories ?? 100;

        return selectedIndices.map(index => {
            // Check if this is the special average ID (handle both number and string)
            if (index === averageId || index === String(averageId) || String(index) === String(averageId)) {
                const avgData = useRawValues ? this.getRawCategoryAvgs() : this.getCategoryAvgs();
                return avgData[0] || [];
            }

            // Regular application data lookup
            if (index >= 0 && index < allData.length) {
                const appData = allData[index];
                // Ensure originalIndex is set to the actual applications array index
                return appData.map(point => ({
                    ...point,
                    originalIndex: index
                }));
            }

            // Out of bounds - might be another special ID
            console.warn(`DataTransformer: Index ${index} out of bounds (average ID is ${averageId})`);
            return [];
        }).filter(data => data.length > 0);
    }

    /**
     * Get data for a single application by name
     * @param {string} appName - Application name
     * @returns {Array<DataPoint>|undefined} Application data or undefined if not found
     */
    getSingleDataSet(appName) {
        if (!appName || typeof appName !== 'string') {
            console.warn('DataTransformer: Invalid application name');
            return undefined;
        }

        const allData = this.getTransformedSortedData();
        return allData.find(data =>
            data.length > 0 && data[0].app === appName
        );
    }

    /**
     * Get raw (untransformed) sorted data for all applications
     * @returns {Array<Array<DataPoint>>} Raw sorted data
     */
    getRawSortedData() {
        const cacheKey = 'rawSortedData';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.currentData) {
            throw new Error('DataTransformer: No raw data available');
        }

        // Sort raw data by application names
        const appNames = this.getAppNames();
        const sortedData = appNames.map(appName => {
            const appData = this.currentData.maturityData.find(data =>
                data.length > 0 && data[0].app === appName
            );
            return appData || [];
        }).filter(data => data.length > 0);

        this.cache.set(cacheKey, sortedData);
        return sortedData;
    }

    /**
     * Calculate category averages across all applications
     * @returns {Array<Array<DataPoint>>} Category averages as chart data
     */
    getCategoryAvgs() {
        const cacheKey = 'categoryAvgs';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.currentData || !this.transformedData) {
            throw new Error('DataTransformer: No data available for averaging');
        }

        const categories = this.currentData.categories;
        const averageTitle = this.currentData.averageTitle || 'Category Averages';
        const averageId = this.currentData.idAverageCategories || 100;

        // Calculate averages for each category
        const categoryAverages = categories.map((category, categoryIndex) => {
            const values = this.transformedData
                .filter(appData => appData.length > categoryIndex)
                .map(appData => appData[categoryIndex]?.value || 0)
                .filter(value => !isNaN(value));

            const average = values.length > 0
                ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
                : 0;

            return {
                app: averageTitle,
                axis: category,
                value: average,
                originalIndex: averageId
            };
        });

        const result = [categoryAverages];
        this.cache.set(cacheKey, result);
        return result;
    }

    /**
     * Calculate raw category averages across all applications
     * @returns {Array<Array<DataPoint>>} Raw category averages as chart data
     */
    getRawCategoryAvgs() {
        const cacheKey = 'rawCategoryAvgs';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (!this.currentData) {
            throw new Error('DataTransformer: No raw data available for averaging');
        }

        const categories = this.currentData.categories;
        const averageTitle = this.currentData.averageTitle || 'Category Averages';
        const averageId = this.currentData.idAverageCategories || 100;

        // Calculate averages for each category using raw values
        const categoryAverages = categories.map((category, categoryIndex) => {
            const values = this.currentData.maturityData
                .filter(appData => appData.length > categoryIndex)
                .map(appData => appData[categoryIndex]?.value || 0)
                .filter(value => !isNaN(value));

            const average = values.length > 0
                ? values.reduce((sum, val) => sum + val, 0) / values.length
                : 0;

            return {
                app: averageTitle,
                axis: category,
                value: average,
                originalIndex: averageId
            };
        });

        const result = [categoryAverages];
        this.cache.set(cacheKey, result);
        return result;
    }

    /**
     * Get overall maturity rating for all applications
     * @returns {Array<Object>} Applications with their average ratings
     */
    getAllAppsMaturityRating() {
        const cacheKey = 'allAppsRating';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const allData = this.getTransformedSortedData();

        const ratings = allData.map(appData => {
            if (!appData || appData.length === 0) {
                return null;
            }

            const values = appData.map(point => point.value).filter(val => !isNaN(val));
            const average = values.length > 0
                ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
                : 0;

            return {
                app: appData[0].app,
                averageRating: average,
                rawAverage: this.reverseTransformValue(average),
                dataPoints: appData.length
            };
        }).filter(rating => rating !== null);

        // Sort by average rating (descending)
        ratings.sort((a, b) => b.averageRating - a.averageRating);

        this.cache.set(cacheKey, ratings);
        return ratings;
    }

    /**
     * Get current data source
     * @returns {MaturityData|null} Current data source
     */
    getCurrentData() {
        return this.currentData;
    }

    /**
     * Get transformed data
     * @returns {Array<Array<DataPoint>>|null} Transformed data
     */
    getTransformedData() {
        return this.transformedData;
    }

    /**
     * Clear all data and cache
     */
    reset() {
        this.currentData = null;
        this.transformedData = null;
        this.scaleConfig = null;
        this.clearCache();
    }

    /**
     * Get cache statistics for debugging
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Static methods for backward compatibility
DataTransformer.transformScale = DataTransformer.transformScale;
DataTransformer.transformScaleReverse = DataTransformer.transformScaleReverse;

export default DataTransformer;
