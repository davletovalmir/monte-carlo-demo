import { cn } from "~lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/shared/components/ui/dialog";
import { type PropsWithChildren, useEffect, useMemo, useState } from "react";
import {
  useDataset,
  useDatasetSchemas,
  findJoinableDatasets,
  type JoinableDataset,
  joinDatasets,
} from "~/shared/dataset";
import { DataTable } from "~/shared/dataset/components/DataTable";
import { useToast } from "~/shared/components/ui/use-toast";
import { Button } from "~/shared/components/ui/button";
import { saveDatasetInDB } from "~/shared/dataset/indexed-db";
import { useCustomDatasetSetters } from "../store";

const Label = ({ children }: PropsWithChildren) => {
  return (
    <label
      className={cn(
        "flex flex-nowrap items-center gap-1",
        "cursor-pointer select-none rounded px-1 py-0.5 hover:bg-slate-300",
      )}
    >
      {children}
    </label>
  );
};

type CheckableField = {
  name: string;
  on: boolean;
};

type JoinWithTableModalProps = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  datasetName?: string;
};

export const JoinWithTableModal = ({
  open,
  onOpenChange,
  datasetName,
}: JoinWithTableModalProps) => {
  const { toast } = useToast();

  const { data: targetDataset } = useDataset(datasetName);
  const { data: schemas } = useDatasetSchemas();

  const joinableDatasets = useMemo(() => {
    if (!targetDataset || !schemas) return [];

    return findJoinableDatasets(targetDataset, schemas);
  }, [targetDataset, schemas]);

  const [selectedDataset, setSelectedDataset] = useState<JoinableDataset>();
  const { data: otherDataset } = useDataset(selectedDataset?.name);

  const [targetFields, setTargetFields] = useState<CheckableField[]>([]);
  const toggleTargetField = (fieldName: string) => {
    setTargetFields((prev) =>
      prev.map((f) => (f.name === fieldName ? { ...f, on: !f.on } : f)),
    );
  };
  const targetFieldNames = useMemo(() => {
    return targetFields.filter((f) => f.on).map((f) => f.name);
  }, [targetFields]);

  const [otherFields, setOtherFields] = useState<CheckableField[]>([]);
  const toggleOtherField = (fieldName: string) => {
    setOtherFields((prev) =>
      prev.map((f) => (f.name === fieldName ? { ...f, on: !f.on } : f)),
    );
  };
  const otherFieldNames = useMemo(() => {
    return otherFields.filter((f) => f.on).map((f) => f.name);
  }, [otherFields]);

  const [joinKeys, setJoinKeys] = useState<CheckableField[]>([]);
  const toggleJoinKey = (fieldName: string) => {
    setJoinKeys((prev) =>
      prev.map((f) => (f.name === fieldName ? { ...f, on: !f.on } : f)),
    );
  };
  const joinKeyNames = useMemo(() => {
    return joinKeys.filter((f) => f.on).map((f) => f.name);
  }, [joinKeys]);

  // Set initial fields and keys
  useEffect(() => {
    if (targetDataset) {
      setTargetFields(
        Object.keys(targetDataset.schema).map((name) => ({ name, on: true })),
      );
    }
    if (selectedDataset) {
      setOtherFields(
        Object.keys(selectedDataset.schema).map((name) => ({
          name,
          on: true,
        })),
      );
      setJoinKeys(selectedDataset.joinKeys.map((name) => ({ name, on: true })));
    }
  }, [targetDataset, selectedDataset]);

  // deselect fields from join keys
  useEffect(() => {
    setTargetFields((prev) => {
      return prev.map((f) =>
        joinKeyNames.includes(f.name) ? { ...f, on: false } : f,
      );
    });
    setOtherFields((prev) => {
      return prev.map((f) =>
        joinKeyNames.includes(f.name) ? { ...f, on: false } : f,
      );
    });
  }, [joinKeyNames]);

  const selectedFieldNames = useMemo(() => {
    return [
      ...new Set([...joinKeyNames, ...targetFieldNames, ...otherFieldNames]),
    ];
  }, [targetFieldNames, otherFieldNames, joinKeyNames]);

  const [title, setTitle] = useState("Example name");

  const newDataset = useMemo(() => {
    if (!targetDataset || !otherDataset) return null;

    return joinDatasets({
      name: title,
      firstDataset: targetDataset,
      firstSelectKeys: targetFieldNames,
      secondDataset: otherDataset,
      secondSelectKeys: otherFieldNames,
      joinKeys: joinKeyNames,
    });
  }, [
    title,
    targetDataset,
    targetFieldNames,
    otherDataset,
    otherFieldNames,
    joinKeyNames,
  ]);

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    setSelectedDataset(undefined);
  };

  const { addCustomDataset } = useCustomDatasetSetters();

  const createJointDataset = async () => {
    if (!newDataset) return;

    try {
      await saveDatasetInDB(newDataset);
      addCustomDataset(newDataset.name);
      toast({ description: "Created joint dataset" });
      handleOpenChange(false);
    } catch (e) {
      toast({ description: String(e), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "h-full max-h-[90vh] w-full max-w-[80vw]",
          "flex flex-col items-start",
        )}
      >
        <DialogHeader>
          <DialogTitle>Create joint dataset</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            "w-full overflow-auto",
            "flex flex-1 flex-col items-start gap-2",
          )}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dataset name"
            className="h-7 w-full rounded border-2 border-slate-700 px-1 text-base"
          />

          <div className="flex w-full items-center gap-4 border-b pb-1">
            <div className="font-semibold">Join {datasetName} with:</div>
            <select
              className="cursor-pointer rounded"
              onChange={(e) => {
                const dataset = joinableDatasets.find(
                  (d) => d.name === e.target.value,
                );
                if (!dataset) return;
                setSelectedDataset(dataset);
              }}
              defaultValue=""
            >
              <option disabled value="">
                Select dataset
              </option>

              {joinableDatasets.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {selectedDataset && joinKeys && (
            <div className="flex w-full flex-wrap gap-2 border-b pb-1">
              <div className="font-semibold">Join Keys:</div>
              {joinKeys.map((field) => (
                <Label key={"join-" + field.name}>
                  <input
                    type="checkbox"
                    checked={field.on}
                    onChange={() => toggleJoinKey(field.name)}
                    disabled={field.on && joinKeyNames.length === 1}
                  />
                  {field.name}
                </Label>
              ))}
            </div>
          )}

          <div className="flex w-full flex-wrap items-center gap-2 border-b pb-1">
            <div className="font-semibold">{datasetName} Fields:</div>
            {targetFields.map((field) => (
              <Label key={"target-" + field.name}>
                <input
                  type="checkbox"
                  checked={field.on}
                  onChange={() => toggleTargetField(field.name)}
                  disabled={
                    !!joinKeyNames.find((k) => k === field.name) ||
                    !!otherFieldNames.find((k) => k === field.name)
                  }
                />
                {field.name}
              </Label>
            ))}
          </div>

          {selectedDataset && (
            <div className="flex w-full flex-wrap gap-2">
              <div className="font-semibold">
                {selectedDataset?.name} Fields:
              </div>
              {otherFields.map((field) => (
                <Label key={"other-" + field.name}>
                  <input
                    type="checkbox"
                    checked={field.on}
                    onChange={() => toggleOtherField(field.name)}
                    disabled={
                      !!joinKeyNames.find((k) => k === field.name) ||
                      !!targetFieldNames.find((k) => k === field.name)
                    }
                  />
                  {field.name}
                </Label>
              ))}
            </div>
          )}

          <div className="relative w-full overflow-x-auto">
            {newDataset && (
              <DataTable
                dataset={newDataset}
                columnNames={selectedFieldNames}
                filterable={false}
              />
            )}
          </div>
        </div>

        <DialogFooter className="z-[2] w-full bg-white">
          <Button onClick={() => handleOpenChange(false)} variant="outline">
            Cancel
          </Button>

          <Button onClick={createJointDataset}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
