# Implement Feature-Based Folder Structure for Whiteboard Application

Reference: `.agents/PLAN.md` | Tasks: `docs/todo/2025-12-16-folder-structure-implementation/todos.md`

## Purpose

Establish a scalable, maintainable folder structure that organizes code by feature rather than by file type. This enables better code colocation, easier navigation, and clearer separation of concerns for the collaborative whiteboard application. Developers will be able to find all code related to a specific feature (e.g., whiteboard drawing, authentication, dashboard) in a single directory, making the codebase easier to understand, maintain, and scale as the application grows.

### User Story

As a frontend developer working on the collaborative whiteboard, I want code to be organized by feature so that I can quickly locate all related files (components, hooks, services, types, constants) for a specific feature without searching across multiple top-level directories, making development faster and reducing context switching.

### Acceptance Criteria

- [ ] Feature-based folder structure implemented in `/Users/mac/WebApps/projects/excalidraw-clone/apps/frontend/`
- [ ] All existing whiteboard functionality reorganized into feature folders
- [ ] Each feature folder contains: components/, hooks/, services/, types/, utils/, constants/
- [ ] Shared code moved to `/shared/` directory
- [ ] Import paths updated to use relative imports within features
- [ ] All components from packages/shared-ui properly integrated
- [ ] Build process continues to work without errors
- [ ] TypeScript compilation succeeds
- [ ] No circular dependencies between features
- [ ] Documentation created explaining the new structure

## Progress

- [ ] Decision Log updated with final folder structure approach
- [ ] Feature folders created (whiteboard, auth, dashboard, shared)
- [ ] Existing code analyzed and mapped to features
- [ ] Files reorganized into feature-based structure
- [ ] Import paths updated throughout codebase
- [ ] TypeScript configuration verified
- [ ] Build and type checking pass
- [ ] Documentation created
- [ ] Validation completed

## Decision Log

### Decision 1: Optimal Folder Structure for Whiteboard Application
**Chosen**: Feature-Based Structure

**Rationale**:
After analyzing 5 different approaches, **Feature-Based is the best choice** for a collaborative whiteboard application because:

1. **Complex Feature Requirements**: Whiteboard drawing requires tight integration of canvas components, drawing hooks, element state management, and collaboration services - all of which must work together seamlessly. Feature-based structure keeps these related files together.

2. **Scalability for Collaboration**: Real-time collaboration features (WebSocket, presence, operational transformation) are complex cross-cutting concerns that need to be easily accessible within the whiteboard feature.

3. **Clear Ownership**: Feature teams can own entire folders (e.g., whiteboard team owns all drawing-related code), making parallel development easier.

4. **Self-Contained Features**: Each feature (whiteboard, auth, dashboard) can be developed, tested, and deployed independently.

**Performance & Maintenance**: Reduces cognitive load when working on complex whiteboard features, as developers don't need to jump between /components, /hooks, /services directories.

### Alternative 1: Page-Based (Route-Based)
**Structure**: `/pages/whiteboard/`, `/pages/dashboard/` with parallel `/components/`, `/hooks/`, `/services/` folders

**Pros**:
- ✓ Matches URL routing structure
- ✓ Familiar pattern in web development
- ✓ Easy to understand page-level organization
- ✓ Good for simple CRUD applications

**Cons**:
- ✗ Scatters related code (drawing tools, canvas logic, element state) across multiple directories
- ✗ Hard to find all code related to a feature
- ✗ Difficult to extract features
- ✗ Creates import path hell with deeply nested relative paths
- ✗ Adding new feature requires touching multiple top-level folders

**Best For**: Content-heavy sites, blogs, documentation, simple CRUD apps

### Alternative 2: Domain-Based (Bounded Contexts)
**Structure**: `/domains/whiteboard/`, `/domains/auth/`, `/domains/dashboard/` (similar to feature-based but broader)

**Pros**:
- ✓ Clear domain boundaries
- ✓ Good for microservices thinking
- ✓ Each domain is independently testable
- ✓ Scales well for large teams

