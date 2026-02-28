import { useState, useMemo, useEffect, useRef } from "react";
import Map, {
    Marker,
    Popup,
    GeolocateControl,
    Source,
    Layer,
    MapRef,
} from "react-map-gl/mapbox";
import type { LayerProps } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { ShieldCheck } from "@mynaui/icons-react";

interface Report {
    id: number;
    latitude: string;
    longitude: string;
    description: string;
    status: string;
    photo_path: string;
    user: {
        name: string;
        warga?: {
            is_terverifikasi: boolean;
        };
    };
    created_at: string;
}

interface DangerZone {
    id: number;
    name: string;
    severity: string;
    type: string;
    coordinates: any;
}

interface MapProps {
    reports: Report[];
    isDarkMode: boolean;
    userLocation?: { lat: number; lng: number } | null;
    dangerZones?: DangerZone[];
}

export default function MapComponent({
    reports,
    isDarkMode,
    userLocation,
    dangerZones = [],
}: MapProps) {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const mapRef = useRef<MapRef>(null);

    const lombokCenter = {
        longitude: 116.1165, // Diubah ke Mataram agar fokus
        latitude: -8.5833,
        zoom: 12,
    };

    useEffect(() => {
        if (userLocation && mapRef.current) {
            mapRef.current.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: 14,
                duration: 2000,
            });
        }
    }, [userLocation]);

    // Data Laporan Warga (Heatmap)
    const geojsonData = useMemo(() => {
        return {
            type: "FeatureCollection" as const,
            features: reports.map((report) => ({
                type: "Feature" as const,
                properties: {
                    id: report.id,
                    mag: 100,
                },
                geometry: {
                    type: "Point" as const,
                    coordinates: [
                        parseFloat(report.longitude),
                        parseFloat(report.latitude),
                    ],
                },
            })),
        };
    }, [reports]);

    // Data Zona Rawan (Polygon Mapbox Draw)
    const dangerZoneGeojson = useMemo(() => {
        return {
            type: "FeatureCollection" as const,
            features: dangerZones.map((zone) => ({
                type: "Feature" as const,
                properties: {
                    id: zone.id,
                    name: zone.name,
                    severity: zone.severity,
                    type: zone.type,
                },
                geometry: {
                    type: "Polygon" as const,
                    coordinates: zone.coordinates,
                },
            })),
        };
    }, [dangerZones]);

    // Styling Heatmap Laporan
    const heatmapLayer: LayerProps = {
        id: "reports-heat",
        type: "heatmap",
        source: "reports-data",
        maxzoom: 15,
        paint: {
            "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                0,
                0,
                1,
                1,
            ],
            "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                1,
                9,
                3,
            ],
            "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(33,102,172,0)",
                0.2,
                "rgb(103,169,207)",
                0.4,
                "rgb(167, 233, 74)",
                0.7,
                "rgb(239,138,98)",
                1,
                "rgb(178,24,43)",
            ],
            "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                15,
                9,
                40,
            ],
            "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                1,
                14,
                0,
            ],
        },
    };

    // Styling Zona Rawan - Area Dalam (Fill)
    const dangerZoneFillLayer: LayerProps = {
        id: "danger-zone-fill",
        type: "fill",
        source: "danger-zone-data",
        paint: {
            "fill-color": [
                "match",
                ["get", "severity"],
                "critical",
                "#ef4444", // Merah
                "high",
                "#f97316", // Oranye
                "medium",
                "#eab308", // Kuning
                "low",
                "#22c55e", // Hijau
                "#94a3b8", // Abu-abu default
            ],
            "fill-opacity": isDarkMode ? 0.25 : 0.35, // Agak transparan agar peta di bawahnya tetap terlihat
        },
    };

    // Styling Zona Rawan - Garis Luar (Outline)
    const dangerZoneLineLayer: LayerProps = {
        id: "danger-zone-line",
        type: "line",
        source: "danger-zone-data",
        paint: {
            "line-color": [
                "match",
                ["get", "severity"],
                "critical",
                "#b91c1c",
                "high",
                "#c2410c",
                "medium",
                "#a16207",
                "low",
                "#15803d",
                "#475569",
            ],
            "line-width": 2,
            "line-dasharray": [2, 2], // Garis putus-putus
        },
    };

    return (
        <Map
            ref={mapRef}
            initialViewState={lombokCenter}
            style={{ width: "100%", height: "100%" }}
            mapStyle={
                isDarkMode
                    ? "mapbox://styles/mapbox/dark-v11"
                    : "mapbox://styles/mapbox/streets-v12"
            }
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        >
            {/* SUMBER DATA 1: ZONA RAWAN (Digambar duluan agar ada di layer bawah) */}
            <Source
                id="danger-zone-data"
                type="geojson"
                data={dangerZoneGeojson}
            >
                <Layer {...dangerZoneFillLayer} />
                <Layer {...dangerZoneLineLayer} />
            </Source>

            {/* SUMBER DATA 2: HEATMAP LAPORAN */}
            <Source id="reports-data" type="geojson" data={geojsonData}>
                <Layer {...heatmapLayer} />
            </Source>

            {/* MARKER LAPORAN INDIVIDU */}
            {reports.map((report) => (
                <Marker
                    key={report.id}
                    longitude={parseFloat(report.longitude)}
                    latitude={parseFloat(report.latitude)}
                    anchor="center"
                    onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setSelectedReport(report);
                    }}
                >
                    <div className="relative flex items-center justify-center w-10 h-10 cursor-pointer hover:scale-110 transition-transform duration-300">
                        <span
                            className={`absolute w-10 h-10 opacity-50 rounded-full animate-ping ${
                                report.status === "menunggu"
                                    ? "bg-red-500"
                                    : report.status === "proses"
                                      ? "bg-blue-500"
                                      : "bg-[#a7e94a]"
                            }`}
                        ></span>
                        <span
                            className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md ${
                                report.status === "menunggu"
                                    ? "bg-red-600"
                                    : report.status === "proses"
                                      ? "bg-blue-600"
                                      : "bg-[#a7e94a]"
                            }`}
                        ></span>
                    </div>
                </Marker>
            ))}

            {/* POPUP LAPORAN */}
            {selectedReport && (
                <Popup
                    longitude={parseFloat(selectedReport.longitude)}
                    latitude={parseFloat(selectedReport.latitude)}
                    anchor="bottom"
                    offset={20}
                    onClose={() => setSelectedReport(null)}
                    closeOnClick={true}
                    closeButton={false}
                    className="z-50"
                    maxWidth="320px"
                >
                    <div className="flex flex-col w-[240px] gap-0 rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-white">
                        {/* Area Foto Popup */}
                        <div className="relative h-32 w-full bg-slate-200">
                            <img
                                src={`/storage/${selectedReport.photo_path}`}
                                alt="Foto Sampah"
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors z-10"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke="currentColor"
                                    className="w-3 h-3"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                            <span
                                className={`absolute bottom-2 left-2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md shadow-sm backdrop-blur-md ${
                                    selectedReport.status === "menunggu"
                                        ? "bg-red-500/90 text-white"
                                        : selectedReport.status === "proses"
                                          ? "bg-blue-500/90 text-white"
                                          : "bg-[#a7e94a]/90 text-slate-900"
                                }`}
                            >
                                {selectedReport.status}
                            </span>
                        </div>

                        {/* Area Teks Popup */}
                        <div className="p-4 flex flex-col">
                            <h3 className="text-slate-800 text-xs font-bold leading-snug line-clamp-2 mb-2">
                                {selectedReport.description ||
                                    "Laporan tumpukan sampah."}
                            </h3>
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-3 h-3 text-slate-400"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="flex items-center gap-1 overflow-hidden">
                                    <span className="text-[10px] text-slate-600 font-semibold truncate">
                                        {selectedReport.user?.name}
                                    </span>
                                    {!!selectedReport.user?.warga
                                        ?.is_terverifikasi && (
                                        <span
                                            title="Pelapor Terverifikasi (Reputasi Tinggi)"
                                            className="flex items-center flex-shrink-0"
                                        >
                                            <ShieldCheck
                                                className="w-3 h-3 text-blue-500 fill-blue-500/20"
                                                strokeWidth={2.5}
                                            />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Popup>
            )}
        </Map>
    );
}
