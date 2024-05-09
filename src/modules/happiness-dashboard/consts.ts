import type { ChartConfig } from "~/shared/dataset";

export const FUNNY_NULL = "¯\\_(ツ)_/¯";
export const CHART_TYPES = [
  {
    type: "line",
    title: "Line Chart",
  },
  {
    type: "area",
    title: "Area Chart",
  },
  {
    type: "bar",
    title: "Bar Chart",
  },
] as { type: ChartConfig["type"]; title: string }[];
