# Pre-commit Hooks

This project uses pre-commit hooks to maintain code quality and consistency.

## File Size Check

The pre-commit hook includes a file size checker that enforces the following limits:

- **TypeScript files (.ts, .tsx)**: 700 lines maximum

### What it does

- Scans all TypeScript files in the project for line count
- Issues warnings for files between 700-1050 lines
- Blocks commits for files over 1050 lines (150% of limit)
- Excludes backup files (`.original.`, `.backup.`, `.old.`)
- Excludes common directories (node_modules, dist, build, etc.)

### Running the check manually

```bash
# Check all TypeScript files
npm run check-file-sizes

# Run the full pre-commit suite
npm run precommit
```

### Bypassing the check

**Not recommended**, but if you need to bypass the check:

```bash
git commit --no-verify
```

### Suggestions for large files

When files exceed the limit, the hook provides specific suggestions:

- Extract utility functions into separate files
- Keep type definitions inline for better isolated declarations and LLM context
- Create separate files for each major component/class
- Use barrel exports (index.ts) for clean imports
- Split by feature or domain responsibility
- Consider extracting constants to a constants.ts file
- Break down large components into smaller, focused components
- Extract custom hooks into separate files (if React)
- Move business logic to service files

### Why these limits?

- **700 lines**: Optimal for maintainability and code review
- **TypeScript only**: Focuses on the most critical files for type safety
- **Inline types**: Supports isolated declarations and better LLM context
- **Single responsibility**: Encourages focused, modular code

## Other pre-commit checks

The full pre-commit suite includes:

1. **File size check** - TypeScript files under 700 lines
2. **Linting** - Code style and quality checks
3. **Type checking** - TypeScript compilation validation
4. **Unit tests** - Ensure tests pass before commit

These run automatically on every commit to maintain code quality.