/*
 * Builds Leaflet markers and clusters from universities with coordinates.
 * Marker colors represent revenue / expenses; cluster colors represent the
 * percentage of valid ratios below 100%. The visible cluster count includes
 * all child markers, even when some have no usable finance ratio.
 *
 * Marker refs let a search selection reveal the correct marker and open its
 * popup after MapNavigator moves the map.
 */
import { useEffect, useRef } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { divIcon, type Marker as LeafletMarker } from "leaflet";

import type {
  University,
} from "../../types/university.ts";
import type { UniversityFinanceSummary } from "../../types/finance";

import UniversityPopup from "./UniversityPopups";
import { getFinanceColor } from "../../utils/getFinanceColor";
import { getRevenueExpenseRatio } from "../../utils/getRevenueExpenseRatio";
import { MAP_FOCUS_ZOOM } from "../../config/map";

interface UniversityMarkersProps {
  universities: University[];
  selectedUniversity: University | null;
  financesByUnitid: Map<number, UniversityFinanceSummary>;
}

type UniversityMarker = LeafletMarker & {
  universityId?: number;
};

type UniversityCluster = {
  getAllChildMarkers: () => UniversityMarker[];
  getChildCount: () => number;
};

type UniversityClusterGroup = {
  zoomToShowLayer: (marker: LeafletMarker, callback: () => void) => void;
  refreshClusters: () => void;
};

function createUniversityIcon(ratio: number | null) {
  const color = getFinanceColor(ratio);

  return divIcon({
    html: `<div class="university-marker" style="--marker-color: ${color}"></div>`,
    className: "university-marker-container",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

function UniversityMarkers({
  universities,
  selectedUniversity,
  financesByUnitid,
}: UniversityMarkersProps) {
  const map = useMap();

  const markerRefs = useRef<Map<number, LeafletMarker>>(new Map());

  const clusterGroupRef = useRef<UniversityClusterGroup | null>(null);

  // Generate cluster colors based on the percentage of
  // universities reporting expenses greater than revenue.
  const createClusterIcon = (cluster: UniversityCluster) => {
    const markers = cluster.getAllChildMarkers();

    let deficitCount = 0;
    let validCount = 0;

    markers.forEach((marker) => {
      if (marker.universityId === undefined) return;

      const finance = financesByUnitid.get(marker.universityId);

      if (!finance) return;

      const ratio = getRevenueExpenseRatio(
        finance.total_revenues_additions,
        finance.total_expenses_deductions,
      );

      if (ratio === null) return;

      validCount++;

      if (ratio < 100) {
        deficitCount++;
      }
    });

    const deficitPercentage =
      validCount > 0 ? (deficitCount / validCount) * 100 : null;

    const color =
      deficitPercentage === null
        ? "#94a3b8"
        : deficitPercentage >= 80
          ? "#dc2626"
          : deficitPercentage >= 60
            ? "#f97316"
            : deficitPercentage >= 40
              ? "#eab308"
              : deficitPercentage >= 20
                ? "#84cc16"
                : "#16a34a";

    return divIcon({
      html: `<div class="university-cluster-marker" style="--cluster-color: ${color}">
        <span>${cluster.getChildCount()}</span>
      </div>`,
      className: "university-cluster",
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  };

  // Reveal and open the selected university's popup.
  useEffect(() => {
    if (!selectedUniversity) return;

    const marker = markerRefs.current.get(selectedUniversity.unitid);
    const clusterGroup = clusterGroupRef.current;

    if (!marker || !clusterGroup) return;

    let cancelled = false;

    const revealMarker = () => {
      clusterGroup.zoomToShowLayer(marker, () => {
        if (!cancelled) {
          marker.openPopup();
        }
      });
    };

    map.once("moveend", revealMarker);

    return () => {
      cancelled = true;
      map.off("moveend", revealMarker);
    };
  }, [map, selectedUniversity]);

  // Recalculate cluster icons when financial summaries change.
  useEffect(() => {
    clusterGroupRef.current?.refreshClusters();
  }, [financesByUnitid]);

  return (
    <MarkerClusterGroup
      ref={clusterGroupRef}
      chunkedLoading
      showCoverageOnHover={false}
      maxClusterRadius={40}
      disableClusteringAtZoom={MAP_FOCUS_ZOOM}
      iconCreateFunction={createClusterIcon}
    >
      {universities
        .filter(
          (university) =>
            university.latitude !== null && university.longitude !== null,
        )
        .map((university) => {
          const finance = financesByUnitid.get(university.unitid);

          const ratio = finance
            ? getRevenueExpenseRatio(
                finance.total_revenues_additions,
                finance.total_expenses_deductions,
              )
            : null;

          return (
            <Marker
              key={university.unitid}
              position={[university.latitude!, university.longitude!]}
              icon={createUniversityIcon(ratio)}
              ref={(marker) => {
                if (marker) {
                  const universityMarker = marker as UniversityMarker;

                  universityMarker.universityId = university.unitid;

                  markerRefs.current.set(university.unitid, marker);
                } else {
                  markerRefs.current.delete(university.unitid);
                }
              }}
            >
              <Popup>
                <UniversityPopup university={university} ratio={ratio} />
              </Popup>
            </Marker>
          );
        })}
    </MarkerClusterGroup>
  );
}

export default UniversityMarkers;
