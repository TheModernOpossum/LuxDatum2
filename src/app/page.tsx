"use client"; // Ensures this runs only in the browser

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import axios from "axios";

// Dynamically import Leaflet components to prevent SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
import "leaflet/dist/leaflet.css";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [latitude, setLatitude] = useState("37.7749");
  const [longitude, setLongitude] = useState("-122.4194");
  const [date, setDate] = useState("2025-01-15");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImage = async () => {
    setLoading(true);
    setError(null);
    setImageSrc(null);
    try {
      const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;
      if (!API_KEY) throw new Error("Missing NASA API Key");

      const response = await axios.get("https://api.nasa.gov/planetary/earth/imagery", {
        params: { lat: latitude, lon: longitude, dim: 0.1, date, api_key: API_KEY },
        responseType: "blob",
      });

      const imageBlob = response.data;
      setImageSrc(URL.createObjectURL(imageBlob));
    } catch (err) {
      setError("Failed to fetch satellite image.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-4">LuxDatum Earth Imagery</h1>

        {/* User Input Section */}
        <div className="flex flex-col gap-4 mb-6 w-full max-w-lg">
          <div className="flex gap-4">
            <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude"
                className="p-2 bg-gray-800 border border-gray-700 rounded w-full"
            />
            <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude"
                className="p-2 bg-gray-800 border border-gray-700 rounded w-full"
            />
          </div>
          <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 bg-gray-800 border border-gray-700 rounded"
          />
          <button onClick={fetchImage} className="p-3 bg-blue-600 hover:bg-blue-500 rounded font-bold">
            Fetch Image
          </button>
        </div>

        {/* Image Display */}
        {loading && <p>Loading satellite image...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {imageSrc && (
            <Image
                src={imageSrc}
                alt="NASA Satellite View"
                width={800}
                height={400}
                className="w-full max-w-3xl rounded-lg shadow-lg"
                unoptimized
            />
        )}

        {/* Leaflet Map */}
        <div className="w-full max-w-3xl h-96 mt-6">
          <MapContainer center={[parseFloat(latitude), parseFloat(longitude)]} zoom={10} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[parseFloat(latitude), parseFloat(longitude)]} />
          </MapContainer>
        </div>
      </div>
  );
}