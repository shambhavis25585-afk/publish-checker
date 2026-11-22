#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { runChecks } = require('../src/index');
const Reporter = require('../src/utils/reporter');
const c = require('../src/utils/colors');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${c.bold(c.cyan('publish-checker'))} - Comprehensive pre-publish audit for NPM packages

${c.bold('USAGE:')}
  $ npx publish-checker [options]
  $ publish-checker [options]

${c.bold('OPTIONS:')}
  -d, --dir <path>     Directory of the package to check (default: current directory)
  -s, --strict         Strict mode: treat warnings as errors (exit code 1)
  --json               Output machine-readable JSON (ideal for CI/CD)
  --init-hook          Automatically add "prepublishOnly" hook to your package.json
  -v, --version        Show current version
  -h, --help           Show this help message

${c.bold('EXAMPLES:')}
  $ publish-checker
  $ publish-checker --strict
  $ publish-checker --dir ../my-library --json
  $ publish-checker --init-hook
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  try {
    const pkg = require('../package.json');
    console.log(`publish-checker v${pkg.version}`);
  } catch {
    console.log('publish-checker v1.0.0');
  }
  process.exit(0);
}

let targetDir = process.cwd();
const dirIndex = args.findIndex(arg => arg === '--dir' || arg === '-d');
if (dirIndex !== -1 && args[dirIndex + 1]) {
  targetDir = path.resolve(args[dirIndex + 1]);
}

if (args.includes('--init-hook')) {
  const pkgPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.error(c.red('✖ Error: No package.json found in ' + targetDir));
    process.exit(1);
  }

  try {
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    pkg.scripts = pkg.scripts || {};
    
    if (pkg.scripts.prepublishOnly && pkg.scripts.prepublishOnly.includes('publish-checker')) {
      console.log(c.yellow('⚠ Hook "prepublishOnly": "publish-checker" is already installed.'));
      process.exit(0);
    }

    pkg.scripts.prepublishOnly = 'publish-checker';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(c.bold(c.green('✔ Successfully added "prepublishOnly": "publish-checker" to package.json!')));
    console.log(c.gray('Now, every time you run "npm publish", checks will run automatically.'));
    process.exit(0);
  } catch (err) {
    console.error(c.red('✖ Failed to update package.json: ' + err.message));
    process.exit(1);
  }
}

const isStrict = args.includes('--strict') || args.includes('-s');
const isJson = args.includes('--json');

const results = runChecks({
  dir: targetDir,
  strict: isStrict
});

Reporter.printResults(results, {
  strict: isStrict,
  json: isJson
});

process.exit(results.success ? 0 : 1);
