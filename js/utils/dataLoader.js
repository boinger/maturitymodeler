/**
 * Data Loading Utility with Error Handling
 * Provides robust data loading with fallbacks, user feedback,
 * and runtime data source switching via URL query param or API.
 */

"use strict";

// Import data modules statically to avoid webpack chunking
import dataRadarModule from '../data/data_radar.js';
import iacRadarModule from '../data/iac_radar.js';

/**
 * Registry of available data sources.
 * Keys are the short names usable in ?data= query param.
 */
const DATA_SOURCES = {
    data_radar: { module: dataRadarModule, label: "CI/CD Maturity Model" },
    iac_radar: { module: iacRadarModule, label: "IaC Maturity Model" }
};

// Fallback data for when all sources fail
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
    usingFallback: false,
    currentSource: 'data_radar'
};

/**
 * Show loading indicator to user
 */
function showLoadingIndicator() {
    const titleElement = document.getElementById("title");
    if (titleElement) {
        titleElement.textContent = "Loading maturity model data...";
        titleElement.style.color = "#666";
    }

    const chartElement = document.getElementById("chart");
    if (chartElement) {
        chartElement.textContent = '';
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = 'text-align: center; padding: 40px; color: #666;';
        loadingDiv.textContent = 'Loading visualization...';
        chartElement.appendChild(loadingDiv);
    }
}

/**
 * Show error message to user with fallback option
 */
function showErrorMessage(error, canUseFallback = true) {
    console.error("Data loading error:", error);
    const errorMsg = (error && error.message) ? String(error.message) : 'Unknown error occurred';

    const titleElement = document.getElementById("title");
    if (titleElement) {
        titleElement.textContent = canUseFallback
            ? "Data Loading Error - Using Demo Data"
            : "Critical Error - Application Cannot Load";
        titleElement.style.color = "#d62728";
    }

    const chartElement = document.getElementById("chart");
    if (chartElement) {
        chartElement.textContent = '';
        const wrapper = document.createElement('div');
        wrapper.style.cssText = canUseFallback
            ? 'background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; border-radius: 4px;'
            : 'background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin: 10px 0; border-radius: 4px;';

        const strong = document.createElement('strong');
        strong.textContent = canUseFallback ? 'Notice: ' : 'Error: ';
        wrapper.appendChild(strong);

        const text = document.createElement('span');
        text.textContent = canUseFallback
            ? 'Could not load primary data. Displaying demo data instead.'
            : 'Application cannot initialize.';
        wrapper.appendChild(text);

        wrapper.appendChild(document.createElement('br'));

        const detail = document.createElement('small');
        detail.textContent = 'Error: ' + errorMsg;
        wrapper.appendChild(detail);

        if (!canUseFallback) {
            wrapper.appendChild(document.createElement('br'));
            const btn = document.createElement('button');
            btn.style.cssText = 'margin-top: 10px; padding: 5px 10px;';
            btn.textContent = 'Retry';
            btn.addEventListener('click', () => location.reload());
            wrapper.appendChild(btn);
        }

        chartElement.appendChild(wrapper);
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
 * Read the data source name from URL query param ?data=<name>
 * @returns {string|null} Data source name or null if not specified
 */
function getDataSourceFromURL() {
    if (typeof window === 'undefined' || !window.location) return null;
    try {
        const params = new URLSearchParams(window.location.search);
        return params.get('data');
    } catch (e) {
        return null;
    }
}

/**
 * Resolve which data module to use based on source name.
 * @param {string} [sourceName] - Data source key (e.g. "iac_radar")
 * @returns {Object} The data module's default export
 */
function resolveDataModule(sourceName) {
    if (sourceName && DATA_SOURCES[sourceName]) {
        return DATA_SOURCES[sourceName].module;
    }
    // Default to primary
    return dataRadarModule;
}

/**
 * Load data with error handling and fallback.
 * Checks ?data= query param first, then falls back to primary data.
 */
async function loadDataWithFallback() {
    loadingState.isLoading = true;
    loadingState.hasError = false;
    loadingState.usingFallback = false;

    showLoadingIndicator();

    try {
        // Check URL param for data source selection
        const requestedSource = getDataSourceFromURL();
        const sourceName = requestedSource && DATA_SOURCES[requestedSource]
            ? requestedSource
            : 'data_radar';

        const data = resolveDataModule(sourceName);

        // Validate the loaded data
        validateDataStructure(data);

        loadingState.currentSource = sourceName;
        console.log(`Successfully loaded data source: ${sourceName}`);
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
            loadingState.currentSource = 'fallback';

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
 * Load a specific data source by name.
 * Returns validated data or throws.
 *
 * @param {string} sourceName - Key from DATA_SOURCES (e.g. "iac_radar")
 * @returns {Object} Validated data module
 */
function loadDataSource(sourceName) {
    if (!DATA_SOURCES[sourceName]) {
        throw new Error(`Unknown data source: ${sourceName}`);
    }
    const data = DATA_SOURCES[sourceName].module;
    validateDataStructure(data);
    loadingState.currentSource = sourceName;
    return data;
}

/**
 * Get list of available data sources for the settings panel.
 * @returns {Array<{key: string, label: string, active: boolean}>}
 */
function getAvailableDataSources() {
    return Object.entries(DATA_SOURCES).map(([key, entry]) => ({
        key,
        label: entry.label,
        active: key === loadingState.currentSource
    }));
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
        usingFallback: false,
        currentSource: 'data_radar'
    };
}

// ES Module exports
export {
    loadDataWithFallback,
    loadDataSource,
    getAvailableDataSources,
    getLoadingState,
    resetLoadingState,
    validateDataStructure,
    FALLBACK_DATA
};

export default {
    loadDataWithFallback,
    loadDataSource,
    getAvailableDataSources,
    getLoadingState,
    resetLoadingState,
    validateDataStructure,
    FALLBACK_DATA
};
