# Whiteboard Design System Implementation Plan

Reference: `.agents/PLAN.md` | Tasks: `docs/todo/2025-12-16-whiteboard-design-system/todos.md`

## Purpose

Create a comprehensive design system for the collaborative whiteboard application that clones Excalidraw's functionality and UI patterns. The design system will establish consistent visual language, reusable components, and interaction patterns across all versions (V1-V4) of the whiteboard application. This ensures cohesive user experience, scalable development, and maintainable codebase.

### User Story

As a **frontend developer**, I want a **TailwindCSS v4 + shadcn/ui design system with comprehensive color palette** so that I can **efficiently build whiteboard features** while maintaining **visual consistency and accessibility standards** across all application versions.

### Acceptance Criteria

- [ ] Comprehensive TailwindCSS v4 color palette (Excalidraw-inspired)
- [ ] shadcn/ui component library customized for whiteboard (20+ components)
- [ ] Canvas element color system (shapes, tools, connectors, selection)
- [ ] Design tokens integrated with TailwindCSS v4 configuration
- [ ] Component library documented with shadcn patterns
- [ ] Interaction patterns specified (drawing, selection, editing)
- [ ] Accessibility standards implemented (WCAG 2.1 AA compliance)
- [ ] Responsive design patterns defined
- [ ] Excalidraw-inspired UI patterns analyzed and adapted
- [ ] TypeScript types for all design tokens and components
- [ ] Documentation website with component examples

## Progress

- [x] (2025-12-16 10:00Z) Initial plan created
- [ ] Design tokens research and definition
- [ ] Component architecture planning
- [ ] Canvas element design
- [ ] UI patterns documentation
- [ ] Accessibility guidelines
- [ ] Implementation specifications
- [ ] Documentation website

## Decision Log

**2025-12-16 10:00Z**: Initial planning phase
- Decision: Follow Excalidraw's design patterns as primary reference
- Rationale: Excalidraw is the industry-standard for collaborative whiteboards with proven UX patterns
- Impact: Faster development, familiar user experience, battle-tested interactions

**2025-12-16 10:00Z**: TailwindCSS v4 + shadcn/ui approach
- Decision: Use TailwindCSS v4 with built-in design tokens and shadcn/ui components
- Rationale: Faster development, consistent styling, battle-tested components, better performance
- Impact: All V1-V4 features can use the same component library with version-specific adaptations

**2025-12-16 10:00Z**: Color-first approach
- Decision: Prioritize color palette and design tokens before component building
- Rationale: Visual foundation drives all UI decisions, ensures consistency across components
- Impact: All components inherit from unified color system

**2025-12-16 10:00Z**: OKLCH color space adoption
- Decision: Continue using OKLCH color space from existing theme
- Rationale: Better perceptual uniformity, easier to adjust lightness/chroma, WCAG compliant
- Impact: All canvas colors will use OKLCH for consistent appearance across themes

**2025-12-16 10:00Z**: Canvas-optimized color palette
- Decision: Create 3 palette variants with different color strategies for canvas work
- Rationale: Different use cases (casual drawing, professional diagrams, accessibility)
- Impact: Users can choose based on their workflow and visual preferences

## Color Palette Recommendations

Based on the existing OKLCH theme system and Excalidraw's design principles, here are **3 optimized palette variants** for your whiteboard project:

### 🎨 Variant 1: "Classic Excalidraw" (Recommended)
**Best for: General use, familiar to Excalidraw users**

```css
:root {
  /* Canvas - Clean white background */
  --canvas-background: oklch(0.99 0 0);
  --canvas-grid: oklch(0.89 0.01 252.11);
  --canvas-selection: oklch(0.65 0.191 263.8 / 0.25);
  
  /* Stroke Colors - Vibrant and distinct */
  --stroke-primary: oklch(0.15 0.01 255.21);    /* Black */
  --stroke-secondary: oklch(0.55 0.20 27.84);   /* Red */
  --stroke-accent: oklch(0.55 0.15 194.68);     /* Blue */
  --stroke-success: oklch(0.55 0.16 143.8);     /* Green */
  --stroke-warning: oklch(0.55 0.18 83.8);      /* Yellow */
  --stroke-purple: oklch(0.55 0.17 303.8);      /* Purple */
  --stroke-pink: oklch(0.55 0.18 343.8);        /* Pink */
  --stroke-orange: oklch(0.55 0.19 44.94);      /* Orange */
  
  /* Fill Colors - Subtle and professional */
  --fill-transparent: transparent;
  --fill-white: oklch(1 0 0);
  --fill-light: oklch(0.96 0.01 252.11);
  --fill-highlight: oklch(0.88 0.06 85.59);
  
  /* Dark mode adjustments */
  &:where([data-theme="dark"], [data-theme="dark"] *) {
    --canvas-background: oklch(0.12 0.005 252.11);
    --canvas-grid: oklch(0.25 0.008 252.11);
    --canvas-selection: oklch(0.65 0.191 263.8 / 0.4);
    
    --stroke-primary: oklch(0.98 0.002 252.11);
    --stroke-muted: oklch(0.75 0.01 252.11);
  }
}
```

