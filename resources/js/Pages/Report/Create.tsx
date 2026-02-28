import { FormEvent, useState, useEffect, useCallback, useRef } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import WargaLayout from "@/Layouts/WargaLayout";
import Map, { Marker, GeolocateControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {
    CloudUpload,
    Map as MapIcon,
    FileText,
    Send,
    MapPin,
    Target,
    CheckCircleSolid,
    Building,
    Edit,
} from "@mynaui/icons-react";

interface LngLat {
    lng: number;
    lat: number;
}

interface Kaling {
    id: number;
    nama_wilayah: string;
}

export default function CreateReport({
    auth,
    kalings = [],
}: {
    auth: any;
    kalings?: Kaling[];
}) {
    const initialCenter = { longitude: 116.1165, latitude: -8.5833, zoom: 13 };

    const [viewState, setViewState] = useState(initialCenter);
    const [markerPosition, setMarkerPosition] = useState<LngLat | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [isManualOverride, setIsManualOverride] = useState(false);

    const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);

    const mapRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        photo: null as File | null,
        latitude: "",
        longitude: "",
        address: "",
        kaling_id: "",
        waste_type: "",
        severity_level: "",
        description: "",
    });

    // ==========================================
    // FUNGSI TOGGLE JENIS SAMPAH
    // ==========================================
    const toggleWasteType = (type: string) => {
        let updatedTypes = [...selectedWasteTypes];

        if (updatedTypes.includes(type)) {
            // Jika sudah ada, hapus dari array
            updatedTypes = updatedTypes.filter((t) => t !== type);
        } else {
            // Jika belum ada, tambahkan ke array
            updatedTypes.push(type);
        }

        setSelectedWasteTypes(updatedTypes);
        // Gabungkan array menjadi string dipisahkan koma (Contoh: "Organik, B3")
        setData("waste_type", updatedTypes.join(", "));
    };

    // ==========================================
    // ALGORITMA PINTAR AUTO-MATCHING (SISTEM SKORING)
    // ==========================================
    const fetchAddressFromCoords = async (lng: number, lat: number) => {
        setIsDetectingLocation(true);
        setIsManualOverride(false);

        try {
            const token = import.meta.env.VITE_MAPBOX_TOKEN;
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=id`,
            );
            const json = await res.json();

            if (json.features && json.features.length > 0) {
                const placeName = json.features[0].place_name;
                const placeNameLower = placeName.toLowerCase();
                let bestKalingId = "";
                let maxScore = 0;

                kalings.forEach((k) => {
                    const wilLower = k.nama_wilayah.toLowerCase();
                    const cleanWilayah = wilLower.replace(
                        /\b(lingkungan|kel\.|kelurahan|kec\.|kecamatan|desa)\b/g,
                        " ",
                    );
                    const keywords =
                        cleanWilayah
                            .match(/[a-z]+/g)
                            ?.filter((w) => w.length > 3) || [];

                    let currentScore = 0;
                    keywords.forEach((kw) => {
                        if (placeNameLower.includes(kw)) currentScore += 1;
                    });

                    if (currentScore > maxScore) {
                        maxScore = currentScore;
                        bestKalingId = k.id.toString();
                    }
                });

                setData((prev) => ({
                    ...prev,
                    address: placeName,
                    kaling_id: maxScore > 0 ? bestKalingId : "",
                }));
            }
        } catch (error) {
            console.error("Gagal mendeteksi alamat:", error);
        } finally {
            setIsDetectingLocation(false);
        }
    };

    useEffect(() => {
        if (markerPosition) {
            setData((prev) => ({
                ...prev,
                latitude: markerPosition.lat.toString(),
                longitude: markerPosition.lng.toString(),
            }));
        }
    }, [markerPosition]);

    const handleMapClick = useCallback((event: any) => {
        const { lng, lat } = event.lngLat;
        setMarkerPosition({ lng, lat });
        fetchAddressFromCoords(lng, lat);
    }, []);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = {
                        lng: pos.coords.longitude,
                        lat: pos.coords.latitude,
                    };
                    setMarkerPosition(newPos);
                    setViewState({
                        ...viewState,
                        longitude: newPos.lng,
                        latitude: newPos.lat,
                        zoom: 16,
                    });
                    fetchAddressFromCoords(newPos.lng, newPos.lat);
                },
                () =>
                    alert(
                        "Gagal mendapatkan lokasi GPS. Pastikan izin akses lokasi aktif.",
                    ),
                { enableHighAccuracy: true },
            );
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("photo", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route("report.store"));
    };

    // Daftar pilihan jenis sampah
    const wasteOptions = ["Organik", "Anorganik", "B3", "Campuran"];

    return (
        <WargaLayout
            auth={auth}
            header={
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <Send className="w-6 h-6 text-emerald-500" /> Lapor
                            Temuan Sampah
                        </h2>
                        <p className="text-xs lg:text-sm text-slate-500 mt-1">
                            Pilih lokasi, sistem cerdas kami akan mendeteksi
                            wilayahnya.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Buat Laporan Baru" />

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl border border-slate-200 flex flex-col lg:flex-row min-h-[750px] lg:h-[calc(100vh-140px)]">
                {/* KOLOM KIRI: Peta Mapbox */}
                <div className="w-full lg:w-1/2 relative bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col h-[40vh] lg:h-full">
                    <div className="p-4 flex justify-between items-end absolute top-0 left-0 right-0 z-10 pointer-events-none">
                        <div className="pointer-events-auto bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <MapIcon className="w-4 h-4 text-emerald-500" />{" "}
                                Koordinat Peta
                            </h3>
                            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                                Klik di peta untuk menaruh pin merah.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="pointer-events-auto bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl shadow-md border border-slate-200 transition-all flex items-center gap-2 text-xs hover:-translate-y-0.5"
                        >
                            <Target className="w-4 h-4 text-blue-500" /> Lacak
                            GPS
                        </button>
                    </div>

                    <div className="flex-1 w-full z-0 relative">
                        <Map
                            ref={mapRef}
                            {...viewState}
                            onMove={(evt) => setViewState(evt.viewState)}
                            onClick={handleMapClick}
                            style={{ width: "100%", height: "100%" }}
                            mapStyle="mapbox://styles/mapbox/streets-v12"
                            mapboxAccessToken={
                                import.meta.env.VITE_MAPBOX_TOKEN
                            }
                            cursor={markerPosition ? "grab" : "crosshair"}
                        >
                            <GeolocateControl position="bottom-right" />
                            {markerPosition && (
                                <Marker
                                    longitude={markerPosition.lng}
                                    latitude={markerPosition.lat}
                                    anchor="bottom"
                                >
                                    <div className="relative flex items-center justify-center w-10 h-10 -mt-5">
                                        <span className="absolute w-8 h-8 bg-red-500 opacity-30 rounded-full animate-ping"></span>
                                        <span className="absolute w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-md"></span>
                                        <div className="absolute w-0.5 h-4 bg-gray-800 bottom-[-8px] rounded-full"></div>
                                    </div>
                                </Marker>
                            )}
                        </Map>
                    </div>

                    {(errors.latitude || errors.longitude) && (
                        <div className="absolute bottom-6 left-6 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl shadow-lg z-10 animate-in fade-in slide-in-from-left-4">
                            <p className="text-xs text-red-700 font-bold">
                                Titik lokasi wajib dipilih pada peta.
                            </p>
                        </div>
                    )}
                </div>

                {/* KOLOM KANAN: Form Pengisian */}
                <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col h-full bg-white overflow-y-auto custom-scrollbar">
                    <form
                        onSubmit={submit}
                        className="space-y-6 flex flex-col"
                        encType="multipart/form-data"
                    >
                        {/* 1. Upload Foto */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">
                                Unggah Foto Bukti{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl hover:border-emerald-400 transition-colors bg-slate-50 relative group overflow-hidden h-40">
                                {imagePreview ? (
                                    <div className="absolute inset-0 w-full h-full">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white font-semibold text-sm">
                                                Ganti Foto
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-center flex flex-col justify-center items-center w-full h-full pointer-events-none">
                                        <CloudUpload className="w-8 h-8 text-emerald-500 mb-2" />
                                        <p className="text-sm text-slate-600 font-bold text-emerald-600">
                                            Pilih file foto
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            PNG, JPG maksimal 5MB
                                        </p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/jpeg, image/png, image/jpg"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            {errors.photo && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.photo}
                                </p>
                            )}
                        </div>

                        {/* 2. Wilayah & Auto Assignment */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
                                    <span>Alamat / Patokan Lokasi</span>
                                    {isDetectingLocation && (
                                        <span className="text-[10px] text-emerald-500 flex items-center gap-1 animate-pulse">
                                            <svg
                                                className="animate-spin h-3 w-3"
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
                                            Satelit Menganalisa...
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData("address", e.target.value)
                                        }
                                        placeholder="Klik peta untuk deteksi alamat otomatis..."
                                        className="w-full pl-9 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 sm:text-sm bg-slate-50 p-3 placeholder:text-slate-400 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* TAMPILAN MODE MANUAL VS OTOMATIS */}
                            {isManualOverride ? (
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 animate-in fade-in zoom-in-95">
                                    <div className="flex justify-between items-start mb-2">
                                        <label className="block text-sm font-bold text-slate-800">
                                            Pilih Wilayah Manual{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsManualOverride(false)
                                            }
                                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-100 px-2 py-1 rounded"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                    <select
                                        value={data.kaling_id}
                                        onChange={(e) =>
                                            setData("kaling_id", e.target.value)
                                        }
                                        className="w-full rounded-xl border-blue-200 focus:border-blue-500 sm:text-sm bg-white p-3 shadow-sm"
                                    >
                                        <option value="" disabled>
                                            -- Tentukan Wilayah Kaling --
                                        </option>
                                        {kalings.map((k) => (
                                            <option key={k.id} value={k.id}>
                                                {k.nama_wilayah}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div
                                    className={`p-4 rounded-xl border transition-colors duration-500 relative group ${data.kaling_id ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}
                                >
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                        Penanggung Jawab Wilayah
                                    </label>
                                    {data.kaling_id ? (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                                                <CheckCircleSolid className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 leading-tight pr-6">
                                                    {
                                                        kalings.find(
                                                            (k) =>
                                                                k.id.toString() ===
                                                                data.kaling_id,
                                                        )?.nama_wilayah
                                                    }
                                                </p>
                                                <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">
                                                    Dideteksi otomatis oleh
                                                    sistem
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3 opacity-70">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
                                                <Building className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 leading-tight">
                                                    Fasilitas Umum / Kota
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                                                    Ditangani langsung oleh
                                                    Satgas DLH
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsManualOverride(true)
                                        }
                                        className="absolute top-4 right-4 p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all md:opacity-0 group-hover:opacity-100"
                                        title="Koreksi Manual"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 3. Detail Sampah */}
                        <div className="space-y-4">
                            {/* JENIS SAMPAH (CHECKBOX PILLS) */}
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">
                                    Jenis Sampah{" "}
                                    <span className="text-[10px] font-normal text-slate-500">
                                        (Bisa pilih lebih dari satu)
                                    </span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {wasteOptions.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() =>
                                                toggleWasteType(type)
                                            }
                                            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                                selectedWasteTypes.includes(
                                                    type,
                                                )
                                                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* TINGKAT KEPARAHAN (TETAP DROPDOWN) */}
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">
                                    Tingkat Keparahan
                                </label>
                                <select
                                    value={data.severity_level}
                                    onChange={(e) =>
                                        setData(
                                            "severity_level",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border-slate-200 focus:border-emerald-400 sm:text-sm bg-slate-50 p-3"
                                >
                                    <option value="">
                                        Pilih Keparahan (Opsional)
                                    </option>
                                    <option value="Ringan">
                                        Ringan (Bisa diangkut motor)
                                    </option>
                                    <option value="Sedang">
                                        Sedang (Butuh pickup)
                                    </option>
                                    <option value="Parah">
                                        Parah (Butuh truk & alat berat)
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* 4. Deskripsi Tambahan */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-slate-500" />{" "}
                                Keterangan Tambahan{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                className="block w-full rounded-xl border-slate-200 focus:border-emerald-400 sm:text-sm bg-slate-50 p-3 resize-none h-24"
                                placeholder="Cth: Bau menyengat dan menghalangi jalan"
                            />
                            {errors.description && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Area Tombol */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-auto pb-4">
                            <Link
                                href={route("dashboard")}
                                className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4"
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
                                        </svg>{" "}
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" /> Kirim
                                        Laporan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </WargaLayout>
    );
}
