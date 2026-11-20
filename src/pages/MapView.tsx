/* 
    Where I will build the OpenStreetMap view for universities' financial data
*/

// react stuff
import { useEffect, useState } from "react";

// my components
import { getUniversities, type University } from "../services/ipeds";
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
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);

  useEffect(() => {
    getUniversities().then(setUniversities).catch(console.error);
  }, []);

  return (
    <main className="main">
      <section className="map-view">
        <div className="container">
          <h1>University Map</h1>
          <p>Loaded {universities.length} universities.</p>

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
            />

            
          </MapContainer>
        </div>
      </section>
    </main>
  );
}

export default MapView;