**Pros:**
- Familiar to Excalidraw users
- High contrast for accessibility
- Vibrant colors that pop on canvas
- Works well for both light and dark modes

**Cons:**
- May feel too bright for long sessions

---

### 🏢 Variant 2: "Modern Professional"
**Best for: Business diagrams, presentations, extended use**

```css
:root {
  /* Canvas - Slightly warm off-white */
  --canvas-background: oklch(0.98 0.01 95);  /* Warm white */
  --canvas-grid: oklch(0.86 0.015 252.11);
  --canvas-selection: oklch(0.58 0.15 263.8 / 0.2);
  
  /* Stroke Colors - Muted and sophisticated */
  --stroke-primary: oklch(0.18 0.005 255.21);    /* Deep gray */
  --stroke-secondary: oklch(0.52 0.12 15.84);    /* Muted red */
  --stroke-accent: oklch(0.52 0.10 194.68);      /* Muted blue */
  --stroke-success: oklch(0.52 0.11 143.8);      /* Muted green */
  --stroke-warning: oklch(0.60 0.08 80);         /* Muted yellow */
  --stroke-purple: oklch(0.52 0.11 293.8);       /* Muted purple */
  --stroke-pink: oklch(0.52 0.12 330.84);        /* Muted pink */
  --stroke-orange: okut 0.52 0.13 35.94);        /* Muted orange */
  
  /* Fill Colors - Very subtle */
  --fill-transparent: transparent;
  --fill-white: oklch(0.99 0.005 252.11);
  --fill-light: oklch(0.94 0.008 252.11);
  --fill-highlight: oklch(0.85 0.04 85.59);
  
  /* Dark mode - Softer contrast */
  &:where([data-theme="dark"], [data-theme="dark"] *) {
    --canvas-background: oklch(0.10 0.003 252.11);
    --canvas-grid: oklch(0.22 0.006 252.11);
    --canvas-selection: oklch(0.58 0.15 263.8 / 0.35);
    
    --stroke-primary: oklch(0.95 0.003 252.11);
    --stroke-muted: oklch(0.68 0.01 252.11);
  }
}
```

**Pros:**
- Easy on the eyes for long sessions
- Professional appearance
- Subtle colors don't compete with content
- Great for business use

**Cons:**
- Lower contrast may affect accessibility
- Colors less distinctive

---

### ♿ Variant 3: "High Contrast Enhanced"
**Best for: Accessibility, presentations, low vision users**

```css
:root {
  /* Canvas - Pure white for maximum contrast */
  --canvas-background: oklch(1 0 0);
  --canvas-grid: oklch(0.82 0.02 252.11);
  --canvas-selection: oklch(0.65 0.25 263.8 / 0.3);
  
  /* Stroke Colors - Maximum distinctness */
  --stroke-primary: oklch(0.05 0.02 255.21);     /* True black */
  --stroke-secondary: oklch(0.65 0.25 27.84);    /* Bright red */
  --stroke-accent: oklch(0.65 0.22 194.68);      /* Bright blue */
  --stroke-success: oklch(0.65 0.23 143.8);      /* Bright green */
  --stroke-warning: oklch(0.70 0.25 83.8);       /* Bright yellow */
  --stroke-purple: oklch(0.65 0.24 303.8);       /* Bright purple */
  --stroke-pink: oklch(0.65 0.25 343.8);         /* Bright pink */
  --stroke-orange: oklch(0.65 0.26 44.94);       /* Bright orange */
  
  /* Fill Colors - Bold and clear */
  --fill-transparent: transparent;
  --fill-white: oklch(1 0 0);
  --fill-light: oklch(0.93 0.02 252.11);
  --fill-highlight: oklch(0.90 0.08 85.59);
  
  /* Dark mode - Ultra high contrast */
  &:where([data-theme="dark"], [data-theme="dark"] *) {
    --canvas-background: oklch(0.05 0.005 252.11);
    --canvas-grid: oklch(0.30 0.01 252.11);
    --canvas-selection: oklch(0.70 0.25 263.8 / 0.45);
    
    --stroke-primary: oklch(1 0 0);
    --stroke-muted: oklch(0.85 0.01 252.11);
  }
}
```

