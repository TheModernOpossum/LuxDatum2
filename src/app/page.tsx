"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Dynamically import Leaflet to prevent SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

// Define Leaflet marker icon
const markerIcon = new L.Icon({
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

export default function Home() {
    const [latitude, setLatitude] = useState(37.7749); // Default: SF
    const [longitude, setLongitude] = useState(-122.4194);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Ensure this runs only on the client to prevent "window is not defined" error
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Function to fetch satellite image
    const fetchImage = async () => {
        if (!isClient) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/getImage?lat=${latitude}&lon=${longitude}`);
            if (!response.ok) throw new Error("Failed to fetch image");

            const data = await response.json();
            setImageUrl(data.imageUrl);
        } catch (err) {
            console.error("NASA API Fetch Error:", err);
            setError("Failed to fetch satellite image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-2xl font-bold mb-4">LuxDatum - Satellite Map Viewer</h1>

            {/* Input Fields */}
            <div className="flex space-x-4 mb-4">
                <input
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    placeholder="Latitude"
                    className="p-2 border rounded text-black"
                />
                <input
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    placeholder="Longitude"
                    className="p-2 border rounded text-black"
                />
                <button onClick={fetchImage} className="p-2 bg-blue-600 rounded">
                    Fetch Image
                </button>
            </div>

            {/* Image Display */}
            {loading && <p>Loading satellite image...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {imageUrl && (
                <Image src={imageUrl} alt="Satellite View" width={500} height={500} priority />
            )}

            {/* Map Rendering Only on Client */}
            {isClient && (
                <div className="w-full h-[500px] mt-6">
                    <MapContainer center={[latitude, longitude]} zoom={13} className="w-full h-full">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[latitude, longitude]} icon={markerIcon} />
                    </MapContainer>
                </div>
            )}
        </div>
    );
}

// Prevents Static Site Generation (SSG) and forces dynamic rendering
export async function getServerSideProps() {
    return { props: {} };
}
