// Gonna comment this thing cuz i easily get lost with this logic holy shit...
// I know it looks dumb its just to make my smooth brain understands...
import _ from "lodash";

function getUr(chartPointTimestamps: number[]): number {
	if (chartPointTimestamps.length < 3) {
		return 0;
	}
	// Storage the >differece< in ms between two intervals for each index on the array passed to the function.
	const intervals = [];
	for (let i = 1; i < chartPointTimestamps.length; i++) {
		intervals.push(chartPointTimestamps[i] - chartPointTimestamps[i - 1]);
	}

	// Fancy way to sum all number in the intervals array and divide by its leght to get the average.
	const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
	// Calculating the timing error, basically if avgInterval is 200ms and intervals are [200, 150, 250] so the deviations would be [0, -50, 50].
	const deviations = intervals.map((interval) => interval - avgInterval);
	// This is basically just the rest of the calculation for the standard deviation. check this to understand better: https://www.youtube.com/watch?v=ApT_UJfIeAc
	const variance = deviations.reduce((sum, deviation) => sum + Math.pow(deviation, 2), 0) / (intervals.length * 4);
	const standardDeviation = Math.sqrt(variance);

	return _.round(standardDeviation * 10, 2);
}

function getBpm(clicks: number, ms: number): number {
	const tapsPerSecond = clicks / (ms / 1000);
	const result = _.round((tapsPerSecond * 60) / 4, 2);
	return result;
}

export { getBpm, getUr };