**Pros:**
- Maximum accessibility (WCAG AAA compliant)
- Crystal clear visibility
- Excellent for presentations
- Color-blind friendly

**Cons:**
- Very bold colors may feel overwhelming
- Not ideal for subtle design work

---

## Recommendation

**Start with Variant 1: "Classic Excalidraw"** - It provides the best balance of:
- Familiarity for existing Excalidraw users
- Good accessibility (WCAG AA)
- Professional appearance
- Works across all use cases
- Easy to adjust lightness/chroma with OKLCH

The OKLCH color space makes it trivial to switch between variants or even create a custom palette by adjusting lightness (L) and chroma (C) values while maintaining perceptual uniformity.

## Selected Variant

**Implementation will start with Variant 1: "Classic Excalidraw"** with the option to switch or customize later.

All implementation steps will use Variant 1's OKLCH values as the base, and the documentation will include instructions for switching between variants.

## Surprises & Discoveries

*(To be updated during research phase)*

## Outcomes & Retrospective

*(To be completed after implementation)*

## Context

Based on the whiteboard implementation plan (`docs/brain/whiteboard-implementation-plan.md`) and existing project structure analysis:

**Existing Infrastructure:**
- Monorepo with pnpm workspaces + moonrepo
- `apps/excalidraw/` - Main application
- `packages/shared-ui/` - 40+ shadcn/ui components already implemented
- TailwindCSS v4 with OKLCH color space
- OKLCH-based theme system with dark/light mode
- Radix UI primitives throughout
- Storybook for component documentation

**Target Versions:**
- **V1**: Offline-first single board with React, RxDB, Canvas
- **V2**: Cloud sync with authentication
- **V3**: Multi-board management with templates
- **V4**: Real-time collaboration with WebSocket

**Key Technical Constraints:**
- React 18 + TypeScript
- TailwindCSS v4 (OKLCH color space)
- Existing shadcn/ui component library (extend, not rebuild)
- HTML5 Canvas for drawing
- Monorepo structure (moonrepo)
- RxDB for state management
- Excalidraw-inspired color palette and interaction patterns

**Design System Scope:**
- Extend existing theme system for canvas-specific colors
- Add whiteboard-specific components (toolbar, color picker, canvas tools)
- Create Excalidraw-inspired color palette for drawing elements
- Document canvas interaction patterns

## Plan of Work

The design system implementation will follow a systematic approach:

1. **Research & Analysis**: Study Excalidraw's design patterns and extract reusable elements
2. **Design Tokens**: Define atomic design tokens (colors, typography, spacing, etc.)
3. **Component Architecture**: Design component hierarchy and patterns
4. **Canvas Elements**: Define drawing elements (shapes, tools, connectors)
5. **Interaction Patterns**: Specify user interactions and animations
6. **Accessibility**: Ensure WCAG 2.1 AA compliance
7. **Documentation**: Create comprehensive documentation website
8. **Implementation**: Provide TypeScript definitions and TailwindCSS configuration

Each phase builds upon the previous, creating a solid foundation for the whiteboard application.

## Steps

### Phase 1: Research & Analysis (2 days)

**Step 1.1: Excalidraw Pattern Analysis**
```
1. Analyze Excalidraw's visual design language
2. Extract color palette and gradients
3. Document typography hierarchy
4. Identify component patterns
5. Catalog interaction behaviors
```

**Step 1.2: Competitive Analysis**
```
1. Research other whiteboard tools (Miro, Figma, Lucidchart)
2. Compare design approaches
3. Identify best practices
4. Document unique opportunities
```

**Step 1.3: Technical Requirements**
```
1. Review whiteboard implementation plan
2. Map design system to technical architecture
3. Identify component reuse opportunities
4. Define version-specific adaptations
```

