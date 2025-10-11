# Version Management with Changesets

## Overview

This project uses [Changesets](https://github.com/changesets/changesets) to manage versioning in the monorepo.

Important:

- Do not write human-authored changelogs in `.changeset/`. That folder is for release intent entries only (package/version bump metadata).
- Changelogs are not manually maintained in this repo. Communicate changes via PR descriptions and commit messages.

## Why Changesets?

- **Intent-based versioning**: Declare what changed and why
- **Automatic changelog generation**: No manual CHANGELOG.md updates
- **Monorepo-aware**: Handles dependencies between packages
- **CI-friendly**: Integrates with GitHub Actions

## Creating a Changeset (Release Intent)

When you make changes that should be released:

```bash
bun run changeset
```

You'll be prompted to:

1. **Select packages**: Which packages changed?
2. **Select bump type**: Major, minor, or patch?
3. **Write summary**: What changed?

### Bump Types (Semantic Versioning)

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes, backward compatible

### Example

```bash
$ bun run changeset
🦋  Which packages would you like to include?
  ✔ @ui-designer/web
  ✔ @ui-designer/shared-types

🦋  Which packages should have a major bump?
  (none selected)

🦋  Which packages should have a minor bump?
  ✔ @ui-designer/web

🦋  Which packages should have a patch bump?
  ✔ @ui-designer/shared-types

🦋  Please enter a summary for this change:
  Add user profile page with avatar upload
```

This creates a file in `.changeset/` describing your changes.

## Versioning Packages

When ready to release:

```bash
bun run version-packages
```

This:

1. Consumes all changesets
2. Updates package.json versions
3. Updates CHANGELOG.md files
4. Deletes consumed changeset files

Commit the changes:

```bash
git add .
git commit -m "chore: version packages"
```

## Publishing (Optional)

If packages are published to npm:

```bash
bun run release
```

This runs `changeset publish` to publish updated packages.

## Workflow

### Development Flow

1. Make changes to code
2. Create a changeset: `bun run changeset`
3. Commit both code and changeset file
4. Open pull request

### Release Flow

1. Merge PRs with changesets to main
2. GitHub Action creates a "Version Packages" PR
3. Review and merge the version PR
4. Packages are published (if configured)

## Changeset File Format

Changeset files are markdown:

```markdown
---
'@ui-designer/web': minor
'@ui-designer/shared-types': patch
---

Add user profile page with avatar upload

This adds a new /profile route with:

- Avatar upload functionality
- Profile editing form
- Validation with Zod
```

## Best Practices

### 1. One Changeset Per Feature

Create a changeset for each logical change:

```bash
# Feature A
git commit -m "feat: add user profile"
bun run changeset

# Feature B
git commit -m "feat: add notifications"
bun run changeset
```

### 2. Write Clear Summaries

```markdown
# ✅ Good

Add user authentication with JWT tokens

Implements login/logout functionality using JWT tokens.
Includes middleware for protected routes.

# ❌ Bad

Update auth
```

### 3. Include Breaking Changes

For major bumps, explain what breaks:

````markdown
---
'@ui-designer/shared-types': major
---

Rename `User` type to `UserProfile`

BREAKING CHANGE: The `User` type has been renamed to `UserProfile`.
Update all imports:

```typescript
// Before
import { User } from '@ui-designer/shared-types';

// After
import { UserProfile } from '@ui-designer/shared-types';
```
````

````

### 4. Group Related Changes

If multiple packages change together, include them in one changeset:

```markdown
---
'@ui-designer/web': minor
'@ui-designer/shared-types': minor
---

Add project management features

Adds new Project type and CRUD operations.
````

### 5. Selecting Dependency Versions (Version Drift)

When adding or upgrading dependencies, and the required version differs from versions documented in this repo or your model knowledge:

- Use context7 to retrieve the authoritative current version, release notes, and migration guides.
- Check for breaking changes and plan migrations accordingly.
- Include a short summary of the upgrade rationale and risks in the changeset summary.
- Coordinate multi-package upgrades in one changeset when they must land together.

## CI Integration

The `.github/workflows/changesets.yml` workflow:

1. Runs on push to main
2. Checks for changesets
3. Creates/updates a "Version Packages" PR
4. When merged, publishes packages (if configured)

## Skipping Changesets

Not all changes need a changeset:

- Documentation updates
- Test changes
- Internal refactoring (no API changes)
- CI configuration

For these, just commit without creating a changeset.

## Troubleshooting

### "No changesets present"

You forgot to create a changeset. Run `bun run changeset`.

### "Changeset validation failed"

Your changeset file is malformed. Check the YAML frontmatter.

### "Cannot find package"

The package name in your changeset doesn't match package.json.

## Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
