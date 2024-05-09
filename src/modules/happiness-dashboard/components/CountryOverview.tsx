import { useMemo } from "react";
import { cn } from "~lib/utils";
import { FUNNY_NULL } from "../consts";
import { calcTopPercentage, getCountryFlag } from "../utils";
import { Badge } from "~/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import {
  compareFieldAtom,
  countriesTableDomAtom,
  datasetMetadataAtom,
  extremaAtom,
  joinedDatasetAtom,
  targetCountryAtom,
  targetCountryRecordAtom,
} from "../store";
import { useAtom, useAtomValue } from "jotai";
import { ExplanationTip } from "./ExplanationTip";

export const CountryOverview = () => {
  const targetRecord = useAtomValue(targetCountryRecordAtom);
  const targetCountry = useAtomValue(targetCountryAtom);
  const dataset = useAtomValue(joinedDatasetAtom);
  const metricsExtrema = useAtomValue(extremaAtom);
  const metadata = useAtomValue(datasetMetadataAtom);

  const countryMetrics = useMemo(() => {
    if (!targetRecord) return [];

    return Object.entries(targetRecord)
      .filter(([k]) => !["Country", "Happiness Rank"].includes(k))
      .map(([fieldName, value]) => {
        const topPercentage = calcTopPercentage(
          value,
          metricsExtrema[fieldName]?.min,
          metricsExtrema[fieldName]?.max,
          dataset?.metadata?.[fieldName]?.betterWhen,
        );

        return { fieldName, value, topPercentage };
      })
      .toSorted((a, b) => {
        if (a.topPercentage === null || b.topPercentage === null) return 0;
        if (a.topPercentage > b.topPercentage) return 1;
        if (a.topPercentage < b.topPercentage) return -1;
        return 0;
      });
  }, [dataset?.metadata, metricsExtrema, targetRecord]);

  const [compareField, setCompareField] = useAtom(compareFieldAtom);

  const countriesTableDom = useAtomValue(countriesTableDomAtom);

  const handleSelectCompareField = (fieldName: string) => {
    setCompareField(fieldName);
    queueMicrotask(() => {
      countriesTableDom?.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    });
  };

  if (!targetCountry || !targetRecord || !dataset) return null;

  const countryTopPercentage = calcTopPercentage(
    targetRecord["Happiness Rank"],
    metricsExtrema["Happiness Rank"]?.min,
    metricsExtrema["Happiness Rank"]?.max,
    dataset.metadata?.["Happiness Rank"]?.betterWhen,
  );

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center gap-4 overflow-x-auto whitespace-nowrap font-bold">
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg">My country</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl">
            {targetCountry} {getCountryFlag(targetCountry)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg">Happiness Rank</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl">
            {targetRecord["Happiness Rank"]} of{" "}
            {metricsExtrema["Happiness Rank"]?.max}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg">Top Percentage</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl">
            Top {countryTopPercentage}%
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg">Best Metric</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl">
            {countryMetrics[0]?.fieldName}
          </CardContent>
        </Card>
      </div>

      <ExplanationTip className="mb-16">
        <h1 className="text-2xl font-bold">
          Look, your country is in top {countryTopPercentage}% by happiness!
        </h1>
        <p>
          And your country is leading by &quot;{countryMetrics[0]?.fieldName}
          &quot; metric! Let&apos;s see how are we doing on the other metrics
          that might (or not) contribute to the happiness score.
        </p>
        <p>
          Below you will find these metrics (including happiness score) and
          their corresponding min & max values across the whole dataset. Click
          on them!
        </p>
        <p>
          P.S. If you see {FUNNY_NULL} in the values, it means we do not have
          the metric for that country.
        </p>
      </ExplanationTip>

      <div className="grid grid-cols-2 justify-around gap-4 md:grid-cols-3 lg:grid-cols-4">
        {countryMetrics.map(({ fieldName, value, topPercentage }) => {
          return (
            <Card
              key={fieldName}
              className={cn(
                "cursor-pointer",
                "group relative hover:bg-slate-200",
                {
                  "is-active bg-slate-200": compareField === fieldName,
                },
              )}
              onClick={() =>
                value !== null && handleSelectCompareField(fieldName)
              }
            >
              {topPercentage && (
                <Badge
                  className={cn(
                    "absolute -right-2 -top-3 border border-black",
                    {
                      "border-green-700": topPercentage <= 10,
                      "bg-white": topPercentage > 50,
                    },
                  )}
                  variant={
                    topPercentage > 50
                      ? "secondary"
                      : topPercentage > 10
                        ? "default"
                        : "success"
                  }
                >
                  Top {topPercentage}%
                </Badge>
              )}

              <CardHeader className="pb-0 pt-4">
                <CardTitle
                  className={cn(
                    "text-sm font-semibold",
                    "group-hover:border-slate-400 group-[.is-active]:border-slate-400",
                  )}
                >
                  {fieldName}
                </CardTitle>
              </CardHeader>

              <CardContent className="select-text py-1 text-lg font-bold">
                {value ?? FUNNY_NULL}
                {metadata?.[fieldName]?.unit ?? ""}
              </CardContent>

              <CardFooter className="flex w-full justify-between pb-4 text-xs font-semibold">
                <div className="text-red-700">
                  Min: {metricsExtrema[fieldName]?.min}
                  {metadata?.[fieldName]?.unit ?? ""}
                </div>

                <div className="text-green-700">
                  Max: {metricsExtrema[fieldName]?.max}
                  {metadata?.[fieldName]?.unit ?? ""}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
