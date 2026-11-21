/*
 * Financial Explorer page.
 * - Loads the local university directory and field metadata.
 * - Accepts a unitid query parameter, including links from the map.
 * - Fetches the selected institution's 2023 finance record from the API.
 *
 * The search component owns its input, while this page owns the selected
 * institution and the financial data displayed below it.
 */
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
// import UniversityFinances from "../components/UniversityFinances";
import FinancialOverview from "../components/financial-overview/FinancialOverview";
import { useEffect, useState } from "react";

// React Router search params for handling query parameters
import { useSearchParams } from "react-router";

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

  // The URL can initialize the selection once the directory has loaded.
  const [searchParams] = useSearchParams();
  const unitidParam = searchParams.get("unitid");

  useEffect(() => {
    if (!unitidParam || universities.length === 0) return;

    const unitid = Number(unitidParam);

    if (!Number.isSafeInteger(unitid) || unitid <= 0) return;

    const university = universities.find(
      (university) => university.unitid === unitid,
    );

    if (university) {
      setSelectedUniversity(university);
    }
  }, [unitidParam, universities]);

  function handleUniversitySelect(university: University | null) {
    setSelectedUniversity(university);
    setFinances(null);
  }

  // Load university directory
  useEffect(() => {
    getUniversities().then(setUniversities).catch(console.error);
  }, []);

  // Ignore responses for a previous selection after the effect is cleaned up.
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
            <p>Loaded {universities.length} universities.</p>
          </div>
        </section>

        {/* University search section */}
        <UniversitySearch
          universities={universities}
          onSelect={handleUniversitySelect}
        />

        {/* Display selected university information */}
        {selectedUniversity && (
          <section className="selected-university">
            <div className="container">
              <p>Selected University:</p>
              <h2>{selectedUniversity.inst_name}</h2>
              <p>
                {selectedUniversity.city}, {selectedUniversity.state_abbr}
              </p>
              <p>IPEDS ID: {selectedUniversity.unitid}</p>
            </div>
          </section>
        )}

        {/* Display financial data for the selected university */}
        {finances && (
          <>
            <FinancialOverview finances={finances} variables={variables} />
            {/* <UniversityFinances finances={finances} variables={variables} /> */}
          </>
        )}
      </main>
    </>
  );
}

export default Explorer;
