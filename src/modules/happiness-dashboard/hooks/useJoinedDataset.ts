import {
  type Dataset,
  findJoinableDatasets,
  joinDatasets,
  useDataset,
} from "~/shared/dataset";
import { useEffect, useState } from "react";
import { useToast } from "~/shared/components/ui/use-toast";
import { useAtom } from "jotai";
import { joinedDatasetAtom } from "../store";

export const useJoinedDataset = () => {
  const { toast } = useToast();

  const { data: happinessDataset } = useDataset("World Happiness");
  const { data: dietDataset } = useDataset("Healthy Diet");
  const { data: internetDataset } = useDataset("Internet Speed");

  const [joinedDataset, setJoinedDataset] = useAtom(joinedDatasetAtom);
  const [joinError, setJoinError] = useState<string>();

  useEffect(() => {
    if (!happinessDataset || !dietDataset || !internetDataset) {
      return;
    }

    const joinableDatasets = findJoinableDatasets(happinessDataset, [
      dietDataset,
      internetDataset,
    ]);
    let resultingDataset = happinessDataset;
    for (const joinableDataset of joinableDatasets) {
      const joinedDataset = joinDatasets({
        name: `${resultingDataset.name} / ${joinableDataset.name}`,
        firstDataset: resultingDataset,
        firstSelectKeys: Object.keys(resultingDataset.schema),
        secondDataset: joinableDataset as Dataset,
        secondSelectKeys: Object.keys(joinableDataset.schema),
        joinKeys: joinableDataset.joinKeys,
        includeMissingKeys: true,
      });
      if (!joinedDataset) {
        setJoinError("Could not join datasets");
        return;
      }
      resultingDataset = joinedDataset;
    }

    setJoinedDataset(resultingDataset);
  }, [dietDataset, happinessDataset, internetDataset, setJoinedDataset]);

  useEffect(() => {
    if (!joinError) return;

    toast({
      title: "Error joining datasets",
      description: joinError,
      variant: "destructive",
    });
  }, [joinError, toast]);

  return joinedDataset;
};
