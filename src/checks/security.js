const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CATEGORY = 'security';

const SENSITIVE_PATTERNS = [
  { name: '.env file', test: (file) => file === '.env' || file.startsWith('.env.') },
  { name: 'npm token in .npmrc', test: (file) => file === '.npmrc' },
  { name: 'SSH/Private Key', test: (file) => /^id_(rsa|ed25519|dsa)$/i.test(file) || /\.(pem|key)$/i.test(file) },
  { name: 'AWS Credentials', test: (file) => file === 'credentials' || file === 'aws-credentials' },
  { name: 'Hardcoded secrets file', test: (file) => /^(secrets?|credentials)\.json$/i.test(file) }
];

function checkSecurity(pkgDir, pkg) {
  const results = [];

  try {
    const files = fs.readdirSync(pkgDir);

    for (const file of files) {
      for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.test(file)) {
          if (file === '.npmrc') {
            try {
              const npmrcContent = fs.readFileSync(path.join(pkgDir, '.npmrc'), 'utf8');
              if (!npmrcContent.includes('_authToken') && !npmrcContent.includes('password')) {
                continue;
              }
            } catch {
            }
          }

          const isProtectedByWhitelist = Array.isArray(pkg?.files) &&
            !pkg.files.includes(file) &&
            !pkg.files.includes('./' + file);

          if (isProtectedByWhitelist) {
            results.push({
              category: CATEGORY,
              status: 'pass',
              title: `Found "${file}", but protected by "files" whitelist in package.json`
            });
          } else {
            results.push({
              category: CATEGORY,
              status: 'error',
              title: `DANGER: Sensitive file "${file}" detected in project root!`,
              details: `"${pattern.name}" will be published to the public NPM registry unless excluded!`,
              suggestion: `Add "${file}" to your .npmignore or use a "files" whitelist in package.json`
            });
          }
        }
      }
    }
  } catch (err) {
    results.push({
      category: CATEGORY,
      status: 'warn',
      title: `Could not scan directory for secrets: ${err.message}`
    });
  }

  const gitDir = path.join(pkgDir, '.git');
  if (fs.existsSync(gitDir)) {
    try {
      const statusOutput = execSync('git status --porcelain', {
        cwd: pkgDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim();

      if (statusOutput.length > 0) {
        const dirtyCount = statusOutput.split('\n').length;
        results.push({
          category: CATEGORY,
          status: 'warn',
          title: `Git repository has ${dirtyCount} uncommitted change(s)`,
          details: 'Publishing uncommitted code leads to unreproducible package versions.',
          suggestion: 'Commit or stash all changes ("git commit -m ...") before publishing'
        });
      } else {
        results.push({
          category: CATEGORY,
          status: 'pass',
          title: 'Git working tree is clean'
        });
      }
    } catch {
    }
  }

  return results;
}

module.exports = checkSecurity;
