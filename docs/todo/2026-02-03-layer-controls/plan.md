# Layer controls (z-index) + RFC sync

Reference: `.agents/PLAN.md` | Tasks: `docs/todo/2026-02-03-layer-controls/todos.md`

## Purpose

Users can change which element appears in front/behind when elements overlap, using predictable “layer” actions (bring to front, send to back, bring forward, send backward). This makes arranging diagrams possible without deleting/redrawing elements. The change should be easy to see by drawing two overlapping shapes and using the new controls to flip which one is on top.

### User Story

As a user, I want to change the layer order of selected elements so that I can control which elements appear in front or behind when shapes overlap.

### Acceptance Criteria

- [ ] Layer actions work: with overlapping shapes, “Bring to Front” and “Send to Back” immediately change which element is visually on top.
- [ ] Persistence: after a refresh, layer ordering remains (z-index changes are saved to RxDB).
- [x] Shortcuts: Ctrl/Cmd+Shift+] (bring to front), Ctrl/Cmd+Shift+[ (send to back), Ctrl/Cmd+] (bring forward), Ctrl/Cmd+[ (send backward) trigger the correct action for the current selection.
- [x] Multi-selection behavior: bring-to-front/back works when multiple elements are selected (selected elements stay above/below unselected elements; their relative order is preserved).
- [x] RFC sync: `docs/rfc/001-independent-element-management.md` is updated so US-5/US-6 reflect reality, and US-7 reflects the new layer UI/shortcuts.

## Progress

- [x] (2026-02-03 09:33Z) Draft ExecPlan and task breakdown
- [x] (2026-02-03 09:34Z) Repo scan: confirm existing zIndex utilities and persistence paths
- [x] (2026-02-03 09:35Z) RFC sync: update RFC-001 to reflect real status of US-5/US-6 and current US-7 work
- [x] (2026-02-03 09:36Z) TDD: add `layer-utils` tests + implement selection-based zIndex helpers
- [x] (2026-02-03 09:38Z) Add layer UI + handlers in home route; add keyboard shortcuts + tests
- [ ] (2026-02-03 00:00Z) Manual validation: confirm visual layer order + persistence after refresh

## Decision Log

- **Location of controls (initial)**: implement a small “Layer” control row in `apps/excalidraw/app/routes/home/page.tsx` (visible only when `selectedIds.size > 0`) before adding a richer right-click context menu. Rationale: smallest surface area, no new UI primitives needed, easiest to validate.
- **Multi-selection semantics (initial)**: support multi-select for “bring to front/back” only. “Bring forward/backward” is implemented for single-selection first (or applied per-element only if behavior is well-defined after repo scan). Rationale: incremental, avoids complex z-index collision handling for multiple incremental moves.
- **How to persist**: reuse existing RxDB mutation utilities (prefer `updateMultipleElementsInBoard` used for move/transform) rather than adding new schema fields. Rationale: keep changes minimal; zIndex already exists in schema and elements render are sorted by zIndex.

## Surprises & Discoveries

- `pnpm check` currently fails due to repo-wide Biome configuration/schema mismatch and CSS parsing errors in `packages/shared-ui/src/styles/global.css` (Tailwind directives). This is pre-existing and not introduced by this change.
- `pnpm --filter excalidraw test` currently fails due to pre-existing failures in `apps/excalidraw/tests/pages/home.test.tsx` (expects “Dashboard”, but page renders “Loading...”).

## Outcomes & Retrospective

[Fill when complete: what shipped, what to improve next time]

## Context

### What “zIndex” means in this repo

Each canvas element includes a `zIndex: number` (layer order). Rendering order uses zIndex:
- Lower zIndex renders earlier (behind).
- Higher zIndex renders later (in front).

Relevant code paths:
- Rendering sorts by zIndex: `apps/excalidraw/app/components/canvas/Canvas.tsx` (see render loop sorting by `a.zIndex - b.zIndex`).
- Hit-testing returns topmost first (descending zIndex): `apps/excalidraw/lib/canvas/selection.ts` (hit elements sorted by `b.zIndex - a.zIndex`).

Existing utilities and persistence:
- Layer calculations: `apps/excalidraw/lib/canvas/layer-utils.ts` (bring front/back/forward/backward + normalize helpers).
- Element updates for move/transform already use batch updates: `apps/excalidraw/app/routes/home/page.tsx` (calls `updateMultipleElementsInBoard`).
- A zIndex-only mutation exists: `apps/excalidraw/lib/database/mutations.ts` (`reorderElementsInBoard`), but it updates only one element at a time; for multi-selection we likely want batch updates.

### Current RFC status vs code reality

`docs/rfc/001-independent-element-management.md` currently shows:
- US-5 (resize/rotate) is partially complete: resize works; rotation stores `angle`, but rotation is not rendered yet.
- US-6 (copy/paste) is complete.
- US-7 (layer management) is in progress and covered by this plan.

### Term definitions (plain language)

- **Selection**: the set of element IDs currently selected (`Set<string>`).
- **Layer order / z-index**: a number controlling which element appears in front when shapes overlap.
- **Bring to front**: set selected element(s) to a zIndex higher than all other elements.
- **Send to back**: set selected element(s) to a zIndex lower than all other elements.
- **Bring forward / send backward**: move selected element one “step” up/down relative to neighbors’ zIndex.

## Plan of Work

1) Sync the RFC to match what’s already implemented (US-5/US-6), and capture what remains (US-7).

