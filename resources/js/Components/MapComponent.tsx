import {
    useState,
    useMemo,
    useRef,
    forwardRef,
    useImperativeHandle,
} from "react";
import Map, {
    Marker,
    Popup,
    Source,
    Layer,
    GeolocateControl,
    NavigationControl,
} from "react-map-gl/mapbox";
import { Link } from "@inertiajs/react";
import type { LayerProps, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {
    ChevronLeft,
    ChevronRight,
    MapPinHouseInside, // Import ikon Map
    Calendar, // Import ikon Kalender
    Clock4, // Import ikon Jam
    Like, // Import ikon Jempol
    MessageDots, // Import ikon Pesan
    X, // Import ikon Silang (Close)
} from "@mynaui/icons-react";
import { landingDict } from "@/Lang/Landing";

interface Report {
    id: number;
    latitude: string;
    longitude: string;
    description: string;
    status: string;
    severity_level?: string;
    waste_type?: string;
    address?: string;
    photo_path: string;
    user: { id: number; name: string; avatar?: string | null };
    likes_count: number;
    comments_count: number;
    created_at: string;
}

interface DangerZone {
    id: number;
    name: string;
    description?: string;
    type: string;
    severity: string;
    coordinates?: number[][];
    center_lat?: number;
    center_lng?: number;
    radius_meters?: number;
}

interface WasteDensityZone {
    id: number;
    name: string;
    coordinates?: number[][];
    density_level: string;
    kelurahan?: string;
    kecamatan?: string;
    report_count: number;
}

interface MapProps {
    reports: Report[];
    dangerZones: DangerZone[];
    wasteDensityZones: WasteDensityZone[];
    isDarkMode: boolean;
    mapSettings?: {
        showHeatmap: boolean;
        showMarkers: boolean;
        showDangerZones: boolean;
        showDensityZones: boolean;
    };
    onToggleSetting?: (setting: any) => void;
    onSelectReport?: (id: number) => void;
    searchedLocation?: { lat: number; lng: number; address: string } | null;
    onClearSearchLocation?: () => void;
    onReportSearchedLocation?: () => void;
    onGeolocate?: (lat: number, lng: number) => void;
    lang?: "id" | "en";
}

export interface MapHandle {
    centerOnUser: () => void;
    flyTo: (lat: number, lng: number) => void;
    openPopup: (report: Report) => void;
}

const severityColor: Record<string, string> = {
    low: "#facc15",
    medium: "#f97316",
    high: "#ef4444",
    critical: "#7f1d1d",
};

const densityColor: Record<string, string> = {
    very_low: "rgba(167,233,74,0.15)",
    low: "rgba(167,233,74,0.30)",
    medium: "rgba(251,191,36,0.40)",
    high: "rgba(249,115,22,0.45)",
    very_high: "rgba(239,68,68,0.50)",
};

const densityBorder: Record<string, string> = {
    very_low: "rgba(167,233,74,0.5)",
    low: "rgba(167,233,74,0.7)",
    medium: "rgba(251,191,36,0.8)",
    high: "rgba(249,115,22,0.9)",
    very_high: "rgba(239,68,68,1)",
};

const MapComponent = forwardRef<MapHandle, MapProps>(function MapComponent(
    {
        reports,
        dangerZones,
        wasteDensityZones,
        isDarkMode,
        mapSettings: propsMapSettings,
        onToggleSetting,
        onSelectReport,
        searchedLocation,
        onClearSearchLocation,
        onReportSearchedLocation,
        onGeolocate,
        lang = "id",
    },
    ref,
) {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isLegendCollapsed, setIsLegendCollapsed] = useState(false);
    const [currentZoom, setCurrentZoom] = useState(10);
    // Use props if provided, fallback to internal state for backward compatibility/standalone use
    const [internalMapSettings, setInternalMapSettings] = useState({
        showHeatmap: true,
        showMarkers: true,
        showDangerZones: true,
        showDensityZones: false,
    });

    const mapSettings = propsMapSettings || internalMapSettings;
    const setMapSettings = onToggleSetting
        ? (updater: any) => {
              // If it's a function updater (from the old code), we need to extract the key
              // but since we're refactoring, we'll try to keep it simple.
              // The existing code uses setMapSettings(s => ({ ...s, key: !s.key }))
              // We'll handle both cases if possible, but primarily we want to use onToggleSetting.
          }
        : setInternalMapSettings;

    const handleToggle = (setting: string) => {
        if (onToggleSetting) {
            onToggleSetting(setting);
        } else {
            setInternalMapSettings((prev) => ({
                ...prev,
                [setting]: !prev[setting as keyof typeof internalMapSettings],
            }));
        }
    };
    const mapRef = useRef<MapRef>(null);
    const geolocateRef = useRef<any>(null);

    const lombokCenter = { longitude: 116.3167, latitude: -8.5833, zoom: 10 };
    const t = landingDict[lang];

    useImperativeHandle(ref, () => ({
        centerOnUser: () => {
            geolocateRef.current?.trigger();
        },
        flyTo: (lat: number, lng: number) => {
            mapRef.current?.flyTo({
                center: [lng, lat],
                zoom: 16,
                padding: { top: 250 },
                essential: true,
                duration: 1500,
            });
        },
        openPopup: (report: Report) => {
            setSelectedReport(report);
        },
    }));

    const reportsGeoJson = useMemo(
        () => ({
            type: "FeatureCollection" as const,
            features: reports.map((r) => {
                const severityWeight: Record<string, number> = {
                    low: 1,
                    medium: 4,
                    high: 8,
                    critical: 10,
                };
                return {
                    type: "Feature" as const,
                    properties: {
                        id: r.id,
                        mag: severityWeight[r.severity_level || "low"] || 1,
                    },
                    geometry: {
                        type: "Point" as const,
                        coordinates: [
                            parseFloat(r.longitude),
                            parseFloat(r.latitude),
                        ],
                    },
                };
            }),
        }),
        [reports],
    );

    // ── Danger Zones GeoJSON (polygons or circles) ──
    const dangerGeoJson = useMemo(
        () => ({
            type: "FeatureCollection" as const,
            features: dangerZones
                .filter((z) => z.coordinates && z.coordinates.length >= 3)
                .map((z) => ({
                    type: "Feature" as const,
                    properties: { severity: z.severity, name: z.name },
                    geometry: {
                        type: "Polygon" as const,
                        coordinates: [z.coordinates!],
                    },
                })),
        }),
        [dangerZones],
    );

    // ── Waste Density GeoJSON (polygons) ──
    const densityGeoJson = useMemo(
        () => ({
            type: "FeatureCollection" as const,
            features: wasteDensityZones
                .filter((z) => z.coordinates && z.coordinates.length >= 3)
                .map((z) => ({
                    type: "Feature" as const,
                    properties: {
                        density_level: z.density_level,
                        name: z.name,
                    },
                    geometry: {
                        type: "Polygon" as const,
                        coordinates: [z.coordinates!],
                    },
                })),
        }),
        [wasteDensityZones],
    );

    const heatmapLayer: LayerProps = {
        id: "reports-heat",
        type: "heatmap",
        source: "reports-data",
        maxzoom: 15,
        layout: {
            visibility: mapSettings.showHeatmap ? "visible" : "none",
        },
        paint: {
            // Increase the heatmap weight based on report severity (mag)
            "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                1,
                0.2, // low
                10,
                1.5, // critical
            ],
            // Increase the heatmap intensity with zoom level
            "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                1,
                9,
                3,
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Using a "Waste Severity" palette (Green -> Orange -> Red)
            "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(0, 0, 0, 0)",
                0.2,
                "rgba(167, 233, 74, 0.5)", // #a7e94a (Brand Green)
                0.4,
                "rgba(250, 204, 21, 0.7)", // Yellow
                0.6,
                "rgba(249, 115, 22, 0.8)", // Orange
                1,
                "rgba(239, 68, 68, 0.9)", // Red
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                2,
                9,
                25,
            ],
            // Transition from heatmap to points as the user zooms in
            "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                13,
                1,
                15,
                0,
            ],
        },
    };

    const pointLayer: LayerProps = {
        id: "reports-point",
        type: "circle",
        source: "reports-data",
        minzoom: 7,
        layout: {
            visibility: mapSettings.showMarkers ? "visible" : "none",
            "circle-sort-key": ["get", "mag"],
        },
        paint: {
            // --- 1. RADIUS DINAMIS: Skala membesar raksasa saat di-zoom ---
            "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                ["interpolate", ["linear"], ["get", "mag"], 1, 2, 8, 6],
                12,
                ["interpolate", ["linear"], ["get", "mag"], 1, 5, 8, 18],
                16,
                ["interpolate", ["linear"], ["get", "mag"], 1, 15, 8, 50], // Di zoom 16, titik High menjadi 50px
                20,
                ["interpolate", ["linear"], ["get", "mag"], 1, 25, 8, 80],
            ],

            "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                1,
                "rgb(250, 204, 21)", // Low (Kuning)
                4,
                "rgb(249, 115, 22)", // Moderate (Oranye)
                8,
                "rgb(178, 24, 43)", // High (Merah)
            ],

            // --- 3. STROKE: Garis putih luar yang proporsional ---
            "circle-stroke-color": "white",
            "circle-stroke-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                1,
                12,
                2,
                16,
                4, // Sesuai dengan ukuran 50px
                20,
                6,
            ],

            "circle-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1],
            "circle-stroke-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                0,
                8,
                1,
            ],
        },
    };

    const dangerFillLayer: LayerProps = {
        id: "danger-fill",
        type: "fill",
        source: "danger-data",
        layout: {
            visibility: mapSettings.showDangerZones ? "visible" : "none",
        },
        paint: {
            "fill-color": [
                "match",
                ["get", "severity"],
                "low",
                "rgba(250,204,21,0.15)",
                "medium",
                "rgba(249,115,22,0.20)",
                "high",
                "rgba(239,68,68,0.25)",
                "critical",
                "rgba(127,29,29,0.30)",
                "rgba(239,68,68,0.20)",
            ],
            "fill-opacity": 0.8,
        },
    };

    const dangerLineLayer: LayerProps = {
        id: "danger-line",
        type: "line",
        source: "danger-data",
        paint: {
            "line-color": [
                "match",
                ["get", "severity"],
                "low",
                "#facc15",
                "medium",
                "#f97316",
                "high",
                "#ef4444",
                "critical",
                "#7f1d1d",
                "#ef4444",
            ],
            "line-width": 2,
            "line-dasharray": [2, 2],
        },
    };

    const densityFillLayer: LayerProps = {
        id: "density-fill",
        type: "fill",
        source: "density-data",
        layout: {
            visibility: mapSettings.showDensityZones ? "visible" : "none",
        },
        paint: {
            "fill-color": [
                "match",
                ["get", "density_level"],
                "very_low",
                "rgba(167,233,74,0.15)",
                "low",
                "rgba(167,233,74,0.25)",
                "medium",
                "rgba(251,191,36,0.35)",
                "high",
                "rgba(249,115,22,0.40)",
                "very_high",
                "rgba(239,68,68,0.45)",
                "rgba(167,233,74,0.15)",
            ],
            "fill-opacity": 0.85,
        },
    };

    const densityLineLayer: LayerProps = {
        id: "density-line",
        type: "line",
        source: "density-data",
        paint: {
            "line-color": [
                "match",
                ["get", "density_level"],
                "very_low",
                "rgba(167,233,74,0.5)",
                "low",
                "rgba(167,233,74,0.7)",
                "medium",
                "rgba(251,191,36,0.8)",
                "high",
                "rgba(249,115,22,0.9)",
                "very_high",
                "rgba(239,68,68,1)",
                "rgba(167,233,74,0.5)",
            ],
            "line-width": 1.5,
        },
    };

    const statusColor = (status: string) => {
        if (status === "menunggu")
            return { ping: "bg-red-500", dot: "bg-red-600" };
        if (status === "proses")
            return { ping: "bg-blue-500", dot: "bg-blue-600" };
        return { ping: "bg-[#a7e94a]", dot: "bg-[#a7e94a]" };
    };

    const calculateScale = (zoom: number) => {
        if (zoom <= 9) return 0.25;
        if (zoom >= 16) return 1.4;
        return 0.25 + ((zoom - 9) / 7) * 1.15;
    };
    const dynamicScale = calculateScale(currentZoom);

    const calculatePingMultiplier = (zoom: number) => {
        if (zoom <= 9) return 4; // Ping 4x lipat lebih besar saat dari jauh
        if (zoom >= 14) return 1; // Ukuran ping normal saat dilihat dari dekat
        return 4 - ((zoom - 9) / 5) * 3;
    };
    const pingMultiplier = calculatePingMultiplier(currentZoom);

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
            attributionControl={false}
            logoPosition="bottom-left"
            // --- TAMBAHKAN BARIS INI ---
            onClick={(e) => {
                // Pastikan klik terjadi pada peta, bukan pada elemen di dalamnya (seperti marker)
                if (e.originalEvent.target instanceof HTMLCanvasElement) {
                    setSelectedReport(null);
                }
            }}
            onZoom={(e) => setCurrentZoom(e.viewState.zoom)}
        >
            <style>{`
                .mapboxgl-ctrl-logo { display: none !important; }
                .mapboxgl-ctrl-attrib { display: none !important; }
                .mapboxgl-ctrl-geolocate { display: none !important; }
                .mapboxgl-popup { z-index: 999 !important; }

                .custom-react-popup .mapboxgl-popup-content {
                    padding: 0 !important;
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .custom-react-popup.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
                    border-top-color: ${isDarkMode ? "#1e293b" : "#ffffff"} !important;
                }
                .custom-react-popup.mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
                    border-bottom-color: ${isDarkMode ? "#1e293b" : "#ffffff"} !important;
                }
            `}</style>

            <div style={{ display: "none" }}>
                <GeolocateControl
                    ref={geolocateRef}
                    positionOptions={{ enableHighAccuracy: true }}
                    trackUserLocation
                    showUserHeading
                    onGeolocate={(e: any) =>
                        onGeolocate?.(e.coords.latitude, e.coords.longitude)
                    }
                />
            </div>

            {/* Legend */}
            {mapSettings.showHeatmap && (
                <div
                    className={`absolute bottom-[140px] xl:bottom-8 z-50 transition-all duration-500 ease-in-out flex items-center ${
                        isLegendCollapsed
                            ? "left-0 -translate-x-full"
                            : "left-4 xl:left-6"
                    }`}
                >
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 w-44 xl:w-48 relative overflow-hidden group">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            {lang === "id"
                                ? "Kepadatan Sampah"
                                : "Waste Density"}
                        </h4>
                        <div className="flex flex-col gap-2">
                            <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-[#a7e94a] via-amber-400 to-red-500" />
                            <div className="flex justify-between text-[9px] font-bold text-slate-500">
                                <span>{lang === "id" ? "Rendah" : "Low"}</span>
                                <span>{lang === "id" ? "Tinggi" : "High"}</span>
                            </div>
                        </div>

                        {/* Collapse button (shows on hover or when collapsed) */}
                        <button
                            onClick={() => setIsLegendCollapsed(true)}
                            className="absolute top-0 right-0 bottom-0 w-8 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 hover:bg-[#a7e94a] dark:hover:bg-[#a7e94a] hover:text-white text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-all border-l border-slate-100 dark:border-slate-700"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Uncollapse handle when collapsed */}
                    {isLegendCollapsed && (
                        <button
                            onClick={() => setIsLegendCollapsed(false)}
                            className="absolute left-full bottom-0 top-0 w-10 flex items-center justify-center bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-r-2xl text-slate-500 dark:text-slate-400 hover:text-[#a7e94a] transition-all animate-in slide-in-from-left duration-300 pointer-events-auto"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            )}

            {/* Waste Density layer */}
            <Source id="density-data" type="geojson" data={densityGeoJson}>
                <Layer {...densityFillLayer} />
                <Layer {...densityLineLayer} />
            </Source>

            {/* Danger Zones layer */}
            <Source id="danger-data" type="geojson" data={dangerGeoJson}>
                <Layer {...dangerFillLayer} />
                <Layer {...dangerLineLayer} />
            </Source>

            {/* Report heatmap */}
            <Source id="reports-data" type="geojson" data={reportsGeoJson}>
                <Layer {...heatmapLayer} />
                <Layer {...pointLayer} />
            </Source>

            {/* Danger zone circle markers (center point) */}
            {dangerZones
                .filter((z) => z.center_lat && z.center_lng)
                .map((zone) => (
                    <Marker
                        key={`dz-${zone.id}`}
                        longitude={zone.center_lng!}
                        latitude={zone.center_lat!}
                        anchor="center"
                    >
                        <div
                            style={{
                                transform: `scale(${dynamicScale})`,
                                transition: "transform 0.1s ease-out",
                            }}
                        >
                            <div
                                title={zone.name}
                                className="relative flex items-center justify-center w-8 h-8 cursor-pointer hover:scale-125 transition-transform"
                            >
                                {/* --- BUNGKUSAN KHUSUS UNTUK MEMBESARKAN PING SAAT JAUH --- */}
                                <div
                                    className="absolute flex items-center justify-center"
                                    style={{
                                        transform: `scale(${pingMultiplier})`,
                                        transition: "transform 0.1s ease-out",
                                    }}
                                >
                                    <span
                                        className={`absolute w-8 h-8 rounded-full opacity-80 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                                        style={{
                                            backgroundColor:
                                                severityColor[zone.severity] ||
                                                "#ef4444",
                                        }}
                                    />
                                </div>

                                {/* Dot utama */}
                                <span
                                    className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-lg`}
                                    style={{
                                        backgroundColor:
                                            severityColor[zone.severity] ||
                                            "#ef4444",
                                    }}
                                />
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                    {zone.name}
                                </span>
                            </div>
                        </div>
                    </Marker>
                ))}

            {/* Report markers */}
            {mapSettings.showMarkers &&
                reports.map((report) => {
                    const { ping, dot } = statusColor(report.status);
                    return (
                        <Marker
                            key={report.id}
                            longitude={parseFloat(report.longitude)}
                            latitude={parseFloat(report.latitude)}
                            anchor="center"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setSelectedReport(report);

                                // --- MENGGESER KAMERA OTOMATIS SAAT MARKER DIKLIK ---
                                mapRef.current?.flyTo({
                                    center: [
                                        parseFloat(report.longitude),
                                        parseFloat(report.latitude),
                                    ],
                                    zoom: 16,
                                    padding: { top: 350 }, // Jarak aman ekstra agar popup bebas hambatan
                                    duration: 800,
                                });
                            }}
                        >
                            <div
                                style={{
                                    transform: `scale(${dynamicScale})`,
                                    transition: "transform 0.1s ease-out",
                                }}
                            >
                                <div className="relative flex items-center justify-center w-10 h-10 cursor-pointer hover:scale-110 transition-transform duration-300 group">
                                    {/* --- BUNGKUSAN KHUSUS UNTUK MEMBESARKAN PING SAAT JAUH --- */}
                                    <div
                                        className="absolute flex items-center justify-center"
                                        style={{
                                            transform: `scale(${pingMultiplier})`,
                                            transition:
                                                "transform 0.1s ease-out",
                                        }}
                                    >
                                        <span
                                            className={`absolute w-10 h-10 opacity-80 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] shadow-[0_0_15px_rgba(0,0,0,0.5)] ${ping}`}
                                        />
                                    </div>

                                    {/* Dot utama */}
                                    <span
                                        className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md ${dot}`}
                                    />

                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                            {report.severity_level?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Marker>
                    );
                })}

            {/* Popup */}
            {selectedReport && (
                <Popup
                    longitude={parseFloat(selectedReport.longitude)}
                    latitude={parseFloat(selectedReport.latitude)}
                    anchor="bottom"
                    offset={20}
                    onClose={() => setSelectedReport(null)}
                    closeOnClick={false}
                    closeButton={false}
                    className="!z-[999] custom-react-popup"
                    maxWidth="350px"
                >
                    <div
                        className={`w-[280px] sm:w-80 font-sans flex flex-col p-4 rounded-3xl overflow-hidden shadow-2xl border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                    >
                        {/* Header: Foto & Status */}
                        <div
                            className={`h-36 sm:h-40 w-full mb-4 rounded-2xl overflow-hidden relative border ${isDarkMode ? "border-slate-700 bg-slate-700" : "border-slate-200 bg-slate-200"}`}
                        >
                            <img
                                src={`/storage/${selectedReport.photo_path}`}
                                alt="Foto Sampah"
                                className="w-full h-full object-cover"
                            />

                            {/* Tombol Close Melayang (X) */}
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/45 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all hover:scale-110 hover:rotate-90 z-10 border border-white/30"
                            >
                                <X className="w-4 h-4" strokeWidth={2.5} />
                            </button>

                            {/* Badge Status */}
                            <div
                                className={`absolute bottom-2.5 left-2.5 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest rounded-lg shadow-lg backdrop-blur-md border border-white/20 ${selectedReport.status === "menunggu" ? "bg-red-500/90 text-white" : selectedReport.status === "proses" ? "bg-blue-500/90 text-white" : "bg-[#a7e94a]/90 text-slate-900"}`}
                            >
                                {selectedReport.status}
                            </div>
                        </div>

                        {/* Informasi Pelapor & Tanggal */}
                        <div
                            className={`flex flex-col mb-3 pb-3 px-1 border-b ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}
                        >
                            <div className="flex items-center justify-between mb-2.5">
                                <span
                                    className={`text-xs font-black flex items-center tracking-tight truncate ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}
                                >
                                    {selectedReport.user?.name}
                                </span>

                                {/* Ikon Likes & Comments */}
                                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                                    <span className="text-[10px] font-bold flex items-center gap-1">
                                        <Like className="w-3.5 h-3.5" />
                                        {selectedReport.likes_count}
                                    </span>
                                    <span className="text-[10px] font-bold flex items-center gap-1">
                                        <MessageDots className="w-3.5 h-3.5" />
                                        {selectedReport.comments_count}
                                    </span>
                                </div>
                            </div>

                            {/* Grid Tanggal dan Waktu menggunakan ICON */}
                            <div className="flex items-center gap-2">
                                <span
                                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md border ${isDarkMode ? "bg-slate-700/50 text-slate-400 border-slate-600/50" : "bg-slate-50 text-slate-500 border-slate-100"}`}
                                >
                                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                                    {new Date(
                                        selectedReport.created_at,
                                    ).toLocaleDateString(
                                        lang === "id" ? "id-ID" : "en-US",
                                        {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        },
                                    )}
                                </span>
                                <span
                                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md border ${isDarkMode ? "bg-slate-700/50 text-slate-400 border-slate-600/50" : "bg-slate-50 text-slate-500 border-slate-100"}`}
                                >
                                    <Clock4 className="w-3.5 h-3.5 shrink-0" />
                                    {new Date(
                                        selectedReport.created_at,
                                    ).toLocaleTimeString(
                                        lang === "id" ? "id-ID" : "en-US",
                                        { hour: "2-digit", minute: "2-digit" },
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Deskripsi & Lokasi (Pin) */}
                        <div className="flex flex-col gap-1.5 px-1 mb-5">
                            <h3
                                className={`text-xs font-semibold leading-snug line-clamp-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
                            >
                                {selectedReport.description || t.noReports}
                            </h3>
                            {selectedReport.address && (
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 flex items-center gap-1 mt-1">
                                    <MapPinHouseInside className="w-3 h-3 shrink-0" />{" "}
                                    {selectedReport.address}
                                </p>
                            )}
                        </div>

                        {/* Tombol Lihat Detail */}
                        {onSelectReport ? (
                            <button
                                onClick={() =>
                                    onSelectReport(selectedReport.id)
                                }
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black shadow-md shadow-[#a7e94a]/20 transition-all hover:scale-[1.02] active:scale-95 tracking-widest border border-[#a7e94a] bg-[#a7e94a] text-white hover:bg-[#96d242]"
                            >
                                {t.viewDetail}
                            </button>
                        ) : (
                            <Link
                                href={route("report.show", selectedReport.id)}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black shadow-md shadow-[#a7e94a]/20 transition-all hover:scale-[1.02] active:scale-95 tracking-widest border border-[#a7e94a] bg-[#a7e94a] text-white hover:bg-[#96d242]"
                            >
                                {t.viewDetail}
                            </Link>
                        )}
                    </div>
                </Popup>
            )}

            {/* Searched Location Marker & Popup */}
            {searchedLocation && (
                <>
                    <Marker
                        longitude={searchedLocation.lng}
                        latitude={searchedLocation.lat}
                        anchor="bottom"
                    >
                        <div
                            style={{
                                transform: `scale(${dynamicScale})`,
                                transition: "transform 0.1s ease-out",
                                transformOrigin: "bottom center",
                            }}
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 bg-[#a7e94a] rounded-full border-[3px] border-white shadow-lg flex items-center justify-center animate-bounce">
                                    <svg
                                        className="w-4 h-4 text-slate-900"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Marker>
                    <Popup
                        longitude={searchedLocation.lng}
                        latitude={searchedLocation.lat}
                        anchor="top"
                        offset={10}
                        onClose={onClearSearchLocation}
                        closeOnClick={false}
                        closeButton={false}
                        className="!z-[999]"
                    >
                        <div className="px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col gap-2 w-[220px] relative border border-slate-100 dark:border-slate-700">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onClearSearchLocation)
                                        onClearSearchLocation();
                                }}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-100 pr-4">
                                {lang === "id"
                                    ? "Lokasi Pencarian"
                                    : "Searched Location"}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-medium line-clamp-3 mb-1">
                                {searchedLocation.address}
                            </p>
                            {onReportSearchedLocation && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onReportSearchedLocation)
                                            onReportSearchedLocation();
                                    }}
                                    className="w-full py-2 bg-slate-900 dark:bg-[#a7e94a] text-white dark:text-slate-900 text-[10px] font-black rounded-lg hover:bg-slate-800 dark:hover:bg-[#96d142] transition-colors tracking-wider uppercase"
                                >
                                    {lang === "id"
                                        ? "Lapor di sini"
                                        : "Report here"}
                                </button>
                            )}
                        </div>
                    </Popup>
                </>
            )}
        </Map>
    );
});

export default MapComponent;
