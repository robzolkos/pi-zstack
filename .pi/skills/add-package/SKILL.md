---
name: add-package
description: Adds an npm Pi package to pi-zstack. Use when the user asks to add an npm package to the stack, packages.txt, package.json dependencies/bundledDependencies/pi resource paths, package-lock.json, and README package list.
---

# Add Package

Use this skill in the `pi-zstack` repository when adding a new npm package to the personal Pi stack.

## Usage

Run the helper from the repository root with the npm package name:

```bash
node .pi/skills/add-package/scripts/add-package.mjs <npm-package-name>
```

Examples:

```bash
node .pi/skills/add-package/scripts/add-package.mjs pi-example-package
node .pi/skills/add-package/scripts/add-package.mjs @scope/pi-example-package
```

The script updates:

- `packages.txt` with `npm:<package>`
- `package.json` dependencies and `bundledDependencies`
- `package.json` `pi.extensions`, `pi.skills`, `pi.prompts`, and `pi.themes` from the package's published `pi` manifest when present
- `README.md` current package list
- `package-lock.json` via `npm install --package-lock-only --ignore-scripts`

After running it, review the diff and run any checks you want before committing.
