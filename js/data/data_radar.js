/**
 * Created by Gary A. Stafford on 1/29/15.
 * https://github.com/garystafford/cd-maturity-model
 */

/*properties
 app, applications, averageTitle, axis, categories, definition, emptyDataSet,
 idAverageCategories, legendTitle, maturityData, maturityLevels, pageTitle,
 referenceLink, referenceLinkTitle, score, value
 */

/*global define */
define(function () {
    "use strict";
    var CATEGORIES,
        MATURITY_LEVELS,
        EMPTY_DATASET,
        ID_AVERAGE_CATEGORIES,
        applications,
        pageTitle,
        legendTitle,
        averageTitle,
        referenceLink,
        referenceLinkTitle,
        maturityData;

    /* CONSTANTS */
    CATEGORIES = [
        "Build Management and Continuous Integration",
        "Environments and Deployment",
        "Release Management and Compliance",
        "Testing",
        "Data Management",
        "Configuration Management"
    ];

    MATURITY_LEVELS = [{
        score     : -2,
        definition: "Unranked"
    }, {
        score     : -1,
        definition: "Optimizing"
    }, {
        score     : 0,
        definition: "Quantitatively Managed"
    }, {
        score     : 1,
        definition: "Consistent"
    }, {
        score     : 2,
        definition: "Repeatable"
    }, {
        score     : 3,
        definition: "Regressive"
    }];

    EMPTY_DATASET = [
        [{
            "app" : "",
            "axis": CATEGORIES[0],
            value : -2
        }, {
            "app" : "",
            "axis": CATEGORIES[1],
            value : -2
        }, {
            "app" : "",
            "axis": CATEGORIES[2],
            value : -2
        }, {
            "app" : "",
            "axis": CATEGORIES[3],
            value : -2
        }, {
            "app" : "",
            "axis": CATEGORIES[4],
            value : -2
        }, {
            "app" : "",
            "axis": CATEGORIES[5],
            value : -2
        }]
    ];

    ID_AVERAGE_CATEGORIES = 100;

    /* User-level variables */
    pageTitle = "CD Maturity Gap Analysis: First Federated Bank";
    legendTitle = "Banking Systems";
    averageTitle = "Average Maturity - All Systems";
    referenceLink = "http://en.wikipedia.org/wiki/Continuous_delivery";
    referenceLinkTitle = "Sample Link to Analysis Details";

    applications = [
        "Core Banking Application",
        "Internet Banking Application",
        "Human Resources Application",
        "ATM Management Application",
        "Equity Trading and Analytics Platform",
        "Risk Management Application",
        "Mobile Banking Platform (iOS)",
        "Mobile Banking Platform (Android)",
        "Purchasing and Inventory Control System",
        "Centralized Security Administration System",
        "Security Administration System"
    ];

    maturityData = [
        [{ //Core Banking Application
            "app"  : applications[0],
            "axis" : CATEGORIES[0],
            "value": -1
        }, {
            "app"  : applications[0],
            "axis" : CATEGORIES[1],
            "value": -1
        }, {
            "app"  : applications[0],
            "axis" : CATEGORIES[2],
            "value": 1
        }, {
            "app"  : applications[0],
            "axis" : CATEGORIES[3],
            "value": -1
        }, {
            "app"  : applications[0],
            "axis" : CATEGORIES[4],
            "value": 0
        }, {
            "app"  : applications[0],
            "axis" : CATEGORIES[5],
            "value": 2
        }],
        [{ //Internet Banking Application
            "app"  : applications[1],
            "axis" : CATEGORIES[0],
            "value": 1
        }, {
            "app"  : applications[1],
            "axis" : CATEGORIES[1],
            "value": 0
        }, {
            "app"  : applications[1],
            "axis" : CATEGORIES[2],
            "value": 2
        }, {
            "app"  : applications[1],
            "axis" : CATEGORIES[3],
            "value": -1
        }, {
            "app"  : applications[1],
            "axis" : CATEGORIES[4],
            "value": 1
        }, {
            "app"  : applications[1],
            "axis" : CATEGORIES[5],
            "value": 0
        }],
        [{ //Human Resources Application
            "app"  : applications[2],
            "axis" : CATEGORIES[0],
            "value": 0
        }, {
            "app"  : applications[2],
            "axis" : CATEGORIES[1],
            "value": -1
        }, {
            "app"  : applications[2],
            "axis" : CATEGORIES[2],
            "value": 1
        }, {
            "app"  : applications[2],
            "axis" : CATEGORIES[3],
            "value": 1
        }, {
            "app"  : applications[2],
            "axis" : CATEGORIES[4],
            "value": 0
        }, {
            "app"  : applications[2],
            "axis" : CATEGORIES[5],
            "value": 0
        }],
        [{ //ATM Management Application
            "app"  : applications[3],
            "axis" : CATEGORIES[0],
            "value": 2
        }, {
            "app"  : applications[3],
            "axis" : CATEGORIES[1],
            "value": 0
        }, {
            "app"  : applications[3],
            "axis" : CATEGORIES[2],
            "value": 0
        }, {
            "app"  : applications[3],
            "axis" : CATEGORIES[3],
            "value": 2
        }, {
            "app"  : applications[3],
            "axis" : CATEGORIES[4],
            "value": 1
        }, {
            "app"  : applications[3],
            "axis" : CATEGORIES[5],
            "value": -1
        }],
        [{ //Equity Trading and Analytics Platform
            "app"  : applications[4],
            "axis" : CATEGORIES[0],
            "value": 1
        }, {
            "app"  : applications[4],
            "axis" : CATEGORIES[1],
            "value": -1
        }, {
            "app"  : applications[4],
            "axis" : CATEGORIES[2],
            "value": 0
        }, {
            "app"  : applications[4],
            "axis" : CATEGORIES[3],
            "value": 2
        }, {
            "app"  : applications[4],
            "axis" : CATEGORIES[4],
            "value": 0
        }, {
            "app"  : applications[4],
            "axis" : CATEGORIES[5],
            "value": -1
        }],
        [{ //Risk Management Application
            "app"  : applications[5],
            "axis" : CATEGORIES[0],
            "value": 2
        }, {
            "app"  : applications[5],
            "axis" : CATEGORIES[1],
            "value": 0
        }, {
            "app"  : applications[5],
            "axis" : CATEGORIES[2],
            "value": 1
        }, {
            "app"  : applications[5],
            "axis" : CATEGORIES[3],
            "value": 3
        }, {
            "app"  : applications[5],
            "axis" : CATEGORIES[4],
            "value": 1
        }, {
            "app"  : applications[5],
            "axis" : CATEGORIES[5],
            "value": 2
        }],
        [{ //Mobile Banking Platform (iOS)
            "app"  : applications[6],
            "axis" : CATEGORIES[0],
            "value": 2
        }, {
            "app"  : applications[6],
            "axis" : CATEGORIES[1],
            "value": -1
        }, {
            "app"  : applications[6],
            "axis" : CATEGORIES[2],
            "value": -1
        }, {
            "app"  : applications[6],
            "axis" : CATEGORIES[3],
            "value": -1
        }, {
            "app"  : applications[6],
            "axis" : CATEGORIES[4],
            "value": 1
        }, {
            "app"  : applications[6],
            "axis" : CATEGORIES[5],
            "value": 0
        }],
        [{ //Mobile Banking Platform (Android)
            "app"  : applications[7],
            "axis" : CATEGORIES[0],
            "value": 1
        }, {
            "app"  : applications[7],
            "axis" : CATEGORIES[1],
            "value": 0
        }, {
            "app"  : applications[7],
            "axis" : CATEGORIES[2],
            "value": 0
        }, {
            "app"  : applications[7],
            "axis" : CATEGORIES[3],
            "value": -1
        }, {
            "app"  : applications[7],
            "axis" : CATEGORIES[4],
            "value": 1
        }, {
            "app"  : applications[7],
            "axis" : CATEGORIES[5],
            "value": 2
        }],
        [{ //Purchasing and Inventory Control System
            "app"  : applications[8],
            "axis" : CATEGORIES[0],
            "value": -1
        }, {
            "app"  : applications[8],
            "axis" : CATEGORIES[1],
            "value": 1
        }, {
            "app"  : applications[8],
            "axis" : CATEGORIES[2],
            "value": 2
        }, {
            "app"  : applications[8],
            "axis" : CATEGORIES[3],
            "value": 1
        }, {
            "app"  : applications[8],
            "axis" : CATEGORIES[4],
            "value": 0
        }, {
            "app"  : applications[8],
            "axis" : CATEGORIES[5],
            "value": 1
        }],
        [{ //Security Administration System
            "app"  : applications[9],
            "axis" : CATEGORIES[0],
            "value": 1
        }, {
            "app"  : applications[9],
            "axis" : CATEGORIES[1],
            "value": 0
        }, {
            "app"  : applications[9],
            "axis" : CATEGORIES[2],
            "value": 2
        }, {
            "app"  : applications[9],
            "axis" : CATEGORIES[3],
            "value": 1
        }, {
            "app"  : applications[9],
            "axis" : CATEGORIES[4],
            "value": -1
        }, {
            "app"  : applications[9],
            "axis" : CATEGORIES[5],
            "value": 0
        }]
    ];

    return {
        pageTitle          : pageTitle,
        legendTitle        : legendTitle,
        averageTitle       : averageTitle,
        idAverageCategories: ID_AVERAGE_CATEGORIES,
        referenceLink      : referenceLink,
        referenceLinkTitle : referenceLinkTitle,
        maturityLevels     : MATURITY_LEVELS,
        categories         : CATEGORIES,
        emptyDataSet       : EMPTY_DATASET,
        applications       : applications,
        maturityData       : maturityData
    };
});