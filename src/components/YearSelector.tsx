import { useReportingYear } from "../hooks/useReportingYear";
import { SUPPORTED_YEARS } from "../config/reportingYears";

import "../styles/year-selector.css";

function YearSelector() {
  const { year, setYear } = useReportingYear();

  const currentIndex = SUPPORTED_YEARS.indexOf(year);

  const previousYear = SUPPORTED_YEARS[currentIndex - 1];
  const nextYear = SUPPORTED_YEARS[currentIndex + 1];

  return (
    <div className="year-selector" role="group" aria-label="Reporting year">
      <button
        type="button"
        aria-label="Previous reporting year"
        disabled={previousYear === undefined}
        onClick={() => {
          if (previousYear !== undefined) setYear(previousYear);
        }}
      >
        ←
      </button>

      <span className="year-selector__year" aria-live="polite">
        {year}
      </span>

      <button
        type="button"
        aria-label="Next reporting year"
        disabled={nextYear === undefined}
        onClick={() => {
          if (nextYear !== undefined) setYear(nextYear);
        }}
      >
        →
      </button>
    </div>
  );
}

export default YearSelector;
