# GitHub Workflows

This directory contains optimized GitHub Actions workflows for the browser document viewer project.

## Workflows

### CI (Parallel) - `ci-parallel.yml`
The main CI workflow that runs all checks in parallel for maximum efficiency:

- **Lint & Format** - Runs Biome linting and file size checks
- **TypeScript Check** - Validates TypeScript compilation across all packages
- **Unit Tests** - Runs unit tests with coverage for all packages
- **E2E Tests** - Runs end-to-end tests using Playwright (depends on unit tests)
- **Cross-Platform Tests** - Runs deterministic tests on Ubuntu, Windows, and macOS
- **All Checks Passed** - Final job that confirms all previous jobs succeeded

### Deploy Demo - `deploy-demo.yml`
Deploys the demo application to GitHub Pages:

- **Triggers**: Only runs after the CI (Parallel) workflow completes successfully
- **Deployment**: Builds and deploys the demo app to GitHub Pages
- **Concurrency**: Prevents concurrent deployments using GitHub's concurrency controls

## Benefits of the Parallel Approach

1. **Faster Feedback**: Linting, TypeScript checks, and tests run simultaneously
2. **Better Resource Utilization**: GitHub Actions runners work in parallel instead of sequentially
3. **Fail Fast**: Issues are detected quickly across different check types
4. **Safe Deployment**: GitHub Pages deployment only happens after ALL checks pass
5. **Clear Dependencies**: E2E tests depend on unit tests, deployment depends on all checks

## Typical Runtime

- **Previous Sequential Approach**: ~8-12 minutes total
- **New Parallel Approach**: ~4-6 minutes total (depends on slowest job)

## Job Dependencies

```
┌─────────────┐  ┌─────────────────┐  ┌─────────────┐
│   Lint &    │  │   TypeScript    │  │ Unit Tests  │
│   Format    │  │     Check       │  │             │
└─────────────┘  └─────────────────┘  └──────┬──────┘
                                             │
┌─────────────┐                             │
│Cross-Platform│                             │
│    Tests    │                             │
└─────────────┘                             │
                                            │
                                     ┌──────▼──────┐
                                     │  E2E Tests  │
                                     └──────┬──────┘
                                            │
                  ┌─────────────────────────▼─────────────────────────┐
                  │              All Checks Passed                    │
                  └─────────────────────┬─────────────────────────────┘
                                        │
                                 ┌──────▼──────┐
                                 │   Deploy    │
                                 │   to Pages  │
                                 └─────────────┘
```