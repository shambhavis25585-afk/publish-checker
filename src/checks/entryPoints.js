const fs = require('fs');
const path = require('path');

const CATEGORY = 'entryPoints';

function checkEntryPoints(pkgDir, pkg) {
  const results = [];
  if (!pkg) return results;

  if (!pkg.main) {
    const defaultIndex = path.join(pkgDir, 'index.js');
    if (fs.existsSync(defaultIndex)) {
      results.push({
        category: CATEGORY,
        status: 'pass',
        title: 'Implicit "main" entry point (index.js) exists'
      });
    } else {
      results.push({
        category: CATEGORY,
        status: 'warn',
        title: 'No "main" field specified and default "index.js" not found',
        suggestion: 'Specify "main": "src/index.js" or create "index.js"'
      });
    }
  } else {
    const mainPath = path.resolve(pkgDir, pkg.main);
    const exists = fs.existsSync(mainPath) ||
                   fs.existsSync(mainPath + '.js') ||
                   fs.existsSync(mainPath + '.json') ||
                   fs.existsSync(path.join(mainPath, 'index.js'));

    if (exists) {
      results.push({
        category: CATEGORY,
        status: 'pass',
        title: `Entry point "main": "${pkg.main}" exists on disk`
      });
    } else {
      results.push({
        category: CATEGORY,
        status: 'error',
        title: `Entry point "main": "${pkg.main}" NOT FOUND on disk!`,
        details: `Looked for: ${mainPath}`,
        suggestion: 'Create the entry file or fix the path in package.json'
      });
    }
  }

  if (pkg.module) {
    const modulePath = path.resolve(pkgDir, pkg.module);
    if (fs.existsSync(modulePath) || fs.existsSync(modulePath + '.mjs') || fs.existsSync(modulePath + '.js')) {
      results.push({
        category: CATEGORY,
        status: 'pass',
        title: `ES Module entry point "module": "${pkg.module}" exists`
      });
    } else {
      results.push({
        category: CATEGORY,
        status: 'error',
        title: `Module entry point "${pkg.module}" does not exist on disk`,
        suggestion: 'Build your ESM bundle before publishing or update "module" path'
      });
    }
  }

  const typesField = pkg.types || pkg.typings;
  if (typesField) {
    const typesPath = path.resolve(pkgDir, typesField);
    if (fs.existsSync(typesPath)) {
      results.push({
        category: CATEGORY,
        status: 'pass',
        title: `TypeScript definitions file "${typesField}" exists`
      });
    } else {
      results.push({
        category: CATEGORY,
        status: 'error',
        title: `Type declaration file "${typesField}" does not exist`,
        suggestion: 'Compile TypeScript declarations (.d.ts) or check the path'
      });
    }
  }

  if (pkg.bin) {
    const binEntries = typeof pkg.bin === 'string'
      ? { [pkg.name]: pkg.bin }
      : pkg.bin;

    for (const [cmdName, binRelPath] of Object.entries(binEntries)) {
      const binAbsPath = path.resolve(pkgDir, binRelPath);

      if (!fs.existsSync(binAbsPath)) {
        results.push({
          category: CATEGORY,
          status: 'error',
          title: `CLI executable for command "${cmdName}" NOT FOUND at "${binRelPath}"`,
          suggestion: `Create executable script at ${binRelPath}`
        });
        continue;
      }

      try {
        const binContent = fs.readFileSync(binAbsPath, 'utf8');
        const firstLine = binContent.split('\n')[0].trim();

        if (firstLine.startsWith('#!')) {
          results.push({
            category: CATEGORY,
            status: 'pass',
            title: `CLI executable "${cmdName}" has valid shebang: "${firstLine}"`
          });
        } else {
          results.push({
            category: CATEGORY,
            status: 'error',
            title: `CLI executable "${binRelPath}" is missing a Shebang line!`,
            details: 'Without "#!/usr/bin/env node", running your CLI globally or via npx will fail.',
            suggestion: `Add "#!/usr/bin/env node" as the very first line of ${binRelPath}`
          });
        }
      } catch (err) {
        results.push({
          category: CATEGORY,
          status: 'warn',
          title: `Could not verify shebang in "${binRelPath}": ${err.message}`
        });
      }
    }
  }

  return results;
}

module.exports = checkEntryPoints;
