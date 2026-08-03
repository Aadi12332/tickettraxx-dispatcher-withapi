import { useEffect, useId, useRef } from "react";

type LatLngTuple = [number, number];

interface ShipmentMapProps {
  data?: {
    start: LatLngTuple;
    end: LatLngTuple;
    route?: LatLngTuple[];
  };
}

const defaultData = {
  start: [34.0522, -118.2437] as LatLngTuple,
  end: [34.0528, -118.2851] as LatLngTuple,
};

const ShipmentMap = ({ data = defaultData }: ShipmentMapProps) => {
  const { start, end, route } = data;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const startMarker = useRef<any>(null);
  const endMarker = useRef<any>(null);
  const routePolyline = useRef<any>(null);
  const mapId = useId().replace(/:/g, "");

  const initializeMap = () => {
    const google = (window as any).google;
    if (!google?.maps || !mapRef.current || mapInstance.current) {
      return !!mapInstance.current;
    }

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: start[0], lng: start[1] },
      zoom: 15,
      disableDefaultUI: true,
    });

    mapInstance.current = map;
    startMarker.current = new google.maps.Marker({
      position: { lat: start[0], lng: start[1] },
      map,
      title: "Start",
    });
    endMarker.current = new google.maps.Marker({
      position: { lat: end[0], lng: end[1] },
      map,
      title: "End",
    });

    if (route && route.length > 1) {
      routePolyline.current = new google.maps.Polyline({
        path: route.map(([lat, lng]) => ({ lat, lng })),
        geodesic: true,
        strokeColor: "#007AFF",
        strokeOpacity: 1,
        strokeWeight: 3,
        map,
      });
    }

    return true;
  };

  useEffect(() => {
    let interval: number | undefined;

    if (!initializeMap()) {
      interval = window.setInterval(() => {
        if (initializeMap() && interval) {
          window.clearInterval(interval);
        }
      }, 100);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    const center = { lat: start[0], lng: start[1] };
    mapInstance.current.panTo(center);
    startMarker.current?.setPosition(center);

    const endPosition = { lat: end[0], lng: end[1] };
    endMarker.current?.setPosition(endPosition);

    if (route && route.length > 1) {
      const path = route.map(([lat, lng]) => ({ lat, lng }));
      if (routePolyline.current) {
        routePolyline.current.setPath(path);
        routePolyline.current.setMap(mapInstance.current);
      } else {
        const google = (window as any).google;
        if (google?.maps) {
          routePolyline.current = new google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: "#007AFF",
            strokeOpacity: 1,
            strokeWeight: 3,
            map: mapInstance.current,
          });
        }
      }
    } else if (routePolyline.current) {
      routePolyline.current.setMap(null);
    }
  }, [start, end, route]);

  return <div id={mapId} ref={mapRef} className="h-full w-full z-[1]" />;
};

export default ShipmentMap;
