import { useEffect, useRef, useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import KalingLayout from "@/Layouts/KalingLayout";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Map as MapIcon, InfoCircle, Check } from "@mynaui/icons-react";
import { landingDict } from "@/Lang/Landing";

interface Report {
    id: number;
    description: string;
    status: string;
    photo_path: string;
    latitude: string;
    longitude: string;
    user: {
        name: string;
        warga?: {
            is_terverifikasi: boolean;
        };
    };
}

interface Props {
    auth: any;
    reports: Report[];
    namaWilayah: string;
    mapboxToken: string;
}

export default function KalingMap({
    auth,
    reports,
    namaWilayah,
    mapboxToken,
}: Props) {
    // === STATE UNTUK BAHASA ===
    const [lang, setLang] = useState<"id" | "en">("id");

    // Ambil kamus terjemahan berdasarkan bahasa yang sedang aktif
    const t = landingDict[lang];

    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [activeFilter, setActiveFilter] = useState<string>("semua");

    // Efek Inisialisasi Peta (Hanya berjalan sekali di awal)
    useEffect(() => {
        // Load language dari localStorage
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);

        if (map.current || !mapContainer.current) return;

        mapboxgl.accessToken = mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN;

        // Inisialisasi awal
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [116.1165, -8.5833],
            zoom: 11,
            pitch: 45,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.current.on("load", () => {
            renderMarkers("semua");

            if (reports.length > 0) {
                const bounds = new mapboxgl.LngLatBounds();
                reports.forEach((report) => {
                    if (report.latitude && report.longitude) {
                        bounds.extend([
                            parseFloat(report.longitude),
                            parseFloat(report.latitude),
                        ]);
                    }
                });

                map.current!.fitBounds(bounds, {
                    padding: 100,
                    maxZoom: 15,
                    duration: 2500,
                    pitch: 45,
                });
            } else {
                const searchLocation = async () => {
                    try {
                        const query = encodeURIComponent(
                            `${namaWilayah}, Mataram, Nusa Tenggara Barat`,
                        );
                        const res = await fetch(
                            `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxToken}`,
                        );
                        const data = await res.json();

                        if (data.features && data.features.length > 0) {
                            const center = data.features[0].center;
                            map.current?.flyTo({
                                center: center,
                                zoom: 14.5,
                                pitch: 45,
                                duration: 3000,
                                essential: true,
                            });
                        }
                    } catch (err) {
                        console.error("Gagal melacak wilayah:", err);
                    }
                };
                searchLocation();
            }
        });
    }, [mapboxToken, namaWilayah]);

    // Fungsi Utama: Menggambar Marker
    // Diingat menggunakan useCallback agar dependensi `t` (bahasa) selalu ter-update
    const renderMarkers = useCallback(
        (filterStatus: string) => {
            if (!map.current) return;

            markersRef.current.forEach((marker) => marker.remove());
            markersRef.current = [];

            reports.forEach((report) => {
                if (!report.latitude || !report.longitude) return;

                if (filterStatus !== "semua") {
                    if (filterStatus === "proses") {
                        if (
                            report.status !== "proses" &&
                            report.status !== "divalidasi"
                        )
                            return;
                    } else if (report.status !== filterStatus) {
                        return;
                    }
                }

                let markerColor = "#ef4444";
                let statusText = t.kalingMapFilterWaiting;
                let bgBadge = "bg-red-500";

                if (
                    report.status === "divalidasi" ||
                    report.status === "proses"
                ) {
                    markerColor = "#6366f1";
                    statusText = t.kalingMapFilterProcess;
                    bgBadge = "bg-indigo-500";
                } else if (report.status === "selesai") {
                    markerColor = "#22c55e";
                    statusText = t.kalingMapFilterClean;
                    bgBadge = "bg-green-500";
                }

                const isVerified = report.user.warga?.is_terverifikasi;
                const verifiedBadgeHTML = isVerified
                    ? `<svg class="w-3 h-3 text-blue-500 inline-block ml-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                       <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                   </svg>`
                    : "";

                const popupHTML = `
                <div class="w-56 font-sans bg-white">
                    <div class="h-32 w-full mb-3 rounded-lg overflow-hidden bg-slate-100 relative border border-slate-100">
                        <img src="/storage/${report.photo_path}" class="w-full h-full object-cover" alt="Foto Sampah" />
                    </div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-[10px] text-slate-500 font-bold flex items-center">
                            ${t.kalingMapPopupBy} ${report.user.name} ${verifiedBadgeHTML}
                        </span>
                        <span class="text-[9px] font-black text-white px-2 py-0.5 rounded shadow-sm ${bgBadge}">${statusText}</span>
                    </div>
                    <p class="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug mt-1.5">
                        ${report.description || t.kalingNoDesc}
                    </p>
                    <a href="https://maps.google.com/?q=$$${report.latitude},${report.longitude}" target="_blank" class="mt-4 block w-full text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2.5 rounded-lg transition-colors border border-indigo-200">
                        ${t.kalingMapPopupOpenRoute}
                    </a>
                </div>
            `;

                const popup = new mapboxgl.Popup({
                    offset: 25,
                    closeButton: true,
                    closeOnClick: true,
                    maxWidth: "280px",
                }).setHTML(popupHTML);

                const marker = new mapboxgl.Marker({
                    color: markerColor,
                    scale: 0.85,
                })
                    .setLngLat([
                        parseFloat(report.longitude),
                        parseFloat(report.latitude),
                    ])
                    .setPopup(popup)
                    .addTo(map.current!);

                markersRef.current.push(marker);
            });
        },
        [reports, t],
    );

    // Render ulang saat filter atau BAHASA berubah
    useEffect(() => {
        if (map.current && map.current.isStyleLoaded()) {
            renderMarkers(activeFilter);
        }
    }, [activeFilter, renderMarkers]);

    return (
        <KalingLayout
            auth={auth}
            header={
                <div className="flex justify-between items-center w-full animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <MapIcon className="w-7 h-7 text-indigo-500" />
                            {t.kalingMapTitle}{" "}
                            {namaWilayah ? `- ${namaWilayah}` : ""}
                        </h2>
                        <p className="text-xs lg:text-sm text-slate-500 mt-1">
                            {t.kalingMapSubtitle}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={t.kalingMapTitle} />

            <style>
                {`
                    .mapboxgl-popup-content {
                        background-color: #ffffff !important;
                        border-radius: 16px !important;
                        padding: 12px !important;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                        border: 1px solid #f1f5f9 !important;
                    }
                    .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
                        border-top-color: #ffffff !important;
                    }
                    .mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
                        border-bottom-color: #ffffff !important;
                    }
                    .mapboxgl-popup-close-button {
                        font-size: 16px;
                        color: #94a3b8;
                        padding: 4px 8px;
                        border-radius: 0 16px 0 8px;
                    }
                    .mapboxgl-popup-close-button:hover {
                        background-color: #fee2e2;
                        color: #ef4444;
                    }
                `}
            </style>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col h-[calc(100vh-180px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div ref={mapContainer} className="flex-1 w-full h-full" />

                {/* Floating Legend & Filter Panel */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 z-10 w-64">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                            <InfoCircle className="w-4 h-4 text-slate-400" />{" "}
                            {t.kalingMapFilterTitle}
                        </h4>
                        {activeFilter !== "semua" && (
                            <button
                                onClick={() => setActiveFilter("semua")}
                                className="text-[9px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                            >
                                {t.kalingMapReset}
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {/* Filter Menunggu */}
                        <button
                            onClick={() =>
                                setActiveFilter(
                                    activeFilter === "menunggu"
                                        ? "semua"
                                        : "menunggu",
                                )
                            }
                            className={`w-full flex items-center justify-between p-2 rounded-xl transition-all border ${
                                activeFilter === "menunggu"
                                    ? "bg-red-50 border-red-200 shadow-sm"
                                    : "bg-transparent border-transparent hover:bg-slate-50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-white ${activeFilter === "menunggu" ? "animate-pulse" : ""}`}
                                ></div>
                                <span
                                    className={`text-sm font-bold ${activeFilter === "menunggu" ? "text-red-700" : "text-slate-700"}`}
                                >
                                    {t.kalingMapFilterWaiting}
                                </span>
                            </div>
                            {activeFilter === "menunggu" && (
                                <Check className="w-4 h-4 text-red-600" />
                            )}
                        </button>

                        {/* Filter Proses */}
                        <button
                            onClick={() =>
                                setActiveFilter(
                                    activeFilter === "proses"
                                        ? "semua"
                                        : "proses",
                                )
                            }
                            className={`w-full flex items-center justify-between p-2 rounded-xl transition-all border ${
                                activeFilter === "proses"
                                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                    : "bg-transparent border-transparent hover:bg-slate-50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] border-2 border-white ${activeFilter === "proses" ? "animate-pulse" : ""}`}
                                ></div>
                                <span
                                    className={`text-sm font-bold ${activeFilter === "proses" ? "text-indigo-700" : "text-slate-700"}`}
                                >
                                    {t.kalingMapFilterProcess}
                                </span>
                            </div>
                            {activeFilter === "proses" && (
                                <Check className="w-4 h-4 text-indigo-600" />
                            )}
                        </button>

                        {/* Filter Selesai */}
                        <button
                            onClick={() =>
                                setActiveFilter(
                                    activeFilter === "selesai"
                                        ? "semua"
                                        : "selesai",
                                )
                            }
                            className={`w-full flex items-center justify-between p-2 rounded-xl transition-all border ${
                                activeFilter === "selesai"
                                    ? "bg-green-50 border-green-200 shadow-sm"
                                    : "bg-transparent border-transparent hover:bg-slate-50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] border-2 border-white ${activeFilter === "selesai" ? "animate-pulse" : ""}`}
                                ></div>
                                <span
                                    className={`text-sm font-bold ${activeFilter === "selesai" ? "text-green-700" : "text-slate-700"}`}
                                >
                                    {t.kalingMapFilterClean}
                                </span>
                            </div>
                            {activeFilter === "selesai" && (
                                <Check className="w-4 h-4 text-green-600" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </KalingLayout>
    );
}
