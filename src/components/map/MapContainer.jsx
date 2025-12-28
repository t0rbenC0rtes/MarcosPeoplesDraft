import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Supercluster from "supercluster";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapContainer({ memories, onMarkerClick }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize cluster
  const clusterRef = useRef(
    new Supercluster({
      radius: 60,
      maxZoom: 14,
      minZoom: 0,
      minPoints: 2,
    })
  );

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [4.3517, 50.8503], // Brussels
      zoom: 0.75,
      minZoom: 0.75,
      maxZoom: 18,
      projection: "globe",
    });

    // Add controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Disable rotation
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();

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

  // Load memories into cluster
  useEffect(() => {
    if (memories && memories.length > 0) {
      clusterRef.current.load(memories);
    }
  }, [memories]);

  // Update markers when map moves or zooms
  useEffect(() => {
    if (!mapLoaded || !map.current || memories.length === 0) return;

    const updateMarkers = () => {
      const zoom = map.current.getZoom();
      const bounds = map.current.getBounds();

      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];

      const clusters = clusterRef.current.getClusters(bbox, Math.floor(zoom));

      // Remove existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add new markers
      clusters.forEach((cluster) => {
        const [lng, lat] = cluster.geometry.coordinates;
        const properties = cluster.properties;

        if (properties.cluster) {
          // Cluster marker
          const count = properties.point_count;
          const el = document.createElement("div");
          el.className = "marker-cluster";
          el.innerHTML = `<span class="cluster-count">${count}</span>`;

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map.current);

          // Click to zoom into cluster
          el.addEventListener("click", () => {
            const clusterId = properties.cluster_id;
            const zoom = clusterRef.current.getClusterExpansionZoom(clusterId);
            map.current.easeTo({
              center: [lng, lat],
              zoom: zoom,
              duration: 1000,
            });
          });

          markersRef.current.push(marker);
        } else {
          // Individual memory marker
          const memory = properties.memory;
          const el = document.createElement("div");
          el.className = "memory-marker";

          // Add thumbnail if available
          const thumbnailUrl =
            memory.media?.[0]?.thumbnail_url || memory.media?.[0]?.file_url;
          if (thumbnailUrl) {
            el.innerHTML = `<img src="${thumbnailUrl}" alt="${
              memory.title || "Memory"
            }" />`;
          } else {
            el.innerHTML = `<div class="marker-icon">📍</div>`;
          }

          const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
            .setLngLat([lng, lat])
            .addTo(map.current);

          // Add popup on hover
          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 25,
          }).setHTML(`
            <div class="memory-hover-tooltip">
              <h4>${memory.title || "Untitled Memory"}</h4>
              <p>${memory.location_name || "Unknown location"}</p>
              ${
                memory.year
                  ? `<span class="memory-year">${memory.year}</span>`
                  : ""
              }
            </div>
          `);

          el.addEventListener("mouseenter", () => {
            marker.setPopup(popup);
            popup.addTo(map.current);
          });

          el.addEventListener("mouseleave", () => {
            popup.remove();
          });

          // Click to open memory detail
          el.addEventListener("click", () => {
            if (onMarkerClick) {
              onMarkerClick(memory);
            }
          });

          markersRef.current.push(marker);
        }
      });
    };

    // Initial update
    updateMarkers();

    // Listen to map events
    map.current.on("moveend", updateMarkers);
    map.current.on("zoomend", updateMarkers);

    return () => {
      if (map.current) {
        map.current.off("moveend", updateMarkers);
        map.current.off("zoomend", updateMarkers);
      }
    };
  }, [mapLoaded, memories, onMarkerClick]);

  return (
    <div className="map-wrapper">
      <div ref={mapContainer} className="map-container" />
      {!mapLoaded && (
        <div className="map-loading">
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
}
