/**
 * Data Loading Utility with Error Handling
 * Provides robust data loading with fallbacks and user feedback
 */

"use strict";

// Import data modules statically to avoid webpack chunking
import dataRadarModule from '../data/data_radar.js';

// Fallback data for when main data fails to load
const FALLBACK_DATA = {
    pageTitle: "Maturity Model Visualization (Demo Mode)",
    legendTitle: "Applications (Demo Data)",
    averageTitle: "Sample Average",
    idAverageCategories: 100,
    referenceLink1: "",
    referenceLinkTitle1: "",
    referenceLink2: "",
    referenceLinkTitle2: "",
    maturityLevels: [
        { score: -2, definition: "Unranked" },
        { score: -1, definition: "Base" },
        { score: 0, definition: "Minimal" },
        { score: 1, definition: "Intermediate" },
        { score: 2, definition: "Advanced" },
        { score: 3, definition: "Extreme" }
    ],
    categoryCount: 4,
    categories: [
        "Sample Category 1",
        "Sample Category 2", 
        "Sample Category 3",
        "Sample Category 4"
    ],
    applications: [
        "Demo Application 1",
        "Demo Application 2"
    ],
    maturityData: [
        [
            { app: "Demo Application 1", axis: "Sample Category 1", value: 1 },
            { app: "Demo Application 1", axis: "Sample Category 2", value: 0 },
            { app: "Demo Application 1", axis: "Sample Category 3", value: 2 },
            { app: "Demo Application 1", axis: "Sample Category 4", value: -1 }
        ],
        [
            { app: "Demo Application 2", axis: "Sample Category 1", value: 0 },
            { app: "Demo Application 2", axis: "Sample Category 2", value: 2 },
            { app: "Demo Application 2", axis: "Sample Category 3", value: 1 },
            { app: "Demo Application 2", axis: "Sample Category 4", value: 1 }
        ]
    ],
    emptyDataSet: [
        [
            { app: "", axis: "Sample Category 1", value: -2 },
            { app: "", axis: "Sample Category 2", value: -2 },
            { app: "", axis: "Sample Category 3", value: -2 },
            { app: "", axis: "Sample Category 4", value: -2 }
        ]
    ]
};

// Loading state management
let loadingState = {
    isLoading: false,
    hasError: false,
    errorMessage: '',
    usingFallback: false
};

/**
 * Show loading indicator to user
 */
function showLoadingIndicator() {
    const titleElement = document.getElementById("title");
    if (titleElement) {
        titleElement.innerHTML = "Loading maturity model data...";
        titleElement.style.color = "#666";
    }
    
    const chartElement = document.getElementById("chart");
    if (chartElement) {
        chartElement.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Loading visualization...</div>';
    }
}

/**
 * Show error message to user with fallback option
 */
function showErrorMessage(error, canUseFallback = true) {
    console.error("Data loading error:", error);
    
    const titleElement = document.getElementById("title");
    if (titleElement) {
        if (canUseFallback) {
            titleElement.innerHTML = "⚠️ Data Loading Error - Using Demo Data";
            titleElement.style.color = "#d62728";
        } else {
            titleElement.innerHTML = "❌ Critical Error - Application Cannot Load";
            titleElement.style.color = "#d62728";
        }
    }
    
    const chartElement = document.getElementById("chart");
    if (chartElement && canUseFallback) {
        chartElement.innerHTML = `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; border-radius: 4px;">
                <strong>Notice:</strong> Could not load primary data. Displaying demo data instead.<br>
                <small>Error: ${error.message || 'Unknown error occurred'}</small>
            </div>
        `;
    } else if (chartElement) {
        chartElement.innerHTML = `
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin: 10px 0; border-radius: 4px;">
                <strong>Error:</strong> Application cannot initialize.<br>
                <small>${error.message || 'Unknown error occurred'}</small><br>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px;">Retry</button>
            </div>
        `;
    }
}

/**
 * Validate data structure to ensure it has required properties
 */
function validateDataStructure(data) {
    const requiredProps = [
        'pageTitle', 'categories', 'applications', 'maturityData', 
        'idAverageCategories', 'categoryCount'
    ];
    
    for (const prop of requiredProps) {
        if (!data[prop]) {
            throw new Error(`Missing required property: ${prop}`);
        }
    }
    
    // Validate categories is non-empty array
    if (!Array.isArray(data.categories) || data.categories.length === 0) {
        throw new Error('Categories must be a non-empty array');
    }
    
    // Validate applications is non-empty array
    if (!Array.isArray(data.applications) || data.applications.length === 0) {
        throw new Error('Applications must be a non-empty array');
    }
    
    // Validate maturityData structure
    if (!Array.isArray(data.maturityData) || data.maturityData.length === 0) {
        throw new Error('MaturityData must be a non-empty array');
    }
    
    // Validate each app's data
    data.maturityData.forEach((appData, appIndex) => {
        if (!Array.isArray(appData)) {
            throw new Error(`MaturityData[${appIndex}] must be an array`);
        }
        
        appData.forEach((point, pointIndex) => {
            if (!point || typeof point !== 'object') {
                throw new Error(`Invalid data point at app ${appIndex}, point ${pointIndex}`);
            }
            
            if (typeof point.app !== 'string' || 
                typeof point.axis !== 'string' || 
                typeof point.value !== 'number') {
                throw new Error(`Invalid data point structure at app ${appIndex}, point ${pointIndex}`);
            }
        });
    });
    
    return true;
}

/**
 * Load data with error handling and fallback
 */
async function loadDataWithFallback() {
    loadingState.isLoading = true;
    loadingState.hasError = false;
    loadingState.usingFallback = false;
    
    showLoadingIndicator();
    
    try {
        // Use statically imported primary data
        const data = dataRadarModule;
        
        // Validate the loaded data
        validateDataStructure(data);
        
        console.log('Successfully loaded primary data');
        loadingState.isLoading = false;
        return data;
        
    } catch (primaryError) {
        console.warn('Primary data loading failed:', primaryError);
        
        // Use fallback data as last resort
        try {
            validateDataStructure(FALLBACK_DATA);
            
            loadingState.usingFallback = true;
            loadingState.hasError = true;
            loadingState.errorMessage = `Data loading failed: ${primaryError.message}`;
            
            showErrorMessage(primaryError, true);
            
            console.log('Using fallback demo data');
            loadingState.isLoading = false;
            return FALLBACK_DATA;
            
        } catch (fallbackError) {
            // Critical failure - even fallback data is broken
            loadingState.hasError = true;
            loadingState.errorMessage = 'Critical error: All data sources failed';
            
            showErrorMessage(new Error('All data sources failed including fallback'), false);
            
            loadingState.isLoading = false;
            throw new Error('Critical data loading failure');
        }
    }
}

/**
 * Get current loading state
 */
function getLoadingState() {
    return { ...loadingState };
}

/**
 * Reset loading state (useful for testing)
 */
function resetLoadingState() {
    loadingState = {
        isLoading: false,
        hasError: false,
        errorMessage: '',
        usingFallback: false
    };
}

// ES Module exports
export {
    loadDataWithFallback,
    getLoadingState,
    resetLoadingState,
    validateDataStructure,
    FALLBACK_DATA
};

export default {
    loadDataWithFallback,
    getLoadingState,
    resetLoadingState,
    validateDataStructure,
    FALLBACK_DATA
};