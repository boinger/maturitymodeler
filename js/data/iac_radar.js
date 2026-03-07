/**
 * Infrastructure as Code Maturity Gap Analysis
 * Financial Institution Sample Data
 * Created by Gary A. Stafford on 1/28/17
 * Modified by Jeff Vier beginning 7 Dec 2020
 * https://github.com/boinger/maturitymodeler
 */

"use strict";

    var CATEGORIES,
        MATURITY_LEVELS,
        ID_AVERAGE_CATEGORIES,
        applications,
        pageTitle,
        legendTitle,
        averageTitle,
        referenceLink1,
        referenceLinkTitle1,
        referenceLink2,
        referenceLinkTitle2,
        maturityData;

    /* CONSTANTS */

    CATEGORIES = [
        "Development",
        "Continuous Integration",
        "Provisioning",
        "Management",
        "Observability"
    ];

    MATURITY_LEVELS = [{
        score: -2,
        definition: "Unranked"
    }, {
        score: -1,
        definition: "Regressive"
    }, {
        score: 0,
        definition: "Repeatable"
    }, {
        score: 1,
        definition: "Consistent"
    }, {
        score: 2,
        definition: "Managed"
    }, {
        score: 3,
        definition: "Optimizing"
    }];

    ID_AVERAGE_CATEGORIES = 100;

    /* User-level variables */
    pageTitle = "IaC Maturity Gap Analysis: First Federated Bank";
    legendTitle = "Banking Platforms";
    averageTitle = "Average Maturity - All Systems";
    referenceLink1 = "https://github.com/boinger/maturitymodeler";
    referenceLinkTitle1 = "Maturity Modeler";
    referenceLink2 = "https://github.com/boinger/maturitymodeler";
    referenceLinkTitle2 = "Jeff Vier - 2020-2025";

    applications = [
        "Commercial Lending",
        "Core Banking",
        "Internet Banking",
        "Investment Services",
        "Mobile Banking",
        "Risk Management"
    ];

    maturityData = [
        [{ //Commercial Lending
            app: applications[0],
            axis: CATEGORIES[0],
            value: -1
        }, {
            app: applications[0],
            axis: CATEGORIES[1],
            value: 1
        }, {
            app: applications[0],
            axis: CATEGORIES[2],
            value: -1
        }, {
            app: applications[0],
            axis: CATEGORIES[3],
            value: 0
        }, {
            app: applications[0],
            axis: CATEGORIES[4],
            value: 2
        }],
        [{ //Core Banking
            app: applications[1],
            axis: CATEGORIES[0],
            value: 3
        }, {
            app: applications[1],
            axis: CATEGORIES[1],
            value: 2
        }, {
            app: applications[1],
            axis: CATEGORIES[2],
            value: -1
        }, {
            app: applications[1],
            axis: CATEGORIES[3],
            value: 1
        }, {
            app: applications[1],
            axis: CATEGORIES[4],
            value: 0
        }],
        [{ //Internet Banking
            app: applications[2],
            axis: CATEGORIES[0],
            value: 1
        }, {
            app: applications[2],
            axis: CATEGORIES[1],
            value: 2
        }, {
            app: applications[2],
            axis: CATEGORIES[2],
            value: -1
        }, {
            app: applications[2],
            axis: CATEGORIES[3],
            value: 0
        }, {
            app: applications[2],
            axis: CATEGORIES[4],
            value: 2
        }],
        [{ //Investment Services
            app: applications[3],
            axis: CATEGORIES[0],
            value: 1
        }, {
            app: applications[3],
            axis: CATEGORIES[1],
            value: 2
        }, {
            app: applications[3],
            axis: CATEGORIES[2],
            value: 1
        }, {
            app: applications[3],
            axis: CATEGORIES[3],
            value: 2
        }, {
            app: applications[3],
            axis: CATEGORIES[4],
            value: -1
        }],
        [{ //Mobile Banking
            app: applications[4],
            axis: CATEGORIES[0],
            value: 0
        }, {
            app: applications[4],
            axis: CATEGORIES[1],
            value: 2
        }, {
            app: applications[4],
            axis: CATEGORIES[2],
            value: 1
        }, {
            app: applications[4],
            axis: CATEGORIES[3],
            value: -1
        }, {
            app: applications[4],
            axis: CATEGORIES[4],
            value: 0
        }],
        [{ //Risk Management
            app: applications[5],
            axis: CATEGORIES[0],
            value: 1
        }, {
            app: applications[5],
            axis: CATEGORIES[1],
            value: 1
        }, {
            app: applications[5],
            axis: CATEGORIES[2],
            value: -1
        }, {
            app: applications[5],
            axis: CATEGORIES[3],
            value: 0
        }, {
            app: applications[5],
            axis: CATEGORIES[4],
            value: 2
        }]
    ];

// New-schema config export
export const config = {
    meta: {
        pageTitle,
        legendTitle,
        averageTitle,
        references: [
            { url: referenceLink1, title: referenceLinkTitle1 },
            { url: referenceLink2, title: referenceLinkTitle2 }
        ]
    },
    scale: {
        min: -2,
        max: 3,
        levels: MATURITY_LEVELS.map(ml => ({ score: ml.score, label: ml.definition }))
    },
    categories: CATEGORIES,
    applications,
    maturityData,
    theme: {}
};

// Build emptyDataSet from categories and scale min
var EMPTY_DATASET = [
    CATEGORIES.map(cat => ({ app: "", axis: cat, value: -2 }))
];

// Legacy named exports (backward compatibility)
export {
    pageTitle,
    legendTitle,
    averageTitle,
    ID_AVERAGE_CATEGORIES as idAverageCategories,
    referenceLink1,
    referenceLinkTitle1,
    referenceLink2,
    referenceLinkTitle2,
    MATURITY_LEVELS as maturityLevels,
    CATEGORIES as categories,
    EMPTY_DATASET as emptyDataSet,
    applications,
    maturityData
};

// Legacy default export (backward compatibility)
export default {
    pageTitle,
    legendTitle,
    averageTitle,
    idAverageCategories: ID_AVERAGE_CATEGORIES,
    referenceLink1,
    referenceLinkTitle1,
    referenceLink2,
    referenceLinkTitle2,
    maturityLevels: MATURITY_LEVELS,
    categoryCount: CATEGORIES.length,
    categories: CATEGORIES,
    emptyDataSet: EMPTY_DATASET,
    applications,
    maturityData
};