### Phase 2: Design Tokens Definition (3 days)

**Step 2.1: Canvas Color System (Extend Existing OKLCH Theme)**
```
1. Analyze Excalidraw's color palette and extract core colors
2. Extend existing colors.css with canvas-specific OKLCH values:
   - Canvas background and grid colors
   - Drawing stroke colors (primary, secondary, muted)
   - Shape-specific colors (rectangle, circle, arrow, text)
   - Selection and highlight colors
3. Add canvas color variables to global.css theme block
4. Create color picker component using existing UI patterns
5. Integrate with existing theme provider system
6. Validate WCAG AA contrast ratios for canvas colors
7. Test color accessibility in both light and dark modes
```

**Step 2.2: Typography**
```
1. Define font families (system fonts for performance)
2. Create typography scale (display, heading, body, caption, code)
3. Define font weights and styles
4. Create text color tokens
```

**Step 2.3: Spacing & Layout**
```
1. Define spacing scale (4px base unit)
2. Create component padding/margin tokens
3. Define grid system (8px grid)
4. Create breakpoints for responsive design
```

**Step 2.4: Visual Effects**
```
1. Define elevation/shadow system
2. Create border radius tokens
3. Define border width tokens
4. Create animation timing and easing tokens
```

### Phase 3: Component Architecture (4 days)

**Step 3.1: Component Hierarchy**
```
1. Design atomic design system hierarchy (atoms, molecules, organisms)
2. Define component composition patterns
3. Create component dependency diagram
4. Document component API contracts
```

**Step 3.2: Whiteboard-Specific Components (Extend Existing Library)**
```
1. Canvas toolbar component (extend existing sidebar patterns)
2. Color picker with swatches (custom component using existing UI)
3. Tool selector buttons (extend button component)
4. Stroke width slider (extend existing slider)
5. Canvas element properties panel (extend sidebar patterns)
6. Layer panel (extend sidebar patterns)
7. Export dialog (extend existing dialog)
8. Presence indicator (extend badge/avatar patterns)
9. Zoom controls (custom toolbar component)
10. Canvas container wrapper with proper theming
```

**Step 3.3: Toolbar Components**
```
1. Main toolbar design
2. Tool button groups
3. Color picker components
4. Stroke width selector
5. Tool indicator/status
6. Collapsible toolbar sections
```

**Step 3.4: Layout Components**
```
1. Application shell
2. Sidebar (layers, elements panel)
3. Canvas container
4. Header/navigation
5. Footer/status bar
6. Responsive layout patterns
```

### Phase 4: Canvas Element Design (3 days)

**Step 4.1: Drawing Tools**
```
1. Pen/freehand tool design
2. Shape tools (rectangle, circle, diamond, arrow)
3. Text tool design
4. Selection tool patterns
5. Eraser tool design
6. Hand/pan tool design
```

**Step 4.2: Element Styling**
```
1. Stroke color system
2. Fill color system
3. Stroke width variations
4. Opacity controls
5. Dash patterns
6. Arrowhead styles
```

**Step 4.3: Selection & Manipulation**
```
1. Selection visual indicators
2. Resize handle design
3. Rotation handle design
4. Multi-selection patterns
5. Group/ungroup visual cues
```

**Step 4.4: Canvas Interactions**
```
1. Grid system design
2. Zoom controls and indicators
3. Minimap design (V3+)
4. Cursor variations
5. Loading states
```

### Phase 5: Interaction Patterns (2 days)

**Step 5.1: Drawing Interactions**
```
1. Drawing start/middle/end states
2. Rubber band selection feedback
3. Real-time drawing preview
4. Snap-to-grid behavior
5. Constrained drawing (shift-key)
```

**Step 5.2: Element Interactions**
```
1. Drag and drop patterns
2. Resize interaction patterns
3. Rotate interaction patterns
4. Edit-in-place patterns
5. Context menu patterns
```

**Step 5.3: Navigation Interactions**
```
1. Pan interaction (spacebar + drag)
2. Zoom interactions (ctrl/cmd + scroll)
3. Fit-to-screen behavior
4. Navigation history (V3+)
```

**Step 5.4: Animation & Transitions**
```
1. Micro-interactions for buttons
2. Element creation animations
3. State change transitions
4. Loading state animations
5. Success/error feedback animations
```

### Phase 6: Accessibility (2 days)

