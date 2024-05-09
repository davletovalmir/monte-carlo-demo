import { cn } from "~lib/utils";
import { Button } from "./ui/button";
import Link from "next/link";
import { useRouter } from "next/router";

type NavbarProps = {
  className?: string;
};

const paths = [
  { path: "/", title: "Happiness Dashboard" },
  { path: "/custom-dashboard", title: "Custom Dashboard" },
];

export const Navbar = ({ className }: NavbarProps) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-slate-600 text-white",
        "h-16 w-full px-4",
        "sticky top-0 z-20",
        className,
      )}
    >
      <div className="mr-4 text-xl font-bold">Data is fun!</div>

      {paths.map(({ path, title }) => (
        <Button
          key={path}
          variant="ghost"
          className={cn("hover:bg-slate-500 hover:text-white", {
            "bg-slate-500": router.pathname === path,
          })}
          asChild
        >
          <Link href={path}>{title}</Link>
        </Button>
      ))}
    </div>
  );
};
