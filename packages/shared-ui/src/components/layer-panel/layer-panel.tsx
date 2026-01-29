import * as React from "react";
import { cn } from "../../utils";
import { Button } from "../button/button";
import { ScrollArea } from "../scroll-area/scroll-area";
import { Separator } from "../separator/separator";
import { Badge } from "../badge/badge";
import {
	Eye,
	EyeOff,
	Lock,
	Unlock,
	MoreHorizontal,
	Square,
	Circle,
	Type,
	Minus,
	ArrowRight,
} from "lucide-react";

export type LayerType =
	| "rectangle"
	| "circle"
	| "line"
	| "arrow"
	| "text"
	| "freehand";

export interface Layer {
	id: string;
	name: string;
	type: LayerType;
	visible: boolean;
	locked: boolean;
	opacity: number;
	elementCount?: number;
}

export interface LayerPanelProps {
	className?: string;
	layers: Layer[];
	selectedLayerIds?: string[];
	onLayerSelect?: (layerId: string, multiSelect?: boolean) => void;
	onLayerVisibilityToggle?: (layerId: string) => void;
	onLayerLockToggle?: (layerId: string) => void;
	onLayerReorder?: (fromIndex: number, toIndex: number) => void;
	onLayerDelete?: (layerId: string) => void;
	onLayerRename?: (layerId: string, name: string) => void;
}

const LAYER_ICONS: Record<
	LayerType,
	React.ComponentType<{ className?: string }>
> = {
	rectangle: Square,
	circle: Circle,
	line: Minus,
	arrow: ArrowRight,
	text: Type,
	freehand: Minus,
};

export function LayerPanel({
	className,
	layers,
	selectedLayerIds = [],
	onLayerSelect,
	onLayerVisibilityToggle,
	onLayerLockToggle,
	onLayerReorder,
	onLayerDelete,
	onLayerRename,
}: LayerPanelProps) {
	const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

	const handleDragStart = (index: number) => {
		setDraggedIndex(index);
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === index) return;

		// Visual feedback for drop target
		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === dropIndex) return;

		onLayerReorder?.(draggedIndex, dropIndex);
		setDraggedIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
	};

	return (
		<div
			className={cn(
				"flex flex-col h-full bg-background border rounded-md",
				className,
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between p-3 border-b">
				<h3 className="text-sm font-semibold">Layers</h3>
				<Badge variant="secondary" className="text-xs">
					{layers.length}
				</Badge>
			</div>

			{/* Layer List */}
			<ScrollArea className="flex-1">
				<div className="p-2 space-y-1">
					{layers.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
							<Square className="h-8 w-8 mb-2 opacity-50" />
							<p>No layers yet</p>
							<p className="text-xs">Start drawing to create layers</p>
						</div>
					) : (
						layers.map((layer, index) => {
							const Icon = LAYER_ICONS[layer.type];
							const isSelected = selectedLayerIds.includes(layer.id);
							const isDragged = draggedIndex === index;

							return (
								<div
									key={layer.id}
									draggable
									onDragStart={() => handleDragStart(index)}
									onDragOver={(e) => handleDragOver(e, index)}
									onDrop={(e) => handleDrop(e, index)}
									onDragEnd={handleDragEnd}
									className={cn(
										"group flex items-center gap-2 p-2 rounded-md border transition-all",
										isSelected && "bg-accent border-accent",
										!isSelected && "hover:bg-accent/50 border-transparent",
										isDragged && "opacity-50",
										"cursor-pointer",
									)}
									onClick={(e) =>
										onLayerSelect?.(layer.id, e.metaKey || e.ctrlKey)
									}
								>
									{/* Layer Icon */}
									<Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />

									{/* Layer Info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium truncate">
												{layer.name}
											</span>
											{layer.elementCount !== undefined &&
												layer.elementCount > 1 && (
													<Badge
														variant="outline"
														className="text-xs px-1 py-0 h-4"
													>
														{layer.elementCount}
													</Badge>
												)}
										</div>
										<div className="text-xs text-muted-foreground capitalize">
											{layer.type}
										</div>
									</div>

									{/* Layer Actions */}
									<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7"
											onClick={(e) => {
												e.stopPropagation();
												onLayerVisibilityToggle?.(layer.id);
											}}
											title={layer.visible ? "Hide layer" : "Show layer"}
										>
											{layer.visible ? (
												<Eye className="h-3 w-3" />
											) : (
												<EyeOff className="h-3 w-3" />
											)}
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7"
											onClick={(e) => {
												e.stopPropagation();
												onLayerLockToggle?.(layer.id);
											}}
											title={layer.locked ? "Unlock layer" : "Lock layer"}
										>
											{layer.locked ? (
												<Lock className="h-3 w-3" />
											) : (
												<Unlock className="h-3 w-3" />
											)}
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7"
											onClick={(e) => {
												e.stopPropagation();
												// Open context menu or dropdown
											}}
											title="More options"
										>
											<MoreHorizontal className="h-3 w-3" />
										</Button>
									</div>
								</div>
							);
						})
					)}
				</div>
			</ScrollArea>

			{/* Footer */}
			{layers.length > 0 && (
				<>
					<Separator />
					<div className="p-2">
						<Button
							variant="outline"
							size="sm"
							className="w-full"
							onClick={() => {}}
						>
							Add Layer
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
