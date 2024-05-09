import { cn } from "~lib/utils";
import { CountriesMap } from "./components/CountriesMap";
import { useJoinedDataset } from "./hooks/useJoinedDataset";
import { CountryOverview } from "./components/CountryOverview";
import { useSetAtom } from "jotai";
import {
  compareTwoCountriesDomAtom,
  countriesTableDomAtom,
  countryOverviewDomAtom,
} from "./store";
import { CompareCountriesTable } from "./components/CompareCountriesTable";
import { CompareCountriesChart } from "./components/CompareCountriesChart";
import { ExplanationTip } from "./components/ExplanationTip";
import { CompareTwoCountries } from "./components/CompareTwoCountries";

type HappinessDashboardProps = {
  className?: string;
};

export const HappinessDashboard = ({ className }: HappinessDashboardProps) => {
  const joinedDataset = useJoinedDataset();

  const setCountryOverviewDom = useSetAtom(countryOverviewDomAtom);
  const setCountriesTableDom = useSetAtom(countriesTableDomAtom);
  const setCompareTwoCountriesDom = useSetAtom(compareTwoCountriesDomAtom);

  if (!joinedDataset) return null;

  return (
    <div className={cn("bg-main w-full", className)}>
      <ExplanationTip className="px-8 pb-6 pt-10">
        <h1 className="text-2xl font-bold">
          Hello! Ever wondered how happy are people around the world?
        </h1>
        <p>
          Let&apos;s use this simple tool to see how happy are people in your
          country, what might contribute to their happiness, and see how others
          are doing!
        </p>
        <p>
          First, find your your country on the map, or search one. Once you find
          your country, click on it!
        </p>
        <p>
          P.S. Countries are colored according to their happiness score. White
          means we don&apos;t know their score.
        </p>
      </ExplanationTip>

      <CountriesMap />

      <div
        className="flex w-full scroll-mt-16 items-center px-8 py-10"
        ref={setCountryOverviewDom}
      >
        <CountryOverview />
      </div>

      <div className="w-full scroll-mt-16 px-8 py-4" ref={setCountriesTableDom}>
        <CompareCountriesTable />
      </div>

      <div className="w-full px-8 py-10">
        <CompareCountriesChart />
      </div>

      <div
        className="w-full scroll-mt-16 px-8 py-10"
        ref={setCompareTwoCountriesDom}
      >
        <CompareTwoCountries />
      </div>

      <ExplanationTip className="px-8 py-10">
        <h1 className="text-2xl font-bold">And that&apos;s it, my friends!</h1>
        <p>
          I hope you enjoyed this demo app and was able to find some useful
          insighths!
        </p>
        <p>
          For convenience, data is transposed in the visualizations below. And
          table header now sorts the data, not changes the target metric!
        </p>
      </ExplanationTip>

      <div className="w-full py-16 text-center">
        Created by{" "}
        <a
          href="mailto:davletovalmir@gmail.com"
          className="font-semibold hover:underline"
        >
          Almir Davletov
        </a>{" "}
        in May, 2024
      </div>
    </div>
  );
};
