import "../App.css";
import {
  getUniversities,
  getUniversityFinances,
  getVariables,
  type FinanceRecord,
  type VariableMetadata,
  type University,
} from "../services/ipeds";
import UniversitySearch from "../components/UniversitySearch";
import UniversityFinances from "../components/UniversityFinances";
import FinancialOverview from "../components/financial-overview/FinancialOverview";
import { useEffect, useState } from "react";

function Explorer() {
  // University directory
  const [universities, setUniversities] = useState<University[]>([]);

  // Selected university
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);

  const [finances, setFinances] = useState<FinanceRecord | null>(null);

  const [variables, setVariables] = useState<Record<string, VariableMetadata>>(
    {},
  );

  function handleUniversitySelect(university: University | null) {
    setSelectedUniversity(university);
    setFinances(null);
  }

  // Load university directory
  useEffect(() => {
    getUniversities().then(setUniversities).catch(console.error);
  }, []);

  // Load financial data for the selected university

  useEffect(() => {
    if (!selectedUniversity) return;

    let cancelled = false;

    getUniversityFinances(selectedUniversity.unitid, 2023)
      .then((data) => {
        if (!cancelled) setFinances(data);
      })
      .catch((error) => {
        if (!cancelled) console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedUniversity]);

  // Load variable metadata
  useEffect(() => {
    getVariables().then(setVariables).catch(console.error);
  }, []);

  return (
    <>
      <main className="main">


        {/* Introduction section */}
        <section className="intro">
          <div className="container">
            <h1>University Financial Explorer</h1>
          </div>
        </section>

        {/* University search section */}
        <section className="university-search">
          <UniversitySearch
            universities={universities}
            onSelect={handleUniversitySelect}
          />
          <p>Loaded {universities.length} universities.</p>
        </section>

        {/* Display selected university information */}
        {selectedUniversity && (
          <div>
            <h2>{selectedUniversity.inst_name}</h2>
            <p>
              {selectedUniversity.city}, {selectedUniversity.state_abbr}
            </p>
            <p>IPEDS ID: {selectedUniversity.unitid}</p>
          </div>
        )}

        {/* Display financial data for the selected university */}
        {finances && (
          <>
            <FinancialOverview finances={finances} variables={variables} />
            <UniversityFinances finances={finances} variables={variables} />
          </>
        )}
      </main>
    </>
  );
}

export default Explorer;
