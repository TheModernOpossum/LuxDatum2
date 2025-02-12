"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Dynamically load Leaflet components to prevent SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

// ✅ Fix for missing Leaflet marker icons
const markerIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Home() {
  const [latitude, setLatitude] = useState<string>("37.7749"); // Default: SF
  const [longitude, setLongitude] = useState<string>("-122.4194"); // Default: SF
  const [date, setDate] = useState<string>("2025-01-15"); // Default: Recent Date
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMapLoaded(true);
    }
  }, []);

  // ✅ Fetch NASA Satellite Image
  const fetchImage = async () => {
    setLoading(true);
    setError(null);
    setImageSrc(null);

    try {
      const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;
      if (!API_KEY) throw new Error("Missing NASA API Key");

      const response = await axios.get("https://api.nasa.gov/planetary/earth/imagery", {
        params: {
          lat: latitude,
          lon: longitude,
          dim: 0.1,
          date: date,
          api_key: API_KEY,
        },
        responseType: "blob",
      });

      const imageBlob = response.data;
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setImageSrc(imageObjectURL);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error fetching NASA data:", err.message);
        setError(`Failed to fetch satellite image: ${err.message}`);
      } else {
        console.error("Unknown error fetching NASA data.");
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-4">LuxDatum Earth Imagery</h1>

        {/* 🌍 Input Fields */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-4">
            <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude"
                className="p-2 bg-gray-800 border border-gray-700 rounded"
            />
            <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude"
                className="p-2 bg-gray-800 border border-gray-700 rounded"
            />
          </div>
          <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 bg-gray-800 border border-gray-700 rounded"
          />
          <button
              onClick={fetchImage}
              className="p-3 bg-blue-600 hover:bg-blue-500 rounded font-bold"
          >
            Fetch Image
          </button>
        </div>

        {/* 🌍 Satellite Image Display */}
        {loading ? (
            <p>Loading satellite image...</p>
        ) : error ? (
            <p className="text-red-500">{error}</p>
        ) : (
            imageSrc && (
                <img
                    src={imageSrc}
                    alt="NASA Satellite View"
                    className="w-full max-w-3xl rounded-lg shadow-lg"
                />
            )
        )}

        {/* 🗺️ Interactive Map */}
        {mapLoaded && (
            <div className="w-full max-w-3xl h-96 mt-6">
              <MapContainer
                  center={[parseFloat(latitude), parseFloat(longitude)]}
                  zoom={10}
                  className="h-full w-full rounded-lg shadow-lg"
              >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={[parseFloat(latitude), parseFloat(longitude)]} icon={markerIcon}>
                  <Popup>Selected Location</Popup>
                </Marker>
              </MapContainer>
            </div>
        )}
      </div>
  );
}