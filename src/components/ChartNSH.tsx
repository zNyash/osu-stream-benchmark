"use client";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { ChartPoint } from "@/app/types/chart-point";

interface ChartNSHProps {
  data: Array<ChartPoint>;
}

export function ChartNSH({ data }: ChartNSHProps) {
  const chartConfig = {
    bpm: {
      label: "BPM",
      color: "green",
    },
    ur: {
      label: "UR",
      color: "yellow",
    },
  } satisfies ChartConfig;

  return (
    <div>
      <ChartContainer
        config={chartConfig}
        className="w- min-w-110 rounded-md border-1 border-zinc-800 bg-zinc-900 p-2"
      >
        <LineChart
          accessibilityLayer
          data={data}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="seconds"
            tickLine={true}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          {/* <YAxis
            dataKey="seconds"
            tickLine={true}
            axisLine={false}
            tickMargin={8}
          /> */}
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey="bpm"
            type="linear"
            stroke={chartConfig.bpm.color}
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="ur"
            type="linear"
            stroke={chartConfig.ur.color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
