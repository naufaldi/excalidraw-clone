import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { Button } from "../button/button";
import { cn } from "../../utils";
import { CANVAS_COLOR_PRESETS } from "../../canvas-colors";

export interface ColorPickerProps {
	value?: string;
	onChange?: (color: string) => void;
	label?: string;
	type?: "stroke" | "fill";
	showPresets?: boolean;
	className?: string;
}

const COLOR_SWATCH_SIZE = 32;

export function ColorPicker({
	value = "var(--stroke-primary)",
	onChange,
	label = "Color",
	type = "stroke",
	showPresets = true,
	className,
}: ColorPickerProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [customColor, setCustomColor] = React.useState(value);

	const handleColorSelect = (color: string) => {
		setCustomColor(color);
		onChange?.(color);
		setIsOpen(false);
	};

	const presets =
		type === "stroke" ? CANVAS_COLOR_PRESETS.basic : CANVAS_COLOR_PRESETS.fill;

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={isOpen}
					aria-label={`${label} color picker`}
					className={cn(
						"justify-start gap-2 font-normal",
						!value && "text-muted-foreground",
						className,
					)}
				>
					<div
						className={cn(
							"h-4 w-4 rounded-sm border border-border",
							type === "fill" &&
								customColor === "transparent" &&
								"bg-[repeating-linear-gradient(45deg,_#ccc_0,_#ccc_4px,_transparent_4px,_transparent_8px)]",
						)}
						style={{
							backgroundColor:
								customColor === "transparent" ? undefined : customColor,
						}}
					/>
					<span className="truncate">
						{customColor === "transparent"
							? "Transparent"
							: customColor.startsWith("var(--")
								? customColor
										.replace("var(--", "")
										.replace(")", "")
										.replace(/-/g, " ")
								: customColor}
					</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64 p-3" align="start">
				<div className="space-y-3">
					{/* Current Color Display */}
					<div className="flex items-center gap-2">
						<div
							className="h-8 w-8 rounded-md border border-border flex-shrink-0"
							style={{
								backgroundColor:
									customColor === "transparent" ? undefined : customColor,
								backgroundImage:
									customColor === "transparent"
										? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
										: "none",
								backgroundSize: "8px 8px",
								backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
							}}
						/>
						<div className="text-sm">
							<div className="font-medium">{label}</div>
							<div className="text-xs text-muted-foreground font-mono">
								{customColor}
							</div>
						</div>
					</div>

					{/* Color Presets */}
					{showPresets && (
						<div className="space-y-2">
							<div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
								Presets
							</div>
							<div className="grid grid-cols-5 gap-2">
								{presets.map((preset) => (
									<button
										key={preset.name}
										onClick={() => handleColorSelect(preset.value)}
										className={cn(
											"relative h-8 w-8 rounded-md border border-border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
											customColor === preset.value &&
												"ring-2 ring-ring ring-offset-2",
										)}
										title={preset.name}
										style={{
											backgroundColor: preset.value.includes("transparent")
												? undefined
												: preset.value,
											backgroundImage: preset.value.includes("transparent")
												? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
												: "none",
											backgroundSize: "8px 8px",
											backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
										}}
									>
										{customColor === preset.value && (
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="h-2 w-2 rounded-full bg-background" />
											</div>
										)}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Custom Color Input */}
					<div className="space-y-2">
						<div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Custom
						</div>
						<div className="grid grid-cols-1 gap-2">
							<input
								type="color"
								value={customColor.startsWith("#") ? customColor : "#000000"}
								onChange={(e) => handleColorSelect(e.target.value)}
								className="h-8 w-full rounded cursor-pointer"
								aria-label={`Custom ${label.toLowerCase()}`}
							/>
							<input
								type="text"
								value={customColor}
								onChange={(e) => setCustomColor(e.target.value)}
								onBlur={() => onChange?.(customColor)}
								className="h-8 w-full rounded border border-input bg-background px-2 text-xs font-mono"
								placeholder="#000000 or var(--color)"
								aria-label={`Custom ${label.toLowerCase()} value`}
							/>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
