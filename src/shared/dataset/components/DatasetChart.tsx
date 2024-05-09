import { useDataset, DataChart, type ChartConfig } from "../index";

type DatasetChartProps = {
  datasetName: string;
  chartConfig: ChartConfig;
};

export const DatasetChart = ({
  datasetName,
  chartConfig,
}: DatasetChartProps) => {
  const { data: dataset, error } = useDataset(datasetName);

  if (error)
    return <div className="text-red">Dataset not found: {datasetName}</div>;

  if (!dataset) return null;

  return (
    <DataChart dataset={dataset} config={chartConfig} className="h-[500px]" />
  );
};
