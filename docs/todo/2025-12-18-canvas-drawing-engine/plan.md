# Canvas Component & Drawing Engine Implementation

Reference: `.agents/PLAN.md` | Tasks: `docs/todo/2025-12-18-canvas-drawing-engine/todos.md`

## Purpose

This plan implements the core HTML5 Canvas component with drawing capabilities for the whiteboard application. After completion, users can open the home page and interact with a responsive canvas that supports mouse/touch drawing of basic shapes (rectangle, circle, line) at 60fps. The canvas will properly resize with the browser window and maintain a coordinate system for element positioning.

### User Story

As a whiteboard user, I want a responsive canvas where I can draw basic shapes so that I can create visual diagrams and sketches offline.

### Acceptance Criteria

- [x] Canvas component renders full-screen in the home page
- [x] Mouse event handlers (mousedown, mousemove, mouseup) capture drawing input
- [x] Touch event handlers (touchstart, touchmove, touchend) work on mobile
- [x] Drawing operations render rectangle, circle, and line shapes
- [x] Drawing performance maintains 60fps (no visible lag)
- [x] Canvas coordinate system maps screen coordinates to canvas coordinates
- [x] Canvas resizes automatically with window resize
- [x] Elements persist to RxDB when drawing completes

## Progress

- [x] (2025-12-18) Milestone 1: Canvas infrastructure - Created lib/canvas types, utils, renderer
- [x] (2025-12-18) Milestone 2: Event handling system - Created hooks for events, viewport, size
- [x] (2025-12-18) Milestone 3: Drawing operations - Implemented render loop with RAF
- [x] (2025-12-18) Milestone 4: Integration with RxDB - Connected to database, persistence working

## Decision Log

- (2025-12-18) **Canvas rendering approach**: Use HTML5 Canvas 2D API directly (not WebGL) for V1 simplicity. Canvas 2D is sufficient for 1000+ elements and avoids complexity.
- (2025-12-18) **State management**: Keep drawing state (current tool, active drawing) in React state. Keep hot render loop outside React to avoid per-frame re-renders.
- (2025-12-18) **Coordinate system**: Use a viewport transform (pan/zoom) stored separately from element coordinates. Elements store absolute coordinates; rendering applies viewport transform.
- (2025-12-18) **Folder structure**: Follow feature-based organization per `docs/todo/2025-12-16-folder-structure-implementation/plan.md`:
  - Hooks → `apps/excalidraw/hooks/canvas/` (feature-based hooks directory)
  - Components → `apps/excalidraw/app/components/canvas/` (React components only)
  - Services/Utils → `apps/excalidraw/lib/canvas/` (business logic, renderer, utilities)
  - Types → `apps/excalidraw/lib/canvas/types.ts` (canvas-specific types)

## Surprises & Discoveries

(To be filled during implementation)

## Outcomes & Retrospective

**Completed**: 2025-12-18

**Summary**:
Successfully implemented the Canvas Drawing Engine with all acceptance criteria met:
- Full-screen canvas component with responsive resize
- Mouse and touch event handling with coordinate transformation
- Shape rendering (rectangle, circle, line, arrow) at 60fps using requestAnimationFrame
- RxDB integration for persistence with optimistic updates
- Toolbar for tool selection

**Files Created**:
- `lib/canvas/types.ts` - Viewport, DrawingState interfaces
- `lib/canvas/utils.ts` - Coordinate transforms, helpers
- `lib/canvas/renderer.ts` - Shape drawing functions
- `lib/canvas/index.ts` - Exports
- `hooks/canvas/use-canvas-size.ts` - Window resize handling
- `hooks/canvas/use-viewport.ts` - Pan/zoom state
- `hooks/canvas/use-canvas-events.ts` - Mouse/touch handlers
- `hooks/canvas/use-draw-loop.ts` - RAF render loop
- `hooks/canvas/index.ts` - Exports
- `app/components/canvas/Canvas.tsx` - Main canvas component
- `app/components/canvas/index.ts` - Exports

