export default { test: { include: ['tools/agnostic-loop/*.test.ts'], environment: 'node', fileParallelism: false, testTimeout: 30000, hookTimeout: 30000 } };
