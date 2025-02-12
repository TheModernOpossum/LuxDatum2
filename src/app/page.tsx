"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

// Leaflet imports (Dynamic to avoid SSR issues)
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const useMapEvents = dynamic(() => import("react-leaflet").then(mod => mod.useMapEvents), { ssr: false });

// Leaflet icons
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function Home() {
    const [lat, setLat] = useState("37.7749");
    const [lon, setLon] = useState("-122.4194");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch satellite image
    const fetchImage = async () => {
        if (!lat || !lon) return;
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/fetchImage?lat=${lat}&lon=${lon}`);
            const data = await response.json();
            setImageUrl(data.url);
        } catch (err) {
            console.error("NASA API Fetch Error:", err);
            setError("Failed to fetch satellite image.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch image on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            fetchImage();
        }
    }, [fetchImage]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-2xl font-bold">LuxDatum 2</h1>

            {/* Latitude & Longitude Inputs */}
            <div className="flex gap-2 my-4">
                <input
                    type="text"
                    placeholder="Latitude"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="p-2 text-black border rounded"
                />
                <input
                    type="text"
                    placeholder="Longitude"
                    value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    className="p-2 text-black border rounded"
                />
                <button onClick={fetchImage} className="p-2 bg-blue-500 rounded">Fetch Image</button>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-400">{error}</p>}

            {/* Map Display */}
            <div className="w-full h-96 mt-4">
                <MapContainer center={[parseFloat(lat), parseFloat(lon)]} zoom={10} className="w-full h-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[parseFloat(lat), parseFloat(lon)]} icon={markerIcon} />
                </MapContainer>
            </div>

            {/* Satellite Image */}
            {loading ? (
                <p>Loading image...</p>
            ) : imageUrl ? (
                <Image src={imageUrl} alt="Satellite View" width={500} height={500} priority />
            ) : null}
        </div>
    );
}
