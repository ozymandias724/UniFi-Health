import { useEffect, useRef } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { divIcon, type Marker as LeafletMarker } from "leaflet";
import type { University } from "../../services/ipeds";
import UniversityPopup from "./UniversityPopups";

interface UniversityMarkersProps {
  universities: University[];
  selectedUniversity: University | null;
}

function createClusterIcon(cluster: { getChildCount: () => number }) {
  return divIcon({
    html: `<div><span>${cluster.getChildCount()}</span></div>`,
    className: "university-cluster",
    iconSize: [40, 40],
  });
}

function UniversityMarkers({
  universities,
  selectedUniversity,
}: UniversityMarkersProps) {
  //

  const map = useMap();

  const markerRefs = useRef<Map<number, LeafletMarker>>(new Map());

  useEffect(() => {
    if (!selectedUniversity) return;

    const marker = markerRefs.current.get(selectedUniversity.unitid);

    if (!marker) return;

    const openSelectedPopup = () => {
      marker.openPopup();
    };

    map.once("moveend", openSelectedPopup);

    return () => {
      map.off("moveend", openSelectedPopup);
    };
  }, [map, selectedUniversity]);

  return (
    <MarkerClusterGroup
      chunkedLoading
      showCoverageOnHover={false}
      maxClusterRadius={40}
      disableClusteringAtZoom={14}
      iconCreateFunction={createClusterIcon}
    >
      {universities
        .filter(
          (university) =>
            university.latitude !== null && university.longitude !== null,
        )
        .map((university) => (
          <Marker
            key={university.unitid}
            position={[university.latitude!, university.longitude!]}
            ref={(marker) => {
              if (marker) {
                markerRefs.current.set(university.unitid, marker);
              } else {
                markerRefs.current.delete(university.unitid);
              }
            }}
          >
            <Popup>
              <UniversityPopup university={university} />
            </Popup>
          </Marker>
        ))}
    </MarkerClusterGroup>
  );
}

export default UniversityMarkers;
