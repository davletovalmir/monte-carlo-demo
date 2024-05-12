import React, { useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Rectangle,
  AreaChart,
  Area,
} from "recharts";

import {
  type Dataset,
  type FilterState,
  filterDataset,
  type DatasetRecord,
  calcExtrema,
} from "~/shared/dataset";

const colors: { main: string; hover: string }[] = [
  { main: "#06C", hover: "#004B95" },
  { main: "#4CB140", hover: "#38812F" },
  { main: "#FF6384", hover: "#FF758A" },
  { main: "#9F98FF", hover: "#B0A8FF" },
  { main: "#FDB45C", hover: "#FFBE69" },
  { main: "#97BBCD", hover: "#A7C7DD" },
  { main: "#C9CBFF", hover: "#DAD8FF" },
  { main: "#4BC0C0", hover: "#53CDCD" },
  { main: "#FFCD56", hover: "#FFD86D" },
  { main: "#FF9F40", hover: "#FFA755" },
  { main: "#9966FF", hover: "#AA7CFF" },
  { main: "#4BC0C0", hover: "#53CDCD" },
  { main: "#FFCE56", hover: "#FFD66D" },
  { main: "#36A2EB", hover: "#49B0EB" },
  { main: "#FF6384", hover: "#FF758A" },
  { main: "#49E2A0", hover: "#5BEFB1" },
];

export type ChartConfig = {
  type: "line" | "area" | "bar";
  xField: string;
  yFields: string[];
  filters?: FilterState;
};

const renderChartElement = (
  chartType: ChartConfig["type"],
  field: string,
  idx: number,
) => {
  if (chartType === "line") {
    return (
      <Line
        type="monotone"
        key={"line-" + field + idx}
        dataKey={field}
        stroke={colors[idx]?.main}
        strokeWidth={3}
        dot={{ stroke: colors[idx]?.main, fill: "white", strokeWidth: 2, r: 5 }}
      />
    );
  }

  if (chartType === "area") {
    return (
      <React.Fragment key={"area-" + field + idx}>
        <Area
          type="monotone"
          dataKey={field}
          stroke={colors[idx]?.main}
          strokeWidth={3}
          fillOpacity={1}
          fill={`url(#colorUv-${idx})`}
          dot={{
            stroke: colors[idx]?.main,
            fill: "white",
            strokeWidth: 2,
            r: 5,
          }}
        />
        <defs>
          <linearGradient id={`colorUv-${idx}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[idx]?.main} stopOpacity={0.7} />
            <stop offset="95%" stopColor={colors[idx]?.main} stopOpacity={0} />
          </linearGradient>
        </defs>
      </React.Fragment>
    );
  }

  if (chartType === "bar") {
    return (
      <Bar
        key={"bar-" + field + idx}
        dataKey={field}
        fill={colors[idx]?.main}
        activeBar={<Rectangle fill={colors[idx]?.hover} />}
      />
    );
  }
};

const normalizeData = (records: DatasetRecord[], fields: string[]) => {
  const extrema = calcExtrema(records, fields);

  return records.map((item) => {
    const newItem: DatasetRecord = { ...item };
    fields.forEach((field) => {
      const { min, max } = extrema[field] ?? {};
      const val = item[field];
      if (min === undefined || max === undefined || typeof val !== "number")
        return;

      const range = max - min;
      newItem[field + "Orig"] = val;
      newItem[field] = range !== 0 ? (val - min) / range : 0;
    });

    return newItem;
  });
};

type DataChartProps = {
  dataset: Dataset;
  config: ChartConfig;
  normalize?: boolean;
  className?: string;
};

export const DataChart = ({
  dataset,
  config,
  normalize,
  className,
}: DataChartProps) => {
  const { type: chartType, filters, xField, yFields } = config;
  const records = useMemo(() => {
    if (!filters) return dataset.data;
    const filtered = filterDataset(dataset, filters);
    return filtered.data;
  }, [filters, dataset]);

  const normalizedRecords = useMemo(() => {
    if (normalize) return normalizeData(records, yFields);
    return records;
  }, [normalize, records, yFields]);

  const formatTooltip = useCallback(
    (value: number, name: string, item: { payload?: DatasetRecord }) => {
      if (normalize) return item.payload?.[name + "Orig"];
      return value;
    },
    [normalize],
  );

  const Chart = useMemo(() => {
    if (chartType === "line") return LineChart;
    if (chartType === "area") return AreaChart;
    if (chartType === "bar") return BarChart;
    return LineChart;
  }, [chartType]);

  return (
    <div className={className}>
      <ResponsiveContainer className="h-full w-full">
        <Chart
          width={500}
          height={300}
          data={normalizedRecords}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xField} />
          <YAxis />
          <Tooltip formatter={formatTooltip} />
          <Legend />
          {yFields.map((field, idx) =>
            renderChartElement(chartType, field, idx),
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
};
