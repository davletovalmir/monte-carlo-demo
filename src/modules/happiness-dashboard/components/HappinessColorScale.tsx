import { type PropsWithChildren } from "react";
import { cn } from "~/lib/utils";

const SideLabel = ({ children }: PropsWithChildren) => {
  return (
    <div className="mx-2 mt-0.5 flex-1 self-start text-center text-xs font-semibold">
      {children}
    </div>
  );
};

type HappinessColorScaleProps = {
  max: number;
  className?: string;
};

export const HappinessColorScale = ({
  className,
  max,
}: HappinessColorScaleProps) => {
  const getColor = (number: number) => {
    if (number === null) {
      return "#fff";
    }
    const scaledNumber = Math.min(Math.max(number, 0), 10);
    const hue = (scaledNumber / 10) * 120;
    return `hsl(${hue}, 100%, 50%)`;
  };

  const scaleItems = Array.from({ length: max + 1 }, (_, i) => i);

  return (
    <div className={cn("flex items-center", className)}>
      <SideLabel>Unhappy</SideLabel>

      {scaleItems.map((item) => (
        <div key={item} className="w-5">
          <div
            className="h-5 w-5"
            style={{
              backgroundColor: getColor(item),
            }}
          />
          <div className="mt-1 w-5 text-center text-xs font-semibold">
            {item}
          </div>
        </div>
      ))}

      <SideLabel>Happy</SideLabel>
    </div>
  );
};
