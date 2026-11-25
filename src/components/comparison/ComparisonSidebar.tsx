import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useComparison } from "../../hooks/useComparison";
import { getComparisonKey } from "../../utils/getComparisonKey";
import { MAX_COMPARISON_SELECTIONS } from "../../config/comparison";
import { serializeComparisonSelections } from "../../utils/comparisonParams";

import { useComparisonUniversities } from "../../hooks/useComparisonUniversities";

function ComparisonSidebar() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { selections, removeSelection, clearSelections } = useComparison();
  const results = useComparisonUniversities(selections);

  useEffect(() => {
    dialogRef.current?.close();
  }, [location]);

  function openSidebar() {
    const dialog = dialogRef.current;

    if (!dialog || dialog.open) return;

    dialog.showModal();
    setIsOpen(true);
  }

  function closeSidebar() {
    dialogRef.current?.close();
  }

  function handleCompare() {
    if (selections.length === 0) return;

    const params = new URLSearchParams();

    params.set("items", serializeComparisonSelections(selections));

    closeSidebar();

    navigate({
      pathname: "/compare",
      search: `?${params.toString()}`,
    });
  }

  return (
    <>
      <button
        type="button"
        className="btn comparison-toggle"
        data-variant="secondary"
        aria-haspopup="dialog"
        aria-controls="comparison-sidebar"
        aria-expanded={isOpen}
        onClick={openSidebar}
      >
        Compare ({selections.length})
      </button>

      <dialog
        ref={dialogRef}
        id="comparison-sidebar"
        className="comparison-sidebar"
        aria-labelledby="comparison-sidebar-title"
        onClose={() => setIsOpen(false)}
      >
        <div className="comparison-sidebar-header">
          <h2 id="comparison-sidebar-title">Your Comparisons</h2>

          <button
            type="button"
            className="btn"
            data-variant="ghost"
            onClick={closeSidebar}
            aria-label="Close comparison sidebar"
            autoFocus
          >
            Close
          </button>
        </div>

        <p>
          {selections.length} of {MAX_COMPARISON_SELECTIONS} selected
        </p>

        {selections.length === 0 ? (
          <p>No institutions selected.</p>
        ) : (
          <ul className="comparison-selections">
            {results.map(({ selection, university, isLoading }) => (
              <li key={getComparisonKey(selection)}>
                <div>
                  <strong>
                    {isLoading
                      ? "Loading university..."
                      : (university?.inst_name ??
                        `IPEDS ID: ${selection.unitid}`)}
                  </strong>

                  <p>Reporting year: {selection.year}</p>
                </div>

                <button
                  type="button"
                  className="btn"
                  data-variant="secondary"
                  data-size="sm"
                  onClick={() => removeSelection(selection)}
                  aria-label={`Remove ${university?.inst_name ?? selection.unitid}, ${selection.year}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="comparison-sidebar-actions">
          <button
            type="button"
            className="btn"
            onClick={handleCompare}
          >
            Compare ({selections.length})
          </button>

          <button
            type="button"
            className="btn"
            data-variant="secondary"
            onClick={clearSelections}
          >
            Clear All
          </button>
        </div>
      </dialog>
    </>
  );
}

export default ComparisonSidebar;
