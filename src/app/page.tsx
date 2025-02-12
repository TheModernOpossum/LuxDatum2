"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Missing Leaflet Icons
const markerIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41], // Default size
  iconAnchor: [12, 41], // Default anchor
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Home() {
  const [latitude, setLatitude] = useState("37.7749"); // Default: SF
  const [longitude, setLongitude] = useState("-122.4194"); // Default: SF
  const [date, setDate] = useState("2025-01-15"); // Default: Recent Date
  const [imageSrc, setImageSrc] = useState<string | null>(null);
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
        params: { lat: latitude, lon: longitude, dim: 0.1, date: date, api_key: API_KEY },
        responseType: "blob",
      });

      console.log("NASA API Response:", response); // 🔍 DEBUGGING LINE

      const imageBlob = response.data;
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setImageSrc(imageObjectURL);
    } catch (err: any) {
      console.error("Error fetching NASA data:", err.message);
      setError("Failed to fetch satellite image.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4">LuxDatum Earth Imagery</h1>

        {/* Inputs for Coordinates and Date */}
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

        {/* Image Display */}
        {loading ? (
            <p>Loading satellite image...</p>
        ) : error ? (
            <p className="text-red-500">{error}</p>
        ) : (
            imageSrc && (
                <Image
                    src={imageSrc}
                    alt="NASA Satellite View"
                    width={800}
                    height={400}
                    unoptimized={true}
                    className="w-full max-w-3xl rounded-lg shadow-lg"
                />
            )
        )}

        {/* Interactive Map */}
        <MapContainer center={[parseFloat(latitude), parseFloat(longitude)]} zoom={3} className="h-96 w-full mt-6 rounded-lg shadow-lg">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[parseFloat(latitude), parseFloat(longitude)]} icon={markerIcon}>
            <Popup>Selected Location</Popup>
          </Marker>
        </MapContainer>
      </div>
  );
}