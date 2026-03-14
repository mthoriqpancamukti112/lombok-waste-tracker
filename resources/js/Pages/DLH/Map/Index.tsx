import { useEffect, useRef, useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import DLHLayout from "@/Layouts/DLHLayout";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
// 1. Import renderToString untuk merender icon ke HTML murni
import { renderToString } from "react-dom/server";
// 2. Import ikon-ikon MyNaui yang dibutuhkan
import {
    Map as MapIcon,
    InfoCircle,
    Check,
    MapPinHouseInside,
    Calendar,
    Clock4,
    User,
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
    };
    // Tambahkan field opsional untuk data Kaling
    kaling_name?: string;
    nama_wilayah?: string;
}

interface Props {
    auth: any;
    reports: Report[];
    mapboxToken: string;
}

export default function MapIndex({ auth, reports, mapboxToken }: Props) {
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
            zoom: 12.5,
            pitch: 45,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.current.on("load", () => {
            renderMarkers("semua");
        });

        return () => observer.disconnect();
    }, []);

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
                let statusText = t.dlhMapFilterWaiting;
                let bgBadge = "bg-red-500/90 text-white border-red-400";

                if (
                    report.status === "divalidasi" ||
                    report.status === "proses"
                ) {
                    markerColor = "#3b82f6";
                    statusText = t.dlhMapFilterProcess;
                    bgBadge = "bg-blue-500/90 text-white border-blue-400";
                } else if (report.status === "selesai") {
                    markerColor = "#22c55e";
                    statusText = t.dlhMapFilterClean;
                    bgBadge = "bg-green-500/90 text-white border-green-400";
                }

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

                // Format Tanggal dan Waktu
                let dateStr = "N/A";
                let timeStr = "N/A";
                if (report.created_at) {
                    const dateObj = new Date(report.created_at);
                    dateStr = dateObj.toLocaleDateString(
                        lang === "id" ? "id-ID" : "en-US",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        },
                    );
                    timeStr = dateObj.toLocaleTimeString(
                        lang === "id" ? "id-ID" : "en-US",
                        {
                            hour: "2-digit",
                            minute: "2-digit",
                        },
                    );
                }

                // Render string HTML untuk icon MyNaui
                const mapIconHTML = renderToString(
                    <MapPinHouseInside className="w-4 h-4 shrink-0" />,
                );
                const calendarIconHTML = renderToString(
                    <Calendar className="w-3.5 h-3.5 shrink-0" />,
                );
                const clockIconHTML = renderToString(
                    <Clock4 className="w-3.5 h-3.5 shrink-0" />,
                );
                const userIconHTML = renderToString(
                    <User className="w-3.5 h-3.5 shrink-0 text-indigo-500" />,
                );

                // Tentukan data Kaling dan Lingkungan (gunakan fallback jika tidak tersedia)
                // Tentukan data Kaling dan Lingkungan
                const kalingInfo = report.kaling_name
                    ? `${report.kaling_name} - ${report.nama_wilayah || "Lingkungan Tidak Diketahui"}`
                    : "Data Kaling Belum Ditentukan";

                const popupHTML = `
                <div class="w-64 font-sans ${popupBg}">
                    <div class="h-36 w-full mb-3 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative border ${popupBorder}">
                        <img src="/storage/${report.photo_path}" class="w-full h-full object-cover" alt="Foto Sampah" />

                        <div class="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg text-[9px] font-extrabold shadow-lg backdrop-blur-md border uppercase tracking-widest ${bgBadge}">
                            ${statusText}
                        </div>
                    </div>

                    <div class="flex flex-col mb-2.5 border-b ${isMapDark ? "border-slate-700" : "border-slate-100"} pb-2.5 px-1">
                        <span class="text-xs ${popupText} font-black mb-1">
                            ${t.dlhMapPopupBy} ${report.user.name}
                        </span>

                        <div class="flex items-start gap-1.5 mb-2">
                            ${userIconHTML}
                            <span class="text-[10px] ${popupMuted} font-semibold leading-tight">
                                <span class="text-indigo-500 dark:text-indigo-400 font-bold">Kaling:</span> ${kalingInfo}
                            </span>
                        </div>

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

                    <p class="text-xs font-medium ${popupMuted} line-clamp-2 leading-relaxed px-1 mb-3">
                        ${report.description || t.dlhMapPopupNoDesc}
                    </p>

                    <a href="https://maps.google.com/?q=${report.latitude},${report.longitude}" target="_blank" rel="noopener noreferrer" class="mt-1 w-full flex items-center justify-center gap-2 ${popupBtnBg} text-xs font-black py-2.5 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 border">
                        ${mapIconHTML}
                        ${lang === "id" ? "Buka Rute Maps" : "Open Route Maps"}
                    </a>
                </div>
            `;

                const popup = new mapboxgl.Popup({
                    offset: 35, // Jarak popup dari marker (agar tidak tumpang tindih)
                    anchor: "bottom", // Paksa popup terbuka ke atas
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

                // 3. EVENT LISTENER: Bergeser dan Zoom saat klik marker
                marker.getElement().addEventListener("click", () => {
                    map.current?.flyTo({
                        center: [
                            parseFloat(report.longitude),
                            parseFloat(report.latitude),
                        ],
                        zoom: 16.5,
                        pitch: 45,
                        offset: [0, 130], // Geser tampilan agar popup tepat di tengah layar
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
        <DLHLayout
            auth={auth}
            header={
                <div className="flex justify-between items-center w-full animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2 transition-colors">
                            <MapIcon className="w-7 h-7 text-[#86bf36]" />
                            {t.dlhMapTitle}
                        </h2>
                        <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                            {t.dlhMapSubtitle}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={t.dlhMapTitle} />
            <style>
                {`
                    /* --- DESAIN PADDING BAWAH POPUP DIPERBESAR --- */
                    .custom-popup .mapboxgl-popup-content {
                        background-color: #ffffff !important;
                        border-radius: 24px !important;
                        /* PADDING BAWAH DIPERBESAR */
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
                        background-color: rgba(15, 23, 42, 0.6);
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
                            {t.dlhMapFilterTitle}
                        </h4>

                        {/* Tombol Reset Filter */}
                        {activeFilter !== "semua" && (
                            <button
                                onClick={() => setActiveFilter("semua")}
                                className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-1 rounded transition-colors"
                            >
                                {t.dlhMapReset}
                            </button>
                        )}
                    </div>

                    {/* Tombol Filter Interaktif */}
                    <div className="space-y-2">
                        {/* Tombol Filter Menunggu */}
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
                                    className={`w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-white dark:border-slate-800 transition-colors ${
                                        activeFilter === "menunggu"
                                            ? "animate-pulse"
                                            : ""
                                    }`}
                                ></div>
                                <span
                                    className={`text-sm font-bold transition-colors ${
                                        activeFilter === "menunggu"
                                            ? "text-red-700 dark:text-red-400"
                                            : "text-slate-700 dark:text-slate-300"
                                    }`}
                                >
                                    {t.dlhMapFilterWaiting}
                                </span>
                            </div>
                            {activeFilter === "menunggu" && (
                                <Check className="w-4 h-4 text-red-600 dark:text-red-400" />
                            )}
                        </button>

                        {/* Tombol Filter Proses */}
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
                                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 shadow-sm"
                                    : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] border-2 border-white dark:border-slate-800 transition-colors ${
                                        activeFilter === "proses"
                                            ? "animate-pulse"
                                            : ""
                                    }`}
                                ></div>
                                <span
                                    className={`text-sm font-bold transition-colors ${
                                        activeFilter === "proses"
                                            ? "text-blue-700 dark:text-blue-400"
                                            : "text-slate-700 dark:text-slate-300"
                                    }`}
                                >
                                    {t.dlhMapFilterProcess}
                                </span>
                            </div>
                            {activeFilter === "proses" && (
                                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                        </button>

                        {/* Tombol Filter Selesai */}
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
                                    className={`w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] border-2 border-white dark:border-slate-800 transition-colors ${
                                        activeFilter === "selesai"
                                            ? "animate-pulse"
                                            : ""
                                    }`}
                                ></div>
                                <span
                                    className={`text-sm font-bold transition-colors ${
                                        activeFilter === "selesai"
                                            ? "text-green-700 dark:text-green-400"
                                            : "text-slate-700 dark:text-slate-300"
                                    }`}
                                >
                                    {t.dlhMapFilterClean}
                                </span>
                            </div>
                            {activeFilter === "selesai" && (
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </DLHLayout>
    );
}
