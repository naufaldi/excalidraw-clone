# Monorepo Agent Rules (excalidraw-clone)

This repository is an offline-first collaborative whiteboard that evolves in phases:
V1 (frontend-only) → V2 (cloud sync) → V3 (multi-board) → V4 (real-time).

These rules are for any automated agent (and humans) making changes in this repo.

## Workspace & Project Layout

- Monorepo tooling: **pnpm workspaces** + **moonrepo**.
- Workspace globs:
  - pnpm workspaces: `apps/*`, `packages/*` (see `pnpm-workspace.yaml`)
  - moon workspace: `apps/*`, `packages/*`, `infra/*` (see `.moon/workspace.yml`)
- Expected apps/packages from the implementation plan:
  - `apps/frontend` (React + RxDB + Canvas; V1–V4)
  - `apps/backend` (Go API; V2+)
  - `packages/shared` (shared TS types)
  - `packages/ui` (shared React UI components)

## Tooling Conventions (Non-Negotiable)

- Package manager: use **pnpm** (root `packageManager` pin).
- Task runner/orchestrator: prefer **moon** over ad-hoc scripts.
  - Common entrypoints: `pnpm lint`, `pnpm check`, `pnpm typecheck`, `pnpm format`.
- Local infra (when needed): `pnpm compose:up`, `pnpm compose:down` (see `compose.yaml`).
- Formatting/linting for JS/TS/JSON/CSS: **Biome**.
  - Do not add ESLint/Prettier unless the repo explicitly adopts them later.
- Git hooks are configured in `.moon/workspace.yml`; don’t bypass them by introducing conflicting tooling.

## Dependency Policy (Important)

Moon toolchain is configured with a “single version policy” (`rootPackageOnly: true`).

- Add **Node** dependencies at the **workspace root** unless there is a deliberate exception.
- Prefer `workspace:*` for internal packages.
- Avoid adding new package managers, lockfiles, or per-project dependency trees.

## Product/Architecture Guardrails

- V1 must remain **frontend-only** and **offline-first**:
  - No required auth, no required backend, no required network calls.
  - Persistence uses RxDB/IndexedDB; UI should subscribe reactively to local state.
- V2+ adds cloud sync; keep code organized so V1 paths don’t depend on backend runtime.
- Keep shared types and utilities in `packages/*` (not duplicated across apps).

## Frontend Implementation Rules

- Rendering: Canvas-first for performance (1000+ elements).
- Data model: keep element operations explicit (create/update/delete) and serializable.
- Prefer predictable state transitions (command/event style) to enable undo/redo and sync later.
- Performance: avoid per-frame React state updates; keep hot drawing loops outside React when possible.

## Backend Implementation Rules (V2+)

- Go code lives in `apps/backend` and follows standard layout (`cmd/`, `internal/`).
- Use `gofmt` formatting; keep APIs versioned and typed; avoid leaky DB models in handlers.
- Postgres is the source of truth for cloud state; local remains RxDB.

## Documentation Discipline

- When you introduce a new subsystem (sync strategy, schema change, protocol), add or update:
  - `docs/brain/whiteboard-implementation-plan.md` (if it changes the plan)
  - `docs/rfc/` (for decisions that need rationale and future reference)

## PR Hygiene (Local Changes)

- Keep changes minimal and scoped to the requested task.
- Run the narrowest verification that applies (format/lint/typecheck/tests) before declaring “done”.

## If You’re Unsure

- Prefer the implementation plan in `docs/brain/whiteboard-implementation-plan.md`.
- Ask one targeted question and proceed with a reasonable default if blocked.
