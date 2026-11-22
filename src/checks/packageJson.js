const fs = require('fs');
const path = require('path');

const CATEGORY = 'packageJson';

function checkPackageJson(pkgDir) {
  const results = [];
  const pkgPath = path.join(pkgDir, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    results.push({
      category: CATEGORY,
      status: 'error',
      title: 'package.json is missing',
      details: `Expected at ${pkgPath}`,
      suggestion: 'Run "npm init -y" to generate a basic package.json'
    });
    return { pkg: null, results };
  }

  let pkg = null;
  try {
    const raw = fs.readFileSync(pkgPath, 'utf8');
    pkg = JSON.parse(raw);
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: 'package.json is valid JSON'
    });
  } catch (err) {
    results.push({
      category: CATEGORY,
      status: 'error',
      title: 'package.json contains invalid JSON syntax',
      details: err.message,
      suggestion: 'Check for trailing commas or missing quotation marks in package.json'
    });
    return { pkg: null, results };
  }

  if (!pkg.name || typeof pkg.name !== 'string') {
    results.push({
      category: CATEGORY,
      status: 'error',
      title: 'Package "name" is missing or empty',
      suggestion: 'Add a valid name field to package.json'
    });
  } else {
    const name = pkg.name;
    const npmNameRegex = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    
    if (name.length > 214) {
      results.push({
        category: CATEGORY,
        status: 'error',
        title: `Package name is too long (${name.length} chars > 214 max)`,
        suggestion: 'Shorten your package name'
      });
    } else if (name !== name.toLowerCase()) {
      results.push({
        category: CATEGORY,
        status: 'error',
        title: `Package name "${name}" contains uppercase characters`,
        suggestion: 'NPM requires all package names to be strictly lowercase'
      });
    } else if (!npmNameRegex.test(name)) {
      results.push({
        category: CATEGORY,
        status: 'error',
        title: `Package name "${name}" violates npm naming guidelines`,
        suggestion: 'Avoid special characters, spaces, or leading periods/underscores'
      });
    } else {
      results.push({
        category: CATEGORY,
        status: 'pass',
        title: `Package name "${name}" is valid`
      });
    }
  }

  const semverRegex = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
  if (!pkg.version || typeof pkg.version !== 'string') {
    results.push({
      category: CATEGORY,
      status: 'error',
      title: 'Package "version" is missing',
      suggestion: 'Add "version": "1.0.0" to package.json'
    });
  } else if (!semverRegex.test(pkg.version)) {
    results.push({
      category: CATEGORY,
      status: 'error',
      title: `Version "${pkg.version}" is not a valid Semantic Version (SemVer)`,
      suggestion: 'Use a standard format like "1.0.0" or "0.1.0-alpha"'
    });
  } else {
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: `Version "${pkg.version}" is valid SemVer`
    });
  }

  if (!pkg.description || typeof pkg.description !== 'string' || pkg.description.trim().length === 0) {
    results.push({
      category: CATEGORY,
      status: 'warn',
      title: 'Package "description" is missing',
      suggestion: 'Add a short, descriptive sentence so people can find your package on npmjs.com'
    });
  } else {
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: `Description provided: "${pkg.description.slice(0, 50)}${pkg.description.length > 50 ? '...' : ''}"`
    });
  }

  if (!pkg.license || typeof pkg.license !== 'string' || pkg.license.trim().length === 0) {
    results.push({
      category: CATEGORY,
      status: 'warn',
      title: 'No "license" specified in package.json',
      suggestion: 'Specify a standard license like "MIT", "Apache-2.0", or "ISC"'
    });
  } else {
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: `License is set to "${pkg.license}"`
    });
  }

  if (!pkg.author) {
    results.push({
      category: CATEGORY,
      status: 'warn',
      title: 'No "author" specified in package.json',
      suggestion: 'Add "author": "Your Name <you@example.com>"'
    });
  } else {
    const authorName = typeof pkg.author === 'string' ? pkg.author : pkg.author.name || 'Author specified';
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: `Author specified: ${authorName}`
    });
  }

  if (!pkg.keywords || !Array.isArray(pkg.keywords) || pkg.keywords.length === 0) {
    results.push({
      category: CATEGORY,
      status: 'warn',
      title: 'No "keywords" found in package.json',
      suggestion: 'Add an array of keywords to improve npm search discoverability'
    });
  } else {
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: `${pkg.keywords.length} keyword(s) defined: [${pkg.keywords.slice(0, 4).join(', ')}${pkg.keywords.length > 4 ? ', ...' : ''}]`
    });
  }

  if (!pkg.repository) {
    results.push({
      category: CATEGORY,
      status: 'warn',
      title: 'No "repository" field in package.json',
      suggestion: 'Add "repository": { "type": "git", "url": "https://github.com/user/repo" }'
    });
  } else {
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: 'Repository information specified'
    });
  }

  return { pkg, results };
}

module.exports = checkPackageJson;
