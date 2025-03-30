import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Clock, MousePointerClick } from "lucide-react";
import { ModeSelectorProps } from "../app/types/mode-selector-props";

export const ModeSelector: React.FC<ModeSelectorProps> = memo(({ mode, handleValueChange, handleModeChange }) => (
	<section className="section mt-24">
		<div className="flex flex-col">
			<Label className="gap-1">
				Stop at {mode.mode === "clicks" ? <span>{mode.clicksValue} clicks</span> : <span>{mode.secondsValue} seconds</span>}
			</Label>
			<div className="flex">
				<Input
					type="number"
					min={mode.mode === "clicks" ? 3 : 1}
					className="input rounded-r-none"
					value={mode.mode === "clicks" ? mode.clicksValue : mode.secondsValue}
					onChange={(e) => handleValueChange(Number(e.target.value))}
				/>

				<ToggleGroup type="single" variant="nsh" value={mode.mode}>
					<ToggleGroupItem
						value="clicks"
						className={`first:rounded-l-none ${mode.mode === "clicks" ? "bg-zinc-700 hover:bg-zinc-700" : ""}`}
						onClick={() => handleModeChange("clicks")}
					>
						<MousePointerClick />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="seconds"
						onClick={() => handleModeChange("seconds")}
						className={mode.mode === "seconds" ? "bg-zinc-700 hover:bg-zinc-700" : ""}
					>
						<Clock />
					</ToggleGroupItem>
				</ToggleGroup>
			</div>
		</div>
	</section>
));

ModeSelector.displayName = "ModeSelector";