**Cons**:
- ✗ More abstract than feature-based, less obvious for new developers
- ✗ May create too-coarse-grained boundaries
- ✗ Harder to know what belongs where

**Best For**: Enterprise applications, microservices architecture, complex business domains

### Alternative 3: Layered Architecture (Hexagonal/Onion)
**Structure**: `/ui/`, `/business-logic/`, `/data/`, `/infrastructure/`

**Pros**:
- ✓ Clear separation of concerns
- ✓ Easy to swap implementations (e.g., change database)
- ✓ Follows clean architecture principles
- ✓ Good for complex business logic

**Cons**:
- ✗ Scatters feature code across layers
- ✗ Hard to work on a single feature
- ✗ Can lead to anemic domain models
- ✗ Overkill for feature-rich UI apps like whiteboards

**Best For**: Business-critical applications, complex rule engines, enterprise software

### Alternative 4: Atomic Design Pattern
**Structure**: `/atoms/`, `/molecules/`, `/organisms/`, `/templates/`, `/pages/`

**Pros**:
- ✓ Excellent for design systems
- ✓ Clear component hierarchy
- ✓ Reusable components
- ✓ Good for UI component libraries

**Cons**:
- ✗ Doesn't address services, hooks, or business logic
- ✗ Forces unnatural categorization
- ✗ Not suitable for feature-rich applications
- ✗ Whiteboard features don't fit atom/molecule hierarchy

**Best For**: Design systems, component libraries, marketing sites

### Alternative 5: Hybrid: Feature + Atomic (RECOMMENDED)
**Structure**: `/features/whiteboard/components/{atoms,molecules,organisms}/`

**Pros**:
- ✓ Combines benefits of both approaches
- ✓ Feature code colocation
- ✓ Design system clarity within features
- ✓ Easy to extract components to shared library

**Cons**:
- ✗ More complex structure
- ✗ More directories to manage
- ✗ Can be overkill for small features

**Best For**: Applications with rich UI and complex features (like this whiteboard app)

**Why Not Chosen**: While this is a good pattern, it's more complex than needed for this project. The shared-ui package already handles component organization, so feature-based is simpler and sufficient.

### Decision 2: Feature Folder Structure
**Chosen**: Atomic structure within each feature

**Structure**:
```
apps/frontend/src/
├── features/
│   ├── whiteboard/
│   │   ├── components/     # Feature-specific React components ONLY
│   │   │   └── Canvas.tsx  # Local components (if any)
│   │   ├── hooks/          # Feature-specific hooks (business logic)
│   │   ├── services/       # API calls, state management
│   │   ├── types/          # Feature-specific TypeScript types
│   │   ├── utils/          # Feature-specific utilities
│   │   ├── constants/      # Feature-specific constants
│   │   └── index.ts        # Public API exports
│   │
│   ├── auth/
│   └── dashboard/
│
└── shared/                 # App-specific shared utilities ONLY
    ├── config/             # App configuration
    ├── utils/              # App-specific utilities
    ├── types/              # App-specific shared types
    └── constants/          # App-specific constants
```

**Rationale**:
- Mirrors the atomic design pattern
- Clear separation of concerns within feature
- Easy to identify what belongs to the feature
- Supports tree-shaking through index.ts exports
- **Leverages packages/shared-ui** instead of duplicating UI components

### Decision 3: Shared Code Organization - Leverage Existing Packages
**Chosen**: Use packages/shared-ui for all UI shared code

**Shared Code Sources**:

