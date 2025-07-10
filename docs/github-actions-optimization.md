# GitHub Actions Optimization Guide

This document outlines the optimizations made to our GitHub Actions workflows to improve build times and resource usage.

## Key Optimizations Implemented

### 1. Dependency Caching

**Before**: Dependencies were installed fresh in every job (4x in CI workflow)
**After**: Bun cache is shared across jobs, saving ~30-60 seconds per job

```yaml
- name: Cache Bun dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.bun/install/cache
      node_modules
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
    restore-keys: |
      ${{ runner.os }}-bun-
```

### 2. Build Artifact Sharing

**Before**: Packages were built 3 times (typecheck, unit-tests, e2e-tests)
**After**: Built once and shared via artifacts, saving ~1-2 minutes per duplicate build

```yaml
# In build job:
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: build-artifacts
    path: |
      packages/*/dist
      packages/*/build
    retention-days: 1

# In consuming jobs:
- name: Download build artifacts
  uses: actions/download-artifact@v4
  with:
    name: build-artifacts
    path: packages
```

### 3. Playwright Browser Caching

**Before**: Playwright browsers downloaded fresh for each E2E run (~100MB+)
**After**: Browsers cached, saving ~1-2 minutes

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ${{ env.PLAYWRIGHT_BROWSERS_PATH }}
    key: ${{ runner.os }}-playwright-${{ hashFiles('packages/viewer/package.json') }}
    restore-keys: |
      ${{ runner.os }}-playwright-
```

### 4. E2E Test Parallelization

**Before**: E2E tests ran sequentially after all other tests
**After**: 
- E2E tests run in parallel with unit tests (only depends on build)
- Tests sharded across 2 parallel jobs

```yaml
e2e-tests:
  needs: [build]  # Only needs build, not other tests
  strategy:
    matrix:
      shard: [1, 2]
  # ...
  - name: Run E2E tests (shard ${{ matrix.shard }}/${{ strategy.job-total }})
    run: cd packages/viewer && bun run test:e2e -- --shard=${{ matrix.shard }}/${{ strategy.job-total }}
```

### 5. Deploy Workflow Optimization

**Before**: Rebuilt all packages after successful CI
**After**: Reuses build artifacts from CI workflow

## Performance Improvements

### Estimated Time Savings

1. **Dependency Installation**: ~2-4 minutes saved (30-60s × 4 jobs)
2. **Build Deduplication**: ~2-4 minutes saved (1-2 min × 2 duplicate builds)
3. **Playwright Caching**: ~1-2 minutes saved
4. **E2E Parallelization**: ~50% reduction in E2E time
5. **Deploy Optimization**: ~2-3 minutes saved

**Total Estimated Savings**: ~7-13 minutes per CI run

### Resource Usage

- **Network**: Reduced bandwidth usage from caching dependencies and browsers
- **CPU**: Eliminated redundant builds
- **Storage**: Minimal impact (1-day artifact retention)

## Migration Guide

To use the optimized workflows:

1. **Update workflow references**: 
   - Change `CI (Parallel)` to `CI (Optimized)` in dependent workflows
   - Update branch protection rules if needed

2. **Ensure Playwright compatibility**:
   - The E2E tests must support the `--shard` parameter
   - Update playwright config if needed:
   ```typescript
   export default defineConfig({
     // ... other config
     fullyParallel: true,
     workers: process.env.CI ? 1 : undefined,
   });
   ```

3. **Monitor cache effectiveness**:
   - Check Actions cache hit rates
   - Adjust cache keys if needed

## Best Practices

1. **Cache Key Strategy**:
   - Use lockfile hash for dependency caches
   - Include OS in cache key for cross-platform compatibility
   - Use restore-keys for fallback to previous caches

2. **Artifact Management**:
   - Keep retention low (1 day) for build artifacts
   - Use meaningful artifact names
   - Clean up artifacts after use

3. **Job Dependencies**:
   - Minimize dependencies between jobs
   - Run independent tasks in parallel
   - Use needs only when truly required

4. **Matrix Strategies**:
   - Use for parallel test execution
   - Consider OS/browser matrices for comprehensive testing
   - Balance parallelism with runner availability

## Monitoring and Maintenance

1. **Performance Metrics**:
   - Track workflow run times in GitHub Insights
   - Monitor cache hit rates
   - Watch for bottlenecks

2. **Regular Updates**:
   - Update action versions periodically
   - Review and adjust cache strategies
   - Optimize slow-running tests

3. **Cost Optimization**:
   - Monitor GitHub Actions usage minutes
   - Consider self-hosted runners for heavy workloads
   - Use path filters to skip unnecessary runs