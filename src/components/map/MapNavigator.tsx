import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { University } from "../../services/ipeds";
import { MAP_FOCUS_ZOOM } from "../../config/map";


interface MapNavigatorProps {
  selectedUniversity: University | null;
}

function MapNavigator({ selectedUniversity }: MapNavigatorProps) {
  const map = useMap();

  useEffect(() => {
    if (
      selectedUniversity?.latitude == null ||
      selectedUniversity?.longitude == null
    ) {
      return;
    }

    map.flyTo([selectedUniversity.latitude, selectedUniversity.longitude], MAP_FOCUS_ZOOM, {
      duration: 1.5,
    });
  }, [map, selectedUniversity]);

  return null;
}

export default MapNavigator;
