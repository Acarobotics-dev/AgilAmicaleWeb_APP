/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.integration.test.js"],
  testTimeout: 120000,
  maxWorkers: 1,
};
