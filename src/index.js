const path = require('path');
const checkPackageJson = require('./checks/packageJson');
const checkEntryPoints = require('./checks/entryPoints');
const checkDocumentation = require('./checks/documentation');
const checkSecurity = require('./checks/security');
const checkFiles = require('./checks/files');
const checkScripts = require('./checks/scripts');

function runChecks(options = {}) {
  const targetDir = path.resolve(options.dir || process.cwd());
  const allChecks = [];

  const { pkg, results: pkgResults } = checkPackageJson(targetDir);
  allChecks.push(...pkgResults);

  if (!pkg) {
    return formatResults(allChecks, options.strict);
  }

  allChecks.push(...checkEntryPoints(targetDir, pkg));
  allChecks.push(...checkDocumentation(targetDir, pkg));
  allChecks.push(...checkSecurity(targetDir, pkg));
  allChecks.push(...checkFiles(targetDir, pkg));
  allChecks.push(...checkScripts(pkg));

  return formatResults(allChecks, options.strict);
}

function formatResults(checks, strict = false) {
  const passed = checks.filter(c => c.status === 'pass').length;
  const warnings = checks.filter(c => c.status === 'warn').length;
  const errors = checks.filter(c => c.status === 'error').length;

  const success = errors === 0 && (!strict || warnings === 0);

  return {
    success,
    stats: {
      total: checks.length,
      passed,
      warnings,
      errors
    },
    checks
  };
}

module.exports = {
  runChecks
};
