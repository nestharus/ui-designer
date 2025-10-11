# Git Workflow

## Branch Strategy

### Main Branches

- `main` - Production-ready code
- `develop` - Integration branch for features (if using Git Flow)

### Feature Branches

Create feature branches from `main` (or `develop`):

```bash
git checkout -b feat/your-feature-name
```

### Branch Naming Convention

Use prefixes to indicate the type of work:

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `style/` - Code style changes (formatting, etc.)
- `refactor/` - Code refactoring
- `perf/` - Performance improvements
- `test/` - Adding or updating tests
- `build/` - Build system changes
- `ci/` - CI/CD changes
- `chore/` - Maintenance tasks

**Examples:**

```bash
feat/user-authentication
fix/login-validation-error
docs/api-documentation
refactor/user-service
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc.)
- `refactor` - Code refactoring (neither fixes a bug nor adds a feature)
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system changes (npm, webpack, etc.)
- `ci` - CI/CD changes (GitHub Actions, etc.)
- `chore` - Other changes that don't modify src or test files
- `revert` - Reverts a previous commit

### Scope (Optional)

The scope should be the name of the affected package or module:

```text
feat(auth): add JWT token generation
fix(api): handle null response from server
docs(readme): update installation instructions
```

### Subject

- Use imperative, present tense: "add" not "added" nor "adds"
- Don't capitalize first letter
- No period (.) at the end
- Keep under 50 characters

### Body (Optional)

- Use imperative, present tense
- Include motivation for the change
- Contrast with previous behavior

### Footer (Optional)

- Reference issues: `Closes #123`, `Fixes #456`
- Note breaking changes: `BREAKING CHANGE: description`

### Examples

#### Simple Commit

```text
feat: add user authentication module
```

#### Commit with Scope

```text
fix(api): handle network timeout errors
```

#### Commit with Body

```text
feat: add user authentication module

Implement JWT-based authentication with the following features:
- Login/logout endpoints
- Token generation and validation
- Auth middleware for protected routes
```

#### Commit with Footer

```text
fix: resolve memory leak in event listeners

Remove event listeners when component unmounts to prevent memory leaks.

Closes #123
```

#### Breaking Change

```text
feat: update API response format

BREAKING CHANGE: API now returns data in a different structure.
Old format: { user: {...} }
New format: { data: { user: {...} } }
```

## Workflow Steps

### 1. Create a Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/your-feature-name
```

### 2. Make Changes

- Write code
- Add tests
- Update documentation

### 3. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional message
git commit -m "feat: add new feature"
```

**Note:** Git hooks will automatically:

- Format staged files
- Run linting
- Validate commit message format

### 4. Keep Branch Updated

```bash
# Fetch latest changes
git fetch origin

# Rebase on main
git rebase origin/main

# Or merge main into your branch
git merge origin/main
```

### 5. Push Changes

```bash
# First push
git push -u origin feat/your-feature-name

# Subsequent pushes
git push
```

### 6. Create Pull Request

1. Go to GitHub/GitLab
2. Click "New Pull Request"
3. Select your branch
4. Fill in PR template
5. Request review

## Pull Request Guidelines

### PR Title

Use the same format as commit messages:

```text
feat: add user authentication
fix: resolve login validation error
```

### PR Description

Include:

1. **What** - What changes were made
2. **Why** - Why these changes were needed
3. **How** - How the changes were implemented
4. **Testing** - How to test the changes
5. **Screenshots** - If UI changes were made
6. **Related Issues** - Link to related issues

**Template:**

```markdown
## What

Brief description of changes

## Why

Explanation of why these changes were needed

## How

Technical details of implementation

## Testing

Steps to test the changes:

1. Step 1
2. Step 2
3. Step 3

## Screenshots

(If applicable)

## Related Issues

Closes #123
```

### PR Checklist

Before requesting review, ensure:

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All checks pass (lint, type-check, tests)
- [ ] No merge conflicts
- [ ] PR description is complete

## Code Review Process

### As a Reviewer

1. **Review promptly** - Within 24 hours if possible
2. **Be constructive** - Suggest improvements, don't just criticize
3. **Ask questions** - If something is unclear
4. **Approve or request changes** - Be clear about blocking issues
5. **Test locally** - If needed for complex changes

### As an Author

1. **Respond to feedback** - Address all comments
2. **Make requested changes** - Or explain why you disagree
3. **Keep PR updated** - Rebase/merge main regularly
4. **Be patient** - Reviews take time
5. **Thank reviewers** - Appreciate their time

## Merging

### Merge Strategies

1. **Squash and Merge** (Recommended)
   - Combines all commits into one
   - Keeps main branch history clean
   - Use for feature branches

2. **Rebase and Merge**
   - Replays commits on top of main
   - Maintains individual commits
   - Use for important commits

3. **Merge Commit**
   - Creates a merge commit
   - Preserves full history
   - Use rarely

### After Merging

```bash
# Switch to main
git checkout main

# Pull latest changes
git pull origin main

# Delete feature branch
git branch -d feat/your-feature-name

# Delete remote branch
git push origin --delete feat/your-feature-name
```

## Common Scenarios

### Fixing Commit Message

```bash
# Fix last commit message
git commit --amend -m "feat: correct commit message"

# Force push (if already pushed)
git push --force-with-lease
```

### Undoing Changes

```bash
# Discard uncommitted changes
git checkout -- file.ts

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Resolving Conflicts

```bash
# During rebase
git rebase origin/main

# Fix conflicts in files
# Then:
git add .
git rebase --continue

# Or abort rebase
git rebase --abort
```

### Cherry-Picking Commits

```bash
# Apply specific commit to current branch
git cherry-pick <commit-hash>
```

## Git Hooks

### Pre-commit

Runs before each commit:

- Formats staged files with Prettier
- Lints staged files with ESLint
- Runs Stylelint on CSS files

### Commit-msg

Validates commit message format:

- Checks conventional commit format
- Ensures proper type and subject

### Pre-push

Runs before pushing:

- Type checks all code
- Runs all tests

### Bypassing Hooks

**Not recommended**, but if needed:

```bash
# Skip pre-commit hooks
git commit --no-verify -m "message"

# Skip pre-push hooks
git push --no-verify
```

## Best Practices

### Commit Often

- Make small, focused commits
- Each commit should be a logical unit
- Easier to review and revert if needed

### Write Good Messages

- Clear and descriptive
- Follow conventional commits
- Include context in body

### Keep Branches Short-Lived

- Merge within a few days
- Reduces merge conflicts
- Easier to review

### Rebase Before Merging

- Keep history clean
- Resolve conflicts early
- Makes review easier

### Review Your Own Code

- Before requesting review
- Check for obvious issues
- Ensure tests pass

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)
