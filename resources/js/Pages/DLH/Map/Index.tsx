import { useEffect, useRef, useState } from "react";
import { Head } from "@inertiajs/react";
import DLHLayout from "@/Layouts/DLHLayout";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Map as MapIcon, InfoCircle, Check } from "@mynaui/icons-react";

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
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    // Array untuk menyimpan objek marker agar bisa dihapus saat di-filter
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    // State untuk menyimpan filter aktif ('semua', 'menunggu', 'proses', 'selesai')
    const [activeFilter, setActiveFilter] = useState<string>("semua");

    // Efek Inisialisasi Peta (Hanya berjalan sekali di awal)
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        mapboxgl.accessToken = mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [116.1165, -8.5833],
            zoom: 12.5,
            pitch: 45,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Ketika peta selesai loading, langsung gambar marker pertama kali (Semua)
        map.current.on("load", () => {
            renderMarkers("semua");
        });
    }, []); // <-- Dependencies kosong agar peta tidak ter-reset

    // Fungsi Utama: Menggambar Marker Berdasarkan Filter
    const renderMarkers = (filterStatus: string) => {
        if (!map.current) return;

        // 1. Hapus SEMUA marker yang ada di peta saat ini
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = []; // Kosongkan array

        // 2. Loop dan gambar ulang marker yang SESUAI filter
        reports.forEach((report) => {
            if (!report.latitude || !report.longitude) return;

            // Logika Penyaringan (Skip jika tidak cocok dengan filter)
            if (filterStatus !== "semua") {
                // Catatan: Jika filter 'proses', kita ambil status 'proses' dan 'divalidasi' (Keduanya biru)
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
            let statusText = "Menunggu Validasi";
            let bgBadge = "bg-red-500";

            if (report.status === "divalidasi" || report.status === "proses") {
                markerColor = "#3b82f6";
                statusText = "Sedang Diproses";
                bgBadge = "bg-blue-500";
            } else if (report.status === "selesai") {
                markerColor = "#22c55e";
                statusText = "Selesai";
                bgBadge = "bg-green-500";
            }

            // Desain Popup
            const popupHTML = `
                <div class="w-56 font-sans bg-white">  <div class="h-32 w-full mb-3 rounded-lg overflow-hidden bg-slate-100 relative border border-slate-100">
                        <img src="/storage/${report.photo_path}" class="w-full h-full object-cover" alt="Foto Sampah" />
                    </div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-[10px] text-slate-500 font-bold">Oleh: ${report.user.name}</span>
                        <span class="text-[9px] font-black text-white px-2 py-0.5 rounded shadow-sm ${bgBadge}">${statusText}</span>
                    </div>
                    <p class="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug mt-1.5">
                        ${report.description || "Tanpa keterangan"}
                    </p>
                    <a href="https://maps.google.com/?q=$${report.latitude},${report.longitude}" target="_blank" class="mt-4 block w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-lg transition-colors border border-slate-200">
                        Buka Rute Maps
                    </a>
                </div>
            `;

            const popup = new mapboxgl.Popup({
                offset: 25,
                closeButton: true,
                closeOnClick: true,
                maxWidth: "280px",
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
    };

    // Efek Samping: Jika State 'activeFilter' berubah, panggil ulang fungsi renderMarkers
    useEffect(() => {
        // Mencegah error jika peta belum selesai di-load
        if (map.current && map.current.isStyleLoaded()) {
            renderMarkers(activeFilter);
        }
    }, [activeFilter, reports]); // Terpicu setiap filter diklik atau data laporan berubah

    return (
        <DLHLayout
            auth={auth}
            header={
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <MapIcon className="w-7 h-7 text-[#86bf36]" />
                            Peta Sebaran Lokasi
                        </h2>
                        <p className="text-xs lg:text-sm text-slate-500 mt-1">
                            Pemantauan titik tumpukan sampah secara geografis
                            dan interaktif.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Peta Sebaran Lokasi" />
            <style>
                {`
                    /* Memaksa background popup menjadi putih solid dan cantik */
                    .mapboxgl-popup-content {
                        background-color: #ffffff !important;
                        border-radius: 16px !important;
                        padding: 12px !important;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                        border: 1px solid #f1f5f9 !important;
                    }
                    /* Memastikan panah (segitiga) popup juga berwarna putih solid */
                    .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
                        border-top-color: #ffffff !important;
                    }
                    .mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
                        border-bottom-color: #ffffff !important;
                    }
                    /* Mempercantik tombol X close */
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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col h-[calc(100vh-180px)]">
                <div ref={mapContainer} className="flex-1 w-full h-full" />

                {/* Floating Legend & Filter Panel */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 z-10 w-64 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                            <InfoCircle className="w-4 h-4 text-slate-400" />{" "}
                            Filter Peta
                        </h4>

                        {/* Tombol Reset Filter */}
                        {activeFilter !== "semua" && (
                            <button
                                onClick={() => setActiveFilter("semua")}
                                className="text-[9px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                            >
                                Reset
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
                                    Menunggu Validasi
                                </span>
                            </div>
                            {activeFilter === "menunggu" && (
                                <Check className="w-4 h-4 text-red-600" />
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
                                    ? "bg-blue-50 border-blue-200 shadow-sm"
                                    : "bg-transparent border-transparent hover:bg-slate-50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] border-2 border-white ${activeFilter === "proses" ? "animate-pulse" : ""}`}
                                ></div>
                                <span
                                    className={`text-sm font-bold ${activeFilter === "proses" ? "text-blue-700" : "text-slate-700"}`}
                                >
                                    Sedang Diproses
                                </span>
                            </div>
                            {activeFilter === "proses" && (
                                <Check className="w-4 h-4 text-blue-600" />
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
                                    Sudah Bersih
                                </span>
                            </div>
                            {activeFilter === "selesai" && (
                                <Check className="w-4 h-4 text-green-600" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </DLHLayout>
    );
}
