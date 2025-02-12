"use client"; // Forces this to be a client-only component

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Leaflet components must load on client-side only
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

const L = typeof window !== "undefined" ? require("leaflet") : null; // Ensures this only loads on client-side

const Home = () => {
  const [lat, setLat] = useState(37.7749);
  const [lng, setLng] = useState(-122.4194);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // Prevent SSR execution
  }, []);

  const fetchImage = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/satellite?lat=${lat}&lng=${lng}`);
      if (!response.ok) throw new Error("Failed to fetch image");

      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (err) {
      console.error("Error fetching image:", err);
      setError("Could not fetch satellite image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Satellite Image Viewer</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          value={lat}
          onChange={(e) => setLat(parseFloat(e.target.value))}
          className="p-2 bg-gray-800 border border-gray-600 rounded"
          placeholder="Latitude"
        />
        <input
          type="number"
          value={lng}
          onChange={(e) => setLng(parseFloat(e.target.value))}
          className="p-2 bg-gray-800 border border-gray-600 rounded"
          placeholder="Longitude"
        />
        <button
          onClick={fetchImage}
          className="p-2 bg-blue-600 rounded text-white hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch Image"}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {imageUrl && (
        <img src={imageUrl} alt="Satellite view" className="mt-4 w-96 h-96 border border-gray-600" />
      )}

      <div className="w-full h-96 mt-8">
        {typeof window !== "undefined" && (
          <MapContainer center={[lat, lng]} zoom={10} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[lat, lng]} icon={L?.icon({ iconUrl: "leaflet/marker-icon.png", shadowUrl: "leaflet/marker-shadow.png" })} />
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default Home;
