import { useState, useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import Map, {
    Marker,
    Popup,
    Source,
    Layer,
    GeolocateControl,
    NavigationControl,
} from "react-map-gl/mapbox";
import { Link } from "@inertiajs/react";
import type { LayerProps, MapRef, GeolocateControlRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { ChevronLeft, ChevronRight } from "@mynaui/icons-react";

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
}

export interface MapHandle {
    centerOnUser: () => void;
}

const severityColor: Record<string, string> = {
    low: '#facc15',
    medium: '#f97316',
    high: '#ef4444',
    critical: '#7f1d1d',
};

const densityColor: Record<string, string> = {
    very_low: 'rgba(167,233,74,0.15)',
    low: 'rgba(167,233,74,0.30)',
    medium: 'rgba(251,191,36,0.40)',
    high: 'rgba(249,115,22,0.45)',
    very_high: 'rgba(239,68,68,0.50)',
};

const densityBorder: Record<string, string> = {
    very_low: 'rgba(167,233,74,0.5)',
    low: 'rgba(167,233,74,0.7)',
    medium: 'rgba(251,191,36,0.8)',
    high: 'rgba(249,115,22,0.9)',
    very_high: 'rgba(239,68,68,1)',
};

const MapComponent = forwardRef<MapHandle, MapProps>(
    function MapComponent({
        reports,
        dangerZones,
        wasteDensityZones,
        isDarkMode,
        mapSettings: propsMapSettings,
        onToggleSetting,
        onSelectReport
    }, ref) {
        const [selectedReport, setSelectedReport] = useState<Report | null>(null);
        const [isLegendCollapsed, setIsLegendCollapsed] = useState(false);
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
                setInternalMapSettings(prev => ({ ...prev, [setting]: !prev[setting as keyof typeof internalMapSettings] }));
            }
        };
        const mapRef = useRef<MapRef>(null);
        const geolocateRef = useRef<GeolocateControlRef>(null);

        const lombokCenter = { longitude: 116.3167, latitude: -8.5833, zoom: 10 };

        useImperativeHandle(ref, () => ({
            centerOnUser: () => { geolocateRef.current?.trigger(); },
        }));

        const reportsGeoJson = useMemo(() => ({
            type: "FeatureCollection" as const,
            features: reports.map(r => {
                const severityWeight: Record<string, number> = {
                    low: 1,
                    medium: 3,
                    high: 6,
                    critical: 10
                };
                return {
                    type: "Feature" as const,
                    properties: {
                        id: r.id,
                        mag: severityWeight[r.severity_level || 'low'] || 1
                    },
                    geometry: {
                        type: "Point" as const,
                        coordinates: [parseFloat(r.longitude), parseFloat(r.latitude)],
                    },
                };
            }),
        }), [reports]);

        // ── Danger Zones GeoJSON (polygons or circles) ──
        const dangerGeoJson = useMemo(() => ({
            type: "FeatureCollection" as const,
            features: dangerZones
                .filter(z => z.coordinates && z.coordinates.length >= 3)
                .map(z => ({
                    type: "Feature" as const,
                    properties: { severity: z.severity, name: z.name },
                    geometry: {
                        type: "Polygon" as const,
                        coordinates: [z.coordinates!],
                    },
                })),
        }), [dangerZones]);

        // ── Waste Density GeoJSON (polygons) ──
        const densityGeoJson = useMemo(() => ({
            type: "FeatureCollection" as const,
            features: wasteDensityZones
                .filter(z => z.coordinates && z.coordinates.length >= 3)
                .map(z => ({
                    type: "Feature" as const,
                    properties: { density_level: z.density_level, name: z.name },
                    geometry: {
                        type: "Polygon" as const,
                        coordinates: [z.coordinates!],
                    },
                })),
        }), [wasteDensityZones]);

        const heatmapLayer: LayerProps = {
            id: "reports-heat",
            type: "heatmap",
            source: "reports-data",
            maxzoom: 15,
            layout: {
                visibility: mapSettings.showHeatmap ? 'visible' : 'none',
            },
            paint: {
                // Increase the heatmap weight based on report severity (mag)
                "heatmap-weight": [
                    "interpolate",
                    ["linear"],
                    ["get", "mag"],
                    1, 0.2, // low
                    10, 1.5 // critical
                ],
                // Increase the heatmap intensity with zoom level
                "heatmap-intensity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0, 1,
                    9, 3
                ],
                // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                // Using a "Waste Severity" palette (Green -> Orange -> Red)
                "heatmap-color": [
                    "interpolate",
                    ["linear"],
                    ["heatmap-density"],
                    0, "rgba(0, 0, 0, 0)",
                    0.2, "rgba(167, 233, 74, 0.5)", // #a7e94a (Brand Green)
                    0.4, "rgba(250, 204, 21, 0.7)", // Yellow
                    0.6, "rgba(249, 115, 22, 0.8)", // Orange
                    1, "rgba(239, 68, 68, 0.9)"    // Red
                ],
                // Adjust the heatmap radius by zoom level
                "heatmap-radius": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0, 2,
                    9, 25
                ],
                // Transition from heatmap to points as the user zooms in
                "heatmap-opacity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    13, 1,
                    15, 0
                ],
            },
        };

        const pointLayer: LayerProps = {
            id: "reports-point",
            type: "circle",
            source: "reports-data",
            minzoom: 7,
            layout: {
                visibility: mapSettings.showMarkers ? 'visible' : 'none',
            },
            paint: {
                "circle-radius": [
                    "interpolate", ["linear"], ["zoom"],
                    7, ["interpolate", ["linear"], ["get", "mag"], 1, 1, 6, 4],
                    16, ["interpolate", ["linear"], ["get", "mag"], 1, 5, 6, 50],
                ],
                "circle-color": [
                    "interpolate", ["linear"], ["get", "mag"],
                    1, "rgba(33,102,172,0)",
                    2, "rgb(103,169,207)",
                    3, "rgb(253,219,199)",
                    4, "rgb(239,138,98)",
                    5, "rgb(178,24,43)",
                    6, "rgb(178,24,43)",
                ],
                "circle-stroke-color": "white",
                "circle-stroke-width": 1,
                "circle-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1],
            },
        };

        const dangerFillLayer: LayerProps = {
            id: "danger-fill",
            type: "fill",
            source: "danger-data",
            layout: {
                visibility: mapSettings.showDangerZones ? 'visible' : 'none',
            },
            paint: {
                "fill-color": [
                    "match", ["get", "severity"],
                    "low", "rgba(250,204,21,0.15)",
                    "medium", "rgba(249,115,22,0.20)",
                    "high", "rgba(239,68,68,0.25)",
                    "critical", "rgba(127,29,29,0.30)",
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
                    "match", ["get", "severity"],
                    "low", "#facc15",
                    "medium", "#f97316",
                    "high", "#ef4444",
                    "critical", "#7f1d1d",
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
                visibility: mapSettings.showDensityZones ? 'visible' : 'none',
            },
            paint: {
                "fill-color": [
                    "match", ["get", "density_level"],
                    "very_low", "rgba(167,233,74,0.15)",
                    "low", "rgba(167,233,74,0.25)",
                    "medium", "rgba(251,191,36,0.35)",
                    "high", "rgba(249,115,22,0.40)",
                    "very_high", "rgba(239,68,68,0.45)",
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
                    "match", ["get", "density_level"],
                    "very_low", "rgba(167,233,74,0.5)",
                    "low", "rgba(167,233,74,0.7)",
                    "medium", "rgba(251,191,36,0.8)",
                    "high", "rgba(249,115,22,0.9)",
                    "very_high", "rgba(239,68,68,1)",
                    "rgba(167,233,74,0.5)",
                ],
                "line-width": 1.5,
            },
        };

        const statusColor = (status: string) => {
            if (status === "menunggu") return { ping: "bg-red-500", dot: "bg-red-600" };
            if (status === "proses") return { ping: "bg-blue-500", dot: "bg-blue-600" };
            return { ping: "bg-[#a7e94a]", dot: "bg-[#a7e94a]" };
        };

        return (
            <Map
                ref={mapRef}
                initialViewState={lombokCenter}
                style={{ width: "100%", height: "100%" }}
                mapStyle={isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v12"}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                attributionControl={false}
                logoPosition="bottom-left"
            >
                <style>{`.mapboxgl-ctrl-logo { display: none !important; } .mapboxgl-ctrl-attrib { display: none !important; } .mapboxgl-ctrl-geolocate { display: none !important; }`}</style>

                <div style={{ display: 'none' }}>
                    <GeolocateControl
                        ref={geolocateRef}
                        positionOptions={{ enableHighAccuracy: true }}
                        trackUserLocation
                        showUserHeading
                    />
                </div>


                {/* Legend */}
                {mapSettings.showHeatmap && (
                    <div
                        className={`absolute bottom-32 z-50 transition-all duration-500 ease-in-out flex items-center ${isLegendCollapsed
                            ? 'left-0 -translate-x-full ml-10'
                            : 'left-6'
                            }`}
                    >
                        <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-slate-100 w-48 relative overflow-hidden group">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kepadatan Laporan</h4>
                            <div className="flex flex-col gap-2">
                                <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-[#a7e94a] via-amber-400 to-red-500" />
                                <div className="flex justify-between text-[9px] font-bold text-slate-500">
                                    <span>Rendah</span>
                                    <span>Tinggi</span>
                                </div>
                            </div>

                            {/* Collapse button (shows on hover or when collapsed) */}
                            <button
                                onClick={() => setIsLegendCollapsed(true)}
                                className="absolute top-0 right-0 bottom-0 w-8 flex items-center justify-center bg-slate-50/50 hover:bg-[#a7e94a] hover:text-white text-slate-400 opacity-0 group-hover:opacity-100 transition-all border-l border-slate-100"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Uncollapse handle when collapsed */}
                        {isLegendCollapsed && (
                            <button
                                onClick={() => setIsLegendCollapsed(false)}
                                className="absolute left-0 bottom-0 top-0 w-10 flex items-center justify-center bg-white shadow-xl border border-slate-100 rounded-r-2xl text-slate-500 hover:text-[#a7e94a] transition-all animate-in slide-in-from-left duration-300 pointer-events-auto"
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
                {dangerZones.filter(z => z.center_lat && z.center_lng).map(zone => (
                    <Marker
                        key={`dz-${zone.id}`}
                        longitude={zone.center_lng!}
                        latitude={zone.center_lat!}
                        anchor="center"
                    >
                        <div
                            title={zone.name}
                            className="relative flex items-center justify-center w-8 h-8 cursor-pointer hover:scale-125 transition-transform"
                        >
                            <span className={`absolute w-8 h-8 rounded-full opacity-40 animate-ping`}
                                style={{ backgroundColor: severityColor[zone.severity] || '#ef4444' }} />
                            <span className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-lg`}
                                style={{ backgroundColor: severityColor[zone.severity] || '#ef4444' }} />
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100">
                                {zone.name}
                            </span>
                        </div>
                    </Marker>
                ))}

                {/* Report markers */}
                {mapSettings.showMarkers && reports.map(report => {
                    const { ping, dot } = statusColor(report.status);
                    return (
                        <Marker
                            key={report.id}
                            longitude={parseFloat(report.longitude)}
                            latitude={parseFloat(report.latitude)}
                            anchor="center"
                            onClick={e => {
                                e.originalEvent.stopPropagation();
                                setSelectedReport(report);
                            }}
                        >
                            <div className="relative flex items-center justify-center w-10 h-10 cursor-pointer hover:scale-110 transition-transform duration-300 group">
                                <span className={`absolute w-10 h-10 opacity-50 rounded-full animate-ping ${ping}`} />
                                <span className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md ${dot}`} />
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    <span className="text-[10px] font-bold text-slate-700">{report.severity_level?.toUpperCase()}</span>
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
                        className="z-50"
                        maxWidth="320px"
                    >
                        <div className="flex flex-col w-[240px] gap-0 rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-white">
                            <div className="relative h-32 w-full bg-slate-200">
                                <img src={`/storage/${selectedReport.photo_path}`} alt="Foto Sampah" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors z-10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <span className={`absolute bottom-2 left-2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md shadow-sm backdrop-blur-md ${selectedReport.status === "menunggu" ? "bg-red-500/90 text-white" : selectedReport.status === "proses" ? "bg-blue-500/90 text-white" : "bg-[#a7e94a]/90 text-slate-900"}`}>
                                    {selectedReport.status}
                                </span>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <h3 className="text-slate-800 text-xs font-bold leading-snug line-clamp-2">
                                    {selectedReport.description || "Laporan tumpukan sampah."}
                                </h3>
                                {selectedReport.address && (
                                    <p className="text-[10px] text-slate-400 line-clamp-1">📍 {selectedReport.address}</p>
                                )}
                                <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={selectedReport.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedReport.user?.name || 'U')}&background=e2e8f0&color=64748b&size=32`}
                                                className="w-5 h-5 rounded-full object-cover"
                                                alt=""
                                            />
                                            <span className="text-[10px] text-slate-600 font-semibold truncate">{selectedReport.user?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <span className="text-[10px] font-bold flex items-center gap-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3"><path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" /></svg>
                                                {selectedReport.likes_count}
                                            </span>
                                        </div>
                                    </div>
                                    {onSelectReport ? (
                                        <button
                                            onClick={() => onSelectReport(selectedReport.id)}
                                            className="w-full py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl text-center hover:bg-slate-800 transition-colors uppercase tracking-wider"
                                        >
                                            Lihat Detail Laporan
                                        </button>
                                    ) : (
                                        <Link
                                            href={route('report.show', selectedReport.id)}
                                            className="w-full py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl text-center hover:bg-slate-800 transition-colors uppercase tracking-wider"
                                        >
                                            Lihat Detail Laporan
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        );
    }
);

export default MapComponent;