**Lessons Learned**:
- Feature-based folder organization (hooks/, lib/, components/) provides clear separation
- TypeScript path aliases (#lib/, #hooks/) need explicit configuration in tsconfig
- RxDB observables return the `.$` observable directly from `createLiveBoardQuery`

## Context

**Current State**: The project has RxDB configured with Board and Element schemas. The home page (`apps/excalidraw/app/routes/home/page.tsx`) currently shows a Welcome component.

**Existing Structure**:
- `apps/excalidraw/hooks/` - Feature-based hooks directory (exists, empty)
- `apps/excalidraw/app/components/` - React components
- `apps/excalidraw/lib/` - Library code (database, services)
- `apps/excalidraw/app/routes/home/page.tsx` - Home page entry point

**Key Files**:
- `apps/excalidraw/lib/database/shared/types.ts` - Element and Board types
- `apps/excalidraw/lib/database/shared/schema.ts` - RxDB schemas

**Element Types** (from types.ts):
- `rectangle`, `circle`, `line`, `arrow`, `text`, `pen`
- Each element has: id, type, x, y, width?, height?, points?, strokeColor, fillColor, strokeWidth, opacity, zIndex

**Term Definitions**:
- **Viewport**: The visible area of the canvas, defined by pan (x,y offset) and zoom level
- **Canvas coordinates**: Absolute position in the drawing space
- **Screen coordinates**: Position relative to browser window
- **Hot loop**: The render loop that runs every frame, kept outside React for performance

## Plan of Work

The implementation follows four milestones, each independently verifiable. Files are organized by type following the feature-based structure.

### File Structure Overview

    apps/excalidraw/
    ├── hooks/
    │   └── canvas/                    # Canvas feature hooks
    │       ├── index.ts               # Public exports
    │       ├── use-canvas-size.ts     # Window resize handling
    │       ├── use-canvas-events.ts   # Mouse/touch event handling
    │       ├── use-viewport.ts        # Pan/zoom state management
    │       └── use-draw-loop.ts       # RAF render loop
    │
    ├── lib/
    │   └── canvas/                    # Canvas business logic & utilities
    │       ├── index.ts               # Public exports
    │       ├── types.ts               # Canvas-specific types (Viewport, DrawingState)
    │       ├── renderer.ts            # Shape drawing functions
    │       └── utils.ts               # Coordinate transforms, helpers
    │
    └── app/
        ├── components/
        │   └── canvas/                # Canvas React components
        │       ├── index.ts           # Public exports
        │       └── Canvas.tsx         # Main canvas component
        │
        └── routes/
            └── home/
                └── page.tsx           # Home page (integrates Canvas)

### Milestone 1: Canvas Infrastructure

Create the base Canvas component with proper sizing and context setup.

**Files to create**:

1. `apps/excalidraw/lib/canvas/types.ts` - Canvas-specific types:

        export interface Viewport {
          offsetX: number;
          offsetY: number;
          zoom: number;
        }

        export interface DrawingState {
          isDrawing: boolean;
          currentTool: ElementType;
          startPoint: Point | null;
          previewElement: Element | null;
        }

        export interface CanvasContext {
          canvas: HTMLCanvasElement;
          ctx: CanvasRenderingContext2D;
          viewport: Viewport;
        }

2. `apps/excalidraw/lib/canvas/index.ts` - Export barrel

3. `apps/excalidraw/hooks/canvas/use-canvas-size.ts` - Resize hook:

        export function useCanvasSize() {
          const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
          
          useEffect(() => {
            const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
          }, []);
          
          return size;
        }

4. `apps/excalidraw/hooks/canvas/index.ts` - Export barrel

5. `apps/excalidraw/app/components/canvas/Canvas.tsx` - Main component:

        import { useCanvasSize } from '#/hooks/canvas';
        import type { Element } from '#/lib/database/shared/types';

        interface CanvasProps {
          elements: Element[];
          onElementCreate?: (element: Element) => void;
        }

        export function Canvas({ elements, onElementCreate }: CanvasProps) {
          const canvasRef = useRef<HTMLCanvasElement>(null);
          const { width, height } = useCanvasSize();
          
          return <canvas ref={canvasRef} width={width} height={height} />;
        }

6. `apps/excalidraw/app/components/canvas/index.ts` - Export barrel

**Validation**: Canvas renders full-screen, resizes with window.

### Milestone 2: Event Handling System

Add mouse and touch event handlers with coordinate transformation.

**Files to create**:

1. `apps/excalidraw/lib/canvas/utils.ts` - Coordinate transforms:

        import type { Point } from '#/lib/database/shared/types';
        import type { Viewport } from './types';

        export function screenToCanvas(screenX: number, screenY: number, viewport: Viewport): Point {
          return {
            x: (screenX - viewport.offsetX) / viewport.zoom,
            y: (screenY - viewport.offsetY) / viewport.zoom,
          };
        }

        export function canvasToScreen(canvasX: number, canvasY: number, viewport: Viewport): Point {
          return {
            x: canvasX * viewport.zoom + viewport.offsetX,
            y: canvasY * viewport.zoom + viewport.offsetY,
          };
        }

2. `apps/excalidraw/hooks/canvas/use-viewport.ts` - Viewport state:

        import type { Viewport } from '#/lib/canvas';

        export function useViewport(initialViewport?: Partial<Viewport>) {
          const [viewport, setViewport] = useState<Viewport>({
            offsetX: 0,
            offsetY: 0,
            zoom: 1,
            ...initialViewport,
          });
          
          const pan = (dx: number, dy: number) => { /* ... */ };
          const zoom = (factor: number, centerX: number, centerY: number) => { /* ... */ };
          const reset = () => { /* ... */ };
          
          return { viewport, pan, zoom, reset, setViewport };
        }

3. `apps/excalidraw/hooks/canvas/use-canvas-events.ts` - Event handling:

        import type { DrawingState } from '#/lib/canvas';
        import { screenToCanvas } from '#/lib/canvas';

        export function useCanvasEvents(
          canvasRef: RefObject<HTMLCanvasElement>,
          viewport: Viewport,
          onDrawStart: (point: Point) => void,
          onDrawMove: (point: Point) => void,
          onDrawEnd: (point: Point) => void,
        ) {
          useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            
            const handleMouseDown = (e: MouseEvent) => { /* ... */ };
            const handleMouseMove = (e: MouseEvent) => { /* ... */ };
            const handleMouseUp = (e: MouseEvent) => { /* ... */ };
            
            // Touch handlers for mobile
            const handleTouchStart = (e: TouchEvent) => { /* ... */ };
            const handleTouchMove = (e: TouchEvent) => { /* ... */ };
            const handleTouchEnd = (e: TouchEvent) => { /* ... */ };
            
            // Add event listeners...
            return () => { /* Remove event listeners */ };
          }, [canvasRef, viewport]);
        }

