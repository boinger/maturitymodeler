/**
 * CD Maturity Gap Analysis
 * Financial Institution Sample Data
 * Created by Gary A. Stafford on 1/29/15
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
        "Culture & Organization",
        "Continuous Integration",
        "Build Automation",
        "Deployment Automation",
        "Test Automation",
        "Reporting",
        "Provisioning Automation",
        "Design & Architecture"
    ];

    MATURITY_LEVELS = [{
        score: -1,
        definition: "Unranked"
    }, {
        score: 0,
        definition: "Base"
    }, {
        score: 1,
        definition: "Minimal"
    }, {
        score: 2,
        definition: "Intermediate"
    }, {
        score: 3,
        definition: "Advanced"
    }, {
        score: 4,
        definition: "Extreme"
    }];

    ID_AVERAGE_CATEGORIES = 100;

    /* User-level variables */
    pageTitle = "CI/CD Maturity Gap Analysis: CloudWerx Heavy Industries";
    legendTitle = "Application Platforms";
    averageTitle = "Average Maturity - All Systems";
    referenceLink1 = "https://github.com/boinger/maturitymodeler";
    referenceLinkTitle1 = "Maturity Modeler";
    referenceLink2 = "https://github.com/boinger/maturitymodeler";
    referenceLinkTitle2 = "Jeff Vier - 2020-2025";

    applications = [
        "UI/UX",
        "Some Microservice",
        "Some Other Microservice",
        "Database API",
        "Codename: Clown Town",
        "Obfuscation API",
        "Mobile Platform (iOS)",
        "Mobile Platform (Android)",
        "Purchasing and Inventory Control System",
        "Security Administration System"
    ];

    maturityData = [
        [{ //UI/UX
            app: applications[0],
            axis: CATEGORIES[0],
            value: 0
        }, {
            app: applications[0],
            axis: CATEGORIES[1],
            value: -1
        }, {
            app: applications[0],
            axis: CATEGORIES[2],
            value: 2
        }, {
            app: applications[0],
            axis: CATEGORIES[3],
            value: 0
        }, {
            app: applications[0],
            axis: CATEGORIES[4],
            value: 1
        }, {
            app: applications[0],
            axis: CATEGORIES[5],
            value: 3
        }, {
            app: applications[0],
            axis: CATEGORIES[6],
            value: 0
        }, {
            app: applications[0],
            axis: CATEGORIES[7],
            value: 3
        }],
        [{ //Some Microservice
            app: applications[1],
            axis: CATEGORIES[0],
            value: 2
        }, {
            app: applications[1],
            axis: CATEGORIES[1],
            value: 1
        }, {
            app: applications[1],
            axis: CATEGORIES[2],
            value: 3
        }, {
            app: applications[1],
            axis: CATEGORIES[3],
            value: 0
        }, {
            app: applications[1],
            axis: CATEGORIES[4],
            value: 2
        }, {
            app: applications[1],
            axis: CATEGORIES[5],
            value: 1
        }, {
            app: applications[1],
            axis: CATEGORIES[6],
            value: -1
        }, {
            app: applications[1],
            axis: CATEGORIES[7],
            value: 3
        }],
        [{ //Some Other Microservice
            app: applications[2],
            axis: CATEGORIES[0],
            value: 1
        }, {
            app: applications[2],
            axis: CATEGORIES[1],
            value: 0
        }, {
            app: applications[2],
            axis: CATEGORIES[2],
            value: 2
        }, {
            app: applications[2],
            axis: CATEGORIES[3],
            value: 2
        }, {
            app: applications[2],
            axis: CATEGORIES[4],
            value: -1
        }, {
            app: applications[2],
            axis: CATEGORIES[5],
            value: 1
        }, {
            app: applications[2],
            axis: CATEGORIES[6],
            value: 3
        }, {
            app: applications[2],
            axis: CATEGORIES[7],
            value: 1
        }],
        [{ //"Database API
            app: applications[3],
            axis: CATEGORIES[0],
            value: 3
        }, {
            app: applications[3],
            axis: CATEGORIES[1],
            value: 1
        }, {
            app: applications[3],
            axis: CATEGORIES[2],
            value: 1
        }, {
            app: applications[3],
            axis: CATEGORIES[3],
            value: 3
        }, {
            app: applications[3],
            axis: CATEGORIES[4],
            value: 2
        }, {
            app: applications[3],
            axis: CATEGORIES[5],
            value: 0
        }, {
            app: applications[3],
            axis: CATEGORIES[6],
            value: 0
        }, {
            app: applications[3],
            axis: CATEGORIES[7],
            value: 2
        }],
        [{ //Codename: Clown Town
            app: applications[4],
            axis: CATEGORIES[0],
            value: 2
        }, {
            app: applications[4],
            axis: CATEGORIES[1],
            value: 0
        }, {
            app: applications[4],
            axis: CATEGORIES[2],
            value: 1
        }, {
            app: applications[4],
            axis: CATEGORIES[3],
            value: 3
        }, {
            app: applications[4],
            axis: CATEGORIES[4],
            value: 1
        }, {
            app: applications[4],
            axis: CATEGORIES[5],
            value: 0
        }, {
            app: applications[4],
            axis: CATEGORIES[6],
            value: 3
        }, {
            app: applications[4],
            axis: CATEGORIES[7],
            value: 2
        }],
        [{ //Obfuscation API
            app: applications[5],
            axis: CATEGORIES[0],
            value: 3
        }, {
            app: applications[5],
            axis: CATEGORIES[1],
            value: 1
        }, {
            app: applications[5],
            axis: CATEGORIES[2],
            value: 2
        }, {
            app: applications[5],
            axis: CATEGORIES[3],
            value: 4
        }, {
            app: applications[5],
            axis: CATEGORIES[4],
            value: 2
        }, {
            app: applications[5],
            axis: CATEGORIES[5],
            value: 3
        }, {
            app: applications[5],
            axis: CATEGORIES[6],
            value: -1
        }, {
            app: applications[5],
            axis: CATEGORIES[7],
            value: 1
        }],
        [{ //Mobile Platform (iOS)
            app: applications[6],
            axis: CATEGORIES[0],
            value: 3
        }, {
            app: applications[6],
            axis: CATEGORIES[1],
            value: 0
        }, {
            app: applications[6],
            axis: CATEGORIES[2],
            value: 0
        }, {
            app: applications[6],
            axis: CATEGORIES[3],
            value: 0
        }, {
            app: applications[6],
            axis: CATEGORIES[4],
            value: 2
        }, {
            app: applications[6],
            axis: CATEGORIES[5],
            value: 1
        }, {
            app: applications[6],
            axis: CATEGORIES[6],
            value: 0
        }, {
            app: applications[6],
            axis: CATEGORIES[7],
            value: 3
        }],
        [{ //Mobile Platform (Android)
            app: applications[7],
            axis: CATEGORIES[0],
            value: 2
        }, {
            app: applications[7],
            axis: CATEGORIES[1],
            value: 1
        }, {
            app: applications[7],
            axis: CATEGORIES[2],
            value: 1
        }, {
            app: applications[7],
            axis: CATEGORIES[3],
            value: 0
        }, {
            app: applications[7],
            axis: CATEGORIES[4],
            value: 2
        }, {
            app: applications[7],
            axis: CATEGORIES[5],
            value: 3
        }, {
            app: applications[7],
            axis: CATEGORIES[6],
            value: -1
        }, {
            app: applications[7],
            axis: CATEGORIES[7],
            value: 1
        }],
        [{ //Purchasing and Inventory Control System
            app: applications[8],
            axis: CATEGORIES[0],
            value: 0
        }, {
            app: applications[8],
            axis: CATEGORIES[1],
            value: 2
        }, {
            app: applications[8],
            axis: CATEGORIES[2],
            value: 3
        }, {
            app: applications[8],
            axis: CATEGORIES[3],
            value: 2
        }, {
            app: applications[8],
            axis: CATEGORIES[4],
            value: 1
        }, {
            app: applications[8],
            axis: CATEGORIES[5],
            value: 2
        }, {
            app: applications[8],
            axis: CATEGORIES[6],
            value: 2
        }, {
            app: applications[8],
            axis: CATEGORIES[7],
            value: 2
        }],
        [{ //Security Administration System
            app: applications[9],
            axis: CATEGORIES[0],
            value: 2
        }, {
            app: applications[9],
            axis: CATEGORIES[1],
            value: 1
        }, {
            app: applications[9],
            axis: CATEGORIES[2],
            value: 3
        }, {
            app: applications[9],
            axis: CATEGORIES[3],
            value: 2
        }, {
            app: applications[9],
            axis: CATEGORIES[4],
            value: 0
        }, {
            app: applications[9],
            axis: CATEGORIES[5],
            value: 1
        }, {
            app: applications[9],
            axis: CATEGORIES[6],
            value: 2
        }, {
            app: applications[9],
            axis: CATEGORIES[7],
            value: -1
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
        min: -1,
        max: 4,
        levels: MATURITY_LEVELS.map(ml => ({ score: ml.score, label: ml.definition }))
    },
    categories: CATEGORIES,
    applications,
    maturityData,
    theme: {}
};

// Build emptyDataSet from categories and scale min
var EMPTY_DATASET = [
    CATEGORIES.map(cat => ({ app: "", axis: cat, value: -1 }))
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
