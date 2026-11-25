import { useEffect, useMemo, useState } from "react";
import { getUniversities } from "../services/ipeds";
import type { University } from "../types/university";
import type { ComparisonSelection } from "../types/comparison";

interface DirectoryResult {
  year: number;
  universities: University[];
  error: boolean;
}

export function useComparisonUniversities(selections: ComparisonSelection[]) {
  const yearsKey = [...new Set(selections.map(({ year }) => year))]
    .sort((a, b) => a - b)
    .join(",");

  const [directories, setDirectories] = useState<
    Record<number, DirectoryResult>
  >({});

  useEffect(() => {
    if (!yearsKey) return;

    const controller = new AbortController();
    const years = yearsKey.split(",").map(Number);

    for (const year of years) {
      getUniversities(year, controller.signal)
        .then((universities) => {
          if (controller.signal.aborted) return;

          setDirectories((previous) => ({
            ...previous,
            [year]: { year, universities, error: false },
          }));
        })
        .catch(() => {
          if (controller.signal.aborted) return;

          setDirectories((previous) => ({
            ...previous,
            [year]: { year, universities: [], error: true },
          }));
        });
    }

    return () => controller.abort();
  }, [yearsKey]);

  return useMemo(
    () =>
      selections.map((selection) => {
        const directory = directories[selection.year];

        return {
          selection,
          university:
            directory?.universities.find(
              (university) => university.unitid === selection.unitid,
            ) ?? null,
          isLoading: !directory,
          error: directory?.error ?? false,
        };
      }),
    [selections, directories],
  );
}
