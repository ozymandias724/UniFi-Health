import { Link } from "react-router";
import type { University } from "../../services/ipeds";

interface UniversityPopupProps {
  university: University;
  ratio: number | null;
}

function UniversityPopup({ university, ratio }: UniversityPopupProps) {
  // Placeholder data until we build our financial data pipeline.
  
  const reportingYear = 2023;

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

      <Link to={`/?unitid=${university.unitid}`}>View Financial Profile →</Link>
    </div>
  );
}

export default UniversityPopup;
