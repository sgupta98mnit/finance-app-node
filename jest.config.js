module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.base.json' }]
  },
  testMatch: ['**/*.spec.ts']
};
