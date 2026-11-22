const c = require('./colors');

class Reporter {
  static formatCheck(status, title, details = null, suggestion = null) {
    let icon = '';
    let statusText = '';

    if (status === 'pass') {
      icon = c.green('✔');
      statusText = c.green(title);
    } else if (status === 'warn') {
      icon = c.yellow('⚠');
      statusText = c.yellow(title);
    } else if (status === 'error') {
      icon = c.red('✖');
      statusText = c.red(title);
    }

    let output = `  ${icon} ${statusText}`;

    if (details) {
      output += `\n    ${c.gray(details)}`;
    }
    if (suggestion) {
      output += `\n    ${c.cyan('➜ Suggestion:')} ${suggestion}`;
    }

    return output;
  }

  static printSection(title) {
    console.log(`\n${c.bold(c.blue('■'))} ${c.bold(title)}`);
  }

  static printResults(results, options = {}) {
    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    console.log('\n' + c.bold(c.cyan('========================================')));
    console.log(c.bold(c.cyan('     📦 NPM PUBLISH-CHECKER REPORT     ')));
    console.log(c.bold(c.cyan('========================================')));

    const categories = [
      { key: 'packageJson', title: 'Package Metadata (package.json)' },
      { key: 'entryPoints', title: 'Entry Points & Executables' },
      { key: 'documentation', title: 'Documentation & Licensing' },
      { key: 'security', title: 'Security & Leak Prevention' },
      { key: 'files', title: 'Publish Whitelist & Files' },
      { key: 'scripts', title: 'NPM Scripts & Hooks' }
    ];

    for (const cat of categories) {
      const items = results.checks.filter(c => c.category === cat.key);
      if (items.length > 0) {
        this.printSection(cat.title);
        for (const item of items) {
          console.log(this.formatCheck(item.status, item.title, item.details, item.suggestion));
        }
      }
    }

    console.log('\n' + c.dim('----------------------------------------'));
    console.log(c.bold('SUMMARY:'));

    const passes = results.checks.filter(c => c.status === 'pass').length;
    const warnings = results.checks.filter(c => c.status === 'warn').length;
    const errors = results.checks.filter(c => c.status === 'error').length;

    console.log(`  ${c.green(`Passed:   ${passes}`)}`);
    console.log(`  ${c.yellow(`Warnings: ${warnings}`)}`);
    console.log(`  ${c.red(`Errors:   ${errors}`)}`);
    console.log(c.dim('----------------------------------------'));

    if (errors === 0 && warnings === 0) {
      console.log(c.bold(c.green('\n🎉 All checks passed! Your package is in prime condition to publish!\n')));
    } else if (errors === 0) {
      if (options.strict) {
        console.log(c.bold(c.red('\n✖ Failed strict mode: Package has warnings that must be resolved.\n')));
      } else {
        console.log(c.bold(c.yellow('\n⚠ Package can be published, but consider addressing the warnings above.\n')));
      }
    } else {
      console.log(c.bold(c.red(`\n✖ Found ${errors} error(s)! Fix these issues before running "npm publish".\n`)));
    }
  }
}

module.exports = Reporter;