**Step 6.1: WCAG 2.1 AA Compliance**
```
1. Color contrast verification (4.5:1 minimum)
2. Keyboard navigation patterns
3. Focus management
4. Screen reader support
5. Alternative text for visual elements
```

**Step 6.2: Keyboard Interactions**
```
1. Tool selection shortcuts
2. Element manipulation shortcuts
3. Canvas navigation shortcuts
4. Menu navigation patterns
5. Modal keyboard handling
```

**Step 6.3: Semantic HTML**
```
1. ARIA labels and roles
2. Semantic element structure
3. Live region announcements
4. Skip links
```

**Step 6.4: Inclusive Design**
```
1. Color-blind friendly palette
2. Reduced motion support
3. High contrast mode support
4. Touch target sizes (44px minimum)
```

### Phase 7: Documentation Website (3 days)

**Step 7.1: Documentation Structure**
```
1. Design system overview
2. Getting started guide
3. Design tokens reference
4. Component documentation
5. Patterns and guidelines
6. Accessibility guidelines
```

**Step 7.2: Extend Existing Storybook Documentation**
```
1. Add stories for new whiteboard-specific components
2. Document canvas color system with interactive examples
3. Showcase color picker component with OKLCH values
4. Add canvas interaction patterns to existing stories
5. Document theme integration (light/dark + canvas colors)
6. Create examples for each whiteboard tool component
7. Add accessibility testing to whiteboard components
8. Document integration with existing shared-ui patterns
```

**Step 7.3: Code Examples**
```
1. Usage examples for each component
2. Integration patterns
3. Customization examples
4. TypeScript type definitions
5. TailwindCSS configuration
```

**Step 7.4: Resources**
```
1. Downloadable assets (icons, illustrations)
2. Figma design files
3. Sketch library
4. Brand guidelines
5. Migration guides
```

### Phase 8: Implementation Specifications (2 days)

**Step 8.1: Technical Documentation (Extending Existing System)**
```
1. Document canvas color additions to colors.css
2. TypeScript definitions for canvas color tokens
3. Integration guide for whiteboard components with existing UI
4. Canvas color system usage patterns
5. Component API for whiteboard-specific components
6. State management patterns for canvas elements
7. Testing guidelines for canvas components
```

**Step 8.2: Implementation Roadmap**
```
1. V1 component priorities
2. V2-V4 enhancement plans
3. Migration strategy
4. Version compatibility
5. Performance considerations
```

**Step 8.3: Developer Resources**
```
1. Setup instructions
2. Development workflow
3. Contribution guidelines
4. Code style guide
5. Git workflow
```

**Step 8.4: Quality Assurance**
```
1. Design review checklist
2. Accessibility testing checklist
3. Cross-browser testing checklist
4. Performance benchmarks
5. Visual regression testing
```

## Validation

**Testing Strategy:**

1. **Design Validation**
   - Visual comparison with Excalidraw
   - Consistency checks across components
   - Responsive design testing
   - Accessibility audit (axe-core)

2. **Component Testing**
   - Unit tests for components
   - Visual regression tests (Chromatic)
   - Interaction testing (Testing Library)
   - Performance testing (Lighthouse)

3. **Documentation Validation**
   - Documentation completeness check
   - Code example execution
   - Storybook functionality test
   - Accessibility of documentation site

**Success Metrics:**

- Canvas color system fully integrated with existing OKLCH theme
- 10+ whiteboard-specific components added to existing library
- 100% WCAG 2.1 AA compliance for canvas colors
- All new components follow existing shared-ui patterns
- <100ms interaction response time for canvas operations
- Zero console errors in new components
- All canvas colors have TypeScript types
- Color palette covers all Excalidraw drawing use cases

**Validation Commands:**

```bash
# Run existing component tests
pnpm test

# Run Storybook for new components
pnpm storybook

# Check linting
pnpm lint

# Format code
pnpm format

# Build all packages
pnpm build

# Type checking
pnpm typecheck

# Run accessibility tests
pnpm test:a11y

# Build app
pnpm --filter @excalidraw-clone/app build
```

## Artifacts

*(Evidence and examples will be added as each phase is completed)*

### Example: Extending Existing colors.css for Canvas

