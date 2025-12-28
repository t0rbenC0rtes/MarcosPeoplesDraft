import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./LocationPicker.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function LocationPicker({ location, setLocation }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return; // Initialize only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [4.3517, 50.8503], // Brussels default
      zoom: 10,
    });

    // Add geocoder (search)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: "Search for a location...",
    });

    map.current.addControl(geocoder);

    // Handle geocoder result
    geocoder.on("result", (e) => {
      const { place_name, center } = e.result;
      updateLocation(center[0], center[1], place_name);
    });

    // Handle map click
    map.current.on("click", async (e) => {
      const { lng, lat } = e.lngLat;

      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const placeName = data.features[0].place_name;
          updateLocation(lng, lat, placeName);
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        updateLocation(lng, lat, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const updateLocation = (lng, lat, placeName) => {
    // Update location state
    setLocation({
      location_name: placeName,
      latitude: lat,
      longitude: lng,
    });

    // Update or create marker
    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    } else {
      marker.current = new mapboxgl.Marker({ color: "#000000" })
        .setLngLat([lng, lat])
        .addTo(map.current);
    }

    // Center map on location
    map.current.flyTo({ center: [lng, lat], zoom: 12 });
  };

  return (
    <div className="location-picker">
      <div ref={mapContainer} className="picker-map" />
      {!mapLoaded && <div className="map-loading">Loading map...</div>}
      {location && (
        <div className="selected-location">
          <p>
            <strong>Selected:</strong> {location.location_name}
          </p>
        </div>
      )}
    </div>
  );
}
