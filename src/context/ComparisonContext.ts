import { createContext } from "react";
import type { ComparisonSelection } from "../types/comparison";

interface ComparisonContextValue {
  selections: ComparisonSelection[];
  addSelection: (selection: ComparisonSelection) => void;
  removeSelection: (selection: ComparisonSelection) => void;
  clearSelections: () => void;
}

export const ComparisonContext =
  createContext<ComparisonContextValue | null>(null);