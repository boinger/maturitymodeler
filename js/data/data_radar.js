/**
 * CD Maturity Gap Analysis
 * Financial Institution Sample Data
 * Created by Gary A. Stafford on 1/29/15
 * Modified by Jeff Vier beginning 7 Dec 2020
 * https://github.com/boinger/maturitymodeler
 */

 /*properties
  app, applications, averageTitle, axis, categoryCount, categories, definition,
  emptyDataSet, idAverageCategories, legendTitle, maturityData, maturityLevels,
  pageTitle, referenceLink1, referenceLinkTitle1, referenceLink2, referenceLinkTitle2,
  score, value
  */

/*global define */
define(function () {
    "use strict";

    var CATEGORY_COUNT,
        CATEGORIES,
        MATURITY_LEVELS,
        EMPTY_DATASET,
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
    CATEGORY_COUNT = 8; // currently unused

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
        score: -2,
        definition: "Unranked"
    }, {
        score: -1,
        definition: "Base"
    }, {
        score: 0,
        definition: "Minimal"
    }, {
        score: 1,
        definition: "Intermediate"
    }, {
        score: 2,
        definition: "Advanced"
    }, {
        score: 3,
        definition: "Extreme"
    }];

    EMPTY_DATASET = [
        [{
            app: "",
            axis: CATEGORIES[0],
            value: -2
        }, {
            app: "",
            axis: CATEGORIES[1],
            value: -2
        }, {
            app: "",
            axis: CATEGORIES[2],
            value: -2
        }, {
            app: "",
            axis: CATEGORIES[3],
            value: -2
        }, {
            app: "",
            axis: CATEGORIES[4],
            value: -2
        }, {
            app: "",
            axis: CATEGORIES[5],
            value: -2
        }, {
            app: "",
            axis: CATEGORIES[6],
            value: -2
        }, {
            app: "",
            axis: CATEGORIES[7],
            value: -2
        }]
    ];

    ID_AVERAGE_CATEGORIES = 100;

    /* User-level variables */
    pageTitle = "CI/CD Maturity Gap Analysis: CloudWerx Heavy Industries";
    legendTitle = "Application Platforms";
    averageTitle = "Average Maturity - All Systems";
    referenceLink1 = "https://github.com/boinger/maturitymodeler";
    referenceLinkTitle1 = "Maturity Modeler";
    referenceLink2 = "https://github.com/boinger/maturitymodeler";
    referenceLinkTitle2 = "Jeff Vier - 2020";

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
            value: -1
        }, {
            app: applications[0],
            axis: CATEGORIES[1],
            value: -2
        }, {
            app: applications[0],
            axis: CATEGORIES[2],
            value: 1
        }, {
            app: applications[0],
            axis: CATEGORIES[3],
            value: -1
        }, {
            app: applications[0],
            axis: CATEGORIES[4],
            value: 0
        }, {
            app: applications[0],
            axis: CATEGORIES[5],
            value: 2
        }, {
            app: applications[0],
            axis: CATEGORIES[6],
            value: -1
        }, {
            app: applications[0],
            axis: CATEGORIES[7],
            value: 2
        }],
        [{ //Some Microservice
            app: applications[1],
            axis: CATEGORIES[0],
            value: 1
        }, {
            app: applications[1],
            axis: CATEGORIES[1],
            value: 0
        }, {
            app: applications[1],
            axis: CATEGORIES[2],
            value: 2
        }, {
            app: applications[1],
            axis: CATEGORIES[3],
            value: -1
        }, {
            app: applications[1],
            axis: CATEGORIES[4],
            value: 1
        }, {
            app: applications[1],
            axis: CATEGORIES[5],
            value: 0
        }, {
            app: applications[1],
            axis: CATEGORIES[6],
            value: -2
        }, {
            app: applications[1],
            axis: CATEGORIES[7],
            value: 2
        }],
        [{ //Some Other Microservice
            app: applications[2],
            axis: CATEGORIES[0],
            value: 0
        }, {
            app: applications[2],
            axis: CATEGORIES[1],
            value: -1
        }, {
            app: applications[2],
            axis: CATEGORIES[2],
            value: 1
        }, {
            app: applications[2],
            axis: CATEGORIES[3],
            value: 1
        }, {
            app: applications[2],
            axis: CATEGORIES[4],
            value: -2
        }, {
            app: applications[2],
            axis: CATEGORIES[5],
            value: 0
        }, {
            app: applications[2],
            axis: CATEGORIES[6],
            value: 2
        }, {
            app: applications[2],
            axis: CATEGORIES[7],
            value: 0
        }],
        [{ //"Database API
            app: applications[3],
            axis: CATEGORIES[0],
            value: 2
        }, {
            app: applications[3],
            axis: CATEGORIES[1],
            value: 0
        }, {
            app: applications[3],
            axis: CATEGORIES[2],
            value: 0
        }, {
            app: applications[3],
            axis: CATEGORIES[3],
            value: 2
        }, {
            app: applications[3],
            axis: CATEGORIES[4],
            value: 1
        }, {
            app: applications[3],
            axis: CATEGORIES[5],
            value: -1
        }, {
            app: applications[3],
            axis: CATEGORIES[6],
            value: -1
        }, {
            app: applications[3],
            axis: CATEGORIES[7],
            value: 1
        }],
        [{ //Codename: Clown Town
            app: applications[4],
            axis: CATEGORIES[0],
            value: 1
        }, {
            app: applications[4],
            axis: CATEGORIES[1],
            value: -1
        }, {
            app: applications[4],
            axis: CATEGORIES[2],
            value: 0
        }, {
            app: applications[4],
            axis: CATEGORIES[3],
            value: 2
        }, {
            app: applications[4],
            axis: CATEGORIES[4],
            value: 0
        }, {
            app: applications[4],
            axis: CATEGORIES[5],
            value: -1
        }, {
            app: applications[4],
            axis: CATEGORIES[6],
            value: 2
        }, {
            app: applications[4],
            axis: CATEGORIES[7],
            value: 1
        }],
        [{ //Obfuscation API
            app: applications[5],
            axis: CATEGORIES[0],
            value: 2
        }, {
            app: applications[5],
            axis: CATEGORIES[1],
            value: 0
        }, {
            app: applications[5],
            axis: CATEGORIES[2],
            value: 1
        }, {
            app: applications[5],
            axis: CATEGORIES[3],
            value: 3
        }, {
            app: applications[5],
            axis: CATEGORIES[4],
            value: 1
        }, {
            app: applications[5],
            axis: CATEGORIES[5],
            value: 2
        }, {
            app: applications[5],
            axis: CATEGORIES[6],
            value: -2
        }, {
            app: applications[5],
            axis: CATEGORIES[7],
            value: 0
        }],
        [{ //Mobile Platform (iOS)
            app: applications[6],
            axis: CATEGORIES[0],
            value: 2
        }, {
            app: applications[6],
            axis: CATEGORIES[1],
            value: -1
        }, {
            app: applications[6],
            axis: CATEGORIES[2],
            value: -1
        }, {
            app: applications[6],
            axis: CATEGORIES[3],
            value: -1
        }, {
            app: applications[6],
            axis: CATEGORIES[4],
            value: 1
        }, {
            app: applications[6],
            axis: CATEGORIES[5],
            value: 0
        }, {
            app: applications[6],
            axis: CATEGORIES[6],
            value: -1
        }, {
            app: applications[6],
            axis: CATEGORIES[7],
            value: 2
        }],
        [{ //Mobile Platform (Android)
            app: applications[7],
            axis: CATEGORIES[0],
            value: 1
        }, {
            app: applications[7],
            axis: CATEGORIES[1],
            value: 0
        }, {
            app: applications[7],
            axis: CATEGORIES[2],
            value: 0
        }, {
            app: applications[7],
            axis: CATEGORIES[3],
            value: -1
        }, {
            app: applications[7],
            axis: CATEGORIES[4],
            value: 1
        }, {
            app: applications[7],
            axis: CATEGORIES[5],
            value: 2
        }, {
            app: applications[7],
            axis: CATEGORIES[6],
            value: -2
        }, {
            app: applications[7],
            axis: CATEGORIES[7],
            value: 0
        }],
        [{ //Purchasing and Inventory Control System
            app: applications[8],
            axis: CATEGORIES[0],
            value: -1
        }, {
            app: applications[8],
            axis: CATEGORIES[1],
            value: 1
        }, {
            app: applications[8],
            axis: CATEGORIES[2],
            value: 2
        }, {
            app: applications[8],
            axis: CATEGORIES[3],
            value: 1
        }, {
            app: applications[8],
            axis: CATEGORIES[4],
            value: 0
        }, {
            app: applications[8],
            axis: CATEGORIES[5],
            value: 1
        }, {
            app: applications[8],
            axis: CATEGORIES[6],
            value: 1
        }, {
            app: applications[8],
            axis: CATEGORIES[7],
            value: 1
        }],
        [{ //Security Administration System
            app: applications[9],
            axis: CATEGORIES[0],
            value: 1
        }, {
            app: applications[9],
            axis: CATEGORIES[1],
            value: 0
        }, {
            app: applications[9],
            axis: CATEGORIES[2],
            value: 2
        }, {
            app: applications[9],
            axis: CATEGORIES[3],
            value: 1
        }, {
            app: applications[9],
            axis: CATEGORIES[4],
            value: -1
        }, {
            app: applications[9],
            axis: CATEGORIES[5],
            value: 0
        }, {
            app: applications[9],
            axis: CATEGORIES[6],
            value: 1
        }, {
            app: applications[9],
            axis: CATEGORIES[7],
            value: -2
        }]
    ];

    return {
        pageTitle: pageTitle,
        legendTitle: legendTitle,
        averageTitle: averageTitle,
        idAverageCategories: ID_AVERAGE_CATEGORIES,
        referenceLink1: referenceLink1,
        referenceLinkTitle1: referenceLinkTitle1,
        referenceLink2: referenceLink2,
        referenceLinkTitle2: referenceLinkTitle2,
        maturityLevels: MATURITY_LEVELS,
        categories: CATEGORIES,
        emptyDataSet: EMPTY_DATASET,
        applications: applications,
        maturityData: maturityData
    };
});