1. **packages/shared-ui/** - UI Components, hooks, styles (already exists with 40+ components)
   - Import path: `@repo/shared-ui/components`, `@repo/shared-ui/hooks`, `@repo/shared-ui/styles`
   - Contains: Button, CanvasToolbar, ColorPicker, LayerPanel, use-mobile, cn utility, etc.

2. **apps/frontend/src/shared/** - App-specific utilities ONLY
   - App configuration
   - App-specific utilities (not available in shared-ui)
   - App-specific shared types
   - App-specific constants

**Example Usage**:
```typescript
// In features/whiteboard/components/Canvas.tsx
import { Button } from "@repo/shared-ui/components";  // From packages/shared-ui
import { CanvasToolbar } from "@repo/shared-ui/components"; // From packages/shared-ui
import { useCanvas } from "@repo/shared-ui/hooks";     // From packages/shared-ui
import { cn } from "@repo/shared-ui/utils";            // From packages/shared-ui
import { useWhiteboardStore } from "../../services";   // Feature-specific
import type { AppConfig } from "../../../shared/types"; // App-specific
```

**What Goes Where**:
- **packages/shared-ui**: UI components, UI hooks, styles, design system
- **features/*/components**: Feature-specific React components (rare, only for complex feature-specific components)
- **features/*/services**: Feature-specific business logic, state management
- **features/*/hooks**: Feature-specific hooks (business logic, not UI state)
- **apps/frontend/src/shared/**: App configuration, cross-feature utilities specific to this app

**Rationale**:
- **No Duplication**: Leverage existing shared-ui package with 40+ components
- **Single Source of Truth**: UI components live in one place
- **Easier Updates**: Update shared components in one package
- **Better Reusability**: Share components across apps if needed
- **Clearer Boundaries**: packages/shared-ui for UI, apps/frontend/src/shared/ for app utilities only
- **Monorepo Best Practice**: Shared packages at repo root, app-specific in apps/
- **Avoids Monorepo Smell**: Don't recreate what's already well-organized in packages/

## Surprises & Discoveries

[To be updated during implementation]

## Outcomes & Retrospective

[To be completed after implementation]

## Context

The current project structure at `/Users/mac/WebApps/projects/excalidraw-clone/` uses a traditional page-based organization. The repository contains:

- `packages/shared-ui/`: 40+ shadcn/ui components with hooks and styles (already well-organized)
  - Components: Button, CanvasToolbar, ColorPicker, LayerPanel, etc.
  - Hooks: use-mobile, and custom hooks
  - Styles: TailwindCSS v4 with OKLCH, design system
  - Build system: Vite-based with TypeScript declarations
- `apps/frontend/`: React application (needs reorganization)
  - Currently has minimal code, needs feature-based structure
- Existing services: RxDB integration (planned), drawing engine (planned)

**Key Decision**: Leverage packages/shared-ui for ALL UI code instead of duplicating in apps/frontend

The whiteboard application will have these major features:
1. **Whiteboard**: Canvas drawing, tools, elements, real-time collaboration
2. **Authentication**: Login, registration, user management
3. **Dashboard**: Board management, templates, search
4. **Shared**: App-specific utilities (NOT UI components - those are in packages/shared-ui)

Current structure issues:
- No clear feature organization in apps/frontend
- Need to establish feature-based structure
- Import paths should use @repo/shared-ui for all UI components
- apps/frontend/src/shared/ should only contain app-specific utilities, not UI components

## Plan of Work

The implementation will proceed in the following sequence:

1. **Analyze Current Structure**: Inventory existing code and map to features
2. **Create Feature Directories**: Set up the new folder structure
3. **Reorganize Code**: Move files to appropriate feature folders
4. **Update Imports**: Fix all import statements to use new paths
5. **Verify Build**: Ensure TypeScript compilation and Vite build work
6. **Create Documentation**: Explain the structure and migration guide

Each step will be validated before proceeding to ensure no functionality is broken.

## Steps

### Step 1: Analyze Current Code Structure
**Working Directory**: `/Users/mac/WebApps/projects/excalidraw-clone/apps/frontend/`

Create an inventory of existing files and map them to features:

```bash
# Inventory current structure in apps/frontend
ls -la apps/frontend/src/

# Check packages/shared-ui for available components
ls -la packages/shared-ui/src/components/

# Create feature mapping document
cat > FEATURE_MAPPING.md << 'EOF'
# Feature Mapping - Updated with packages/shared-ui

## Whiteboard Feature
- Canvas component (local to feature)
- Drawing tools logic (hooks/services)
- Element management (services)
- CanvasToolbar, ColorPicker, LayerPanel → packages/shared-ui
- Import from: @repo/shared-ui/components

## Auth Feature
- Login component (local)
- Registration component (local)
- Auth hooks (business logic)
- UI components → packages/shared-ui (@repo/shared-ui/components)

## Dashboard Feature
- Board list component (local)
- Board creation component (local)
- Template gallery (local)
- UI components → packages/shared-ui

## Shared
- App configuration → apps/frontend/src/shared/config
- App-specific utilities → apps/frontend/src/shared/utils
- Cross-feature types → apps/frontend/src/shared/types
- App constants → apps/frontend/src/shared/constants
- UI Components/Hooks/Styles → packages/shared-ui (DO NOT duplicate)

## Key Principle
- packages/shared-ui: ALL UI code (components, hooks, styles)
- apps/frontend/src/features/*: Feature-specific business logic
- apps/frontend/src/shared/: App-specific utilities ONLY
EOF
```

**Expected Output**: Clear mapping using existing packages/shared-ui for UI

### Step 2: Create Feature Directory Structure
**Working Directory**: `/Users/mac/WebApps/projects/excalidraw-clone/apps/frontend/src/`

Create the new directory structure (WITHOUT duplicating packages/shared-ui):

```bash
# Create feature directories
mkdir -p features/whiteboard/{components,hooks,services,types,utils,constants}
mkdir -p features/auth/{components,hooks,services,types,utils,constants}
mkdir -p features/dashboard/{components,hooks,services,types,utils,constants}

# Create app-specific shared directory (NO components/hooks/styles - those are in packages/shared-ui)
mkdir -p shared/{config,utils,types,constants}

# Create index.ts files for public APIs
touch features/whiteboard/index.ts
touch features/auth/index.ts
touch features/dashboard/index.ts
touch shared/index.ts

# Verify structure
tree -L 3 features/ shared/

# Confirm NO duplication with packages/shared-ui
echo "UI Components should ONLY be in packages/shared-ui, NOT in apps/frontend/src/shared/"
ls -la packages/shared-ui/src/components/ | head -10
```

**Expected Output**: 
- Directory structure created successfully
- No duplicate component directories in apps/frontend/src/shared/
- packages/shared-ui confirmed as single source for UI

### Step 3: Create Feature-Specific Components
**Working Directory**: `/Users/mac/WebApps/projects/excalidraw-clone/apps/frontend/src/`

Create placeholder for whiteboard feature (CanvasToolbar, ColorPicker, LayerPanel are in packages/shared-ui):

```bash
# Create feature-specific component directory
mkdir -p features/whiteboard/components

# Create a whiteboard-specific component (example)
cat > features/whiteboard/components/WhiteboardCanvas.tsx << 'EOF'
/**
 * Feature-specific whiteboard canvas component
 * Uses UI components from packages/shared-ui
 */
