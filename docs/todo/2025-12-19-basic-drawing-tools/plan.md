# Basic Drawing Tools Implementation - Execution Plan

Reference: `.agents/PLANS.md` | Tasks: `docs/todo/2025-12-19-basic-drawing-tools/todos.md`

## Purpose

This plan implements the core drawing tools that enable users to create and manipulate basic shapes on the canvas. Users will be able to draw with a pen tool for freehand drawing, create precise geometric shapes (rectangles, circles, lines), and add text elements. The tools will integrate with the existing Canvas component and RxDB database, providing a foundation for the collaborative whiteboard functionality.

### User Story

As a user of the collaborative whiteboard, I want to use basic drawing tools (pen, rectangle, circle, line, and text) so that I can create and annotate diagrams, sketches, and visual content on the canvas with precision and ease.

### Acceptance Criteria

- [ ] Pen tool creates smooth freehand curves with proper stroke smoothing
- [ ] Rectangle tool allows click-drag to create rectangles with proper proportions
- [ ] Circle tool creates circles using center-based click-drag interaction
- [ ] Line tool creates straight lines using two-click interaction (start point, end point)
- [ ] Text tool enables editable text placement with proper positioning and styling
- [ ] Toolbar provides clear tool switching with visual feedback for active tool
- [ ] All tools integrate seamlessly with the existing Canvas component
- [ ] Drawing operations are saved to RxDB database for persistence
- [ ] Tools maintain 60fps drawing performance during interactions
- [ ] Coordinate system properly maps between canvas coordinates and element positions

## Progress

- [x] (2025-12-19 10:00Z) Created initial execution plan and task breakdown
- [x] (2025-12-19 10:15Z) Analyzed existing structure: basic toolbar with text symbols, Canvas component with drawing hooks
- [x] (2025-12-19 10:20Z) Updated plan to include icon integration and component separation strategy
- [x] (2025-12-19 10:15Z) Research icon library options - Lucide React already available
- [x] (2025-12-19 10:30Z) Enhanced existing canvas-toolbar component with proper icons
- [x] (2025-12-19 10:45Z) Replaced inline toolbar with CanvasToolbar component
- [x] (2025-12-19 11:00Z) Implemented pen tool with smooth curve drawing and point collection
- [x] (2025-12-19 11:15Z) Enhanced rectangle, circle, and line tools with improved interaction
- [x] (2025-12-19 11:30Z) Implemented text tool with click-to-place functionality
- [x] (2025-12-19 11:45Z) Added stroke width, stroke color, and fill color controls
- [x] (2025-12-19 12:00Z) Integrated all tools with RxDB persistence and database storage
- [x] (2025-12-19 12:15Z) Added visual feedback and active tool indicators
- [x] (2025-12-19 12:30Z) Fixed TypeScript compilation and type compatibility
- [x] (2025-12-19 12:45Z) Built shared-ui package and verified dev server functionality

## Decision Log

- **Tool State Management**: Will use React state management with local component state for real-time drawing, with debounced saves to RxDB
- **Coordinate System**: Will maintain existing coordinate system from Canvas component, ensuring consistency across all tools
- **Drawing Performance**: Will implement drawing operations outside of React state updates for performance, using canvas context directly
- **Tool Architecture**: Each tool will be implemented as a separate module with consistent interface for integration
- **Icon Strategy**: Replace text symbols (□, ○, /, →) with proper icons from Lucide React or similar library for better UX
- **Component Separation**: Create dedicated tool components in `/apps/excalidraw/src/components/tools/` directory for maintainability
- **Toolbar Enhancement**: Enhance existing `canvas-toolbar` component in shared-ui instead of inline styling in home page
- **Tool Button Design**: Use shadcn/ui Button component with proper variants for active/inactive states and icon integration

## Surprises & Discoveries

[To be updated during implementation as discoveries occur]

## Outcomes & Retrospective

[To be completed at the end of implementation]

## Context

The project is an offline-first collaborative whiteboard built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Canvas**: HTML5 Canvas with custom drawing engine (Task 5 completed)
- **Database**: RxDB with IndexedDB for offline persistence (Task 4 completed)
- **UI Components**: shadcn/ui components in packages/shared-ui
- **State Management**: React hooks with RxDB observables

Current project structure:
- `apps/excalidraw/` - Main frontend application
- `packages/shared-ui/` - Shared UI components library
- `packages/shared/` - Shared types and utilities
- Canvas component exists at `apps/excalidraw/app/components/canvas/`
- Database integration exists with CRUD operations for boards and elements

**Current State Analysis**:
- **Existing Toolbar**: Basic toolbar in `apps/excalidraw/app/routes/home/page.tsx` with text symbols (□, ○, /, →)
- **Existing Canvas**: Fully functional Canvas component with drawing hooks and preview elements
- **UI Library**: 40+ shadcn/ui components including `canvas-toolbar`, `button`, `toggle`, `color-picker`
- **Tool Support**: Currently supports rectangle, circle, line, arrow (missing pen and text tools)

**Term Definitions**:
- **Canvas Component**: The main HTML5 Canvas element and drawing engine
- **Tool**: A drawing mode that determines how mouse/touch interactions create elements
- **Element**: A drawable object (shape, line, text) stored in the database
- **RxDB**: Reactive database that provides real-time queries and offline persistence
- **ToolButton**: Individual button component for selecting drawing tools
- **Canvas Toolbar**: Container component for organizing and displaying tool buttons

## Plan of Work

The implementation will proceed through six main phases, building incrementally from UI enhancement to complete tool integration with proper icons and component separation. Each tool will be implemented as a separate module following consistent patterns, ensuring maintainability and extensibility for future tools.

### Phase 1: UI Foundation and Component Architecture
Research icon library options (Lucide React, Heroicons) and enhance the existing `canvas-toolbar` component. Design dedicated tool component architecture with proper separation in `/apps/excalidraw/src/components/tools/`. Create base tool interface and component structure.

### Phase 2: Enhanced Toolbar Implementation
Replace the existing inline toolbar in home page with proper components using shadcn/ui library. Implement icon-based tool buttons with active/inactive states, tooltips, and accessibility features. Integrate with existing Canvas component.

### Phase 3: Pen Tool Implementation
Implement pen tool with smooth curve drawing functionality, including stroke point collection, smoothing algorithms, and proper integration with Canvas drawing hooks.

### Phase 4: Core Drawing Tools Enhancement
Enhance existing tools (rectangle, circle, line) and implement any missing functionality. Ensure all tools follow consistent patterns and integrate properly with the new toolbar architecture.

### Phase 5: Text Tool Implementation
Implement text tool with editable content functionality, including text positioning, font handling, inline editing capabilities, and proper database integration.

### Phase 6: Database Integration and Optimization
Integrate all tools with RxDB persistence, implement performance optimizations for smooth 60fps drawing, and add comprehensive testing and validation.

## Steps

[Detailed implementation steps will be added as each milestone progresses, following the principle of planning one milestone ahead while implementing the current one]

## Validation

The implementation will be validated through:
1. **Unit Testing**: Individual tool functions and utilities
2. **Integration Testing**: Tool interactions with Canvas component
3. **Database Testing**: Element persistence and retrieval
4. **Performance Testing**: Drawing performance benchmarks
5. **User Acceptance Testing**: Manual testing of all drawing tools
6. **Cross-browser Testing**: Compatibility verification

Validation commands and expected outputs will be documented as implementation progresses.

## Artifacts

[Terminal outputs, code diffs, and evidence will be captured here during implementation]
