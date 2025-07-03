# GitHub Actions Workflows

This directory contains the CI/CD workflows for the PDFWasm project.

## Workflows

### 1. Pre-merge Checks (`pre-merge.yml`)
- **Trigger**: Pull requests to `main` branch
- **Purpose**: Validate code before merging
- **Steps**:
  - Build WASM and JS targets
  - Run all tests
  - Check code formatting
  - Verify type safety

### 2. Post-merge Build (`post-merge.yml`)
- **Trigger**: Push to `main` branch
- **Purpose**: Build and store artifacts after merge
- **Steps**:
  - Build all targets
  - Run tests
  - Upload artifacts
  - Create release (if commit contains `[release]`)

### 3. Continuous Integration (`ci.yml`)
- **Trigger**: All pushes and pull requests
- **Purpose**: Full CI matrix testing
- **Matrix**: Ubuntu and macOS
- **Steps**:
  - Install MoonBit
  - Build all targets
  - Run unit and integration tests
  - Cache dependencies

### 4. Dependency Check (`dependency-check.yml`)
- **Trigger**: Weekly (Mondays at 9 AM UTC) or manual
- **Purpose**: Keep dependencies up to date
- **Steps**:
  - Check for MoonBit updates
  - Update dependencies
  - Run tests
  - Create PR if updates found

### 5. Release (`release.yml`)
- **Trigger**: Version tags (`v*`) or manual
- **Purpose**: Create official releases
- **Steps**:
  - Build release artifacts
  - Run full test suite
  - Generate changelog
  - Create GitHub release with artifacts

## Local Testing

To test workflows locally, you can use [act](https://github.com/nektos/act):

```bash
# Test pre-merge workflow
act pull_request -W .github/workflows/pre-merge.yml

# Test CI workflow
act push -W .github/workflows/ci.yml
```

## Secrets Required

None currently required. All workflows use public resources.

## Caching

Workflows cache:
- MoonBit installation (`~/.moon`)
- Project dependencies (`.mooncakes`)

Cache keys are based on OS and `moon.mod.json` hash.