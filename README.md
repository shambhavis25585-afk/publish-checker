# @shambhavi_14/publish-checker

A CLI preflight verification tool that audits npm packages before publishing to prevent broken releases, missing entry points, and accidental file leaks.

## Why publish-checker?

Publishing an npm package with invalid configuration or missing files causes broken installs and security risks. `publish-checker` runs comprehensive audits to ensure your package is ready for production.

## Features

- **Metadata Validation:** Verifies `package.json` syntax, semantic versioning, naming conventions, and required metadata.
- **Entry Point Verification:** Validates that `main`, `module`, `types`, and `bin` target real files on disk.
- **Executable Validation:** Verifies shebang lines (`#!/usr/bin/env node`) on all CLI scripts.
- **Security Audit:** Checks for leaked secrets, `.env` files, and private credentials.
- **Whitelist Verification:** Checks `files` array and `.npmignore` configuration.
- **Zero Dependencies:** Pure Node.js implementation with no external runtime packages.

## Installation

Run directly with npx:

```bash
npx @shambhavi_14/publish-checker
```

Or install globally:

```bash
npm install -g @shambhavi_14/publish-checker
```

## Usage

Run the checker inside any npm project directory:

```bash
publish-checker
```

### Options

| Flag | Description |
| --- | --- |
| `-d, --dir <path>` | Audit a specific directory |
| `-s, --strict` | Treat warnings as failures |
| `--json` | Output machine-readable JSON |
| `--init-hook` | Add prepublishOnly script to package.json |
| `-v, --version` | Display version |
| `-h, --help` | Display help |

### Automatic Publish Hook

To run checks automatically before every `npm publish`:

```bash
npx @shambhavi_14/publish-checker --init-hook
```

## Programmatic API

```javascript
const { runChecks } = require('@shambhavi_14/publish-checker');

const report = runChecks({ dir: './my-package', strict: true });
console.log(`Passed: ${report.stats.passed}, Errors: ${report.stats.errors}`);
```

## License

MIT
