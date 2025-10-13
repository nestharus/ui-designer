# E2E Tests

End-to-end (e2e) tests validate complete user flows through the application using a real browser (Playwright).

## Running E2E Tests

### On Windows (Native)

Simply run:

```bash
bun run test:e2e        # Run headless
bun run test:e2e:ui     # Run with UI
```

Playwright will automatically start and manage the dev server.

### On WSL (Windows Subsystem for Linux)

Due to WSL networking complexities, you must start the dev server manually:

1. **Start the dev server** in one terminal:

   ```bash
   bun run --filter=@ui-designer/web dev
   ```

2. **Run the E2E tests** in another terminal:
   ```bash
   bun run test:e2e
   ```

**Note**: The Playwright config automatically detects WSL and:

- Skips automatic server management (requires manual server start)
- Skips webkit tests (due to performance issues on WSL)
- Tests run on Chromium and Firefox only

### On CI/Linux

Playwright manages the server automatically (same as Windows native).

## Patterns and Best Practices

E2E tests run against the full Next.js app (SSR, API routes, and client hydration) and focus on critical journeys.
Detailed patterns and best practices are covered in `docs/e2e-testing-guide.md`.

## Troubleshooting

### Tests Hang with 0 Tests Running (Windows)

**Root Cause**: IPv4/IPv6 resolution issue where `localhost` resolves to IPv6 (`::1`).

**Solution**: Fixed in config - uses `127.0.0.1` instead of `localhost`.

### Tests Hang on WSL

**Root Cause**: WSL networking complexities with Playwright's webServer process management.

**Solution**: Start the dev server manually before running tests (see WSL instructions above). The config automatically detects WSL and disables automatic server management.
