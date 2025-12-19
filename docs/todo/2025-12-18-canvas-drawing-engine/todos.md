# Task 5: Canvas Component & Drawing Engine - Tasks

Reference: `docs/todo/2025-12-18-canvas-drawing-engine/plan.md`

## Milestone 1: Canvas Infrastructure ✅

- `canvas-lib-types` | **completed** | Create `lib/canvas/types.ts` with Viewport, DrawingState, CanvasContext interfaces
- `canvas-lib-index` | **completed** | Create `lib/canvas/index.ts` export barrel
- `canvas-hook-size` | **completed** | Create `hooks/canvas/use-canvas-size.ts` for window resize handling
- `canvas-hook-index` | **completed** | Create `hooks/canvas/index.ts` export barrel
- `canvas-component` | **completed** | Create `app/components/canvas/Canvas.tsx` main component
- `canvas-component-index` | **completed** | Create `app/components/canvas/index.ts` export barrel
- `canvas-integrate-home` | **completed** | Replace Welcome component with Canvas in `routes/home/page.tsx`

## Milestone 2: Event Handling System ✅

- `canvas-lib-utils` | **completed** | Create `lib/canvas/utils.ts` with screenToCanvas, canvasToScreen transforms
- `canvas-hook-viewport` | **completed** | Create `hooks/canvas/use-viewport.ts` for pan/zoom state management
- `canvas-hook-events` | **completed** | Create `hooks/canvas/use-canvas-events.ts` with mouse/touch handlers

## Milestone 3: Drawing Operations ✅

- `canvas-lib-renderer` | **completed** | Create `lib/canvas/renderer.ts` with drawRectangle, drawCircle, drawLine functions
- `canvas-lib-render-all` | **completed** | Add renderElements function to render all elements with viewport transform
- `canvas-hook-drawloop` | **completed** | Create `hooks/canvas/use-draw-loop.ts` with requestAnimationFrame render loop
- `canvas-preview-render` | **completed** | Add preview element rendering during active drawing

## Milestone 4: Integration with RxDB ✅

- `canvas-rxdb-subscribe` | **completed** | Subscribe to RxDB board.elements in `routes/home/page.tsx`
- `canvas-rxdb-create` | **completed** | Implement onElementCreate to persist new elements to RxDB
- `canvas-rxdb-init` | **completed** | Initialize default board if none exists

## Final Validation ✅

- `canvas-acceptance-test` | **completed** | All acceptance criteria met
- `canvas-typecheck` | **completed** | `pnpm typecheck` passes with no errors
- `canvas-build` | **completed** | `pnpm build` succeeds
