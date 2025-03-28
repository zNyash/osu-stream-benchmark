// I want to make sure it is easy to follow the calculations so im commenting this
// This is here to help me (and anyone else) understand better the calculations
// To better understanding of how standard deviation works: https://www.youtube.com/watch?v=ApT_UJfIeA

import _ from "lodash";

function getUr(chartPointTimestamps: number[]): number {
	// Ensure there are enough taps to calculate UR
	if (chartPointTimestamps.length < 3) {
		return 0;
	}

	// Calculate the intervals (time differences) between consecutive taps
	// For example, if the timestamps are [100, 300, 500], the intervals will be [200, 200].
	const intervals = chartPointTimestamps.slice(1).map((timestamp, i) => timestamp - chartPointTimestamps[i]);

	// Calculate the average interval (mean). This gives the "expected" time between taps.
	const avgInterval = _.mean(intervals);

	// Calculate absolute deviations from the average interval
	// For example, if avgInterval is 200ms and intervals are [200, 150, 250], the absolute deviations will be [0, 50, 50].
	const absoluteDeviations = intervals.map((interval) => Math.abs(interval - avgInterval));

	// Calculate the Mean Absolute Deviation (MAD). This represents the average timing error between taps.
	const meanAbsoluteDeviation = _.mean(absoluteDeviations);

	// Return the Mean Absolute Deviation as the Unstable Rate, rounded to 2 decimal places.
	return _.round(meanAbsoluteDeviation * 10, 2);
}

function getBpm(clicks: number, ms: number): number {
	// Figuring out how many taps happen per second
	const tapsPerSecond = clicks / (ms / 1000);

	// Converting that to BPM and divide by 4 (streams on osu are usually 4 notes per beat so)
	const result = _.round((tapsPerSecond * 60) / 4, 2);
	return result;
}

export { getBpm, getUr };
