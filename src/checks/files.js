const fs = require('fs');
const path = require('path');

const CATEGORY = 'files';

const JUNK_FILES = [
  '.DS_Store',
  'Thumbs.db',
  'npm-debug.log',
  'yarn-error.log',
  '.vscode',
  '.idea'
];

function checkFiles(pkgDir, pkg) {
  const results = [];

  const hasFilesField = Array.isArray(pkg?.files) && pkg.files.length > 0;
  const hasNpmIgnore = fs.existsSync(path.join(pkgDir, '.npmignore'));

  if (hasFilesField) {
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: `Publish whitelist ("files" field) configured with ${pkg.files.length} item(s)`
    });

    for (const item of pkg.files) {
      const itemPath = path.resolve(pkgDir, item);
      if (!fs.existsSync(itemPath)) {
        results.push({
          category: CATEGORY,
          status: 'error',
          title: `Item in "files" whitelist does NOT exist: "${item}"`,
          details: `Expected at ${itemPath}`,
          suggestion: 'Ensure you ran your build step (e.g., "npm run build") or fix the path in package.json'
        });
      } else {
        results.push({
          category: CATEGORY,
          status: 'pass',
          title: `Whitelisted item "${item}" verified on disk`
        });
      }
    }
  } else if (hasNpmIgnore) {
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: '.npmignore file found'
    });
  } else {
    results.push({
      category: CATEGORY,
      status: 'warn',
      title: 'Neither "files" whitelist in package.json nor .npmignore found',
      details: 'Without this, npm will publish all files in your directory except those in .gitignore.',
      suggestion: 'Define "files": ["src", "bin", "README.md", "LICENSE"] in package.json'
    });
  }

  try {
    const dirEntries = fs.readdirSync(pkgDir);
    for (const junk of JUNK_FILES) {
      if (dirEntries.includes(junk)) {
        if (hasFilesField && !pkg.files.includes(junk)) {
          continue;
        }
        results.push({
          category: CATEGORY,
          status: 'warn',
          title: `Unwanted file/directory found: "${junk}"`,
          details: 'Publishing OS/IDE metadata clutters the package tarball.',
          suggestion: `Add "${junk}" to .npmignore or .gitignore`
        });
      }
    }
  } catch {
  }

  return results;
}

module.exports = checkFiles;
