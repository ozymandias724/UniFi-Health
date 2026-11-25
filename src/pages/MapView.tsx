/*
 * University map page. The directory supplies locations, while the local
 * finance summaries supply marker and cluster colors. Search selection moves
 * the map via MapNavigator and lets UniversityMarkers reveal the matching
 * popup. Tiles are loaded from OpenStreetMap.
 */

// react stuff
import { useEffect, useState, useMemo } from "react";

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
  } | null>(null);

  // const universities = mapData?.year === year ? mapData.universities : [];
  // const finances = mapData?.year === year ? mapData.finances : [];

  const universities = mapData?.universities ?? [];
  const finances = mapData?.finances ?? [];

  const isLoading = mapData?.year !== year;

  // Store the institution's identity independently of the reporting year.
  const [selectedUnitid, setSelectedUnitid] = useState<number | null>(null);

  // Resolve the selected institution from the current directory.
  const selectedUniversity =
    universities.find((university) => university.unitid === selectedUnitid) ??
    null;

  const financesByUnitid = useMemo(
    () =>
      new Map(
        (mapData?.finances ?? []).map((record) => [record.unitid, record]),
      ),
    [mapData],
  );

  // Load matching directory and financial summaries for the reporting year.
  useEffect(() => {
    let cancelled = false;

    async function loadMapData() {
      try {
        const [universities, finances] = await Promise.all([
          getUniversities(year),
          getFinanceSummaries(year),
        ]);

        if (!cancelled) {
          setMapData({ year, universities, finances });
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load map data:", error);
        }
      }
    }

    loadMapData();

    return () => {
      cancelled = true;
    };
  }, [year]);

  return (
    <main className="main">
      <section className="map-view">
        <div className="container">
          <h1>University Map</h1>
          <p>
            {isLoading
              ? `Loading data for ${year}...`
              : `Loaded ${universities.length} universities and ${finances.length} financial summaries for ${year}.`}
          </p>

          <YearSelector />

          <UniversitySearch
            universities={universities}
            onSelect={(university) =>
              setSelectedUnitid(university?.unitid ?? null)
            }
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
            />
          </MapContainer>
        </div>
      </section>
    </main>
  );
}

export default MapView;
