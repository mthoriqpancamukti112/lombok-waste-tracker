import { useEffect, useRef, useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import KalingLayout from "@/Layouts/KalingLayout";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { renderToString } from "react-dom/server";
import {
    Map as MapIcon,
    InfoCircle,
    Check,
    MapPinHouseInside,
    Calendar,
    Clock4,
} from "@mynaui/icons-react";
import { landingDict } from "@/Lang/Landing";

interface Report {
    id: number;
    description: string;
    status: string;
    photo_path: string;
    latitude: string;
    longitude: string;
    created_at: string;
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
    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [activeFilter, setActiveFilter] = useState<string>("semua");
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);

        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
        };

        checkDarkMode();

        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        if (map.current || !mapContainer.current) return;

        mapboxgl.accessToken = mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN;

        const initialStyle = document.documentElement.classList.contains("dark")
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/streets-v12";

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: initialStyle,
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

        return () => observer.disconnect();
    }, [mapboxToken, namaWilayah]);

    useEffect(() => {
        if (!map.current) return;

        const newStyle = isDarkMode
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/streets-v12";

        map.current.setStyle(newStyle);
    }, [isDarkMode]);

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
                let bgBadge = "bg-red-500/90 text-white border-red-400";

                if (
                    report.status === "divalidasi" ||
                    report.status === "proses"
                ) {
                    markerColor = "#6366f1";
                    statusText = t.kalingMapFilterProcess;
                    bgBadge = "bg-indigo-500/90 text-white border-indigo-400";
                } else if (report.status === "selesai") {
                    markerColor = "#22c55e";
                    statusText = t.kalingMapFilterClean;
                    bgBadge = "bg-green-500/90 text-white border-green-400";
                }

                const isVerified = report.user.warga?.is_terverifikasi;
                const verifiedBadgeHTML = isVerified
                    ? `<svg class="w-3.5 h-3.5 text-blue-500 inline-block ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                       <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                   </svg>`
                    : "";

                const isMapDark =
                    document.documentElement.classList.contains("dark");
                const popupBg = isMapDark ? "bg-slate-800" : "bg-white";
                const popupText = isMapDark
                    ? "text-slate-100"
                    : "text-slate-800";
                const popupBorder = isMapDark
                    ? "border-slate-700"
                    : "border-slate-100";
                const popupMuted = isMapDark
                    ? "text-slate-400"
                    : "text-slate-500";
                const popupBtnBg = isMapDark
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 border-indigo-500"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700";

                const dateObj = new Date(report.created_at);
                const dateStr = dateObj.toLocaleDateString(
                    lang === "id" ? "id-ID" : "en-US",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    },
                );
                const timeStr = dateObj.toLocaleTimeString(
                    lang === "id" ? "id-ID" : "en-US",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                    },
                );

                // Konversi Icon React ke String HTML
                const mapIconHTML = renderToString(
                    <MapPinHouseInside className="w-4 h-4 shrink-0" />,
                );
                const calendarIconHTML = renderToString(
                    <Calendar className="w-3.5 h-3.5 shrink-0" />,
                );
                const clockIconHTML = renderToString(
                    <Clock4 className="w-3.5 h-3.5 shrink-0" />,
                );

                const popupHTML = `
                <div class="w-64 font-sans ${popupBg}">
                    <div class="h-36 w-full mb-3 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative border ${popupBorder}">
                        <img src="/storage/${report.photo_path}" class="w-full h-full object-cover" alt="Foto Sampah" />

                        <div class="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg text-[9px] font-extrabold shadow-lg backdrop-blur-md border uppercase tracking-widest ${bgBadge}">
                            ${statusText}
                        </div>
                    </div>

                    <div class="flex flex-col mb-3 border-b ${isMapDark ? "border-slate-700" : "border-slate-100"} pb-3 px-1">
                        <span class="text-xs ${popupText} font-black flex items-center tracking-tight mb-2">
                            ${report.user.name} ${verifiedBadgeHTML}
                        </span>

                        <div class="flex items-center gap-2">
                            <span class="flex items-center gap-1.5 text-[10px] ${popupMuted} font-bold bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-600/50">
                                ${calendarIconHTML}
                                ${dateStr}
                            </span>
                            <span class="flex items-center gap-1.5 text-[10px] ${popupMuted} font-bold bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-600/50">
                                ${clockIconHTML}
                                ${timeStr}
                            </span>
                        </div>
                    </div>

                    <p class="text-xs font-medium ${popupMuted} line-clamp-2 leading-relaxed px-1 mb-4">
                        ${report.description || t.kalingNoDesc}
                    </p>

                    <a href="https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}" target="_blank" rel="noopener noreferrer" class="mt-1 w-full flex items-center justify-center gap-2 ${popupBtnBg} text-xs font-black py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 border">
                        ${mapIconHTML}
                        ${t.kalingMapPopupOpenRoute}
                    </a>
                </div>
                `;

                // PERBAIKAN POPUP CONFIG: offset dan anchor disesuaikan
                const popup = new mapboxgl.Popup({
                    offset: 35, // Diperlebar jarak dari bawah agar popup tidak menabrak titik icon
                    anchor: "bottom", // MEMAKSA popup selalu terbuka ke atas
                    closeButton: true,
                    closeOnClick: true,
                    maxWidth: "320px",
                    className: isMapDark
                        ? "custom-popup dark-popup"
                        : "custom-popup",
                }).setHTML(popupHTML);

                const marker = new mapboxgl.Marker({
                    color: markerColor,
                    scale: 0.9,
                })
                    .setLngLat([
                        parseFloat(report.longitude),
                        parseFloat(report.latitude),
                    ])
                    .setPopup(popup)
                    .addTo(map.current!);

                // EVENT LISTENER: Bergeser dan Zoom otomatis saat Marker diklik
                marker.getElement().addEventListener("click", () => {
                    // FlyTo ke koordinat marker
                    map.current?.flyTo({
                        center: [
                            parseFloat(report.longitude),
                            parseFloat(report.latitude),
                        ],
                        zoom: 16.5,
                        pitch: 45,
                        // KUNCI UTAMA: Geser titik map ke bawah sebanyak 130px
                        // agar popup yang tinggi bisa pas di tengah-tengah layar!
                        offset: [0, 130],
                        duration: 1200,
                        essential: true,
                    });
                });

                markersRef.current.push(marker);
            });
        },
        [reports, t, lang],
    );

    useEffect(() => {
        if (map.current && map.current.isStyleLoaded()) {
            renderMarkers(activeFilter);
        }
    }, [activeFilter, isDarkMode, renderMarkers]);

    return (
        <KalingLayout
            auth={auth}
            header={
                <div className="flex justify-between items-center w-full animate-in fade-in slide-in-from-top-4 duration-500 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 transition-colors">
                            <MapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <h2 className="text-base sm:text-xl lg:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate transition-colors">
                                {t.kalingMapTitle}
                            </h2>
                            {namaWilayah ? (
                                <p className="hidden sm:block text-xs lg:text-sm text-indigo-600 dark:text-indigo-400 font-bold truncate transition-colors mt-0.5">
                                    {namaWilayah}
                                </p>
                            ) : (
                                <p className="hidden sm:block text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate transition-colors">
                                    {t.kalingMapSubtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={t.kalingMapTitle} />

            <style>
                {`
                    /* --- DESAIN PADDING BAWAH POPUP DIPERBESAR --- */
                    .custom-popup .mapboxgl-popup-content {
                        background-color: #ffffff !important;
                        border-radius: 24px !important;
                        /* PADDING BAWAH DIPERBESAR agar tombol map tidak terpotong */
                        padding: 16px !important;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                        border: 1px solid #f1f5f9 !important;
                        transition: background-color 0.3s ease, border-color 0.3s ease;
                    }
                    /* Mengatur Panah (Segitiga Bawah) */
                    .custom-popup.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
                        border-top-color: #ffffff !important;
                        transition: border-top-color 0.3s ease;
                    }

                    /* --- DESAIN TOMBOL X (CLOSE) ESTETIK MELAYANG --- */
                    .custom-popup .mapboxgl-popup-close-button {
                        font-size: 18px;
                        font-weight: bold;
                        color: #ffffff;
                        background-color: rgba(0, 0, 0, 0.45);
                        padding: 0;
                        width: 28px;
                        height: 28px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        /* Posisi absolute di atas gambar */
                        top: 24px;
                        right: 24px;
                        backdrop-filter: blur(8px);
                        border: 1px solid rgba(255,255,255,0.3);
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                        z-index: 50;
                    }
                    .custom-popup .mapboxgl-popup-close-button:hover {
                        background-color: #ef4444; /* red-500 */
                        color: white;
                        transform: scale(1.1) rotate(90deg); /* Efek putar & zoom */
                        border-color: #ef4444;
                    }

                    /* --- DARK MODE OVERRIDES --- */
                    .dark-popup.mapboxgl-popup .mapboxgl-popup-content {
                        background-color: #1e293b !important; /* slate-800 */
                        border-color: #334155 !important; /* slate-700 */
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6) !important;
                    }
                    .dark-popup.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip { border-top-color: #1e293b !important; }

                    .dark-popup .mapboxgl-popup-close-button {
                        background-color: rgba(15, 23, 42, 0.6); /* slate-900 transparent */
                    }
                `}
            </style>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative flex flex-col h-[calc(100vh-180px)] animate-in fade-in slide-in-from-bottom-4 duration-700 transition-colors">
                <div ref={mapContainer} className="flex-1 w-full h-full" />

                {/* Floating Legend & Filter Panel */}
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700 z-10 w-64 animate-in fade-in slide-in-from-left-4 duration-500 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                            <InfoCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />{" "}
                            {t.kalingMapFilterTitle}
                        </h4>
                        {activeFilter !== "semua" && (
                            <button
                                onClick={() => setActiveFilter("semua")}
                                className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2 py-1 rounded transition-colors"
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
                                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 shadow-sm"
                                    : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-white dark:border-slate-800 transition-colors ${activeFilter === "menunggu" ? "animate-pulse" : ""}`}
                                ></div>
                                <span
                                    className={`text-sm font-bold transition-colors ${activeFilter === "menunggu" ? "text-red-700 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}
                                >
                                    {t.kalingMapFilterWaiting}
                                </span>
                            </div>
                            {activeFilter === "menunggu" && (
                                <Check className="w-4 h-4 text-red-600 dark:text-red-400" />
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
                                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 shadow-sm"
                                    : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] border-2 border-white dark:border-slate-800 transition-colors ${activeFilter === "proses" ? "animate-pulse" : ""}`}
                                ></div>
                                <span
                                    className={`text-sm font-bold transition-colors ${activeFilter === "proses" ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}
                                >
                                    {t.kalingMapFilterProcess}
                                </span>
                            </div>
                            {activeFilter === "proses" && (
                                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 shadow-sm"
                                    : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] border-2 border-white dark:border-slate-800 transition-colors ${activeFilter === "selesai" ? "animate-pulse" : ""}`}
                                ></div>
                                <span
                                    className={`text-sm font-bold transition-colors ${activeFilter === "selesai" ? "text-green-700 dark:text-green-400" : "text-slate-700 dark:text-slate-300"}`}
                                >
                                    {t.kalingMapFilterClean}
                                </span>
                            </div>
                            {activeFilter === "selesai" && (
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </KalingLayout>
    );
}
