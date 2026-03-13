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

    // State untuk mendeteksi Dark Mode pada peta
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Efek Inisialisasi Peta (Hanya berjalan sekali di awal)
    useEffect(() => {
        // Load language dari localStorage
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);

        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
        };

        checkDarkMode();

        // Observer untuk memantau perubahan tema secara real-time
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

        // Inisialisasi awal
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

    // Efek untuk merubah Style Peta jika Dark Mode di-toggle
    useEffect(() => {
        if (!map.current) return;

        const newStyle = isDarkMode
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/streets-v12";

        map.current.setStyle(newStyle);
    }, [isDarkMode]);

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
                let bgBadge = "bg-red-500 text-white";

                if (
                    report.status === "divalidasi" ||
                    report.status === "proses"
                ) {
                    markerColor = "#6366f1";
                    statusText = t.kalingMapFilterProcess;
                    bgBadge = "bg-indigo-500 text-white";
                } else if (report.status === "selesai") {
                    markerColor = "#22c55e";
                    statusText = t.kalingMapFilterClean;
                    bgBadge = "bg-green-500 text-white";
                }

                const isVerified = report.user.warga?.is_terverifikasi;
                const verifiedBadgeHTML = isVerified
                    ? `<svg class="w-3 h-3 text-blue-500 inline-block ml-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                       <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                   </svg>`
                    : "";

                // Desain Popup (Menyesuaikan dengan Dark Mode)
                const isMapDark =
                    document.documentElement.classList.contains("dark");
                const popupBg = isMapDark ? "bg-slate-800" : "bg-white";
                const popupText = isMapDark
                    ? "text-slate-200"
                    : "text-slate-800";
                const popupBorder = isMapDark
                    ? "border-slate-700"
                    : "border-slate-100";
                const popupMuted = isMapDark
                    ? "text-slate-400"
                    : "text-slate-500";
                const popupBtnBg = isMapDark
                    ? "bg-slate-700 text-indigo-400 border-slate-600"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200";
                const popupBtnHover = isMapDark
                    ? "hover:bg-slate-600 hover:text-indigo-300"
                    : "hover:bg-indigo-100";

                const popupHTML = `
                <div class="w-56 font-sans ${popupBg}">
                    <div class="h-32 w-full mb-3 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 relative border ${popupBorder}">
                        <img src="/storage/${report.photo_path}" class="w-full h-full object-cover" alt="Foto Sampah" />
                    </div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-[10px] ${popupMuted} font-bold flex items-center">
                            ${t.kalingMapPopupBy} ${report.user.name} ${verifiedBadgeHTML}
                        </span>
                        <span class="text-[9px] font-black px-2 py-0.5 rounded shadow-sm ${bgBadge}">${statusText}</span>
                    </div>
                    <p class="text-xs font-semibold ${popupText} line-clamp-2 leading-snug mt-1.5">
                        ${report.description || t.kalingNoDesc}
                    </p>
                 <a href="https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}" target="_blank" rel="noopener noreferrer" class="mt-4 block w-full text-center ${popupBtnBg} ${popupBtnHover} text-xs font-bold py-2.5 rounded-lg transition-colors border">
                    ${t.kalingMapPopupOpenRoute}
                </a>
                </div>
            `;

                const popup = new mapboxgl.Popup({
                    offset: 25,
                    closeButton: true,
                    closeOnClick: true,
                    maxWidth: "280px",
                    className: isMapDark
                        ? "custom-popup dark-popup"
                        : "custom-popup",
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

    // Render ulang saat filter, BAHASA, atau DARK MODE berubah
    useEffect(() => {
        if (map.current && map.current.isStyleLoaded()) {
            renderMarkers(activeFilter);
        }
    }, [activeFilter, isDarkMode, renderMarkers]);

    return (
        <KalingLayout
            auth={auth}
            header={
                // PERBAIKAN RESPONSIVITAS: flex-1 dan min-w-0 agar tidak mendesak tombol menu
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
                                // PERBAIKAN: class hidden sm:block agar hilang di hp
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
                    /* Memaksa background popup menjadi putih solid dan cantik */
                    .custom-popup .mapboxgl-popup-content {
                        background-color: #ffffff !important;
                        border-radius: 16px !important;
                        padding: 12px !important;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                        border: 1px solid #f1f5f9 !important;
                        transition: background-color 0.3s ease, border-color 0.3s ease;
                    }
                    /* Memastikan panah (segitiga) popup juga berwarna putih solid */
                    .custom-popup.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
                        border-top-color: #ffffff !important;
                        transition: border-top-color 0.3s ease;
                    }
                    .custom-popup.mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
                        border-bottom-color: #ffffff !important;
                        transition: border-bottom-color 0.3s ease;
                    }
                    /* Mempercantik tombol X close */
                    .custom-popup .mapboxgl-popup-close-button {
                        font-size: 16px;
                        color: #94a3b8;
                        padding: 4px 8px;
                        border-radius: 0 16px 0 8px;
                    }
                    .custom-popup .mapboxgl-popup-close-button:hover {
                        background-color: #fee2e2;
                        color: #ef4444;
                    }

                    /* --- Dark Mode Overrides untuk Popup Mapbox --- */
                    .dark-popup.mapboxgl-popup .mapboxgl-popup-content {
                        background-color: #1e293b !important; /* slate-800 */
                        border-color: #334155 !important; /* slate-700 */
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3) !important;
                    }
                    .dark-popup.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
                        border-top-color: #1e293b !important;
                    }
                    .dark-popup.mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
                        border-bottom-color: #1e293b !important;
                    }
                    .dark-popup .mapboxgl-popup-close-button {
                        color: #cbd5e1;
                    }
                    .dark-popup .mapboxgl-popup-close-button:hover {
                        background-color: #7f1d1d; /* red-900 */
                        color: #fca5a5; /* red-300 */
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
                                    className={`w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] border-2 border-white dark:border-slate-800 transition-colors ${
                                        activeFilter === "proses"
                                            ? "animate-pulse"
                                            : ""
                                    }`}
                                ></div>
                                <span
                                    className={`text-sm font-bold transition-colors ${
                                        activeFilter === "proses"
                                            ? "text-indigo-700 dark:text-indigo-400"
                                            : "text-slate-700 dark:text-slate-300"
                                    }`}
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
