/*
 * Financial Explorer page.
 * - Loads the local university directory and field metadata.
 * - Accepts a unitid query parameter, including links from the map.
 * - Fetches the selected institution's finance record for the reporting year from the API.
 *
 * The URL owns institution and reporting year selection; this page derives the selected
 * institution and loads its financial data.
 */
import {
  getUniversities,
  getUniversityFinances,
  getVariables,
} from "../services/ipeds";

import type { University } from "../types/university.ts";
import type { FinanceRecord } from "../types/finance.ts";
import type { VariableMetadata } from "../types/metadata.ts";

import UniversitySearch from "../components/UniversitySearch";
import UniversityFinances from "../components/university-finances/UniversityFinances";
import FinancialOverview from "../components/financial-overview/FinancialOverview";
import { useEffect, useState } from "react";

import { useReportingYear } from "../hooks/useReportingYear";
import YearSelector from "../components/YearSelector";

// React Router search params for handling query parameters
import { Link, useSearchParams } from "react-router";

function Explorer() {
  const { year } = useReportingYear();

  // University directory for the selected reporting year.
  const [directoryResult, setDirectoryResult] = useState<{
    year: number;
    data: University[];
    error: boolean;
  } | null>(null);

  const directoryError =
    directoryResult?.year === year && directoryResult.error;

  const isDirectoryLoaded =
    directoryResult?.year === year && !directoryResult.error;

  const universities = isDirectoryLoaded ? directoryResult.data : [];

  // Associate fetched finances with their institution and reporting year.
  const [financeResult, setFinanceResult] = useState<{
    unitid: number;
    year: number;
    data: FinanceRecord | null;
    error: boolean;
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

  const isUniversityUnavailable =
    isDirectoryLoaded &&
    unitid !== null &&
    Number.isSafeInteger(unitid) &&
    unitid > 0 &&
    selectedUniversity === null;

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

  const isCurrentFinanceResult =
    selectedUniversity !== null &&
    financeResult?.unitid === selectedUniversity.unitid &&
    financeResult.year === year;

  const financeError = isCurrentFinanceResult && financeResult.error;

  const isFinanceLoaded = isCurrentFinanceResult && !financeResult.error;

  const finances = isFinanceLoaded ? financeResult.data : null;

  const isFinanceUnavailable = isFinanceLoaded && finances === null;

  // Load the university directory for the selected reporting year.
  useEffect(() => {
    const controller = new AbortController();

    getUniversities(year, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setDirectoryResult({ year, data, error: false });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error(error);
          setDirectoryResult({ year, data: [], error: true });
        }
      });

    return () => controller.abort();
  }, [year]);

  // Load finances for the selected institution and reporting year.
  useEffect(() => {
    if (!selectedUniversity) return;

    const controller = new AbortController();
    const unitid = selectedUniversity.unitid;

    getUniversityFinances(unitid, year, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setFinanceResult({
            unitid,
            year,
            data,
            error: false,
          });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error(error);
          setFinanceResult({
            unitid,
            year,
            data: null,
            error: true,
          });
        }
      });

    return () => controller.abort();
  }, [selectedUniversity, year]);

  // Load variable metadata.
  useEffect(() => {
    const controller = new AbortController();

    getVariables(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setVariables(data);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error(error);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="main">
      {/* Introduction section */}
      <section className="intro">
        <div className="container">
          <h1>University Financial Explorer</h1>
          <p>
            Loaded {universities.length} universities for {year}.
          </p>
          <YearSelector />
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
            <Link
              to={`/map-view?unitid=${selectedUniversity.unitid}&year=${year}`}
            >
              View on Map
            </Link>
          </div>
        </section>
      )}

      {/* Reporting data availability */}
      {directoryError && (
        <p role="alert">
          Unable to load the university directory for {year}. Please try again.
        </p>
      )}

      {!isDirectoryLoaded && !directoryError && (
        <p role="status">Loading university directory for {year}...</p>
      )}

      {isUniversityUnavailable && (
        <p role="status">
          The selected university is not available in the {year} dataset. Try
          selecting another reporting year.
        </p>
      )}

      {selectedUniversity && financeError && (
        <p role="alert">
          Unable to load financial data for {year}. Please try again.
        </p>
      )}

      {selectedUniversity && !isFinanceLoaded && !financeError && (
        <p role="status">Loading financial data for {year}...</p>
      )}

      {isFinanceUnavailable && (
        <p role="status">
          No financial data is available for this university in {year}.
        </p>
      )}

      {/* Display financial data for the selected university */}
      {finances && (
        <>
          <FinancialOverview finances={finances} variables={variables} />
          <UniversityFinances finances={finances} variables={variables} />
        </>
      )}
    </main>
  );
}

export default Explorer;
