# Whiteboard Design System Documentation

## Overview

This document describes the whiteboard design system implementation using **Variant 1: Classic Excalidraw** color palette. The design system extends the existing shadcn/ui component library with whiteboard-specific components optimized for drawing and collaboration.

## Color System

### Variant 1: Classic Excalidraw

The color system uses **OKLCH color space** for better perceptual uniformity and accessibility. All canvas colors are defined as CSS custom properties in `colors.css`.

#### Canvas Colors

```css
:root {
  /* Canvas Background */
  --canvas-background: oklch(0.99 0 0);
  --canvas-grid: oklch(0.89 0.01 252.11);
  --canvas-selection: oklch(0.65 0.191 263.8 / 0.25);
  
  /* Stroke Colors */
  --stroke-primary: oklch(0.15 0.01 255.21);      /* Black */
  --stroke-secondary: oklch(0.55 0.20 27.84);    /* Red */
  --stroke-accent: oklch(0.55 0.15 194.68);      /* Blue */
  --stroke-success: oklch(0.55 0.16 143.8);      /* Green */
  --stroke-warning: oklch(0.55 0.18 83.8);       /* Yellow */
  --stroke-purple: oklch(0.55 0.17 303.8);       /* Purple */
  --stroke-pink: oklch(0.55 0.18 343.8);         /* Pink */
  --stroke-orange: oklch(0.55 0.19 44.94);       /* Orange */
  --stroke-muted: oklch(0.75 0.02 252.11);       /* Gray */
  
  /* Fill Colors */
  --fill-transparent: transparent;
  --fill-white: oklch(1 0 0);
  --fill-light: oklch(0.96 0.01 252.11);
  --fill-highlight: oklch(0.88 0.06 85.59);
  
  /* Element Types */
  --element-rectangle: oklch(0.55 0.20 27.84);
  --element-circle: oklch(0.55 0.15 194.68);
  --element-arrow: oklch(0.55 0.17 303.8);
  --element-text: oklch(0.15 0.01 255.21);
}
```

#### Dark Mode

Dark mode automatically adjusts canvas colors for better visibility:

```css
:root[data-theme="dark"] {
  --canvas-background: oklch(0.12 0.005 252.11);
  --canvas-grid: oklch(0.25 0.008 252.11);
  --stroke-primary: oklch(0.98 0.002 252.11);
  /* ... other dark mode adjustments */
}
```

### Usage in Components

#### TailwindCSS Classes

Use the provided utility classes:

```tsx
<div className="bg-[var(--canvas-background)]">
  <svg className="stroke-[var(--stroke-primary)]">
    <path className="stroke-[var(--stroke-secondary)]" />
  </svg>
</div>
```

#### TypeScript Support

```typescript
import { getCanvasColors, CANVAS_COLOR_PRESETS } from "@/canvas-colors";

const colors = getCanvasColors();
const strokeColor = colors.stroke.primary; // OKLCH value

// Use presets for quick access
const basicColors = CANVAS_COLOR_PRESETS.basic;
```

## Components

### CanvasToolbar

A toolbar component for selecting drawing tools and adjusting properties.

#### Basic Usage

```tsx
import { CanvasToolbar, type Tool } from "@/components/ui/canvas-toolbar";

function WhiteboardCanvas() {
  const [selectedTool, setSelectedTool] = useState<Tool>("selection");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState("var(--stroke-primary)");

  return (
    <CanvasToolbar
      selectedTool={selectedTool}
      strokeWidth={strokeWidth}
      strokeColor={strokeColor}
      onToolSelect={setSelectedTool}
      onStrokeWidthChange={setStrokeWidth}
      onStrokeColorChange={setStrokeColor}
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedTool` | `Tool` | `"selection"` | Currently selected tool |
| `strokeWidth` | `number` | `2` | Stroke width (1-10) |
| `strokeColor` | `string` | `"var(--stroke-primary)"` | Current stroke color |
| `fillColor` | `string` | `"var(--fill-transparent)"` | Current fill color |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Toolbar orientation |
| `onToolSelect` | `(tool: Tool) => void` | - | Callback when tool changes |
| `onStrokeWidthChange` | `(width: number) => void` | - | Callback when width changes |
| `onStrokeColorChange` | `(color: string) => void` | - | Callback when color changes |
| `onFillColorChange` | `(color: string) => void` | - | Callback when fill color changes |

#### Available Tools

- `selection` - Select and move elements (V)
- `rectangle` - Draw rectangles (R)
- `circle` - Draw circles (O)
- `line` - Draw lines (L)
- `arrow` - Draw arrows (A)
- `text` - Add text (T)
- `eraser` - Erase elements (E)
- `hand` - Pan canvas (Space)

### ColorPicker

A color picker component with presets and custom color support.

#### Basic Usage

