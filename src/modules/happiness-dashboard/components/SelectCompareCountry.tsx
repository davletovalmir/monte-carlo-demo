import { cn } from "~lib/utils";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/shared/components/ui/command";
import { useMemo, useState } from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useAtom, useAtomValue } from "jotai";
import {
  compareCountryAtom,
  joinedDatasetAtom,
  targetCountryAtom,
} from "../store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/shared/components/ui/popover";
import { Button } from "~/shared/components/ui/button";

export const SelectCompareCountry = () => {
  const [open, setOpen] = useState(false);
  const [compareCountry, setCompareCountry] = useAtom(compareCountryAtom);

  const dataset = useAtomValue(joinedDatasetAtom);
  const targetCountry = useAtomValue(targetCountryAtom);
  const countries = useMemo(() => {
    return (
      dataset?.data
        .filter((record) => record.Country !== targetCountry)
        .map((record) => record.Country! as string) ?? []
    );
  }, [dataset?.data, targetCountry]);

  if (!dataset || !countries) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          {compareCountry ?? "Select country to compare"}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />

          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            {countries.map((country) => (
              <CommandItem
                key={country}
                value={country}
                onSelect={() => {
                  setCompareCountry(country);
                  setOpen(false);
                }}
                onClick={() => {
                  setCompareCountry(country);
                  setOpen(false);
                }}
              >
                <CheckIcon
                  className={cn(
                    "mr-2 h-4 w-4",
                    country === compareCountry ? "opacity-100" : "opacity-0",
                  )}
                />
                {country}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
