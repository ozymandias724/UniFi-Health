/*
 * University map page. The directory supplies locations, while the local
 * finance summaries supply marker and cluster colors. Search selection moves
 * the map via MapNavigator and lets UniversityMarkers reveal the matching
 * popup. Tiles are loaded from OpenStreetMap.
 */

// react stuff
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router";
// my components
import { getUniversities, getFinanceSummaries } from "../services/ipeds";
import type { University } from "../types/university.ts";
import type { UniversityFinanceSummary } from "../types/finance";
import UniversitySearch from "../components/UniversitySearch";
import MapNavigator from "../components/map/MapNavigator";

import UniversityMarkers from "../components/map/UniversityMarkers";
import { useReportingYear } from "../hooks/useReportingYear";
import YearSelector from "../components/YearSelector";

// leaflet stuff
import { MapContainer, TileLayer } from "react-leaflet";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import "leaflet/dist/leaflet.css";

function MapView() {
  const { year } = useReportingYear();

  const [mapData, setMapData] = useState<{
    year: number;
    universities: University[];
    finances: UniversityFinanceSummary[];
    error: boolean;
  } | null>(null);

  const currentData = mapData?.year === year ? mapData : null;

  const universities = currentData?.universities ?? [];
  const finances = currentData?.finances ?? [];

  const isLoading = currentData === null;
  const hasError = currentData?.error === true;

  // The URL is the source of truth for institution selection.
  const [searchParams, setSearchParams] = useSearchParams();
  const unitidParam = searchParams.get("unitid");
  const unitid = unitidParam === null ? null : Number(unitidParam);

  // Resolve the selected institution from the current directory.
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

  const financesByUnitid = useMemo(
    () =>
      new Map(
        (currentData?.finances ?? []).map((record) => [record.unitid, record]),
      ),
    [currentData],
  );

  // Load matching directory and financial summaries for the reporting year.
  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      getUniversities(year, controller.signal),
      getFinanceSummaries(year, controller.signal),
    ])
      .then(([universities, finances]) => {
        if (!controller.signal.aborted) {
          setMapData({
            year,
            universities,
            finances,
            error: false,
          });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error("Failed to load map data:", error);

          setMapData({
            year,
            universities: [],
            finances: [],
            error: true,
          });

          controller.abort();
        }
      });

    return () => controller.abort();
  }, [year]);

  return (
    <main className="main">
      <section className="map-view">
        <div className="container">
          <h1>University Map</h1>
          <p role="status">
            {isLoading
              ? `Loading data for ${year}...`
              : hasError
                ? `Unable to load data for ${year}. Please try again.`
                : `Loaded ${universities.length} universities and ${finances.length} financial summaries for ${year}.`}
          </p>

          <YearSelector />

          <UniversitySearch
            universities={universities}
            onSelect={handleUniversitySelect}
          />

          <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4}
            scrollWheelZoom={true}
            className="university-map"
          >
            <MapNavigator selectedUniversity={selectedUniversity} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <UniversityMarkers
              universities={universities}
              selectedUniversity={selectedUniversity}
              financesByUnitid={financesByUnitid}
              onSelect={handleUniversitySelect}
            />
          </MapContainer>
        </div>
      </section>
    </main>
  );
}

export default MapView;