import { CanvasToolbar, ColorPicker, LayerPanel } from "@repo/shared-ui/components";
import { useWhiteboardStore } from "../../services";
import { useCanvas } from "@repo/shared-ui/hooks";
import type { CanvasElement } from "../../types";

export function WhiteboardCanvas() {
  const { elements, selectedTool, strokeColor, strokeWidth } = useWhiteboardStore();
  const { canvasRef } = useCanvas();

  return (
    <div className="flex h-screen">
      {/* UI Components from packages/shared-ui */}
      <CanvasToolbar />
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      <LayerPanel />
    </div>
  );
}
EOF

# Verify CanvasToolbar, ColorPicker, LayerPanel exist in packages/shared-ui
ls -la packages/shared-ui/src/components/ | grep -E "canvas-toolbar|color-picker|layer-panel"

echo "✅ CanvasToolbar, ColorPicker, LayerPanel are in packages/shared-ui"
echo "✅ WhiteboardCanvas in features/whiteboard/components uses @repo/shared-ui/components"
```

**Expected Output**: 
- Feature-specific component created using UI from packages/shared-ui
- CanvasToolbar, ColorPicker, LayerPanel confirmed in packages/shared-ui
- NO duplication of these components in features/whiteboard/components/

### Step 4: Update Import Paths
**Working Directory**: `/Users/mac/WebApps/projects/excalidraw-clone/apps/frontend/src/features/whiteboard/components/`

Update imports in WhiteboardCanvas (example):

```bash
# Show correct import pattern
cat > features/whiteboard/components/WhiteboardCanvas.tsx << 'EOF'
/**
 * Import Pattern for Feature-Based Structure
 * 
 * UI Components from packages/shared-ui (NOT local)
 * Business logic from feature services/hooks
 */

