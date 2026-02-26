/** @jest-config-loader ts-node */

import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform; 

const config = {
  verbose: true,
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;