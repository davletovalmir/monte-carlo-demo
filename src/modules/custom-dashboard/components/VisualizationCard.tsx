import { useDatasetVisSetters } from "../store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { useState, type PropsWithChildren } from "react";
import { Button } from "~/shared/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/shared/components/ui/popover";

export const VisualizationCard = ({
  name,
  children,
}: PropsWithChildren & { name: string }) => {
  const { removeVisualization } = useDatasetVisSetters();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const handleDelete = () => {
    removeVisualization(name);
    setDeleteOpen(false);
  };

  return (
    <Card key={name} className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between px-2 text-lg font-semibold">
          {name}

          <Popover open={deleteOpen} onOpenChange={setDeleteOpen}>
            <PopoverTrigger asChild className="font-semibold">
              <Button variant="ghost" size="sm">
                Delete
              </Button>
            </PopoverTrigger>

            <PopoverContent
              side="left"
              sideOffset={20}
              className="flex w-auto items-center justify-end gap-2"
            >
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>

              <Button size="sm" onClick={handleDelete}>
                Yes, delete
              </Button>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
};
