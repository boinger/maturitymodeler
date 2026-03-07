/**
 * Configuration Schema, Validation, and Merge Logic
 *
 * Defines the canonical config shape for maturity model data files.
 * Provides validation, default values, and deep-merge utilities.
 *
 * @module configSchema
 */

"use strict";

/**
 * Default configuration - used as fallback for any missing fields
 */
const CONFIG_DEFAULTS = {
    meta: {
        pageTitle: "Maturity Gap Analysis",
        legendTitle: "Application Platforms",
        averageTitle: "Average Maturity - All Systems",
        references: []
    },

    scale: {
        min: -1,
        max: 4,
        levels: [
            { score: -1, label: "Unranked" },
            { score: 0, label: "Base" },
            { score: 1, label: "Minimal" },
            { score: 2, label: "Intermediate" },
            { score: 3, label: "Advanced" },
            { score: 4, label: "Extreme" }
        ]
    },

    categories: [],
    applications: [],
    maturityData: [],

    theme: {
        colorPalette: null  // null means use default palette
    }
};

/**
 * Default color palette (D3 category10 extended to 20 colors)
 */
const DEFAULT_COLOR_PALETTE = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
    "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
    "#c49c94", "#f7b6d3", "#c7c7c7", "#dbdb8d", "#9edae5"
];

/**
 * Preset color palettes for the runtime selector
 */
const COLOR_PRESETS = {
    default: {
        name: "Default",
        colors: DEFAULT_COLOR_PALETTE
    },
    tableau10: {
        name: "Tableau 10",
        colors: [
            "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
            "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ac"
        ]
    },
    colorblind: {
        name: "Colorblind Safe",
        colors: [
            "#0072B2", "#E69F00", "#009E73", "#CC79A7", "#56B4E9",
            "#D55E00", "#F0E442", "#000000", "#999999", "#661100"
        ]
    },
    pastel: {
        name: "Pastel",
        colors: [
            "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3",
            "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd"
        ]
    },
    vivid: {
        name: "Vivid",
        colors: [
            "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
            "#911eb4", "#42d4f4", "#f032e6", "#bfef45", "#fabed4"
        ]
    }
};

/**
 * Special ID for computed average categories
 */
const ID_AVERAGE_CATEGORIES = 100;

/**
 * Deep merge two objects. Source values override target values.
 * Arrays are replaced, not merged.
 *
 * @param {Object} target - Base object
 * @param {Object} source - Override object
 * @returns {Object} Merged result (new object, inputs not mutated)
 */
function deepMerge(target, source) {
    const result = { ...target };

    for (const key of Object.keys(source)) {
        const sourceVal = source[key];
        const targetVal = target[key];

        if (
            sourceVal !== null &&
            typeof sourceVal === 'object' &&
            !Array.isArray(sourceVal) &&
            targetVal !== null &&
            typeof targetVal === 'object' &&
            !Array.isArray(targetVal)
        ) {
            result[key] = deepMerge(targetVal, sourceVal);
        } else if (sourceVal !== undefined) {
            result[key] = sourceVal;
        }
    }

    return result;
}

/**
 * Validate a config object against the schema.
 * Throws on invalid config with a descriptive message.
 *
 * @param {Object} config - Config to validate
 * @throws {Error} If config is invalid
 */
