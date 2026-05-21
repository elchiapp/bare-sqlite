# QVAC Upstream PR Plan

This fork branch is intentionally broader than any single upstream PR should be.
Use it as the integration branch for QVAC validation, then split upstream work
into small, reviewable branches.

## Principles

- Prefer one public capability per PR, with matching tests in the same PR.
- Avoid QVAC-specific naming in upstream-facing code and commit messages.
- Keep `DatabaseSync`, `StatementSync`, and existing extension-loading behavior
  compatible unless a focused PR explicitly changes it.
- Do not include sqlite-vector or QVAC RAG work in the base query API series.
- Rebase each focused branch on upstream `main`, not on this integration branch,
  unless it depends on an earlier accepted PR.

## Suggested PR Sequence

### PR 1: Node/NAPI Test Target

Scope:

- Add a Node/NAPI build target using the same C binding source.
- Keep the Bare module as the primary target.
- Use `require-addon` only as the Node compatibility loader.
- Add `test:bare`, `test:node`, and aggregate `test` scripts.

Tests:

- Existing test suite passes under Bare.
- Existing test suite passes under Node.

### PR 2: Statement Values Mode

Scope:

- Add `StatementSync#values(...params)`.
- Return rows as arrays in result-column order.
- Preserve existing `all()`, `get()`, `run()`, and `iterate()` behavior.
- Keep BLOB values wrapped as `Buffer` in JavaScript.

Tests:

- Multiple selected rows as arrays.
- Typed scalar values and BLOBs preserve byte order.
- Existing object-row tests continue to pass.

### PR 3: One-Shot Query Convenience

Scope:

- Add `DatabaseSync#query(sql, params, mode)`.
- Support `run`, `all`, `values`, and `get` modes.
- Finalize the prepared statement after each call.
- Require positional params as an array.
- Reject unsupported param types.
- Reject bind-count mismatch.
- Return `null` for empty `get` mode while keeping `StatementSync#get()` as
  `undefined` for API compatibility.

Tests:

- Create table and insert through `run`.
- Select objects through `all`.
- Select arrays through `values`.
- Return first row or `null` through `get`.
- SQL injection payload remains a bound value.
- Bad SQL, too few params, too many params, unsupported params, and bad mode
  throw without poisoning the next query.

### PR 4: iOS Simulator Driver Test

Scope:

- Add a local `test:ios-simulator` script that installs a Bare iOS simulator
  runtime, builds the simulator prebuild when needed, runs `test.js` through
  `xcrun simctl spawn`, and shuts down simulators it booted.
- Keep physical-device testing out of the upstream unit-test script.

Tests:

- Full package test suite passes on an available iOS simulator.

### PR 5: CI And Prebuild Verification

Scope:

- Keep lint and tests in CI.
- Preserve existing prebuild targets.
- Ensure iOS device and simulator prebuilds use an explicit deployment target
  low enough for supported devices. QVAC physical-device smoke found that an
  addon built with SDK 26.5 as the minimum OS would not load on an iOS 26.4.2
  device; local validation used a rebuilt iOS arm64 prebuild with min iOS 15.1.

Targets to preserve:

- linux x64/arm64
- darwin x64/arm64
- win32 x64/arm64
- android arm/arm64/ia32/x64
- ios arm64
- ios simulator

## Out Of Scope For This Series

- SQLite-Vector integration.
- QVAC wrapper or Drizzle adapter code.
- JS cosine fallback or wasm-backed SQLite.