**Validation**: Console.log coordinates on interaction. Verify correct canvas coordinates.

### Milestone 3: Drawing Operations

Implement render loop and shape drawing functions.

**Files to create**:

1. `apps/excalidraw/lib/canvas/renderer.ts` - Drawing functions:

        import type { Element } from '#/lib/database/shared/types';
        import type { Viewport } from './types';

        export function drawRectangle(ctx: CanvasRenderingContext2D, element: Element): void {
          ctx.strokeStyle = element.strokeColor;
          ctx.fillStyle = element.fillColor;
          ctx.lineWidth = element.strokeWidth;
          ctx.globalAlpha = element.opacity;
          ctx.strokeRect(element.x, element.y, element.width ?? 0, element.height ?? 0);
          ctx.fillRect(element.x, element.y, element.width ?? 0, element.height ?? 0);
        }

        export function drawCircle(ctx: CanvasRenderingContext2D, element: Element): void { /* ... */ }
        export function drawLine(ctx: CanvasRenderingContext2D, element: Element): void { /* ... */ }

        export function renderElement(ctx: CanvasRenderingContext2D, element: Element): void {
          switch (element.type) {
            case 'rectangle': drawRectangle(ctx, element); break;
            case 'circle': drawCircle(ctx, element); break;
            case 'line': drawLine(ctx, element); break;
            // ... other types
          }
        }

        export function renderElements(
          ctx: CanvasRenderingContext2D,
          elements: Element[],
          viewport: Viewport,
        ): void {
          ctx.save();
          ctx.translate(viewport.offsetX, viewport.offsetY);
          ctx.scale(viewport.zoom, viewport.zoom);
          
          const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
          for (const element of sorted) {
            renderElement(ctx, element);
          }
          
          ctx.restore();
        }

