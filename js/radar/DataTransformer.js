/**
 * Modern Data Transformation Utility
 * 
 * Handles data transformations for maturity model visualization:
 * - Scale transformations: -2 to 3 → 0 to 100 (formula: 20x + 40)
 * - Data aggregation and filtering
 * - Application data management
 * 
 * @module DataTransformer
 */

"use strict";

/**
 * @typedef {Object} DataPoint
 * @property {string} app - Application name
 * @property {string} axis - Category/axis name  
 * @property {number} value - Raw maturity value (-2 to 3)
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
 * DataTransformer class - Handles all data transformations for maturity visualization
 */
class DataTransformer {
    /**
     * Create a DataTransformer instance
     * @param {MaturityData} [initialData] - Initial data source
     */
    constructor(initialData = null) {
        this.currentData = null;
        this.transformedData = null;
        this.cache = new Map();
        
        if (initialData) {
            this.setDataSource(initialData);
        }
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
        this.transformedData = this.transformMaturityData(this.currentData.maturityData);
        this.clearCache();
        
        console.log('DataTransformer: Data source updated');
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
     * Transform maturity scale from -2→3 to 0→100
     * Formula: 20x + 40
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
     * Reverse transform maturity scale from 0→100 to -2→3
     * Formula: (x - 40) / 20
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
                value: DataTransformer.transformScale(point.value),
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
     * @returns {Array<Array<DataPoint>>} Selected application data
     */
    getSelectedData(selectedIndices) {
        if (!Array.isArray(selectedIndices)) {
            console.warn('DataTransformer: selectedIndices must be an array');
            return [];
        }

        const allData = this.getTransformedSortedData();
        
        return selectedIndices.map(index => {
            if (index >= 0 && index < allData.length) {
                return allData[index];
            }
            console.warn(`DataTransformer: Index ${index} out of bounds`);
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
                rawAverage: DataTransformer.transformScaleReverse(average),
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