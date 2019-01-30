module.exports = {
    "roots": [
      "<rootDir>/client"
    ],
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "collectCoverageFrom": [
        "client/**/*.{js,ts,jsx,tsx,mjs}"
      ],
    "testMatch": [
        "<rootDir>/client/**/__tests__/**/*.{js,ts,jsx,tsx,mjs}",
        "<rootDir>/client/**/?(*.)(spec|test).{js,ts,jsx,tsx,mjs}"
    ],
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "snapshotSerializers": ["enzyme-to-json/serializer"],
    "setupTestFrameworkScriptFile": "<rootDir>/client/setupEnzyme.ts",
  }