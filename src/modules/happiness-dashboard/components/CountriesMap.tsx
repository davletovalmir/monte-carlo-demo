import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup as ZoomableGroupOrig,
  type ZoomableGroupProps,
} from "react-simple-maps";
import { cn } from "~/lib/utils";
import { GEO_URL, type GeoFeature } from "~/shared/geo";
import { HappinessColorScale } from "./HappinessColorScale";
import { generateHappinessColor } from "../utils";
import { type HappinessScoreByCountry } from "../types";
import { useAtomValue, useSetAtom } from "jotai";
import {
  countryOverviewDomAtom,
  joinedDatasetAtom,
  targetCountryAtom,
} from "../store";

const ZoomableGroup = ZoomableGroupOrig as React.FC<
  ZoomableGroupProps & { ref: RefObject<SVGElement> }
>;

export const CountriesMap = () => {
  const dataset = useAtomValue(joinedDatasetAtom);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const setCountry = useSetAtom(targetCountryAtom);
  const countryOverviewDom = useAtomValue(countryOverviewDomAtom);

  const handleSelectCountry = (selectedCountry: string) => {
    setCountry(selectedCountry);
    queueMicrotask(() => {
      countryOverviewDom?.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    });
  };

  const happinessScoreByCountry = useMemo(() => {
    if (!dataset) return new Map<string, number | null>();

    const data = dataset.data as HappinessScoreByCountry[];
    const query = searchQuery.toLowerCase();

    const filtered =
      searchQuery === ""
        ? data
        : data.filter(({ Country }) => Country.toLowerCase().includes(query));

    return new Map<string, number | null>(
      filtered.map((d) => [d.Country, d["Happiness Score"]]),
    );
  }, [dataset, searchQuery]);

  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipCoords, setTooltipCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handleMouseEnter = (
    geo: GeoFeature,
    { x, y }: { x: number; y: number },
  ) => {
    const { name } = geo.properties;
    setTooltipContent(name);
    setTooltipCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
  };

  const zoomableGroupDom = useRef<SVGElement>(null);

  useEffect(() => {
    const geographyEl = zoomableGroupDom.current;
    const emptyZoneEl = geographyEl?.previousElementSibling as SVGElement;
    if (!geographyEl || !emptyZoneEl) return;

    function handleZoom(event: WheelEvent) {
      if (!(event.metaKey || event.ctrlKey)) {
        event.stopPropagation();
      }
    }

    geographyEl.addEventListener("wheel", handleZoom, { passive: false });
    emptyZoneEl.addEventListener("wheel", handleZoom, { passive: false });

    return () => {
      geographyEl.removeEventListener("wheel", handleZoom);
      emptyZoneEl.removeEventListener("wheel", handleZoom);
    };
  }, []);

  if (!dataset) return null;

  return (
    <div>
      <div className="relative z-10 flex w-full items-center justify-center border-b border-blue-500 py-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "mb-6 mt-4 w-[40%] min-w-60 rounded-lg px-6 py-4",
            "bg-white/90 shadow-md focus:outline-0",
          )}
          placeholder="Search your country..."
        />

        <div className="absolute -bottom-10 left-0 p-2 text-sm font-semibold">
          CMD + scroll to Zoom In
        </div>

        {tooltipContent && (
          <div
            className={cn(
              "pointer-events-none fixed z-20",
              "border-2 border-slate-700 bg-slate-50",
              "rounded px-2 py-1 text-sm font-semibold",
            )}
            style={{
              top: tooltipCoords.y,
              left: tooltipCoords.x,
            }}
          >
            {tooltipContent}
          </div>
        )}

        <HappinessColorScale max={10} className="absolute -bottom-12 right-0" />
      </div>

      <div className="relative bg-blue-400">
        <ComposableMap
          width={800}
          height={500}
          projectionConfig={{
            center: [0, 10],
          }}
        >
          <ZoomableGroup ref={zoomableGroupDom}>
            <Geographies
              geography={GEO_URL}
              parseGeographies={(geos) => {
                return geos.filter((g) => {
                  return happinessScoreByCountry.has(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    g.properties?.name as string,
                  );
                });
              }}
            >
              {({ geographies }: { geographies: GeoFeature[] }) =>
                geographies.map((geo) => {
                  const score = happinessScoreByCountry.get(
                    geo.properties.name,
                  );
                  if (score === undefined) return null;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={generateHappinessColor(score)}
                      stroke="#6aa2e7"
                      style={{
                        default: { outline: "none" },
                        hover: {
                          fill: "#0059ff",
                          outline: "none",
                        },
                        pressed: { fill: "#E42", outline: "none" },
                      }}
                      onClick={() => handleSelectCountry(geo.properties.name)}
                      onMouseEnter={(e) => {
                        handleMouseEnter(geo, {
                          x: e.clientX,
                          y: e.clientY - 50,
                        });
                      }}
                      onMouseLeave={handleMouseLeave}
                      className="cursor-pointer"
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
};
