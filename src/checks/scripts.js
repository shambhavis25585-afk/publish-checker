const CATEGORY = 'scripts';

function checkScripts(pkg) {
  const results = [];
  if (!pkg) return results;

  const scripts = pkg.scripts || {};

  if (!scripts.test) {
    results.push({
      category: CATEGORY,
      status: 'warn',
      title: 'No "test" script defined in package.json',
      suggestion: 'Add "scripts": { "test": "node test.js" }'
    });
  } else if (scripts.test.includes('no test specified')) {
    results.push({
      category: CATEGORY,
      status: 'warn',
      title: 'Default placeholder test script detected',
      details: `Current: "${scripts.test}"`,
      suggestion: 'Replace with an actual test runner command'
    });
  } else {
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: `Test script configured: "${scripts.test}"`
    });
  }

  if (scripts.prepublishOnly) {
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: `"prepublishOnly" hook configured: "${scripts.prepublishOnly}"`
    });
  } else {
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: 'Tip: Add "prepublishOnly": "publish-checker" to run checks automatically on publish',
      suggestion: 'Run "npx publish-checker --init-hook" to install this check automatically'
    });
  }

  return results;
}

module.exports = checkScripts;
