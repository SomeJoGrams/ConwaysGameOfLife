/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  testMatch: ['**/tests/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  preset: "ts-jest" 
};