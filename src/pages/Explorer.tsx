/*
 * Financial Explorer page.
 * - Loads the local university directory and field metadata.
 * - Accepts a unitid query parameter, including links from the map.
 * - Fetches the selected institution's 2023 finance record from the API.
 *
 * The URL owns institution selection; this page derives the selected
 * institution and loads its financial data.
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
import UniversityFinances from "../components/university-finances/UniversityFinances";
import FinancialOverview from "../components/financial-overview/FinancialOverview";
import { useEffect, useState } from "react";

// React Router search params for handling query parameters
import { useSearchParams } from "react-router";

function Explorer() {
  // University directory
  const [universities, setUniversities] = useState<University[]>([]);

  // Associate fetched finances with their institution to avoid showing stale data.
  const [financeResult, setFinanceResult] = useState<{
    unitid: number;
    data: FinanceRecord | null;
  } | null>(null);

  const [variables, setVariables] = useState<Record<string, VariableMetadata>>(
    {},
  );

  // The URL is the source of truth for both map links and search selections.
  const [searchParams, setSearchParams] = useSearchParams();
  const unitidParam = searchParams.get("unitid");
  const unitid = unitidParam === null ? null : Number(unitidParam);

  const selectedUniversity =
    unitid !== null && Number.isSafeInteger(unitid) && unitid > 0
      ? (universities.find((university) => university.unitid === unitid) ??
        null)
      : null;

  function handleUniversitySelect(university: University | null) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      if (university) {
        next.set("unitid", String(university.unitid));
      } else {
        next.delete("unitid");
      }

      return next;
    });
  }

  const finances =
    selectedUniversity && financeResult?.unitid === selectedUniversity.unitid
      ? financeResult.data
      : null;

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
        if (!cancelled) {
          setFinanceResult({ unitid: selectedUniversity.unitid, data });
        }
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
            <UniversityFinances finances={finances} variables={variables} />
          </>
        )}
      </main>
    </>
  );
}

export default Explorer;