function validateConfig(config) {
    if (!config || typeof config !== 'object') {
        throw new Error('Config must be a non-null object');
    }

    // categories required and non-empty
    if (!Array.isArray(config.categories) || config.categories.length === 0) {
        throw new Error('Config: categories must be a non-empty array of strings');
    }
    for (let i = 0; i < config.categories.length; i++) {
        if (typeof config.categories[i] !== 'string') {
            throw new Error(`Config: categories[${i}] must be a string`);
        }
    }

    // applications required and non-empty
    if (!Array.isArray(config.applications) || config.applications.length === 0) {
        throw new Error('Config: applications must be a non-empty array of strings');
    }
    for (let i = 0; i < config.applications.length; i++) {
        if (typeof config.applications[i] !== 'string') {
            throw new Error(`Config: applications[${i}] must be a string`);
        }
    }

    // maturityData required, dimensions must match
    if (!Array.isArray(config.maturityData) || config.maturityData.length === 0) {
        throw new Error('Config: maturityData must be a non-empty array');
    }
    if (config.maturityData.length !== config.applications.length) {
        throw new Error(
            `Config: maturityData length (${config.maturityData.length}) must match ` +
            `applications length (${config.applications.length})`
        );
    }
    for (let i = 0; i < config.maturityData.length; i++) {
        const appData = config.maturityData[i];
        if (!Array.isArray(appData)) {
            throw new Error(`Config: maturityData[${i}] must be an array`);
        }
        if (appData.length !== config.categories.length) {
            throw new Error(
                `Config: maturityData[${i}] length (${appData.length}) must match ` +
                `categories length (${config.categories.length})`
            );
        }
        for (let j = 0; j < appData.length; j++) {
            const point = appData[j];
            if (!point || typeof point !== 'object') {
                throw new Error(`Config: maturityData[${i}][${j}] must be an object`);
            }
            if (typeof point.value !== 'number') {
                throw new Error(`Config: maturityData[${i}][${j}].value must be a number`);
            }
            if (typeof point.app !== 'string') {
                throw new Error(`Config: maturityData[${i}][${j}].app must be a string`);
            }
            if (typeof point.axis !== 'string') {
                throw new Error(`Config: maturityData[${i}][${j}].axis must be a string`);
            }
        }
    }

    // scale validation (if provided)
    if (config.scale) {
        if (typeof config.scale.min !== 'number' || typeof config.scale.max !== 'number') {
            throw new Error('Config: scale.min and scale.max must be numbers');
        }
        if (config.scale.min >= config.scale.max) {
            throw new Error('Config: scale.min must be less than scale.max');
        }
        if (config.scale.levels) {
            if (!Array.isArray(config.scale.levels) || config.scale.levels.length < 2) {
                throw new Error('Config: scale.levels must be an array with at least 2 entries');
            }
            // Check levels are ordered by score
            for (let i = 1; i < config.scale.levels.length; i++) {
                if (config.scale.levels[i].score <= config.scale.levels[i - 1].score) {
                    throw new Error('Config: scale.levels must be ordered by ascending score');
                }
            }
            // Each level needs score and label
            for (let i = 0; i < config.scale.levels.length; i++) {
                const level = config.scale.levels[i];
                if (typeof level.score !== 'number') {
                    throw new Error(`Config: scale.levels[${i}].score must be a number`);
                }
                if (typeof level.label !== 'string') {
                    throw new Error(`Config: scale.levels[${i}].label must be a string`);
                }
            }
        }
    }

    // theme.colorPalette validation (if provided)
    if (config.theme?.colorPalette) {
        if (!Array.isArray(config.theme.colorPalette) || config.theme.colorPalette.length === 0) {
            throw new Error('Config: theme.colorPalette must be a non-empty array');
        }
    }
}

/**
 * Convert a legacy data file export to the new config schema.
 *
 * Legacy shape:
 *   { pageTitle, legendTitle, averageTitle, referenceLink1, referenceLinkTitle1,
 *     referenceLink2, referenceLinkTitle2, categories, applications, maturityData,
 *     maturityLevels: [{score, definition}], idAverageCategories, categoryCount, emptyDataSet }
 *
 * @param {Object} legacyData - Legacy data export
 * @returns {Object} Config in new schema
 */
