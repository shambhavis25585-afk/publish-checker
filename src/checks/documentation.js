const fs = require('fs');
const path = require('path');

const CATEGORY = 'documentation';

function checkDocumentation(pkgDir, pkg) {
  const results = [];

  const readmeCandidates = ['README.md', 'readme.md', 'README', 'README.markdown'];
  let foundReadme = null;
  let readmePath = null;

  for (const candidate of readmeCandidates) {
    const fullPath = path.join(pkgDir, candidate);
    if (fs.existsSync(fullPath)) {
      foundReadme = candidate;
      readmePath = fullPath;
      break;
    }
  }

  if (!foundReadme) {
    results.push({
      category: CATEGORY,
      status: 'error',
      title: 'README.md is missing!',
      details: 'Packages without a README look abandoned and rank poorly on npmjs.com.',
      suggestion: 'Create a README.md file explaining what your package does and how to install it.'
    });
  } else {
    try {
      const content = fs.readFileSync(readmePath, 'utf8').trim();
      if (content.length < 80) {
        results.push({
          category: CATEGORY,
          status: 'warn',
          title: `README.md is very short (${content.length} characters)`,
          suggestion: 'Add clear installation commands, code examples, and usage instructions'
        });
      } else {
        const hasHeading = /^#\s+.+/m.test(content);
        const mentionsInstall = /npm\s+i|yarn\s+add|pnpm\s+add|npx\s+/i.test(content);

        if (!hasHeading) {
          results.push({
            category: CATEGORY,
            status: 'warn',
            title: 'README.md lacks a top-level Markdown title (# Title)',
            suggestion: 'Add a clear # Title at the beginning of your README'
          });
        } else if (!mentionsInstall) {
          results.push({
            category: CATEGORY,
            status: 'warn',
            title: 'README.md does not contain installation instructions',
            suggestion: 'Include "npm install <package-name>" so users know how to use it'
          });
        } else {
          results.push({
            category: CATEGORY,
            status: 'pass',
            title: `README.md found with comprehensive sections (${content.length} bytes)`
          });
        }
      }
    } catch (err) {
      results.push({
        category: CATEGORY,
        status: 'warn',
        title: `Could not read README.md: ${err.message}`
      });
    }
  }

  const licenseCandidates = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'COPYING'];
  let foundLicense = null;

  for (const candidate of licenseCandidates) {
    if (fs.existsSync(path.join(pkgDir, candidate))) {
      foundLicense = candidate;
      break;
    }
  }

  if (!foundLicense) {
    results.push({
      category: CATEGORY,
      status: 'warn',
      title: 'No LICENSE file found in root directory',
      details: 'Even if package.json has "license": "MIT", open source registries recommend an explicit LICENSE file.',
      suggestion: 'Add an MIT or Apache-2.0 LICENSE file in the project root'
    });
  } else {
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: `License file "${foundLicense}" is present`
    });
  }

  const changelogCandidates = ['CHANGELOG.md', 'HISTORY.md', 'CHANGES.md'];
  const hasChangelog = changelogCandidates.some(c => fs.existsSync(path.join(pkgDir, c)));

  if (hasChangelog) {
    results.push({
      category: CATEGORY,
      status: 'pass',
      title: 'CHANGELOG file is present'
    });
  }

  return results;
}

module.exports = checkDocumentation;
