# Changesets

This directory contains changeset files that describe changes to packages in the monorepo.

## Creating a Changeset

When you make changes that should be released, run:

```bash
bun run changeset
```

Follow the prompts to:

1. Select which packages have changed
2. Choose the type of change (major, minor, patch)
3. Write a summary of the changes

This creates a markdown file in this directory describing your changes.

## Versioning

When ready to release:

```bash
bun run version-packages
```

This consumes all changesets and updates package versions and CHANGELOGs.

## Publishing

To publish packages (if configured):

```bash
bun run release
```

See [Changesets documentation](https://github.com/changesets/changesets) for more details.