2) Implement “layer actions” in the home route as explicit handlers that:
- compute new zIndex values for the selection (using `apps/excalidraw/lib/canvas/layer-utils.ts`),
- persist via `updateMultipleElementsInBoard`,
- keep selection stable (selected IDs remain selected after layer change).

3) Add keyboard shortcuts for those actions in `apps/excalidraw/hooks/useKeyboardShortcuts.ts`, wired up from `apps/excalidraw/app/routes/home/page.tsx`.

4) Add a minimal UI entry point in the home route (a small row of buttons) so the feature is discoverable without memorizing shortcuts.

5) Add/extend Vitest coverage in `apps/excalidraw/tests/` for the zIndex update logic (and optionally shortcut wiring, if tests already cover keyboard handlers).

## Steps

### Step 0: Repo scan (confirm exact integration points)

From repo root:

    rg -n "reorderElementsInBoard|updateMultipleElementsInBoard|zIndex" apps/excalidraw -S
    rg -n "CanvasToolbar" packages/shared-ui -S
    rg -n "useKeyboardShortcuts" apps/excalidraw -S

Expected: find existing `layer-utils.ts`, an RxDB mutation path, and the home page handlers for move/transform to mirror for zIndex updates.

### Step 1: Update RFC checkboxes/status

Edit:
- `docs/rfc/001-independent-element-management.md`

Make these reflect reality:
- Mark US-5 and US-6 acceptance criteria that are already implemented as complete (or split out what’s missing if partial).
- Keep US-7 unchecked but add concrete plan notes that Phase 5 will add UI + shortcuts.

### Step 2: Add layer action handlers + persistence

Modify:
- `apps/excalidraw/app/routes/home/page.tsx`
- (optional) `apps/excalidraw/lib/canvas/layer-utils.ts` if new helper needed for multi-selection zIndex assignment

Implementation notes (multi-selection bring front/back):
- Compute `maxZ` / `minZ` from all elements.
- Preserve relative order within the selection by sorting selected elements by current zIndex ascending.
- Assign new zIndexes contiguously:
  - Bring to front: start at `maxZ + 1` and increment per selected element.
  - Send to back: start at `minZ - selectedCount` and increment per selected element.

Persist via the existing batch update call (pattern matches move/transform):

    const updates = newZById.map(({ id, zIndex }) => ({ id, updates: { zIndex } }));
    await updateMultipleElementsInBoard(DEFAULT_BOARD_ID, updates);

### Step 3: Add shortcuts in `useKeyboardShortcuts`

Modify:
- `apps/excalidraw/hooks/useKeyboardShortcuts.ts`

Add callbacks (new optional props):
- `onBringToFront?`, `onSendToBack?`, `onBringForward?`, `onSendBackward?`

Bind keys:
- Ctrl/Cmd+Shift+] → bring to front
- Ctrl/Cmd+Shift+[ → send to back
- Ctrl/Cmd+] → bring forward
- Ctrl/Cmd+[ → send backward

Wire from:
- `apps/excalidraw/app/routes/home/page.tsx`

### Step 4: Add minimal UI controls

Modify:
- `apps/excalidraw/app/routes/home/page.tsx`

Add a small UI row near the existing toolbar that:
- only shows when `selectedIds.size > 0`
- provides 2–4 buttons for layer actions (at minimum: bring to front / send to back)
- calls the new handlers

Keep visuals consistent with existing toolbar (simple container + existing shared-ui `Button` component if already used elsewhere in app; otherwise keep styling minimal and consistent with current inline styles).

### Step 5: Add/extend tests

Modify/add in:
- `apps/excalidraw/tests/element-management.test.ts` or a new focused test file under `apps/excalidraw/tests/` (prefer existing patterns in repo scan)

Test the core logic:
- Given overlapping elements, applying bring-to-front changes the selected element(s) to have greater zIndex than unselected.
- For multi-selection bring-to-front/back, relative order within selected elements stays consistent.

Run:

    cd /Users/mac/WebApps/projects/excalidraw-clone
    pnpm --filter excalidraw test

Expected: test suite passes; the new tests cover zIndex behavior.

## Validation

### Automated

From repo root:

    cd /Users/mac/WebApps/projects/excalidraw-clone
    pnpm check

From app:

    cd /Users/mac/WebApps/projects/excalidraw-clone
    pnpm --filter excalidraw typecheck
    pnpm --filter excalidraw test

Expected:
- No Biome errors for modified files.
- Typecheck succeeds.
- Vitest suite passes.

### Manual (behavioral)

1) Start dev server:

    cd /Users/mac/WebApps/projects/excalidraw-clone
    pnpm --filter excalidraw dev

2) Draw two overlapping rectangles.
3) Select the back rectangle, run “Bring to Front” (button or shortcut).
4) Confirm the selected rectangle is now visibly on top.
5) Refresh the page, confirm ordering remains.

## Artifacts

[Paste any relevant terminal output and screenshots as indented blocks during implementation]