function fromLegacyFormat(legacyData) {
    if (!legacyData || typeof legacyData !== 'object') {
        throw new Error('fromLegacyFormat: input must be a non-null object');
    }

    const references = [];
    if (legacyData.referenceLink1 && legacyData.referenceLinkTitle1) {
        references.push({
            url: legacyData.referenceLink1,
            title: legacyData.referenceLinkTitle1
        });
    }
    if (legacyData.referenceLink2 && legacyData.referenceLinkTitle2) {
        references.push({
            url: legacyData.referenceLink2,
            title: legacyData.referenceLinkTitle2
        });
    }

    // Derive scale from maturityLevels if present
    let scale;
    if (Array.isArray(legacyData.maturityLevels) && legacyData.maturityLevels.length > 0) {
        const sorted = [...legacyData.maturityLevels].sort((a, b) => a.score - b.score);
        scale = {
            min: sorted[0].score,
            max: sorted[sorted.length - 1].score,
            levels: sorted.map(ml => ({ score: ml.score, label: ml.definition }))
        };
    }

    const config = {
        meta: {
            pageTitle: legacyData.pageTitle,
            legendTitle: legacyData.legendTitle,
            averageTitle: legacyData.averageTitle,
            references
        },
        scale,
        categories: legacyData.categories,
        applications: legacyData.applications,
        maturityData: legacyData.maturityData,
        theme: {}
    };

    return config;
}

/**
 * Convert a new-schema config back to legacy format for backward compatibility.
 * Used during transition so downstream code can keep consuming the old shape.
 *
 * @param {Object} config - New-schema config
 * @returns {Object} Legacy-format data object
 */
function toLegacyFormat(config) {
    const merged = mergeWithDefaults(config);

    const maturityLevels = (merged.scale?.levels || []).map(l => ({
        score: l.score,
        definition: l.label
    }));

    const refs = merged.meta?.references || [];

    // Build emptyDataSet from categories and scale min
    const emptyDataSet = [
        merged.categories.map(cat => ({
            app: "",
            axis: cat,
            value: merged.scale?.min ?? -1
        }))
    ];

    return {
        pageTitle: merged.meta?.pageTitle || CONFIG_DEFAULTS.meta.pageTitle,
        legendTitle: merged.meta?.legendTitle || CONFIG_DEFAULTS.meta.legendTitle,
        averageTitle: merged.meta?.averageTitle || CONFIG_DEFAULTS.meta.averageTitle,
        idAverageCategories: ID_AVERAGE_CATEGORIES,
        referenceLink1: refs[0]?.url || '',
        referenceLinkTitle1: refs[0]?.title || '',
        referenceLink2: refs[1]?.url || '',
        referenceLinkTitle2: refs[1]?.title || '',
        maturityLevels,
        categoryCount: merged.categories.length,
        categories: merged.categories,
        emptyDataSet,
        applications: merged.applications,
        maturityData: merged.maturityData
    };
}

/**
 * Merge incoming config with defaults, filling in any missing fields.
 *
 * @param {Object} config - Partial or full config
 * @returns {Object} Complete config with all fields populated
 */
function mergeWithDefaults(config) {
    return deepMerge(CONFIG_DEFAULTS, config);
}

/**
 * Resolve the effective color palette from config, user overrides, and defaults.
 *
 * Priority: userOverride > config.theme.colorPalette > DEFAULT_COLOR_PALETTE
 *
 * @param {Object} config - Config object
 * @param {string} [userOverridePreset] - Preset name from user selection
 * @returns {string[]} Resolved color palette
 */
function resolveColorPalette(config, userOverridePreset) {
    if (userOverridePreset && COLOR_PRESETS[userOverridePreset]) {
        return COLOR_PRESETS[userOverridePreset].colors;
    }
    if (config?.theme?.colorPalette) {
        return config.theme.colorPalette;
    }
    return DEFAULT_COLOR_PALETTE;
}

export {
    CONFIG_DEFAULTS,
    DEFAULT_COLOR_PALETTE,
    COLOR_PRESETS,
    ID_AVERAGE_CATEGORIES,
    deepMerge,
    validateConfig,
    fromLegacyFormat,
    toLegacyFormat,
    mergeWithDefaults,
    resolveColorPalette
};

export default {
    CONFIG_DEFAULTS,
    DEFAULT_COLOR_PALETTE,
    COLOR_PRESETS,
    ID_AVERAGE_CATEGORIES,
    deepMerge,
    validateConfig,
    fromLegacyFormat,
    toLegacyFormat,
    mergeWithDefaults,
    resolveColorPalette
};
