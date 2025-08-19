/**
 * Modernized Transform Module
 * 
 * LEGACY WRAPPER: This file now wraps the new DataTransformer class for backward compatibility.
 * All new development should use DataTransformer directly.
 * 
 * Original created by Gary A. Stafford on 1/29/15
 * Modified by Jeff Vier beginning 7 Dec 2020
 * Modernized with DataTransformer class integration
 * https://github.com/boinger/maturitymodeler
 */

import DataTransformer from './DataTransformer.js';
import dataRadar from '../data/data_radar.js';

"use strict";

// Global transformer instance for backward compatibility
let globalTransformer = new DataTransformer(dataRadar);

/**
 * Set new data source (legacy API)
 * @param {Object} newDataRadar - New data source
 */
const setDataSource = (newDataRadar) => {
    try {
        globalTransformer.setDataSource(newDataRadar);
    } catch (error) {
        console.error('Transform: Failed to set data source:', error);
        // Fallback to creating new transformer
        globalTransformer = new DataTransformer(newDataRadar);
    }
};

/**
 * Transform scale from -2→3 to 0→100 (legacy API)
 * @param {number} value - Raw value
 * @returns {number} Transformed value
 */
const transformScale = (value) => DataTransformer.transformScale(value);

/**
 * Reverse transform scale from 0→100 to -2→3 (legacy API)
 * @param {number} value - Transformed value
 * @returns {number} Raw value
 */
const transformScaleReverse = (value) => DataTransformer.transformScaleReverse(value);

/**
 * Get all application names (legacy API)
 * @returns {Array<string>} Application names
 */
const getAppNames = () => {
    try {
        return globalTransformer.getAppNames();
    } catch (error) {
        console.error('Transform: Failed to get app names:', error);
        return [];
    }
};

/**
 * Get all legend names (legacy API)
 * @returns {Array<string>} Legend names
 */
const getLegendNames = () => {
    try {
        return globalTransformer.getLegendNames();
    } catch (error) {
        console.error('Transform: Failed to get legend names:', error);
        return [];
    }
};

/**
 * Get transformed sorted data (legacy API)
 * @returns {Array} Transformed data
 */
const getTransformedSortedData = () => {
    try {
        return globalTransformer.getTransformedSortedData();
    } catch (error) {
        console.error('Transform: Failed to get transformed data:', error);
        return [];
    }
};

/**
 * Get selected data by indices (legacy API)
 * @param {Array<number>} selectedIndices - Selected indices
 * @returns {Array} Selected data
 */
const getSelectedData = (selectedIndices) => {
    try {
        return globalTransformer.getSelectedData(selectedIndices);
    } catch (error) {
        console.error('Transform: Failed to get selected data:', error);
        return [];
    }
};

/**
 * Get single dataset by app name (legacy API)
 * @param {string} appName - Application name
 * @returns {Array|undefined} Application data
 */
const getSingleDataSet = (appName) => {
    try {
        return globalTransformer.getSingleDataSet(appName);
    } catch (error) {
        console.error('Transform: Failed to get single dataset:', error);
        return undefined;
    }
};

/**
 * Get category averages (legacy API)
 * @returns {Array} Category averages
 */
const getCategoryAvgs = () => {
    try {
        return globalTransformer.getCategoryAvgs();
    } catch (error) {
        console.error('Transform: Failed to get category averages:', error);
        return [[]];
    }
};

/**
 * Get all apps maturity rating (legacy API)
 * @returns {Array} All apps ratings
 */
const getAllAppsMaturityRating = () => {
    try {
        return globalTransformer.getAllAppsMaturityRating();
    } catch (error) {
        console.error('Transform: Failed to get all apps rating:', error);
        return [];
    }
};

/**
 * Get the global transformer instance
 * @returns {DataTransformer} Transformer instance
 */
const getTransformer = () => globalTransformer;

// ES Module exports - maintaining exact legacy API
export {
    setDataSource,
    transformScale,
    transformScaleReverse,
    getAppNames,
    getLegendNames,
    getTransformedSortedData,
    getSelectedData,
    getSingleDataSet,
    getCategoryAvgs,
    getAllAppsMaturityRating,
    getTransformer
};

// Default export maintaining legacy structure
export default {
    setDataSource,
    transformScale,
    transformScaleReverse,
    getAppNames,
    getLegendNames,
    getTransformedSortedData,
    getSelectedData,
    getSingleDataSet,
    getCategoryAvgs,
    getAllAppsMaturityRating,
    getTransformer
};