// ✅ UI Components from packages/shared-ui
import { 
  CanvasToolbar, 
  ColorPicker, 
  LayerPanel,
  Button,
  Separator 
} from "@repo/shared-ui/components";

// ✅ Hooks from packages/shared-ui
import { useCanvas } from "@repo/shared-ui/hooks";

// ✅ Utilities from packages/shared-ui
import { cn } from "@repo/shared-ui/utils";

// ✅ Feature-specific imports (relative)
import { useWhiteboardStore } from "../../services";
import type { CanvasElement } from "../../types";
import { WHITEBOARD_CONSTANTS } from "../../constants";

// ✅ App-specific utilities from shared
import { getConfig } from "../../../shared/config";
import type { AppConfig } from "../../../shared/types";

// ❌ DON'T import from local directories:
// import { Button } from "../button";  // Wrong!
// import { useState } from "react";     // Wrong! Use from packages/shared-ui
EOF

# Verify imports work
echo "✅ All UI components imported from @repo/shared-ui/components"
echo "✅ Feature logic imported relatively from feature directories"
echo "✅ App config imported from apps/frontend/src/shared/"
```

**Expected Output**: 
- All UI components imported from @repo/shared-ui/components
- Feature logic imported relatively from feature directories
- App utilities imported from apps/frontend/src/shared/

### Step 5: Create Feature Public APIs
**Working Directory**: `/Users/mac/WebApps/projects/excalidraw-clone/apps/frontend/src/features/whiteboard/`

Export feature public API:

```bash
cat > index.ts << 'EOF'
/**
 * Whiteboard Feature Public API
 * 
 * IMPORTANT: UI Components (CanvasToolbar, ColorPicker, LayerPanel) 
 * are exported from packages/shared-ui, NOT from here.
 * 
 * This index only exports feature-specific code.
 */

// Feature-specific React components (composed of UI from packages/shared-ui)
export { WhiteboardCanvas } from "./components/WhiteboardCanvas";

// Feature-specific hooks (business logic, NOT UI hooks)
export { useDrawingTool } from "./hooks/use-drawing-tool";
export { useElementSelection } from "./hooks/use-element-selection";
export { useCollaboration } from "./hooks/use-collaboration";

// Feature-specific services (business logic)
export { WhiteboardStore } from "./services/whiteboard-store";
export { DrawingService } from "./services/drawing-service";
export { CollaborationService } from "./services/collaboration-service";

// Feature-specific types
export type { DrawingTool, CanvasElement, Layer } from "./types";
export type { WhiteboardState } from "./types";

// Feature-specific utilities
export { calculateElementBounds } from "./utils/calculations";
export { serializeElement } from "./utils/serialization";

// ✅ UI Components are imported from:
// import { CanvasToolbar } from "@repo/shared-ui/components";
// NOT from this feature index
EOF

# Verify UI components are in packages/shared-ui
echo "✅ Feature exports: business logic, services, types"
echo "✅ UI Components: use @repo/shared-ui/components (from packages/shared-ui)"
echo "✅ Example: import { CanvasToolbar } from '@repo/shared-ui/components'"
```

**Expected Output**: 
- Clean public API for feature-specific code only
- UI components referenced but not exported (from packages/shared-ui)
- Clear separation: packages/shared-ui for UI, features/* for business logic

### Step 6: Update TypeScript Configuration
**Working Directory**: `/Users/mac/WebApps/projects/excalidraw-clone/apps/frontend/`

Verify tsconfig.json path mapping:

```bash
cat tsconfig.json | grep -A 10 '"paths"'
```

Ensure paths are configured to support the new structure:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"]
    }
  }
}
```

