const assert = require('assert');
const path = require('path');
const { runChecks } = require('../src/index');

console.log('Running test suite for publish-checker...\n');

const projectDir = path.resolve(__dirname, '..');
const result = runChecks({ dir: projectDir });

assert(result.stats.total > 0, 'Checks should be registered');
assert(Array.isArray(result.checks), 'Checks should be an array');
console.log(`✔ Test 1: Self-check executed successfully (${result.stats.passed} passed checks)`);

const emptyDirResult = runChecks({ dir: path.resolve(__dirname) });
assert.strictEqual(emptyDirResult.success, false, 'Should fail when package.json is missing');
const missingPkgCheck = emptyDirResult.checks.find(c => c.category === 'packageJson' && c.status === 'error');
assert(missingPkgCheck, 'Should log an error for missing package.json');
console.log('✔ Test 2: Missing package.json properly detected as failure');

console.log('\nAll tests passed successfully!');
