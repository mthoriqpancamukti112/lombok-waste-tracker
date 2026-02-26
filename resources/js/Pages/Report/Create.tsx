import { FormEvent, useState, useEffect, useCallback, useRef } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Map, { Marker, GeolocateControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

// Tipe untuk titik koordinat Mapbox
interface LngLat {
    lng: number;
    lat: number;
}

export default function CreateReport() {
    // Pusat peta default (Lombok)
    const initialCenter = {
        longitude: 116.3167,
        latitude: -8.5833,
        zoom: 10,
    };

    // State untuk peta Mapbox
    const [viewState, setViewState] = useState(initialCenter);
    const [markerPosition, setMarkerPosition] = useState<LngLat | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Reference untuk memanipulasi peta jika perlu (opsional)
    const mapRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        description: "",
        photo: null as File | null,
        latitude: "",
        longitude: "",
    });

    // Update form Inertia ketika marker berpindah
    useEffect(() => {
        if (markerPosition) {
            setData((prevData) => ({
                ...prevData,
                latitude: markerPosition.lat.toString(),
                longitude: markerPosition.lng.toString(),
            }));
        }
    }, [markerPosition]);

    // Menangkap event klik pada peta Mapbox
    const handleMapClick = useCallback((event: any) => {
        const { lng, lat } = event.lngLat;
        setMarkerPosition({ lng, lat });
    }, []);

    // Fitur Geolokasi Manual (diluar GeolocateControl bawaan)
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
                        zoom: 14, // Zoom in saat lokasi ditemukan
                    });
                },
                () =>
                    alert(
                        "Gagal mendapatkan lokasi GPS. Pastikan izin akses lokasi aktif.",
                    ),
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-extrabold leading-tight text-slate-800 tracking-tight">
                        Lapor Temuan Sampah
                    </h2>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Formulir Warga
                    </span>
                </div>
            }
        >
            <Head title="Buat Laporan Baru" />

            <div className="py-10 bg-slate-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl border border-slate-200 flex flex-col lg:flex-row min-h-[700px]">
                        {/* KOLOM KIRI: Peta Mapbox Resolusi Tinggi */}
                        <div className="w-full lg:w-1/2 relative bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col">
                            {/* Overlay Header Peta */}
                            <div className="p-6 pb-4 flex justify-between items-end absolute top-0 left-0 right-0 z-10 pointer-events-none">
                                <div className="pointer-events-auto bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-slate-200">
                                    <h3 className="text-sm font-bold text-slate-800">
                                        Tentukan Koordinat
                                    </h3>
                                    <p className="text-xs text-slate-600">
                                        Klik area peta untuk menaruh pin.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    className="pointer-events-auto bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-xl shadow-md border border-slate-200 transition-all flex items-center gap-2 text-sm"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4 text-blue-500"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                        />
                                    </svg>
                                    Lacak GPS
                                </button>
                            </div>

                            <div className="flex-1 h-[400px] lg:h-auto w-full z-0 relative">
                                <Map
                                    ref={mapRef}
                                    {...viewState}
                                    onMove={(evt) =>
                                        setViewState(evt.viewState)
                                    }
                                    onClick={handleMapClick}
                                    style={{ width: "100%", height: "100%" }}
                                    mapStyle="mapbox://styles/mapbox/streets-v12"
                                    mapboxAccessToken={
                                        import.meta.env.VITE_MAPBOX_TOKEN
                                    }
                                    cursor={
                                        markerPosition ? "grab" : "crosshair"
                                    }
                                >
                                    <GeolocateControl position="bottom-right" />

                                    {/* Marker Custom Mapbox */}
                                    {markerPosition && (
                                        <Marker
                                            longitude={markerPosition.lng}
                                            latitude={markerPosition.lat}
                                            anchor="bottom"
                                        >
                                            <div className="relative flex items-center justify-center w-10 h-10 -mt-5">
                                                <span className="absolute w-8 h-8 bg-red-500 opacity-30 rounded-full animate-ping"></span>
                                                <span className="absolute w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-md"></span>
                                                {/* Batang Pin */}
                                                <div className="absolute w-0.5 h-4 bg-gray-800 bottom-[-8px] rounded-full"></div>
                                            </div>
                                        </Marker>
                                    )}
                                </Map>
                            </div>

                            {(errors.latitude || errors.longitude) && (
                                <div className="absolute bottom-6 left-6 right-16 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl shadow-lg z-10 pointer-events-none">
                                    <p className="text-xs text-red-700 font-semibold flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="w-4 h-4"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Titik lokasi wajib dipilih pada peta.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* KOLOM KANAN: Form Pengisian */}
                        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between">
                            <form
                                onSubmit={submit}
                                className="space-y-8 flex-1 flex flex-col"
                                encType="multipart/form-data"
                            >
                                {/* Area Upload Foto Modern */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-3">
                                        Unggah Foto Bukti
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl hover:border-[#a7e94a] transition-colors bg-slate-50 relative group overflow-hidden h-48">
                                        {imagePreview ? (
                                            <div className="absolute inset-0 w-full h-full">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white font-semibold flex items-center gap-2">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="w-5 h-5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                                            />
                                                        </svg>
                                                        Ganti Foto
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 text-center flex flex-col justify-center items-center w-full h-full">
                                                <svg
                                                    className="mx-auto h-12 w-12 text-slate-400"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    viewBox="0 0 48 48"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                <div className="flex text-sm text-slate-600 justify-center mt-2">
                                                    <span className="relative cursor-pointer font-bold text-[#86bf36] hover:text-[#92ce40] focus-within:outline-none">
                                                        <span>
                                                            Pilih file foto
                                                        </span>
                                                    </span>
                                                    <p className="pl-1">
                                                        atau tarik dan lepas
                                                    </p>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    PNG, JPG, JPEG hingga 5MB
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/jpeg, image/png, image/jpg"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    {errors.photo && (
                                        <p className="text-sm text-red-600 mt-2">
                                            {errors.photo}
                                        </p>
                                    )}
                                </div>

                                {/* Deskripsi Tambahan */}
                                <div className="flex-1 flex flex-col">
                                    <label className="text-sm font-bold text-slate-800 mb-2 flex justify-between">
                                        Keterangan Lokasi
                                        <span className="text-xs font-normal text-slate-400">
                                            Opsional
                                        </span>
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        className="block w-full flex-1 rounded-2xl border-slate-200 shadow-sm focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50/50 p-4 transition-colors resize-none"
                                        placeholder="Berikan detail spesifik. Contoh: 'Di samping tiang listrik depan Indomaret, bau sangat menyengat'."
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600 mt-2">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                {/* Area Tombol */}
                                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4 mt-auto">
                                    <Link
                                        href={route("dashboard.warga")}
                                        className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#a7e94a] hover:bg-[#92ce40] text-slate-900 font-bold py-3 px-8 rounded-xl shadow-md disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-5 w-5 text-slate-900"
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
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2.5}
                                                    stroke="currentColor"
                                                    className="w-5 h-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                                    />
                                                </svg>
                                                Kirim Laporan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
