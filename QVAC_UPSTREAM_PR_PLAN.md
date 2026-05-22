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

### PR 1: Statement Values Mode

Scope:

- Add `StatementSync#values(...params)`.
- Return rows as arrays in result-column order.
- Preserve existing `all()`, `get()`, `run()`, and `iterate()` behavior.
- Keep BLOB values wrapped as `Buffer` in JavaScript.

Tests:

- Multiple selected rows as arrays.
- Typed scalar values and BLOBs preserve byte order.
- Existing object-row tests continue to pass.

### PR 2: One-Shot Query Convenience

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

### PR 3: TypeScript Declarations

Scope:

- Add package-owned declarations for `DatabaseSync`, `StatementSync`, query
  modes, run results, and SQLite value rows.
- Keep declarations runtime-neutral: BLOBs are `Uint8Array`, and there are no
  host-specific global types.

Tests:

- Type declarations are consumed by QVAC's wrapper without local ambient shims.

### PR 4: Static Extension Hooks

Scope:

- Add a small public C header for static extension registries.
- Add the default empty registry source.
- Add `DatabaseSync.staticExtensions()` and `db.loadStaticExtension(name)`.
- Add CMake hooks for package users to provide registry source, registry CMake,
  and an optional package-owned test extension.

Tests:

- Default builds report a registry array.
- The test extension build can load and call its linked function.

## Deferred Tooling

Simulator runners and broader prebuild validation should stay out of this core
API branch. Add them later as tooling-only changes when QVAC needs that gate.

## Out Of Scope For This Series

- SQLite-Vector integration.
- QVAC wrapper or Drizzle adapter code.
- JS cosine fallback or wasm-backed SQLite.
