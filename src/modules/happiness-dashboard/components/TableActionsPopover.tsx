import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/shared/components/ui/popover";
import { Button } from "~/shared/components/ui/button";
import { cn } from "~lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import {
  compareCountryAtom,
  compareTwoCountriesDomAtom,
  countryOverviewDomAtom,
  targetCountryAtom,
} from "../store";
import { PopoverPortal } from "@radix-ui/react-popover";

type TableActionsPopoverProps = {
  country: string;
};

export const TableActionsPopover = ({ country }: TableActionsPopoverProps) => {
  const [open, setOpen] = useState(false);
  const setTargetCountry = useSetAtom(targetCountryAtom);
  const countryOverviewDom = useAtomValue(countryOverviewDomAtom);
  const compareTwoCountriesDom = useAtomValue(compareTwoCountriesDomAtom);

  const setCompareCountry = useSetAtom(compareCountryAtom);

  const handleUseClick = () => {
    setTargetCountry(country);
    setOpen(false);

    if (countryOverviewDom) {
      queueMicrotask(() => {
        countryOverviewDom.scrollIntoView({
          block: "start",
          behavior: "smooth",
        });
      });
    }
  };
  const handleCompareClick = () => {
    setCompareCountry(country);
    setOpen(false);

    if (compareTwoCountriesDom) {
      queueMicrotask(() => {
        compareTwoCountriesDom.scrollIntoView({
          block: "start",
          behavior: "smooth",
        });
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="text-left font-semibold text-blue-900 hover:underline">
        {country}
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent
          className={cn(
            "z-20 flex flex-col gap-1 rounded bg-slate-200 p-2",
            "shadow-md",
          )}
          side="right"
          sideOffset={20}
          align="end"
        >
          <div className="w-full text-center font-semibold">{country}</div>
          <Button
            size="default"
            variant="ghost"
            className="justify-start"
            onClick={handleUseClick}
          >
            Use as my country
          </Button>
          <Button
            size="default"
            variant="ghost"
            className="justify-start"
            onClick={handleCompareClick}
          >
            Compare to my country
          </Button>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};
