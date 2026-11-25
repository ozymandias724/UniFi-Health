import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { parseComparisonSelections } from "../utils/comparisonParams";
import { getComparisonKey } from "../utils/getComparisonKey";
import { useComparisonUniversities } from "../hooks/useComparisonUniversities";

function Compare() {
  const [searchParams] = useSearchParams();
  const itemsParam = searchParams.get("items");

  const selections = useMemo(
    () => parseComparisonSelections(itemsParam),
    [itemsParam],
  );

  const results = useComparisonUniversities(selections);

  return (
    <main className="main comparison-view">
      <section className="intro">
        <div className="container">
          <h1>Compare Universities</h1>
          <p>{selections.length} {selections.length === 1 ? "selection" : "selections"}</p>
        </div>
      </section>

      <section className="comparison-results">
        {results.length === 0 && (
          <p>No institutions selected for comparison.</p>
        )}

        {results.map(({ selection, university, isLoading, error }) => (
          <article
            className="comparison-card"
            key={getComparisonKey(selection)}
          >
            <p className="comparison-card-year">Reporting year: {selection.year}</p>

            {isLoading ? (
              <p role="status">Loading university...</p>
            ) : error ? (
              <p role="alert">Unable to load university directory.</p>
            ) : university ? (
              <>
                <h2>{university.inst_name}</h2>

                <p>
                  {university.city}, {university.state_abbr}
                </p>

                <p>IPEDS ID: {university.unitid}</p>

                <Link
                  className="btn"
                  data-variant="secondary"
                  to={`/?unitid=${selection.unitid}&year=${selection.year}`}
                >
                  View Financial Profile
                </Link>
              </>
            ) : (
              <p>
                Institution {selection.unitid} is unavailable for this reporting
                year.
              </p>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

export default Compare;
