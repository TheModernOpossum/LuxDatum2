"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for missing Leaflet marker icons
const markerIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Dynamically import Leaflet map components to prevent SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

export default function Home() {
  const [lat, setLat] = useState(37.7749); // Default: San Francisco
  const [lng, setLng] = useState(-122.4194); // Default: San Francisco
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // Fix SSR issue

  // Ensure code runs only in the browser
  useEffect(() => {
    setIsClient(true);
    fetchImage(); // Fetch image on load
  }, []);

  // Fetch NASA Satellite Image
  const fetchImage = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.nasa.gov/planetary/earth/imagery?lon=${lng}&lat=${lat}&date=2020-01-01&dim=0.1&api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY}`
      );

      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("NASA API Fetch Error:", err);
      setError("Failed to fetch satellite image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">LuxDatum: NASA Satellite Imagery</h1>

      {/* Lat/Lng Inputs */}
      <div className="flex gap-4 mb-4">
        <input
          type="number"
          value={lat}
          onChange={(e) => setLat(parseFloat(e.target.value))}
          placeholder="Latitude"
          className="p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
        />
        <input
          type="number"
          value={lng}
          onChange={(e) => setLng(parseFloat(e.target.value))}
          placeholder="Longitude"
          className="p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
        />
      </div>

      {/* Fetch New Image Button */}
      <button
        onClick={fetchImage}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Fetch Image
      </button>

      {/* Map Section - Only Render in Client */}
      {isClient && (
        <div className="w-full max-w-3xl h-96 mb-4 border border-gray-700 rounded-lg overflow-hidden">
          <MapContainer center={[lat, lng]} zoom={10} className="h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[lat, lng]} icon={markerIcon} />
          </MapContainer>
        </div>
      )}

      {/* Loading & Error Messages */}
      {loading && <p>Loading satellite image...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* NASA Satellite Image */}
      {imageUrl && (
        <img src={imageUrl} alt="Satellite View" className="border border-gray-700 rounded-lg w-full max-w-3xl mt-4" />
      )}
    </div>
  );
}
