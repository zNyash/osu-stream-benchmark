"use client";
import { GithubButton } from "../components/GithubButton";
import { ModeSelector } from "../components/ModeSelector";
import { Header } from "../components/Header";
import { ChartPoint } from "@/app/types/chart-point";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChartNSH } from "@/components/ChartNSH";
import { getBpm, getUr } from "../helpers/osuCalc";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
		if (!isRunningBenchmark && !startTime) return;

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

	// Tap processing function
	const handleTap = useCallback(
		(inputType: "key" | "mouse", identifier: string | number) => {
			if (!hasFirstKeypress) {
				setStartTime(Date.now());
				setHasFirstKeypress(true);
			}

			const now = Date.now();
			let urValue = 0;
			let chartPoint;

			const currentChartPoints = chartPointsRef.current;
			const firstTimestamp = currentChartPoints.length > 0 ? currentChartPoints[0].timestamp : now;

			if (currentChartPoints.length === 0) {
				chartPoint = {
					seconds: 0,
					bpm: 0,
					ur: 0,
					key: String(identifier),
					timestamp: now,
				};
			} else {
				const allTimestamps = [..._.map(currentChartPoints, "timestamp"), now];
				const msSinceFirstTap = now - firstTimestamp;

				urValue = getUr(allTimestamps);
				chartPoint = {
					seconds: _.floor(msSinceFirstTap / 1000, 1),
					bpm: getBpm(currentChartPoints.length + 1, msSinceFirstTap),
					ur: urValue,
					key: String(identifier),
					timestamp: now,
				};
			}

			setTotalTaps((prevTotal) => {
				const newTotal = prevTotal + 1;
				if (mode.mode === "clicks" && newTotal >= mode.clicksValue) {
					setIsRunningBenchmark(false);
					setStartTime(null);
				}
				return newTotal;
			});

			setUR(urValue);
			setChartPoints((prevChartPoints) => [...prevChartPoints, chartPoint]);
		},
		[hasFirstKeypress, mode.mode, mode.clicksValue],
	);

	// Handle keypress
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === " " && !isRunningBenchmark) {
				toggleIsRunningBenchmark();
				return;
			}

			if (!isRunningBenchmark) return;

			if (e.key === "Escape") {
				toggleIsRunningBenchmark();
				return;
			}

			const upperCaseKey = e.key.toUpperCase();
			const isValidKey = [key1, key2].includes(upperCaseKey);

			if (e.repeat) return;

			if (isValidKey) {
				handleTap("key", upperCaseKey);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isRunningBenchmark, key1, key2, toggleIsRunningBenchmark, handleTap]);

	// Handle mouse clicks
	useEffect(() => {
		const handleMouseDown = (e: MouseEvent) => {
			if (!isRunningBenchmark) return;

			if (e.button === 0 || e.button === 2) {
				e.preventDefault();
				handleTap("mouse", e.button);
			}
		};

		const handleContextMenu = (e: MouseEvent) => {
			if (isRunningBenchmark) {
				e.preventDefault();
			}
		};

		window.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("contextmenu", handleContextMenu);

		return () => {
			window.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("contextmenu", handleContextMenu);
		};
	}, [isRunningBenchmark, handleTap]);

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
				<Header />

				<ModeSelector mode={mode} handleValueChange={handleValueChange} Number={Number} handleModeChange={handleModeChange} />

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

			<GithubButton />
		</>
	);
}
