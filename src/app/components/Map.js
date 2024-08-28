"use client";

import React, { useRef, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MaptilerLayer } from "@maptiler/leaflet-maptilersdk";
import styles from "./map.module.css";

// Ensure that the API key is available in the environment
const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

// Path to the custom marker icon
const customMarkerIconUrl = "/images/icon-location.svg";

const Map = ({ position }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false); // Track map initialization status

  // Initialize the map
  useEffect(() => {
    if (map.current || !mapContainer.current) return; // Prevent reinitialization

    map.current = L.map(mapContainer.current, {
      center: L.latLng(position[0], position[1]),
      zoom: 12,
    });

    new MaptilerLayer({
      apiKey: MAPTILER_API_KEY,
    }).addTo(map.current);

    setMapInitialized(true); // Mark map as initialized
  }, [position]); // Initialize map on position change or first render

  // Update the map view and marker when position changes
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    map.current.setView(
      L.latLng(position[0], position[1]),
      map.current.getZoom()
    );

    // Define the custom icon
    const customIcon = L.icon({
      iconUrl: customMarkerIconUrl,
      iconSize: [38, 38], // Size of the icon [width, height]
      iconAnchor: [22, 94], // Point of the icon which will correspond to marker's location
      popupAnchor: [-3, -76], // Point from which the popup should open relative to the iconAnchor
    });

    // Add or update the marker
    if (map.current.marker) {
      map.current.marker.setLatLng(L.latLng(position[0], position[1])); // Update position
    } else {
      map.current.marker = L.marker(L.latLng(position[0], position[1]), {
        icon: customIcon,
      }).addTo(map.current);
    }
  }, [position, mapInitialized]);

  return (
    <div className={styles.mapWrap}>
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
};

export default Map;
