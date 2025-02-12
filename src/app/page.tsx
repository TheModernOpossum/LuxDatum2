"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

// Dynamically import Leaflet components (NO SSR!)
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

export default function Page() {
  const [lat, setLat] = useState<number>(37.7749);
  const [lng, setLng] = useState<number>(-122.4194);
  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Ensure this runs only in the browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  // Function to fetch NASA image
  const fetchImage = async (): Promise<void> => {
    if (!isClient) return;
    
    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;
      const response = await fetch(
        `https://api.nasa.gov/planetary/earth/imagery?lon=${lng}&lat=${lat}&dim=0.1&api_key=${apiKey}`
      );

      if (!response.ok) throw new Error("Failed to fetch image");
      const imageUrl = response.url;
      setNasaImage(imageUrl);
    } catch (err) {
      setError("Failed to fetch satellite image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">NASA Satellite Image Viewer</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium">Latitude</label>
        <input
          type="number"
          value={lat}
          onChange={(e) => setLat(parseFloat(e.target.value))}
          className="text-black px-2 py-1 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Longitude</label>
        <input
          type="number"
          value={lng}
          onChange={(e) => setLng(parseFloat(e.target.value))}
          className="text-black px-2 py-1 rounded"
        />
      </div>

      <button
        onClick={fetchImage}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Loading..." : "Fetch Image"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {nasaImage && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Satellite Image:</h2>
          <Image src={nasaImage} alt="NASA Satellite" width={500} height={500} />
        </div>
      )}

      {/* Conditionally render map only on client */}
      {isClient && (
        <div className="mt-4 w-full max-w-lg h-64">
          <MapContainer center={[lat, lng]} zoom={5} className="w-full h-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[lat, lng]} />
          </MapContainer>
        </div>
      )}
    </div>
  );
}