**Expected Output**: TypeScript can resolve new import paths

### Step 7: Verify Build
**Working Directory**: `/Users/mac/WebApps/projects/excalidraw-clone/apps/frontend/`

Run build and type check:

```bash
# Install dependencies
pnpm install

# Run TypeScript compiler
pnpm typecheck

# Run build
pnpm build
```

**Expected Output**:
- No TypeScript errors
- Build completes successfully
- All features export properly

### Step 8: Create Documentation
**Working Directory**: `/Users/mac/WebApps/projects/excalidraw-clone/apps/frontend/`

Create README explaining the structure:

```bash
cat > FOLDER_STRUCTURE.md << 'EOF'
# Folder Structure Guide - Feature-Based with Shared UI Package

## Overview

This project uses a **feature-based folder structure** combined with a **shared UI package** (`packages/shared-ui`) for all UI components, hooks, and styles.

## Directory Structure

```
/Users/mac/WebApps/projects/excalidraw-clone/
├── packages/
│   └── shared-ui/          # 🏗️ UI Components, Hooks, Styles (40+ components)
│       ├── components/     # Button, CanvasToolbar, ColorPicker, LayerPanel, etc.
│       ├── hooks/          # use-mobile, custom UI hooks
│       ├── styles/         # TailwindCSS v4, design system
│       └── utils/          # cn utility, etc.
│
└── apps/
    └── frontend/
        └── src/
            ├── features/           # Feature-specific business logic
            │   ├── whiteboard/
            │   │   ├── components/ # Feature-specific React components (composed of UI)
            │   │   ├── hooks/      # Feature-specific hooks (business logic)
            │   │   ├── services/   # State management, API calls
            │   │   ├── types/      # Feature-specific types
            │   │   ├── utils/      # Feature-specific utilities
            │   │   ├── constants/  # Feature-specific constants
            │   │   └── index.ts    # Public API exports
            │   │
            │   ├── auth/           # Authentication feature
            │   └── dashboard/      # Board management feature
            │
            └── shared/             # App-specific utilities ONLY
                ├── config/         # App configuration
                ├── types/          # App-wide types
                ├── utils/          # App-specific utilities
                └── constants/      # App constants

                # ❌ NO components/, hooks/, styles/ here
                # Those are in packages/shared-ui/
```

## Key Principles

### 1. **UI Components → packages/shared-ui**
All UI code lives in `packages/shared-ui/`:
- Components: Button, CanvasToolbar, ColorPicker, LayerPanel, etc.
- Hooks: use-mobile, UI state hooks
- Styles: TailwindCSS v4, design system
- Utilities: cn, etc.

### 2. **Feature Code → apps/frontend/src/features/**
Feature-specific business logic:
- State management (Zustand, Redux, etc.)
- API calls and services
- Feature-specific hooks (business logic)
- Feature-specific utilities
- Feature-specific types

### 3. **App Utilities → apps/frontend/src/shared/**
App-specific cross-cutting utilities:
- Configuration
- App-wide types
- App-specific utilities (not available in shared-ui)
- App constants

## Import Guidelines

### Import UI Components from packages/shared-ui
```typescript
// ✅ CORRECT: Import UI from packages/shared-ui
import { Button } from "@repo/shared-ui/components";
import { CanvasToolbar } from "@repo/shared-ui/components";
import { useCanvas } from "@repo/shared-ui/hooks";
import { cn } from "@repo/shared-ui/utils";
```

### Import Feature Code Relatively
```typescript
// ✅ CORRECT: Import feature logic relatively
import { useWhiteboardStore } from "../../services";
import { DrawingService } from "../../services/drawing-service";
import type { CanvasElement } from "../../types";
import { WHITEBOARD_TOOLS } from "../../constants";
```

### Import App Utilities from shared
```typescript
// ✅ CORRECT: Import app utilities from apps/frontend/src/shared/
import { getConfig } from "../../../shared/config";
import type { AppConfig } from "../../../shared/types";
```

### What NOT to Do
```typescript
// ❌ WRONG: Don't create duplicate UI components in features/
mkdir features/whiteboard/components/Button  // NO!

