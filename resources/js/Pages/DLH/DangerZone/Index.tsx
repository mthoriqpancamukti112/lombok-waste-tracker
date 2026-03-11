import { useEffect, useRef, useState, FormEvent } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import DlhLayout from "@/Layouts/DLHLayout";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import Swal from "sweetalert2";
import {
    Map as MapIcon,
    DangerTriangle,
    Trash,
    X,
    Save,
    InfoCircle,
    MapPin,
} from "@mynaui/icons-react";

interface DangerZone {
    id: number;
    name: string;
    description: string;
    type: string;
    severity: string;
    coordinates: any;
    is_active: boolean;
    creator: { name: string } | null;
}

interface Props {
    auth: any;
    zones: DangerZone[];
    mapboxToken: string;
}

export default function DangerZoneIndex({ auth, zones, mapboxToken }: Props) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const draw = useRef<MapboxDraw | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [drawnFeatureId, setDrawnFeatureId] = useState<string | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        description: "",
        type: "illegal_dump",
        severity: "medium",
        coordinates: null as any,
    });

    // Inisialisasi Peta & Tool Menggambar
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        mapboxgl.accessToken = mapboxToken;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [116.1165, -8.5833], // Mataram
            zoom: 12,
        });

        // TAMBAHKAN KOTAK PENCARIAN (GEOCODER)
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl as any,
            marker: {
                color: "#ef4444",
            } as any,
            placeholder: "Cari jalan, tempat, atau Koordinat...",
            countries: "id",
            proximity: { longitude: 116.1165, latitude: -8.5833 },

            localGeocoder: (query: string) => {
                const matches = query.match(
                    /^[ ]*(-?\d+\.?\d*)[, ]+(-?\d+\.?\d*)[ ]*$/,
                );
                if (!matches) {
                    return [];
                }

                const lat = Number(matches[1]);
                const lng = Number(matches[2]);

                if (lat < -11 || lat > 6 || lng < 95 || lng > 141) {
                    return [];
                }

                return [
                    {
                        type: "Feature",
                        center: [lng, lat],
                        geometry: {
                            type: "Point",
                            coordinates: [lng, lat],
                        },
                        place_name: `Titik Koordinat: ${lat}, ${lng}`,
                        place_type: ["coordinate"],
                        properties: {},
                        text: "Titik Koordinat",
                    } as any,
                ];
            },
        });

        // Letakkan kotak pencarian di pojok KIRI ATAS
        map.current.addControl(geocoder, "top-left");

        // Tambahkan alat gambar (Mapbox Draw)
        draw.current = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                polygon: true,
                trash: true,
            },
            defaultMode: "draw_polygon",
        });

        map.current.addControl(draw.current, "top-right");
        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.current.on("load", () => {
            renderExistingZones();
        });

        // Event saat admin selesai menggambar polygon
        map.current.on("draw.create", (e: any) => {
            const feature = e.features[0];
            setDrawnFeatureId(feature.id as string);
            setData("coordinates", feature.geometry.coordinates);
            setIsModalOpen(true); // Buka form
        });

        map.current.on("draw.delete", () => {
            setDrawnFeatureId(null);
            reset();
        });
    }, [mapboxToken, zones]);

    // Fungsi menggambar zona yang sudah ada di database ke atas peta
    const renderExistingZones = () => {
        if (!map.current) return;

        const features = zones.map((zone) => ({
            type: "Feature",
            properties: {
                id: zone.id,
                name: zone.name,
                severity: zone.severity,
                type: zone.type,
            },
            geometry: {
                type: "Polygon",
                coordinates: zone.coordinates,
            },
        }));

        const geojsonData: any = {
            type: "FeatureCollection",
            features: features,
        };

        if (!map.current.getSource("danger-zones")) {
            map.current.addSource("danger-zones", {
                type: "geojson",
                data: geojsonData,
            });

            // Layer Area (Fill)
            map.current.addLayer({
                id: "danger-zones-fill",
                type: "fill",
                source: "danger-zones",
                paint: {
                    "fill-color": [
                        "match",
                        ["get", "severity"],
                        "critical",
                        "#ef4444",
                        "high",
                        "#f97316",
                        "medium",
                        "#eab308",
                        "low",
                        "#22c55e",
                        "#94a3b8",
                    ],
                    "fill-opacity": 0.45,
                },
            });

            // Layer Garis Batas (Line)
            map.current.addLayer({
                id: "danger-zones-outline",
                type: "line",
                source: "danger-zones",
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
                    "line-width": 3,
                },
            });

            map.current.on("click", "danger-zones-fill", (e) => {
                if (e.features && e.features.length > 0) {
                    const props = e.features[0].properties;
                    new mapboxgl.Popup({ className: "custom-popup" })
                        .setLngLat(e.lngLat)
                        .setHTML(
                            `
                            <div class="p-2 w-48 font-sans">
                                <h4 class="font-bold text-slate-800 text-sm mb-1">${props?.name}</h4>
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 border text-slate-600">${props?.type.replace("_", " ")}</span>
                            </div>
                        `,
                        )
                        .addTo(map.current!);
                }
            });

            map.current.on("mouseenter", "danger-zones-fill", () => {
                map.current!.getCanvas().style.cursor = "pointer";
            });

            map.current.on("mouseleave", "danger-zones-fill", () => {
                map.current!.getCanvas().style.cursor = "";
            });
        } else {
            (
                map.current.getSource("danger-zones") as mapboxgl.GeoJSONSource
            ).setData(geojsonData);
        }
    };

    const handleCancel = () => {
        if (draw.current && drawnFeatureId) {
            draw.current.delete(drawnFeatureId);
        }
        setIsModalOpen(false);
        setDrawnFeatureId(null);
        reset();
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route("danger-zones.store"), {
            onSuccess: () => {
                setIsModalOpen(false);
                setDrawnFeatureId(null);
                reset();
                if (draw.current) draw.current.deleteAll();
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Zona Berhasil Disimpan",
                    showConfirmButton: false,
                    timer: 2000,
                });
            },
        });
    };

    const handleDeleteZone = (id: number) => {
        Swal.fire({
            title: "Hapus Zona Rawan?",
            text: "Data yang dihapus akan hilang dari peta.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonText: "Batal",
            confirmButtonText: "Ya, Hapus!",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("danger-zones.destroy", id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: "top-end",
                            icon: "success",
                            title: "Terhapus",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    },
                });
            }
        });
    };

    return (
        <DlhLayout
            auth={auth}
            header={
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <MapPin className="w-7 h-7 text-red-500" />
                        Pemetaan Zona Rawan (GIS)
                    </h2>
                    <p className="text-xs lg:text-sm text-slate-500 mt-1 hidden sm:block">
                        Gunakan alat Polygon di pojok kanan atas peta untuk
                        menggambar area rawan/TPS liar baru.
                    </p>
                </div>
            }
        >
            <Head title="GIS - Zona Rawan" />

            {/* RESPONSIVE LAYOUT CONTAINER */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:h-[calc(100vh-140px)]">
                {/* PANEL KIRI: Peta Mapbox */}
                <div className="flex-1 h-[55vh] min-h-[400px] lg:h-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
                    <div ref={mapContainer} className="w-full h-full" />

                    {/* Instruksi Menggambar (Disembunyikan di Mobile) */}
                    <div className="hidden lg:block absolute top-4 right-14 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 z-10 w-64 pointer-events-none">
                        <div className="flex gap-3 items-start">
                            <InfoCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                            <div>
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1">
                                    Cara Menggambar
                                </h4>
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    1. Klik ikon segi-banyak (Polygon) di kanan
                                    atas peta.
                                    <br />
                                    2. Klik titik-titik di peta untuk
                                    mengelilingi area.
                                    <br />
                                    3. Klik titik awal kembali untuk
                                    menyelesaikannya.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PANEL KANAN: Daftar Zona */}
                <div className="w-full lg:w-96 h-[50vh] min-h-[350px] lg:h-auto bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <MapIcon className="w-5 h-5 text-slate-500" />{" "}
                            Daftar Zona Aktif
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {zones.length === 0 ? (
                            <div className="text-center py-10 opacity-60">
                                <DangerTriangle className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                                <p className="text-sm font-medium text-slate-500">
                                    Belum ada zona yang dipetakan.
                                </p>
                            </div>
                        ) : (
                            zones.map((zone) => (
                                <div
                                    key={zone.id}
                                    className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1 pr-2">
                                            {zone.name}
                                        </h4>
                                        <button
                                            onClick={() =>
                                                handleDeleteZone(zone.id)
                                            }
                                            className="text-slate-400 hover:text-red-500 p-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <span
                                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                                zone.severity === "critical"
                                                    ? "bg-red-50 text-red-600 border-red-200"
                                                    : zone.severity === "high"
                                                      ? "bg-orange-50 text-orange-600 border-orange-200"
                                                      : zone.severity ===
                                                          "medium"
                                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                        : "bg-green-50 text-green-600 border-green-200"
                                            }`}
                                        >
                                            {zone.severity}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                            {zone.type.replace("_", " ")}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ================= MODAL FORM SIMPAN ZONA ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={handleCancel}
                    ></div>

                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 bg-red-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                <DangerTriangle className="w-6 h-6" /> Simpan
                                Zona Rawan
                            </h3>
                            <button
                                onClick={handleCancel}
                                className="text-slate-400 hover:text-red-500 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Nama Area{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    placeholder="Cth: TPS Liar Pasar Pagesangan"
                                    required
                                    className="w-full rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Tipe Zona{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) =>
                                            setData("type", e.target.value)
                                        }
                                        className="w-full rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500 sm:text-sm bg-slate-50"
                                    >
                                        <option value="illegal_dump">
                                            TPS Liar
                                        </option>
                                        <option value="blackspot">
                                            Titik Hitam
                                        </option>
                                        <option value="flood_risk">
                                            Rawan Banjir
                                        </option>
                                        <option value="fire_risk">
                                            Rawan Kebakaran
                                        </option>
                                        <option value="tpa">TPA Resmi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Tingkat Bahaya
                                    </label>
                                    <select
                                        value={data.severity}
                                        onChange={(e) =>
                                            setData("severity", e.target.value)
                                        }
                                        className="w-full rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500 sm:text-sm bg-slate-50"
                                    >
                                        <option value="critical">
                                            Kritis (Merah)
                                        </option>
                                        <option value="high">
                                            Tinggi (Oranye)
                                        </option>
                                        <option value="medium">
                                            Sedang (Kuning)
                                        </option>
                                        <option value="low">
                                            Rendah (Hijau)
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Keterangan / Alasan
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    rows={2}
                                    placeholder="Penjelasan singkat zona ini..."
                                    className="w-full rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500 sm:text-sm resize-none"
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 font-bold text-slate-500 hover:bg-slate-100 py-2.5 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl shadow-md disabled:opacity-50 transition-transform active:scale-95"
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <svg
                                                className="animate-spin h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Menyimpan...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save className="w-5 h-5" /> Simpan
                                            Area
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DlhLayout>
    );
}
