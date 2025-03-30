"use client";
import { ChartPoint } from "@/app/types/chart-point";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Clock, MousePointerClick } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChartNSH } from "@/components/ChartNSH";
import { getBpm, getUr } from "../helpers/osuCalc";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FaGithub } from "react-icons/fa";
import { BenchmarkConfig, BenchmarkMode } from "./types/benchmark-mode";

export default function Home() {
	// Magic numbers
	const DEFAULT_KEY_1 = "Z";
	const DEFAULT_KEY_2 = "X";
	const DEFAULT_CLICKS = 100;
	const DEFAULT_SECONDS = 10;
	const MIN_CLICKS = 3;
	const MIN_SECONDS = 1;

	// Chart Related
	const [isRunningBenchmark, setIsRunningBenchmark] = useState<boolean>(false);
	const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);

	// Tracking if the first valid keypress has occurred
	const [hasFirstKeypress, setHasFirstKeypress] = useState<boolean>(false);

	// Keybind variables & default
	const [key1, setKey1] = useState<string>(DEFAULT_KEY_1);
	const [key2, setKey2] = useState<string>(DEFAULT_KEY_2);

	// Key Counter
	const [totalTaps, setTotalTaps] = useState<number>(0);

	// Counter mode and values code (Clicks or Seconds)
	const [mode, setMode] = useState<BenchmarkConfig>({ mode: "clicks", clicksValue: DEFAULT_CLICKS, secondsValue: DEFAULT_SECONDS });
	const handleModeChange = useCallback((newMode: BenchmarkMode) => {
		setMode((prevConfig: BenchmarkConfig) => ({
			...prevConfig,
			mode: newMode,
		}));
	}, []);
	const handleValueChange = useCallback((newValue: number) => {
		setMode((prevConfig: BenchmarkConfig) => {
			if (prevConfig.mode === "clicks") {
				return {
					...prevConfig,
					clicksValue: Math.max(newValue, MIN_CLICKS),
				};
			} else {
				return {
					...prevConfig,
					secondsValue: Math.max(newValue, MIN_SECONDS),
				};
			}
		});
	}, []);

	// Refs to know which button was selected
	const inputRef1 = useRef<HTMLInputElement>(null!);
	const inputRef2 = useRef<HTMLInputElement>(null!);

	// Variables to display info to the user
	const [BPM, setBPM] = useState<number>(0);
	const [UR, setUR] = useState<number>(0);

	// Timer-related states
	const [startTime, setStartTime] = useState<number | null>(null);
	const [elapsedTime, setElapsedTime] = useState<number>(0);

	const toggleIsRunningBenchmark = useCallback(() => {
		if (!isRunningBenchmark) {
			setStartTime(null);
			setElapsedTime(0);
			setChartPoints([]);
			setTotalTaps(0);
			setHasFirstKeypress(false);
		} else {
			setStartTime(null);
		}

		setIsRunningBenchmark(!isRunningBenchmark);
	}, [isRunningBenchmark]);

	function startBenchmark() {
		toggleIsRunningBenchmark();
	}

	// Setting keybinds to default if empty and select new Keybind
	const handleBlur = (e: React.FocusEvent<HTMLInputElement>, defaultValue: string, setValue: React.Dispatch<React.SetStateAction<string>>) => {
		if (e.target.value === "") setValue(defaultValue);
	};
	// Select all when focus
	const handleFocus = (ref: React.RefObject<HTMLInputElement>) => {
		ref.current?.select();
	};

	// Handle timer
	useEffect(() => {
		if (!isRunningBenchmark && !startTime) return
		
		const interval = setInterval(() => {
			const now = Date.now();
			const newElapsedTime = startTime ? _.round((now - startTime) / 1000, 2) : 0;
			setElapsedTime(newElapsedTime);

			if (mode.mode === "seconds" && newElapsedTime >= mode.secondsValue) {
				toggleIsRunningBenchmark();
			}
		}, 16);
		

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [isRunningBenchmark, startTime, mode, toggleIsRunningBenchmark]);

	// Handle BPM calculation
	useEffect(() => {
		if (chartPoints.length > 1 && startTime) {
			const now = Date.now();
			const ms = now - chartPoints[0].timestamp;
			setBPM(_.round(getBpm(chartPoints.length, ms)));
		}
	}, [chartPoints, startTime]);

	const chartPointsRef = useRef(chartPoints);
	chartPointsRef.current = chartPoints;
	// Handle keypress
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Start benchmark with spacebar
			if (e.key === " " && !isRunningBenchmark) {
				toggleIsRunningBenchmark();
				return;
			}

			// Exit if benchmark is not running
			if (!isRunningBenchmark) {
				return;
			}

			// Stop benchmark with Escape
			if (e.key === "Escape") {
				toggleIsRunningBenchmark();
				return;
			}

			// Check if this is one of the configured keys
			const isValidKey = [key1, key2].includes(e.key.toUpperCase());

			// Ignore key repeats (holding key)
			if (e.repeat) {
				return;
			}

			// Only process valid keys
			if (isValidKey) {
				// If this is the first valid keypress, start the timer
				if (!hasFirstKeypress) {
					setStartTime(Date.now());
					setHasFirstKeypress(true);
				}

				const now = Date.now();
				let urValue: number = 0;
				let chartPoint: ChartPoint;

				if (chartPointsRef.current.length === 0) {
					chartPoint = {
						seconds: 0,
						bpm: 0,
						ur: 0,
						key: e.key,
						timestamp: now,
					};
				} else {
					const ms = now - chartPointsRef.current[0].timestamp;
					urValue = getUr([..._.map(chartPointsRef.current, "timestamp"), now]);
					chartPoint = {
						seconds: _.floor(ms / 1000, 1),
						bpm: getBpm(chartPointsRef.current.length, ms),
						ur: urValue,
						key: e.key,
						timestamp: now,
					};
				}

				// Increment tap counter
				setTotalTaps((prevTotal) => {
					const newTotal = prevTotal + 1;
					if (mode.mode === "clicks" && newTotal >= mode.clicksValue) {
						toggleIsRunningBenchmark();
					}
					return newTotal;
				});

				// Setting the information for display
				setUR(urValue);
				setChartPoints((prevChartPoint) => [...prevChartPoint, chartPoint]);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isRunningBenchmark, key1, key2, mode, toggleIsRunningBenchmark, hasFirstKeypress]);

	// Load keybinds from local storage on page load
	useEffect(() => {
		const storedKey1 = localStorage.getItem("key1");
		const storedKey2 = localStorage.getItem("key2");
		const storedMode = localStorage.getItem("benchmarkMode");
		if (storedKey1) setKey1(storedKey1);
		if (storedKey2) setKey2(storedKey2);
		if (storedMode) {
			try {
				const parsedMode = JSON.parse(storedMode);
				if (
					parsedMode &&
					typeof parsedMode.mode === "string" &&
					typeof parsedMode.clicksValue === "number" &&
					typeof parsedMode.secondsValue === "number"
				) {
					setMode(parsedMode);
				}
			} catch (e) {
				console.error("Failed to parse stored benchmark mode: ", e);
			}
		}
	}, []);

	// Save keybinds to local storage whenever they change
	useEffect(() => {
		localStorage.setItem("key1", key1);
		localStorage.setItem("key2", key2);
		localStorage.setItem("benchmarkMode", JSON.stringify(mode));
	}, [key1, key2, mode]);

	return (
		<>
			<div className="mb-12 flex flex-col items-center">
				<section className="relative flex w-full max-w-[1300px] flex-row md:justify-center">
					<h1 className="mt-2 pt-1.5 pl-3 text-2xl font-medium md:text-4xl">osu! Tapping Benchmark</h1>
					<Button
						variant={"ghost"}
						className="absolute top-3 right-3 cursor-pointer"
						onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
					>
						My Stats
					</Button>
				</section>

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

				<section className="section mt-2">
					<div>
						<p>Choose your keybinds:</p>
						<div className="flex flex-row justify-center gap-1">
							<input
								type="text"
								maxLength={2}
								className="input size-9 rounded-md border text-center align-top leading-none caret-transparent"
								value={key1}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKey1((e.target.value.at(-1) || "").toUpperCase())}
								onBlur={(e) => handleBlur(e, "Z", setKey1)}
								onFocus={() => handleFocus(inputRef1)}
								ref={inputRef1}
							/>
							<input
								type="text"
								maxLength={2}
								className="input size-9 rounded-md border text-center align-top leading-none caret-transparent"
								value={key2}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKey2((e.target.value.at(-1) || "").toUpperCase())}
								onBlur={(e) => handleBlur(e, "X", setKey2)}
								onFocus={() => handleFocus(inputRef2)}
								ref={inputRef2}
							/>
						</div>
					</div>
				</section>

				<section className="section mt-12 text-6xl font-bold">
					<div className="flex flex-col items-center">
						<p>{BPM} BPM</p>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										tabIndex={-1}
										onFocus={(e) => e.target.blur()}
										className="text-foreground mt-4 cursor-pointer bg-sky-600 hover:bg-sky-600/75"
										onClick={() => startBenchmark()}
									>
										{isRunningBenchmark ? "Stop Benchmark" : "Start Benchmark"}
									</Button>
								</TooltipTrigger>
								<TooltipContent className="drop-shadow-2xl">
									<span>{isRunningBenchmark ? "Press ESC to cancel" : "Press SPACE to start"}</span>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</section>
				<section className="section mt-20">
					<div className="flex min-w-110 flex-col items-center rounded-md border-1 border-zinc-800 bg-zinc-900 p-2 pt-8">
						<div className="mb-2.5 flex flex-col items-center">
							<div className="relative w-110">
								<p className="absolute right-1/2 -bottom-[1px] pr-2">{totalTaps} taps</p>
								<span className="absolute inset-x-1/2 bottom-0 -translate-x-1/2 transform pr-1">|</span>
								<p className="absolute -bottom-[1px] left-1/2 pl-2">{elapsedTime} seconds</p>
							</div>
							<p className="pl-4.5">{UR} UR</p>
						</div>
						<ChartNSH data={chartPoints.filter((point) => point.ur > 0)} />
					</div>
				</section>
			</div>

			<Button
				className="text-foreground fixed right-2 bottom-2 cursor-pointer rounded-md bg-zinc-800 hover:bg-zinc-800/75"
				onClick={() => window.open("https://github.com/zNyash/osu-stream-benchmark")}
			>
				<FaGithub />
				Repository
			</Button>
		</>
	);
}