2. `apps/excalidraw/hooks/canvas/use-draw-loop.ts` - RAF render loop:

        import { renderElements } from '#/lib/canvas';

        export function useDrawLoop(
          canvasRef: RefObject<HTMLCanvasElement>,
          elements: Element[],
          viewport: Viewport,
          previewElement: Element | null,
        ) {
          const frameRef = useRef<number>();
          
          useEffect(() => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;
            
            const render = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              renderElements(ctx, elements, viewport);
              if (previewElement) {
                renderElement(ctx, previewElement);
              }
              frameRef.current = requestAnimationFrame(render);
            };
            
            frameRef.current = requestAnimationFrame(render);
            return () => {
              if (frameRef.current) cancelAnimationFrame(frameRef.current);
            };
          }, [canvasRef, elements, viewport, previewElement]);
        }

**Validation**: Draw shapes on canvas. DevTools Performance tab shows ~60fps.

### Milestone 4: Integration with RxDB

Connect canvas to database for persistence.

**Files to modify**:

1. `apps/excalidraw/app/routes/home/page.tsx` - Integrate Canvas:

        import { Canvas } from '#/app/components/canvas';
        import type { Element } from '#/lib/database/shared/types';

        export default function Page() {
          const [elements, setElements] = useState<Element[]>([]);
          
          // Subscribe to RxDB board.elements
          useEffect(() => {
            // Initialize database
            // Subscribe to board changes
            // Update elements state
          }, []);
          
          const handleElementCreate = async (element: Element) => {
            // Add element to RxDB board.elements
          };
          
          return <Canvas elements={elements} onElementCreate={handleElementCreate} />;
        }

**Validation**: Draw shape, refresh page, shape persists.

## Steps

### Milestone 1 Commands

    # Working directory: /Users/mac/WebApps/projects/excalidraw-clone

    # Create directory structure
    mkdir -p apps/excalidraw/hooks/canvas
    mkdir -p apps/excalidraw/lib/canvas
    mkdir -p apps/excalidraw/app/components/canvas

    # Start dev server to test
    cd apps/excalidraw && pnpm dev

    # Expected: Browser opens, canvas fills viewport
    # Expected: Resize window, canvas resizes accordingly

### Milestone 2 Commands

    # Test event handling
    cd apps/excalidraw && pnpm dev

    # Expected: Open browser console
    # Expected: Click on canvas, see coordinate output
    # Expected: Drag on canvas, see continuous coordinate updates

### Milestone 3 Commands

    # Test drawing performance
    cd apps/excalidraw && pnpm dev

    # Expected: Click and drag to draw rectangle
    # Expected: Shape appears on canvas
    # Expected: DevTools Performance shows ~60fps

### Milestone 4 Commands

    # Test persistence
    cd apps/excalidraw && pnpm dev

    # Expected: Draw shapes
    # Expected: Refresh page
    # Expected: Shapes still visible
    # Expected: DevTools > Application > IndexedDB shows board with elements

## Validation

**Acceptance Test Checklist**:

1. **Canvas renders**: Open http://localhost:5173, canvas fills viewport
2. **Resize works**: Resize browser window, canvas adjusts immediately
3. **Mouse events**: Click and drag draws preview shape
4. **Touch events**: On touch device/emulator, touch-drag draws shape
5. **60fps performance**: DevTools Performance tab shows no frame drops during drawing
6. **Shape rendering**: Rectangle, circle, line all render correctly
7. **Coordinate system**: Shapes appear at correct mouse position
8. **Persistence**: Shapes survive page refresh

**Type checking**:

    cd apps/excalidraw && pnpm typecheck
    # Expected: No type errors

**Run tests** (after adding test file):

    cd apps/excalidraw && pnpm test
    # Expected: All tests pass

## Artifacts

(Terminal output, screenshots, and evidence will be added during implementation)
