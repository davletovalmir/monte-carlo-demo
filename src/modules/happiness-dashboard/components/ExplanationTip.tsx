import { type ReactNode } from "react";
import { cn } from "~lib/utils";

type ExplanationTipProps = {
  className?: string;
  children: ReactNode;
};

export const ExplanationTip = ({
  className,
  children,
}: ExplanationTipProps) => {
  return (
    <div
      className={cn(
        "relative space-y-2 border-y border-slate-300 py-4 leading-8",
        className,
      )}
    >
      {children}
    </div>
  );
};
