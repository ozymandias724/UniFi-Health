import { useComparison } from "../../hooks/useComparison";
import { getComparisonKey } from "../../utils/getComparisonKey";
import { MAX_COMPARISON_SELECTIONS } from "../../config/comparison";
import type { ComparisonSelection } from "../../types/comparison";

function AddToCompareButton({ unitid, year }: ComparisonSelection) {
  const { selections, addSelection, removeSelection } = useComparison();

  const selection = { unitid, year };
  const key = getComparisonKey(selection);

  const isSelected = selections.some((item) => getComparisonKey(item) === key);

  const isFull = selections.length >= MAX_COMPARISON_SELECTIONS;

  return (
    <button
      type="button"
      className="btn add-to-compare-button"
      data-variant="secondary"
      aria-pressed={isSelected}
      disabled={!isSelected && isFull}
      onClick={() => {
        if (isSelected) {
          removeSelection(selection);
        } else {
          addSelection(selection);
        }
      }}
    >
      {isSelected
        ? "Added to Compare"
        : isFull
          ? "Comparison Limit Reached"
          : "Add to Compare"}
    </button>
  );
}

export default AddToCompareButton;
