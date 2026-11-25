import { useState, useEffect, type ReactNode } from "react";
import { ComparisonContext } from "./ComparisonContext";
import {
  MAX_COMPARISON_SELECTIONS,
  COMPARISON_STORAGE_KEY,
} from "../config/comparison";
import { getComparisonKey } from "../utils/getComparisonKey";
import {
  parseComparisonSelections,
  serializeComparisonSelections,
} from "../utils/comparisonParams";
import type { ComparisonSelection } from "../types/comparison";

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selections, setSelections] = useState<ComparisonSelection[]>(() => {
    try {
      return parseComparisonSelections(
        localStorage.getItem(COMPARISON_STORAGE_KEY),
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (selections.length === 0) {
        localStorage.removeItem(COMPARISON_STORAGE_KEY);
      } else {
        localStorage.setItem(
          COMPARISON_STORAGE_KEY,
          serializeComparisonSelections(selections),
        );
      }
    } catch {
      // Comparisons remain available in memory.
    }
  }, [selections]);

  function addSelection(selection: ComparisonSelection) {
    setSelections((previous) => {
      if (previous.length >= MAX_COMPARISON_SELECTIONS) {
        return previous;
      }

      const key = getComparisonKey(selection);

      if (previous.some((item) => getComparisonKey(item) === key)) {
        return previous;
      }

      return [...previous, selection];
    });
  }

  function removeSelection(selection: ComparisonSelection) {
    const key = getComparisonKey(selection);

    setSelections((previous) =>
      previous.filter((item) => getComparisonKey(item) !== key),
    );
  }

  function clearSelections() {
    setSelections([]);
  }

  return (
    <ComparisonContext.Provider
      value={{
        selections,
        addSelection,
        removeSelection,
        clearSelections,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}