// ❌ WRONG: Don't import UI from feature directories
import { Button } from "../button"  // NO!

// ❌ WRONG: Don't duplicate hooks/styles in apps/frontend/src/shared/
mkdir apps/frontend/src/shared/components  // NO!
mkdir apps/frontend/src/shared/hooks       // NO!
```

## Example: Whiteboard Feature

### Component Using packages/shared-ui
```typescript
// features/whiteboard/components/WhiteboardCanvas.tsx
import { CanvasToolbar, ColorPicker, LayerPanel } from "@repo/shared-ui/components";
import { Button } from "@repo/shared-ui/components";
import { useCanvas } from "@repo/shared-ui/hooks";
import { cn } from "@repo/shared-ui/utils";

import { useWhiteboardStore } from "../../services";
import type { CanvasElement } from "../../types";

export function WhiteboardCanvas() {
  const { elements } = useWhiteboardStore();
  const { canvasRef } = useCanvas();

  return (
    <div className="flex h-screen">
      <CanvasToolbar />
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      <LayerPanel />
    </div>
  );
}
```

### Feature Exports (No UI Components)
```typescript
// features/whiteboard/index.ts
export { WhiteboardCanvas } from "./components/WhiteboardCanvas";
export { useDrawingTool } from "./hooks/use-drawing-tool";
export { WhiteboardStore } from "./services/whiteboard-store";
export type { CanvasElement } from "./types";

// ✅ UI Components are NOT exported from feature index
// Use: import { CanvasToolbar } from "@repo/shared-ui/components"
```

## Benefits

- **Single Source of Truth**: UI components in one package
- **No Duplication**: Don't recreate what's in packages/shared-ui
- **Easy Updates**: Update UI in one place
- **Better Reuse**: Share UI across apps if needed
- **Clear Separation**: UI vs. Business Logic vs. App Utilities
- **Feature Colocation**: Related code stays together
- **Team Scalability**: Feature teams own their folders

## Adding New Features

1. Create feature folder: `src/features/<feature-name>/`
2. Add subdirectories: components, hooks, services, types, utils, constants
3. Create `index.ts` with public exports
4. Use UI from `@repo/shared-ui/components`
5. Add to parent index if needed

## Adding New UI Components

**If it's a UI component (reusable across features):**
- Add to `packages/shared-ui/src/components/`
- Export from `packages/shared-ui/src/index.ts`
- Use from any feature via `@repo/shared-ui/components`

**If it's feature-specific:**
- Create in `features/<name>/components/`
- Compose UI from `@repo/shared-ui/components`

EOF

echo "✅ Documentation created with packages/shared-ui integration"
```

**Expected Output**: Comprehensive documentation explaining the structure
```

Across features:
```typescript
// Use absolute imports with @ alias
import { CanvasToolbar } from "@/features/whiteboard";
import { useAuth } from "@/features/auth";
```

### Adding a New Feature

1. Create feature folder: `src/features/<feature-name>/`
2. Add subdirectories: components, hooks, services, types, utils, constants
3. Create `index.ts` with public exports
4. Update parent `index.ts` if needed

### Adding to Shared

If code is used by multiple features, add to `src/shared/` instead of a specific feature.

EOF
```

**Expected Output**: Comprehensive documentation created

## Visual Comparison: Old vs New Structure

