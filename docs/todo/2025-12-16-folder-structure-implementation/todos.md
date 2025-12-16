# Folder Structure Implementation Tasks

## folder-structure-decision-log
**Status**: completed

✅ **COMPLETED**: Analyzed 5 folder structure approaches and documented decision

**Decision Summary**:
- **Chosen**: Feature-Based Structure (best for whiteboard app)
- **Reasoning**: Complex whiteboard features require tight integration of canvas, drawing tools, state management, and collaboration services - all must be easily accessible together
- **Alternatives Analyzed**:
  1. **Page-Based** - Simple but scatters feature code
  2. **Domain-Based** - Good for enterprise but too abstract
  3. **Layered** - Overkill for UI-heavy app
  4. **Atomic Design** - Only for design systems
  5. **Hybrid Feature+Atomic** - Good but more complex than needed

**Full Analysis**: See `plan.md` - Decision Log section for detailed pros/cons of each approach.

---

## folder-structure-analyze-current-code
**Status**: pending

Inventory existing code and map to features (UPDATED for packages/shared-ui):

**Current Assets**:
- packages/shared-ui/: 40+ shadcn/ui components (CanvasToolbar, ColorPicker, LayerPanel, etc.)
- apps/frontend/src/: Minimal code, needs feature-based structure

**Feature Mapping**:
- Whiteboard feature → uses UI from @repo/shared-ui/components + feature business logic
- Auth feature → uses UI from @repo/shared-ui/components + auth services
- Dashboard feature → uses UI from @repo/shared-ui/components + dashboard services
- Shared → apps/frontend/src/shared/ for app utilities ONLY (NO UI components)

---

## folder-structure-create-directories
**Status**: pending

Create the feature-based directory structure (UPDATED - no duplication with packages/shared-ui):

```bash
# Create feature directories
mkdir -p features/whiteboard/{components,hooks,services,types,utils,constants}
mkdir -p features/auth/{components,hooks,services,types,utils,constants}
mkdir -p features/dashboard/{components,hooks,services,types,utils,constants}

# Create app-specific shared (NO components/hooks/styles - those are in packages/shared-ui)
mkdir -p shared/{config,utils,types,constants}

# Create index.ts files
touch features/whiteboard/index.ts
touch features/auth/index.ts
touch features/dashboard/index.ts
touch shared/index.ts
```

**Key**: NO components/, hooks/, or styles/ directories in apps/frontend/src/shared/

---

## folder-structure-reorganize-whiteboard-components
**Status**: pending

Create whiteboard feature structure (UPDATED - leverage packages/shared-ui):

**DO NOT MOVE** CanvasToolbar, ColorPicker, LayerPanel - they stay in packages/shared-ui!

**CREATE**:
- Whiteboard feature components (composed of UI from packages/shared-ui)
- Whiteboard feature hooks (business logic)
- Whiteboard feature services (state management)

**Example**:
```typescript
// features/whiteboard/components/WhiteboardCanvas.tsx
import { CanvasToolbar } from "@repo/shared-ui/components";  // From packages/shared-ui
import { useWhiteboardStore } from "../../services";         // Feature-specific
```

---

## folder-structure-update-import-paths
**Status**: pending

Update import patterns (UPDATED for packages/shared-ui):

**Correct Import Patterns**:
- UI Components: `import { Button } from "@repo/shared-ui/components"`
- Feature Logic: `import { useStore } from "../../services"`
- App Utilities: `import { getConfig } from "../../../shared/config"`

**Wrong Patterns**:
- ❌ `import { Button } from "../button"`
- ❌ Creating duplicate UI in features/

---

## folder-structure-create-feature-apis
**Status**: pending

Create feature exports (UPDATED - NO UI components in exports):

**Feature Index Files**:
```typescript
// features/whiteboard/index.ts
// ✅ Export: feature business logic
export { WhiteboardCanvas } from "./components/WhiteboardCanvas";
export { useDrawingTool } from "./hooks/use-drawing-tool";
export { WhiteboardStore } from "./services/whiteboard-store";
export type { CanvasElement } from "./types";

// ❌ DON'T export: UI components (use @repo/shared-ui/components)
```

---

## folder-structure-verify-typescript
**Status**: pending

Verify TypeScript configuration (SAME):

- Check tsconfig.json paths mapping
- Run pnpm typecheck
- Ensure @repo/shared-ui imports resolve correctly

---

## folder-structure-verify-build
**Status**: pending

Ensure build process works (SAME):

- Run pnpm build
- Verify no errors
- Confirm feature exports work
- Verify packages/shared-ui integration

---

## folder-structure-create-documentation
**Status**: pending

Create comprehensive documentation (UPDATED):

- FOLDER_STRUCTURE.md with packages/shared-ui integration
- Import guidelines for @repo/shared-ui/components
- Migration notes
- Best practices for feature-based structure
- What NOT to duplicate

**Key Documentation**:
- packages/shared-ui = UI components, hooks, styles
- apps/frontend/src/features/ = feature business logic
- apps/frontend/src/shared/ = app utilities ONLY

---

## folder-structure-validation
**Status**: pending

Final validation (UPDATED):

- Verify no duplication with packages/shared-ui
- Verify UI components used from @repo/shared-ui/components
- Verify feature structure follows pattern
- Run tests and build
- Document lessons learned
