import { useEffect, useRef, useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import DLHLayout from "@/Layouts/DLHLayout";
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
    };
}

interface Props {
    auth: any;
    reports: Report[];
    mapboxToken: string;
}

export default function MapIndex({ auth, reports, mapboxToken }: Props) {
    // === STATE UNTUK BAHASA ===
    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [activeFilter, setActiveFilter] = useState<string>("semua");

    // State untuk mendeteksi Dark Mode pada peta
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Efek Inisialisasi Peta (Hanya berjalan sekali di awal)
    useEffect(() => {
        // Ambil bahasa dari localStorage
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

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: initialStyle,
            center: [116.1165, -8.5833],
            zoom: 12.5,
            pitch: 45,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Ketika peta selesai loading, langsung gambar marker pertama kali (Semua)
        map.current.on("load", () => {
            renderMarkers("semua");
        });

        return () => observer.disconnect();
    }, []); // <-- Dependencies kosong agar peta tidak ter-reset

    // Efek untuk merubah Style Peta jika Dark Mode di-toggle
    useEffect(() => {
        if (!map.current) return;

        const newStyle = isDarkMode
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/streets-v12";

        map.current.setStyle(newStyle);
    }, [isDarkMode]);

    // Fungsi Utama: Menggambar Marker Berdasarkan Filter
    // Menggunakan useCallback agar `t` selalu terupdate saat re-render
    const renderMarkers = useCallback(
        (filterStatus: string) => {
            if (!map.current) return;

            // 1. Hapus SEMUA marker yang ada di peta saat ini
            markersRef.current.forEach((marker) => marker.remove());
            markersRef.current = [];

            // 2. Loop dan gambar ulang marker yang SESUAI filter
            reports.forEach((report) => {
                if (!report.latitude || !report.longitude) return;

                // Logika Penyaringan
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

                // Tentukan style
                let markerColor = "#ef4444";
                let statusText = t.dlhMapFilterWaiting;
                let bgBadge = "bg-red-500 text-white";

                if (
                    report.status === "divalidasi" ||
                    report.status === "proses"
                ) {
                    markerColor = "#3b82f6";
                    statusText = t.dlhMapFilterProcess;
                    bgBadge = "bg-blue-500 text-white";
                } else if (report.status === "selesai") {
                    markerColor = "#22c55e";
                    statusText = t.dlhMapFilterClean;
                    bgBadge = "bg-green-500 text-white";
                }

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
                const popupBtnBg = isMapDark ? "bg-slate-700" : "bg-slate-50";
                const popupBtnHover = isMapDark
                    ? "hover:bg-slate-600"
                    : "hover:bg-slate-100";

                const popupHTML = `
                <div class="w-56 font-sans ${popupBg}">
                    <div class="h-32 w-full mb-3 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 relative border ${popupBorder}">
                        <img src="/storage/${report.photo_path}" class="w-full h-full object-cover" alt="Foto Sampah" />
                    </div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-[10px] ${popupMuted} font-bold">${t.dlhMapPopupBy} ${report.user.name}</span>
                        <span class="text-[9px] font-black px-2 py-0.5 rounded shadow-sm ${bgBadge}">${statusText}</span>
                    </div>
                    <p class="text-xs font-semibold ${popupText} line-clamp-2 leading-snug mt-1.5">
                        ${report.description || t.dlhMapPopupNoDesc}
                    </p>
                    <a href="https://maps.google.com/?q=$$$$${report.latitude},${report.longitude}" target="_blank" class="mt-4 block w-full text-center ${popupBtnBg} ${popupBtnHover} ${popupText} text-xs font-bold py-2.5 rounded-lg transition-colors border ${popupBorder}">
                        ${t.dlhMapPopupOpenRoute}
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

                // Buat marker dan SANGKUTKAN KE PETA
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

                // Simpan referensi marker ke array agar nanti bisa dihapus
                markersRef.current.push(marker);
            });
        },
        [reports, t],
    );

    // Efek Samping: Jika State 'activeFilter' atau 'isDarkMode' berubah, panggil ulang fungsi renderMarkers
    // Perlu di-re-render saat isDarkMode berubah agar isi HTML dari popup ikut menyesuaikan warnanya
    useEffect(() => {
        // Mencegah error jika peta belum selesai di-load
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