```tsx
import { ColorPicker } from "@/components/ui/color-picker";

function ColorControls() {
  const [strokeColor, setStrokeColor] = useState("var(--stroke-primary)");
  const [fillColor, setFillColor] = useState("var(--fill-transparent)");

  return (
    <div className="flex gap-2">
      <ColorPicker
        value={strokeColor}
        onChange={setStrokeColor}
        label="Stroke"
        type="stroke"
      />
      <ColorPicker
        value={fillColor}
        onChange={setFillColor}
        label="Fill"
        type="fill"
      />
    </div>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `"var(--stroke-primary)"` | Current color value |
| `onChange` | `(color: string) => void` | - | Callback when color changes |
| `label` | `string` | `"Color"` | Label for the color picker |
| `type` | `"stroke" \| "fill"` | `"stroke"` | Type of color picker |
| `showPresets` | `boolean` | `true` | Whether to show preset colors |

#### Color Presets

**Stroke Colors:**
- Black (primary)
- Red (secondary)
- Blue (accent)
- Green (success)
- Yellow (warning)

**Fill Colors:**
- Transparent
- White
- Light Gray
- Highlight (yellow)

### LayerPanel

A panel for managing canvas layers with visibility, locking, and reordering.

#### Basic Usage

```tsx
import { LayerPanel, type Layer } from "@/components/ui/layer-panel";

function LayerSidebar() {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "1",
      name: "Background",
      type: "rectangle",
      visible: true,
      locked: false,
      opacity: 1,
      elementCount: 5,
    },
    // ... more layers
  ]);
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);

  return (
    <LayerPanel
      layers={layers}
      selectedLayerIds={selectedLayers}
      onLayerSelect={(id, multi) => {
        if (multi) {
          setSelectedLayers(prev => 
            prev.includes(id) 
              ? prev.filter(x => x !== id)
              : [...prev, id]
          );
        } else {
          setSelectedLayers([id]);
        }
      }}
      onLayerVisibilityToggle={(id) => {
        setLayers(prev => prev.map(layer => 
          layer.id === id 
            ? { ...layer, visible: !layer.visible }
            : layer
        ));
      }}
      onLayerLockToggle={(id) => {
        setLayers(prev => prev.map(layer => 
          layer.id === id 
            ? { ...layer, locked: !layer.locked }
            : layer
        ));
      }}
      onLayerReorder={(from, to) => {
        setLayers(prev => {
          const newLayers = [...prev];
          const [moved] = newLayers.splice(from, 1);
          newLayers.splice(to, 0, moved);
          return newLayers;
        });
      }}
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `layers` | `Layer[]` | Array of layer objects |
| `selectedLayerIds` | `string[]` | Currently selected layer IDs |
| `onLayerSelect` | `(id: string, multi: boolean) => void` | Callback when layer is selected |
| `onLayerVisibilityToggle` | `(id: string) => void` | Callback to toggle layer visibility |
| `onLayerLockToggle` | `(id: string) => void` | Callback to toggle layer lock |
| `onLayerReorder` | `(from: number, to: number) => void` | Callback to reorder layers |
| `onLayerDelete` | `(id: string) => void` | Callback to delete layer |
| `onLayerRename` | `(id: string, name: string) => void` | Callback to rename layer |

#### Layer Type

```typescript
type LayerType = 
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text"
  | "freehand";

interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  elementCount?: number;
}
```

## Complete Example

Here's a complete whiteboard layout using all components:

```tsx
import { CanvasToolbar } from "@/components/ui/canvas-toolbar";
import { ColorPicker } from "@/components/ui/color-picker";
import { LayerPanel } from "@/components/ui/layer-panel";

export function Whiteboard() {
  const [selectedTool, setSelectedTool] = useState<Tool>("selection");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState("var(--stroke-primary)");
  const [fillColor, setFillColor] = useState("var(--fill-transparent)");
  const [layers, setLayers] = useState<Layer[]>([]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar with Layers */}
      <aside className="w-64 border-r">
        <LayerPanel
          layers={layers}
          onLayerSelect={(id) => console.log("Select", id)}
          onLayerVisibilityToggle={(id) => console.log("Toggle visibility", id)}
          onLayerLockToggle={(id) => console.log("Toggle lock", id)}
        />
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b">
          <CanvasToolbar
            selectedTool={selectedTool}
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            fillColor={fillColor}
            onToolSelect={setSelectedTool}
            onStrokeWidthChange={setStrokeWidth}
            onStrokeColorChange={setStrokeColor}
            onFillColorChange={setFillColor}
          />
        </div>

        {/* Canvas */}
        <div 
          className="flex-1 bg-[var(--canvas-background)]"
          style={{
            backgroundImage: `linear-gradient(var(--canvas-grid) 1px, transparent 1px),
                             linear-gradient(90deg, var(--canvas-grid) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        >
          {/* Canvas elements go here */}
        </div>
      </main>
    </div>
  );
}
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader labels
- ✅ Color contrast compliance
- ✅ Touch target sizes (44px minimum)

## Browser Support

- Modern browsers with OKLCH color support
- Chrome 111+
- Firefox 111+
- Safari 16.4+
- Edge 111+

## Migration Guide

### From V0 to V1

If you're migrating from an older version:

1. **Update colors.css** - Add the new canvas color variables
2. **Replace custom components** - Use new CanvasToolbar, ColorPicker, LayerPanel
3. **Update imports** - Change import paths to `@/components/ui/`
4. **Update styles** - Use new CSS custom properties

### Switching Color Variants

To switch to a different color variant:

1. Update the CSS variables in `colors.css`
2. No component changes required - they use CSS variables
3. Test in both light and dark modes

## Contributing

When adding new whiteboard components:

1. Follow the existing shadcn/ui patterns
2. Use OKLCH color space for new colors
3. Add TypeScript types
4. Include accessibility features
5. Document props and usage
6. Add examples to this documentation

## Resources

- [OKLCH Color Space](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Excalidraw](https://excalidraw.com)
