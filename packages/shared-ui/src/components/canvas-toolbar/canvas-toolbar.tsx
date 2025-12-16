import * as React from "react";
import { cn } from "../../utils";
import { Button } from "../button/button";
import { Slider } from "../slider/slider";
import { Separator } from "../separator/separator";
import {
  MousePointer,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  Eraser,
  Hand,
  Palette,
} from "lucide-react";

export type Tool =
  | "selection"
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text"
  | "eraser"
  | "hand";

export interface CanvasToolbarProps {
  className?: string;
  selectedTool?: Tool;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  onToolSelect?: (tool: Tool) => void;
  onStrokeWidthChange?: (width: number) => void;
  onStrokeColorChange?: (color: string) => void;
  onFillColorChange?: (color: string) => void;
  orientation?: "horizontal" | "vertical";
}

const TOOLS = [
  {
    id: "selection" as Tool,
    icon: MousePointer,
    label: "Selection",
    shortcut: "V",
  },
  { id: "rectangle" as Tool, icon: Square, label: "Rectangle", shortcut: "R" },
  { id: "circle" as Tool, icon: Circle, label: "Circle", shortcut: "O" },
  { id: "line" as Tool, icon: Minus, label: "Line", shortcut: "L" },
  { id: "arrow" as Tool, icon: ArrowRight, label: "Arrow", shortcut: "A" },
  { id: "text" as Tool, icon: Type, label: "Text", shortcut: "T" },
  { id: "eraser" as Tool, icon: Eraser, label: "Eraser", shortcut: "E" },
  { id: "hand" as Tool, icon: Hand, label: "Pan", shortcut: "Space" },
];

export function CanvasToolbar({
  className,
  selectedTool = "selection",
  strokeWidth = 2,
  strokeColor = "var(--stroke-primary)",
  fillColor = "var(--fill-transparent)",
  onToolSelect,
  onStrokeWidthChange,
  onStrokeColorChange,
  onFillColorChange,
  orientation = "horizontal",
}: CanvasToolbarProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 bg-background border rounded-md shadow-sm",
        isVertical && "flex-col w-fit h-fit",
        className,
      )}
    >
      {/* Tool Selection */}
      <div className={cn("flex gap-1", isVertical && "flex-col")}>
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;

          return (
            <Button
              key={tool.id}
              variant={isSelected ? "default" : "ghost"}
              size="icon"
              onClick={() => onToolSelect?.(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              className={cn(
                "h-9 w-9",
                isSelected && "bg-primary text-primary-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      <Separator
        orientation={isVertical ? "horizontal" : "vertical"}
        className={cn(isVertical && "w-full h-px")}
      />

      {/* Color Picker Section */}
      <div
        className={cn(
          "flex items-center gap-2",
          isVertical && "flex-col w-full",
        )}
      >
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title="Stroke Color"
            onClick={() => {
              /* Toggle color picker */
            }}
          >
            <div
              className="w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: strokeColor }}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title="Fill Color"
            onClick={() => {
              /* Toggle color picker */
            }}
          >
            <div
              className="w-4 h-4 rounded border border-border"
              style={{
                backgroundColor: fillColor,
                backgroundImage:
                  fillColor === "transparent"
                    ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                    : "none",
                backgroundSize: "8px 8px",
                backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
              }}
            />
          </Button>
        </div>

        <Separator
          orientation={isVertical ? "horizontal" : "vertical"}
          className={cn(isVertical && "w-full h-px")}
        />

        {/* Stroke Width */}
        <div
          className={cn(
            "flex items-center gap-2",
            isVertical && "flex-col w-full",
          )}
        >
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Width
          </span>
          <Slider
            value={[strokeWidth]}
            onValueChange={(value) => onStrokeWidthChange?.(value[0])}
            max={10}
            min={1}
            step={1}
            className={cn(isVertical ? "w-full" : "w-20")}
          />
          <span className="text-sm text-muted-foreground w-6 text-center">
            {strokeWidth}
          </span>
        </div>
      </div>
    </div>
  );
}