```css
/* apps/excalidraw/app/styles/colors.css - Extension for Canvas */
@layer utilities {
	:root {
		/* Existing theme variables... */
		
		/* Canvas-specific colors (OKLCH) */
		--canvas-background: oklch(0.99 0 0); /* Near white for canvas */
		--canvas-grid: oklch(0.85 0.02 252.11); /* Subtle grid lines */
		--canvas-selection: oklch(0.65 0.191 263.8 / 0.2); /* Primary with 20% opacity */
		
		/* Drawing stroke colors (Excalidraw-inspired) */
		--stroke-primary: oklch(0.25 0.008 255.21); /* Near black */
		--stroke-secondary: oklch(0.45 0.15 27.84); /* Red */
		--stroke-accent: oklch(0.45 0.15 194.68); /* Blue */
		--stroke-muted: oklch(0.75 0.02 252.11); /* Light gray */
		
		/* Shape fill colors */
		--fill-transparent: transparent;
		--fill-white: oklch(1 0 0);
		--fill-light: oklch(0.95 0.01 252.11);
		--fill-highlight: oklch(0.85 0.05 85.59); /* Yellow-ish */
		
		/* Element type colors */
		--element-rectangle: oklch(0.45 0.15 27.84);
		--element-circle: oklch(0.45 0.15 194.68);
		--element-arrow: oklch(0.45 0.15 263.8);
		--element-text: oklch(0.25 0.008 255.21);
		
		&:where([data-theme="dark"], [data-theme="dark"] *) {
			/* Existing dark theme variables... */
			
			/* Canvas colors for dark mode */
			--canvas-background: oklch(0.18 0.003 252.11); /* Dark background */
			--canvas-grid: oklch(0.25 0.008 252.11); /* Visible grid in dark */
			--canvas-selection: oklch(0.65 0.191 263.8 / 0.3); /* More opaque in dark */
			
			/* Lighter strokes for dark mode */
			--stroke-primary: oklch(0.95 0.005 252.11);
			--stroke-muted: oklch(0.65 0.015 252.11);
		}
	}
}
```

### Example: shadcn/ui Component

```typescript
// components/ui/button.tsx (shadcn/ui)
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        tool: "bg-canvas-paper border-2 border-border hover:border-primary",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Example: Whiteboard Component (Extending Existing Patterns)

```typescript
// packages/shared-ui/src/components/canvas-toolbar/canvas-toolbar.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CanvasToolbarProps {
  className?: string;
  onToolSelect?: (tool: string) => void;
  onColorSelect?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
}

export function CanvasToolbar({
  className,
  onToolSelect,
  onColorSelect,
  onStrokeWidthChange,
}: CanvasToolbarProps) {
  const [selectedTool, setSelectedTool] = useState("selection");
  const [strokeWidth, setStrokeWidth] = useState([2]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 bg-background border rounded-md",
        className
      )}
    >
      {/* Tool Selection */}
      <div className="flex gap-1">
        <Button
          variant={selectedTool === "selection" ? "default" : "ghost"}
          size="icon"
          onClick={() => {
            setSelectedTool("selection");
            onToolSelect?.("selection");
          }}
        >
          <CursorPointer className="h-4 w-4" />
        </Button>
        <Button
          variant={selectedTool === "rectangle" ? "default" : "ghost"}
          size="icon"
          onClick={() => {
            setSelectedTool("rectangle");
            onToolSelect?.("rectangle");
          }}
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Stroke Width */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Width</span>
        <Slider
          value={strokeWidth}
          onValueChange={(value) => {
            setStrokeWidth(value);
            onStrokeWidthChange?.(value[0]);
          }}
          max={10}
          min={1}
          step={1}
          className="w-20"
        />
        <span className="text-sm text-muted-foreground w-6">
          {strokeWidth[0]}
        </span>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Color Picker */}
      <ColorPicker onColorSelect={onColorSelect} />
    </div>
  );
}

// Color Picker Component
function ColorPicker({ onColorSelect }: { onColorSelect?: (color: string) => void }) {
  const colors = [
    { name: "Black", value: "var(--stroke-primary)" },
    { name: "Blue", value: "var(--stroke-accent)" },
    { name: "Red", value: "var(--stroke-secondary)" },
  ];

  return (
    <div className="flex gap-1">
      {colors.map((color) => (
        <Button
          key={color.name}
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => onColorSelect?.(color.value)}
        >
          <div
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: color.value }}
          />
        </Button>
      ))}
    </div>
  );
}
```
