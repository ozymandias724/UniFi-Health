/*
 * University map page. The directory supplies locations, while the local
 * finance summaries supply marker and cluster colors. Search selection moves
 * the map via MapNavigator and lets UniversityMarkers reveal the matching
 * popup. Tiles are loaded from OpenStreetMap.
 */

// react stuff
import { useEffect, useState, useMemo } from "react";

// my components
import {
  getUniversities,
  getFinanceSummaries,
  type University,
  type UniversityFinanceSummary,
} from "../services/ipeds";
import UniversitySearch from "../components/UniversitySearch";
import MapNavigator from "../components/map/MapNavigator";

import UniversityMarkers from "../components/map/UniversityMarkers";

// leaflet stuff
import { MapContainer, TileLayer } from "react-leaflet";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import "leaflet/dist/leaflet.css";

function MapView() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [finances, setFinances] = useState<UniversityFinanceSummary[]>([]);

  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);

  const financesByUnitid = useMemo(
    () => new Map(finances.map((record) => [record.unitid, record])),
    [finances],
  );

  useEffect(() => {
    async function loadMapData() {
      try {
        const [universities, finances] = await Promise.all([
          getUniversities(),
          getFinanceSummaries(),
        ]);

        setUniversities(universities);
        setFinances(finances);
      } catch (error) {
        console.error("Failed to load map data:", error);
      }
    }

    loadMapData();
  }, []);

  return (
    <main className="main">
      <section className="map-view">
        <div className="container">
          <h1>University Map</h1>
          <p>
            Loaded {universities.length} universities and {finances.length}{" "}
            financial summaries.
          </p>

          <UniversitySearch
            universities={universities}
            onSelect={setSelectedUniversity}
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