### ❌ OLD Structure (Before)
```
apps/frontend/src/
├── components/          # UI components scattered
│   ├── button/
│   ├── canvas-toolbar/  # Whiteboard UI here
│   ├── color-picker/    # Whiteboard UI here
│   └── layer-panel/     # Whiteboard UI here
├── hooks/               # Hooks scattered
├── services/            # Services scattered
└── shared/              # Mixed utilities
    ├── components/      # Duplicate UI?
    ├── hooks/
    └── utils/
```

### ✅ NEW Structure (After)
```
packages/shared-ui/           # 🏗️ SINGLE SOURCE FOR UI
├── components/               # Button, CanvasToolbar, ColorPicker, etc.
├── hooks/                    # use-mobile, UI hooks
├── styles/                   # TailwindCSS v4
└── utils/                    # cn, etc.

apps/frontend/src/
├── features/
│   ├── whiteboard/           # Feature business logic
│   │   ├── components/       # Feature-specific (composed of UI)
│   │   ├── hooks/            # Business logic hooks
│   │   ├── services/         # State management
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   ├── auth/
│   └── dashboard/
└── shared/                   # App utilities ONLY (NO UI)
    ├── config/
    ├── types/
    ├── utils/
    └── constants/
```

## Validation

After completing all steps, verify the implementation:

```bash
# Working Directory: /Users/mac/WebApps/projects/excalidraw-clone/

# 1. Verify packages/shared-ui exists and has components
test -d packages/shared-ui/src/components && echo "✓ packages/shared-ui exists"
ls packages/shared-ui/src/components/ | grep -q "canvas-toolbar" && echo "✓ CanvasToolbar in shared-ui"

# 2. Verify NO duplication in apps/frontend/src/shared/
test ! -d apps/frontend/src/shared/components && echo "✓ NO duplicate components in shared/"
test ! -d apps/frontend/src/shared/hooks && echo "✓ NO duplicate hooks in shared/"

# 3. Verify feature structure
test -d apps/frontend/src/features/whiteboard/components && echo "✓ Whiteboard feature exists"
test -f apps/frontend/src/features/whiteboard/index.ts && echo "✓ Feature index exists"

# 4. Run TypeScript check
cd apps/frontend && pnpm typecheck 2>&1 | grep -q "error TS" && echo "✗ Type errors" || echo "✓ No TypeScript errors"

# 5. Run build
pnpm build 2>&1 | grep -q "Build failed" && echo "✗ Build failed" || echo "✓ Build successful"

# 6. Verify import pattern in feature component
cat apps/frontend/src/features/whiteboard/components/WhiteboardCanvas.tsx | \
  grep -q "@repo/shared-ui/components" && echo "✓ Uses @repo/shared-ui/components"

# 7. Verify NO UI exports from feature index
cat apps/frontend/src/features/whiteboard/index.ts | \
  grep -q "CanvasToolbar" && echo "✗ Feature exports UI (wrong!)" || echo "✓ Feature exports business logic only"
```

**Expected Results**:
- ✓ packages/shared-ui exists
- ✓ CanvasToolbar in shared-ui
- ✓ NO duplicate components in shared/
- ✓ NO duplicate hooks in shared/
- ✓ Whiteboard feature exists
- ✓ Feature index exists
- ✓ No TypeScript errors
- ✓ Build successful
- ✓ Uses @repo/shared-ui/components
- ✓ Feature exports business logic only

**Critical Checks**:
1. **No Duplication**: packages/shared-ui is the ONLY place for UI components
2. **Correct Imports**: All UI from @repo/shared-ui/components
3. **Feature Separation**: Features contain business logic, not UI
4. **Clean Exports**: Features export logic, UI is imported from shared-ui

## Artifacts

After implementation, include:

1. **Directory Tree**: Output of `tree -L 4 src/features/ src/shared/`
2. **Build Output**: Success/failure of `pnpm build`
3. **Type Check**: Output of `pnpm typecheck`
4. **Example Import**: Code snippet showing new import patterns
5. **Documentation**: Screenshot or excerpt of FOLDER_STRUCTURE.md

These artifacts prove the structure was implemented correctly and works as expected.
