/**
 * Test data fixtures for unit tests
 */

export const sampleCategories = [
  "Build Management and CI",
  "Environments and Deployment", 
  "Release Management",
  "Testing",
  "Data Management",
  "Configuration Management"
];

export const sampleApplications = [
  "Test App 1",
  "Test App 2", 
  "Test App 3"
];

export const sampleMaturityData = [
  [
    { app: "Test App 1", axis: "Build Management and CI", value: 1 },
    { app: "Test App 1", axis: "Environments and Deployment", value: 0 },
    { app: "Test App 1", axis: "Release Management", value: 2 },
    { app: "Test App 1", axis: "Testing", value: -1 },
    { app: "Test App 1", axis: "Data Management", value: 1 },
    { app: "Test App 1", axis: "Configuration Management", value: 0 }
  ],
  [
    { app: "Test App 2", axis: "Build Management and CI", value: 2 },
    { app: "Test App 2", axis: "Environments and Deployment", value: 1 },
    { app: "Test App 2", axis: "Release Management", value: 0 },
    { app: "Test App 2", axis: "Testing", value: 2 },
    { app: "Test App 2", axis: "Data Management", value: -1 },
    { app: "Test App 2", axis: "Configuration Management", value: 1 }
  ]
];

export const sampleConfig = {
  w: 600,
  h: 600,
  factor: 1,
  levels: 5,
  maxValue: 100,
  radius: 5
};

export const expectedTransformedData = [
  [
    { app: "Test App 1", axis: "Build Management and CI", value: 60 }, // 1 * 20 + 40
    { app: "Test App 1", axis: "Environments and Deployment", value: 40 }, // 0 * 20 + 40
    { app: "Test App 1", axis: "Release Management", value: 80 }, // 2 * 20 + 40
    { app: "Test App 1", axis: "Testing", value: 20 }, // -1 * 20 + 40
    { app: "Test App 1", axis: "Data Management", value: 60 }, // 1 * 20 + 40
    { app: "Test App 1", axis: "Configuration Management", value: 40 } // 0 * 20 + 40
  ]
];

/**
 * Sample new-schema config for testing configSchema module
 */
export const sampleNewSchemaConfig = {
  meta: {
    pageTitle: "Test Maturity Model",
    legendTitle: "Test Applications",
    averageTitle: "Test Average",
    references: [
      { url: "https://example.com", title: "Example Ref" }
    ]
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
  categories: sampleCategories,
  applications: ["Test App 1", "Test App 2"],
  maturityData: sampleMaturityData,
  theme: {}
};