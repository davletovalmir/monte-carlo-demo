import { cn } from "~lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/shared/components/ui/dialog";
import { Button } from "~/shared/components/ui/button";
import { deleteDatasetFromDB } from "~/shared/dataset/indexed-db";
import { useCustomDatasetSetters } from "../store";

type DeleteDatasetModalProps = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  datasetName?: string;
};

export const DeleteDatasetModal = ({
  open,
  onOpenChange,
  datasetName,
}: DeleteDatasetModalProps) => {
  const { deleteCustomDataset } = useCustomDatasetSetters();
  const handleDelete = async () => {
    if (datasetName) {
      await deleteDatasetFromDB(datasetName);
      deleteCustomDataset(datasetName);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("w-full", "flex-wrap overflow-auto")}>
        <DialogHeader>
          <DialogTitle className="text-red-600">
            Delete {datasetName}
          </DialogTitle>
        </DialogHeader>

        <p className="font-semibold">
          Are you sure you want to delete {datasetName}?
        </p>

        <p>
          This operation is irreversible, and we do not clean up dependencies.
          It will likely break the page.
        </p>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>

          <Button onClick={handleDelete} variant="destructive">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
