import { Link } from "react-router";
import type { University } from "../../types/university.ts";

import AddToCompareButton from "../comparison/AddToCompareButton";

import { useReportingYear } from "../../hooks/useReportingYear";

interface UniversityPopupProps {
  university: University;
  ratio: number | null;
}

function UniversityPopup({ university, ratio }: UniversityPopupProps) {

  const { year: reportingYear } = useReportingYear();

  return (
    <div className="university-popup">
      <h3>{university.inst_name}</h3>

      <p className="university-popup-location">
        {university.city}, {university.state_abbr}
      </p>

      <div className="university-popup-finances">
        <div>
          <span>Revenue / Expenses</span>
          <strong>{ratio !== null ? `${ratio.toFixed(1)}%` : "N/A"}</strong>
        </div>

        <div>
          <span>Reporting Year</span>
          <strong>{reportingYear}</strong>
        </div>
      </div>

      <div className="university-actions">
        <Link to={`/?unitid=${university.unitid}&year=${reportingYear}`}>
          View Financial Profile →
        </Link>
        <AddToCompareButton unitid={university.unitid} year={reportingYear} />
      </div>
    </div>
  );
}

export default UniversityPopup;
