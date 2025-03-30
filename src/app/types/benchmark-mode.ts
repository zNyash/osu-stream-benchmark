export type BenchmarkMode = "clicks" | "seconds"
export interface BenchmarkConfig {
  mode: BenchmarkMode;
  clicksValue: number;
  secondsValue: number
}
