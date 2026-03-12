import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "@inertiajs/react";
import {
    MapPinUserInside,
    X,
    CheckCircleSolid,
    DangerTriangleSolid,
    Danger,
} from "@mynaui/icons-react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import imageCompression from "browser-image-compression";
import { MapPinned } from "lucide-react";
import toast from "react-hot-toast";
import { landingDict } from "@/Lang/Landing";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isDark?: boolean;
    initialLocation?: { lat: number; lng: number; address: string } | null;
    lang: "id" | "en";
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isDark = false,
    initialLocation,
    lang,
}) => {
    // Memanggil dictionary berdasarkan bahasa yang aktif
    const t = landingDict[lang];

    // ── Form State (Inertia) ──────────────────────
    const {
        data,
        setData,
        post,
        processing: isSubmitting,
        errors,
        reset,
    } = useForm({
        description: "",
        photo: null as File | null,
        photos: [] as File[],
        latitude: "" as string | number,
        longitude: "" as string | number,
        address: "",
        severity_level: "",
        needs: [] as string[],
    });

    // ── Local UI State ────────────────────────────
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const [locationMode, setLocationMode] = useState<"current" | "pick">(
        "current",
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
        address: string;
    } | null>(null);
    const [urgency, setUrgency] = useState<"low" | "moderate" | "high" | "">(
        "",
    );
    const [needs, setNeeds] = useState<string[]>([]);
    const [needInput, setNeedInput] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<
        { name: string; full_address: string; mapbox_id: string }[]
    >([]);
    const [showResults, setShowResults] = useState(false);

    // ── AI State (NEW) ────────────────────────────
    const [isScanningAI, setIsScanningAI] = useState(false);
    const [aiResultImage, setAiResultImage] = useState<string | null>(null);
    const [aiDetectedCount, setAiDetectedCount] = useState<number | null>(null);
    const [isAiRejected, setIsAiRejected] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const resultsContainerRef = useRef<HTMLDivElement>(null);
    const sessionTokenRef = useRef<string>(crypto.randomUUID());

    const [viewState, setViewState] = useState({
        longitude: 116.1165,
        latitude: -8.5833,
        zoom: 12,
    });

    useEffect(() => {
        setData("severity_level", urgency);
    }, [urgency]);

    useEffect(() => {
        setData("needs", needs);
    }, [needs]);

    useEffect(() => {
        if (selectedLocation) {
            setData((prev) => ({
                ...prev,
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
                address: selectedLocation.address,
            }));
        }
    }, [selectedLocation]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setImages([]);
            reset();
            setAiResultImage(null);
            setAiDetectedCount(null);
            setIsAiRejected(false);

            if (initialLocation) {
                setLocationMode("pick");
                setSelectedLocation(initialLocation);
                setViewState({
                    longitude: initialLocation.lng,
                    latitude: initialLocation.lat,
                    zoom: 15,
                });
            } else {
                setLocationMode("current");
                setSelectedLocation(null);
            }
            setSearchQuery("");
            setUrgency("");
            setNeeds([]);
            setNeedInput("");
            setSearchResults([]);
            setShowResults(false);
        }
    }, [isOpen, initialLocation]);

    // =======================================================
    // AI LOGIC: FASTAPI SCANNING REAL-TIME
    // =======================================================
    const scanImageWithAI = async (file: File) => {
        setIsScanningAI(true);
        setIsAiRejected(false);
        setAiResultImage(null);
        setAiDetectedCount(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const yoloApiUrl = import.meta.env.VITE_YOLO_API_URL || "http://127.0.0.1:8001";
            const response = await fetch(`${yoloApiUrl}/deteksi/`, {
                method: "POST",
                headers: { "x-api-key": "yolo11-deteksi-sampah" },
                body: formData,
            });

            if (!response.ok) throw new Error("API Error");
            const aiData = await response.json();

            if (aiData.jumlah_deteksi === 0) {
                setIsAiRejected(true);
                toast.error(t.aiNoWasteToast, {
                    duration: 5000,
                    style: {
                        border: "1px solid #ef4444",
                        background: "#fef2f2",
                        color: "#991b1b",
                        fontWeight: "bold",
                    },
                });
            } else {
                setAiDetectedCount(aiData.jumlah_deteksi);
                setAiResultImage(
                    "data:image/jpeg;base64," + aiData.gambar_base64,
                );
                toast.success(
                    `${t.aiValidatedToast} ${aiData.jumlah_deteksi} ${t.objectsDetected.toLowerCase()}.`,
                    {
                        duration: 4000,
                        style: {
                            border: "1px solid #10b981",
                            background: "#ecfdf5",
                            color: "#065f46",
                            fontWeight: "bold",
                        },
                    },
                );
            }
        } catch (error) {
            console.error("AI Error:", error);
            toast(t.aiOfflineToast, {
                icon: "⚠️",
            });
        } finally {
            setIsScanningAI(false);
        }
    };

    // ── Image handling ────────────────────────────
    const updateImagesInForm = (
        newImages: { file: File; preview: string }[],
    ) => {
        setData((prev) => ({
            ...prev,
            // Simpan foto asli ke state inertia, BUKAN foto hasil AI
            photo: newImages[0]?.file || null,
            photos: newImages.slice(1).map((img) => img.file),
        }));
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files) return;

        // BAGAIMANA JUGA HANYA MENGAMBIL 1 GAMBAR
        const validFiles = Array.from(files)
            .filter((f) => f.type.startsWith("image/"))
            .slice(0, 1);

        if (validFiles.length === 0) return;

        const options = {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
        };

        const compressedFiles = await Promise.all(
            validFiles.map(async (file) => {
                try {
                    return await imageCompression(file, options);
                } catch (error) {
                    console.error("Image compression failed:", error);
                    return file;
                }
            }),
        );

        const newImagesList = compressedFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setImages(newImagesList);
        updateImagesInForm(newImagesList);

        // Langsung panggil AI Scanner
        if (newImagesList.length > 0) {
            scanImageWithAI(newImagesList[0].file);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        handleFiles(e.target.files);

    const removeImage = (index: number) => {
        if (index === 0) {
            setAiResultImage(null);
            setAiDetectedCount(null);
            setIsAiRejected(false);
        }

        setImages((prev) => {
            const removed = prev[index];
            if (removed) URL.revokeObjectURL(removed.preview);
            const updated = prev.filter((_, i) => i !== index);
            updateImagesInForm(updated);
            return updated;
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    // ── Location handling ─────────────────────────
    const getCurrentLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setSelectedLocation({
                    lat: latitude,
                    lng: longitude,
                    address: "",
                });
                setViewState({ longitude, latitude, zoom: 15 });
                await reverseGeocode(longitude, latitude);
            },
            () => alert("Location access denied."),
            { enableHighAccuracy: true },
        );
    };

    const reverseGeocode = async (lng: number, lat: number) => {
        try {
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=${lang}`,
            );
            const json = await res.json();
            if (json.features?.[0]) {
                const address = json.features[0].place_name;
                setSelectedLocation((prev) =>
                    prev ? { ...prev, address } : { lat, lng, address },
                );
            }
        } catch (err) {
            console.error("Geocode error:", err);
        }
    };

    const handleMapClick = useCallback((event: any) => {
        const { lng, lat } = event.lngLat;
        setSelectedLocation({ lat, lng, address: "" });
        reverseGeocode(lng, lat);
    }, []);

    const searchLocation = async (query?: string) => {
        const q = (query ?? searchQuery).trim();
        if (!q) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(
                `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(q)}&access_token=${MAPBOX_TOKEN}&proximity=116.1165,-8.5833&language=${lang}&limit=5&session_token=${sessionTokenRef.current}`,
            );
            const json = await res.json();
            if (json.suggestions?.length) {
                setSearchResults(
                    json.suggestions.map((s: any) => ({
                        name: s.name || s.full_address || q,
                        full_address: s.full_address || s.place_formatted || "",
                        mapbox_id: s.mapbox_id,
                    })),
                );
                setShowResults(true);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const pickSearchResult = async (result: {
        name: string;
        full_address: string;
        mapbox_id: string;
    }) => {
        setShowResults(false);
        setSearchResults([]);
        setSearchQuery(result.name);
        setIsSearching(true);
        try {
            const res = await fetch(
                `https://api.mapbox.com/search/searchbox/v1/retrieve/${result.mapbox_id}?access_token=${MAPBOX_TOKEN}&session_token=${sessionTokenRef.current}`,
            );
            const json = await res.json();
            if (json.features?.[0]) {
                const coords = json.features[0].geometry.coordinates;
                const [lng, lat] = coords;
                setSelectedLocation({
                    lat,
                    lng,
                    address: result.full_address || result.name,
                });
                setViewState({ longitude: lng, latitude: lat, zoom: 15 });
            }
            sessionTokenRef.current = crypto.randomUUID();
        } catch (err) {
            console.error("Retrieve error:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (value.trim().length >= 2) {
            searchTimeoutRef.current = setTimeout(
                () => searchLocation(value),
                400,
            );
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            const inSearch = searchContainerRef.current?.contains(target);
            const inResults = resultsContainerRef.current?.contains(target);
            if (!inSearch && !inResults) setShowResults(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const clearLocation = () => {
        setSelectedLocation(null);
        setViewState({ longitude: 116.1165, latitude: -8.5833, zoom: 12 });
    };

    const addNeed = () => {
        const trimmed = needInput.trim();
        if (trimmed && !needs.includes(trimmed)) {
            setNeeds((prev) => [...prev, trimmed]);
            setNeedInput("");
        }
    };
    const removeNeed = (tag: string) =>
        setNeeds((prev) => prev.filter((n) => n !== tag));

    // ── Submit ─────────────────────────────────────
    const handleSubmit = () => {
        if (!data.photo || !data.description || !selectedLocation) {
            if (!data.photo) toast.error(t.pleaseUploadPhoto);
            if (!data.description) toast.error(t.pleaseProvideDesc);
            if (!selectedLocation) toast.error(t.pleaseSelectLoc);
            return;
        }

        if (isAiRejected) {
            toast.error(t.cannotSubmitRejected);
            return;
        }

        post(route("report.store"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t.reportSubmittedSuccess, {
                    duration: 4000,
                    position: "top-center",
                });
                onSubmit(data);
                onClose();
            },
            onError: (err) => {
                console.error("Submit errors:", err);
                if (Object.keys(err).length > 0) {
                    Object.values(err).forEach((errMsg) => {
                        toast.error(errMsg as string);
                    });
                } else {
                    toast.error(t.submitFailedCheck);
                }
            },
        });
    };

    useEffect(() => {
        if (locationMode === "current" && isOpen && !selectedLocation)
            getCurrentLocation();
    }, [locationMode, isOpen]);

    if (!isOpen) return null;

    // ── Design System Tokens ──
    const bg = isDark ? "bg-ds-bg-inverse" : "bg-white";
    const textPrimary = isDark ? "text-ds-inverse" : "text-ds-mono-bold";
    const textSecondary = "text-ds-mono";
    const borderColor = isDark ? "border-ds-border-bold" : "border-ds-border";
    const cardBg = isDark ? "bg-ds-bg-inverse" : "bg-white";
    const inputBg = isDark
        ? "bg-ds-bg-inverse border-ds-border-bold"
        : "bg-ds-disabled-bg border-ds-border";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-0">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ y: "100%", opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0.5 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={`relative w-full max-w-4xl ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-poppins`}
                >
                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div
                            className={`w-10 h-1 rounded-full ${isDark ? "bg-ds-border-bold" : "bg-ds-disabled"}`}
                        />
                    </div>

                    <div
                        className={`flex items-center justify-center px-6 py-4 border-b ${borderColor}`}
                    >
                        <h2
                            className={`text-lg font-bold tracking-tight ${textPrimary} flex items-center gap-2`}
                        >
                            {t.modalTitle}
                        </h2>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto px-6 pt-6 pb-0"
                    >
                        {/* GRID 2 KOLOM UNTUK DESKTOP */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* ========================================================= */}
                            {/* KOLOM KIRI (GAMBAR & PETA) */}
                            {/* ========================================================= */}
                            <div className="space-y-6">
                                {/* 1. IMAGE UPLOAD & AI PREVIEW (TUNGGAL / 1 FOTO) */}
                                <section>
                                    <div className="flex justify-between items-end mb-2.5">
                                        <label
                                            className={`block text-xs font-semibold uppercase tracking-wider ${textSecondary}`}
                                        >
                                            {t.imageEvidence}
                                        </label>
                                        {aiDetectedCount !== null &&
                                            !isAiRejected && (
                                                <span className="text-[10px] bg-[#a7e94a]/20 text-[#4c7017] px-2 py-0.5 rounded-md font-bold">
                                                    {aiDetectedCount}{" "}
                                                    {t.objectsDetected}
                                                </span>
                                            )}
                                    </div>

                                    <div
                                        onClick={() =>
                                            !images.length &&
                                            fileInputRef.current?.click()
                                        }
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`relative rounded-2xl border-2 border-dashed ${isDragging ? "border-ds-primary bg-ds-primary-subtle" : isDark ? "border-ds-border-bold" : "border-ds-border"} ${isDark ? "bg-ds-bg-inverse" : "bg-ds-bg"} flex flex-col items-center justify-center cursor-pointer transition-all min-h-[220px] overflow-hidden group ${images.length > 0 ? "p-0 border-transparent" : "p-8"}`}
                                    >
                                        {images.length > 0 ? (
                                            <div className="w-full h-full relative">
                                                {/* PREVIEW UTAMA + AI SCANNER */}
                                                <img
                                                    src={
                                                        aiResultImage ||
                                                        images[0].preview
                                                    }
                                                    alt="Utama"
                                                    className={`w-full h-[220px] object-contain bg-black/5 rounded-2xl border-2 ${isAiRejected ? "border-red-400" : aiResultImage ? "border-[#a7e94a]" : "border-transparent"}`}
                                                />

                                                {/* Animasi Scanner AI */}
                                                {isScanningAI && (
                                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center z-20 rounded-2xl overflow-hidden">
                                                        <div className="w-full h-1.5 bg-[#a7e94a] shadow-[0_0_15px_rgba(167,233,74,1)] absolute animate-[scan_1.5s_ease-in-out_infinite]" />
                                                        <svg
                                                            className="w-8 h-8 text-[#a7e94a] mb-2 animate-pulse"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                            />
                                                        </svg>
                                                        <span className="text-white font-mono text-[10px] font-bold bg-black/60 px-2 py-1 rounded tracking-wider">
                                                            {t.scanningAI}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Tombol Silang (Hapus Foto) */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeImage(0);
                                                    }}
                                                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg z-30 transition-transform hover:scale-110"
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </button>

                                                {/* Overlay Ganti Foto saat hover */}
                                                {!isScanningAI && (
                                                    <div
                                                        onClick={() =>
                                                            fileInputRef.current?.click()
                                                        }
                                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl z-20"
                                                    >
                                                        <p className="text-white font-semibold text-sm drop-shadow-md">
                                                            {
                                                                t.clickToChangePhoto
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <svg
                                                    className={`w-12 h-12 mx-auto mb-3 text-[#a7e94a] opacity-90`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={1.2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                                    />
                                                </svg>
                                                <p
                                                    className={`text-sm font-semibold ${textPrimary}`}
                                                >
                                                    {t.clickOrDragUpload}
                                                </p>
                                                <p
                                                    className={`text-xs mt-1 ${textSecondary}`}
                                                >
                                                    {t.aiWillAutoScan}
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </div>

                                    {/* PESAN PENOLAKAN AI */}
                                    {isAiRejected && (
                                        <p className="text-xs text-red-600 mt-2 font-bold bg-red-50 p-2 rounded-lg border border-red-200 flex items-center gap-1.5">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                />
                                            </svg>
                                            {t.aiRejectedMsg}
                                        </p>
                                    )}

                                    {errors.photo && !isAiRejected && (
                                        <p className="text-xs text-ds-negative mt-1 font-medium">
                                            {errors.photo}
                                        </p>
                                    )}
                                </section>

                                {/* 2. LOCATION PICKER MAP */}
                                <section>
                                    <label
                                        className={`block text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-2.5`}
                                    >
                                        {t.locationPin}
                                    </label>
                                    <div
                                        className={`flex rounded-xl border p-1 mb-3 ${isDark ? "bg-ds-bg-inverse border-ds-border-bold" : "bg-ds-bg border-ds-border"}`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLocationMode("current");
                                                getCurrentLocation();
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${locationMode === "current"
                                                ? `${cardBg} shadow-sm ${textPrimary} ${isDark ? "" : "shadow-ds-border/60"}`
                                                : textSecondary
                                                }`}
                                        >
                                            <MapPinUserInside className="w-3.5 h-3.5" />{" "}
                                            {t.currentLocation}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setLocationMode("pick")
                                            }
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${locationMode === "pick"
                                                ? `bg-ds-primary-subtle text-ds-primary-pressed shadow-sm`
                                                : textSecondary
                                                }`}
                                        >
                                            <MapPinned className="w-3.5 h-3.5" />{" "}
                                            {t.pickOnMap}
                                        </button>
                                    </div>

                                    <div
                                        ref={searchContainerRef}
                                        className="mb-3"
                                    >
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) =>
                                                        handleSearchInput(
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        e.key === "Enter" &&
                                                        searchLocation()
                                                    }
                                                    onFocus={() =>
                                                        searchResults.length >
                                                        0 &&
                                                        setShowResults(true)
                                                    }
                                                    placeholder={
                                                        t.searchLocationModal
                                                    }
                                                    className={`w-full rounded-xl border ${inputBg} py-2.5 px-3.5 text-sm ${textPrimary} placeholder:text-ds-mono focus:border-ds-primary focus:ring-1 focus:ring-ds-primary/40 outline-none transition-colors`}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => searchLocation()}
                                                disabled={isSearching}
                                                className="h-[42px] px-4 bg-ds-primary/15 rounded-xl flex items-center justify-center hover:bg-ds-primary/25 transition-all text-xs font-bold text-ds-primary-pressed flex-shrink-0"
                                            >
                                                {isSearching ? (
                                                    <svg
                                                        className="w-4 h-4 text-ds-primary-pressed animate-spin"
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
                                                        />
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2.5}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                                            />
                                                        </svg>
                                                        <span>Cari</span>
                                                    </div>
                                                )}
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {showResults &&
                                                searchResults.length > 0 && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            height: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            height: "auto",
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            height: 0,
                                                        }}
                                                        className="overflow-hidden mb-3"
                                                    >
                                                        <div
                                                            ref={
                                                                resultsContainerRef
                                                            }
                                                            className={`${cardBg} rounded-2xl border ${borderColor} overflow-hidden max-h-[220px] overflow-y-auto shadow-lg`}
                                                        >
                                                            {searchResults.map(
                                                                (result, i) => (
                                                                    <button
                                                                        key={i}
                                                                        type="button"
                                                                        onClick={() =>
                                                                            pickSearchResult(
                                                                                result,
                                                                            )
                                                                        }
                                                                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-ds-primary-subtle dark:hover:bg-slate-800 transition-colors ${i < searchResults.length - 1 ? `border-b ${borderColor}` : ""}`}
                                                                    >
                                                                        <div className="w-8 h-8 rounded-full bg-ds-primary-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                            <svg
                                                                                className="w-4 h-4 text-ds-primary-pressed"
                                                                                fill="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                                                                            </svg>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p
                                                                                className={`text-sm font-semibold ${textPrimary} truncate`}
                                                                            >
                                                                                {
                                                                                    result.name
                                                                                }
                                                                            </p>
                                                                            <p
                                                                                className={`text-xs ${textSecondary} truncate mt-0.5`}
                                                                            >
                                                                                {
                                                                                    result.full_address
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                        </AnimatePresence>
                                    </div>

                                    <div
                                        className={`rounded-2xl overflow-hidden border ${isDark ? "border-slate-700" : "border-slate-200"} h-[170px] relative`}
                                    >
                                        <Map
                                            {...viewState}
                                            onMove={(evt) =>
                                                setViewState(evt.viewState)
                                            }
                                            onClick={
                                                locationMode === "pick"
                                                    ? handleMapClick
                                                    : undefined
                                            }
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                            }}
                                            mapStyle={
                                                isDark
                                                    ? "mapbox://styles/mapbox/dark-v11"
                                                    : "mapbox://styles/mapbox/streets-v12"
                                            }
                                            mapboxAccessToken={MAPBOX_TOKEN}
                                            cursor={
                                                locationMode === "pick"
                                                    ? "crosshair"
                                                    : "grab"
                                            }
                                            interactive={true}
                                        >
                                            <NavigationControl
                                                position="top-right"
                                                showCompass={false}
                                            />
                                            {selectedLocation && (
                                                <Marker
                                                    longitude={
                                                        selectedLocation.lng
                                                    }
                                                    latitude={
                                                        selectedLocation.lat
                                                    }
                                                    anchor="bottom"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-8 h-8 bg-red-500 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center">
                                                            <svg
                                                                className="w-4 h-4 text-white"
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </Marker>
                                            )}
                                        </Map>
                                    </div>

                                    {selectedLocation && (
                                        <div
                                            className={`flex items-center gap-3 mt-3 p-3 rounded-xl border ${isDark ? "bg-ds-bg-inverse border-ds-border-bold" : "bg-ds-bg/80 border-ds-border"}`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-ds-primary/15 flex items-center justify-center flex-shrink-0">
                                                <svg
                                                    className="w-4 h-4 text-ds-primary-pressed"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`text-xs font-bold ${textPrimary}`}
                                                >
                                                    {t.selectedLocation}
                                                </p>
                                                <p
                                                    className={`text-[11px] ${textSecondary} truncate`}
                                                >
                                                    {selectedLocation.address ||
                                                        `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
                                                </p>
                                            </div>
                                            <button
                                                onClick={clearLocation}
                                                className={`${textSecondary} hover:text-ds-negative transition-colors`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    {(errors.latitude || errors.longitude) && (
                                        <p className="text-xs text-ds-negative mt-1 font-medium">
                                            {t.pleaseSelectLocationMap}
                                        </p>
                                    )}
                                </section>
                            </div>

                            {/* ========================================================= */}
                            {/* KOLOM KANAN (FORM DETAIL) */}
                            {/* ========================================================= */}
                            <div className="space-y-6">
                                {/* 3. DESCRIPTION */}
                                <section>
                                    <label
                                        className={`block text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-2.5`}
                                    >
                                        {t.additionalDesc}
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        placeholder={t.descPlaceholder}
                                        rows={4}
                                        className={`w-full rounded-xl border ${inputBg} p-4 text-sm ${textPrimary} placeholder:text-ds-mono focus:border-ds-primary focus:ring-1 focus:ring-ds-primary/40 outline-none resize-none transition-colors`}
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-ds-negative mt-1 font-medium">
                                            {errors.description}
                                        </p>
                                    )}
                                </section>

                                {/* 4. URGENCY LEVEL */}
                                <section>
                                    <label
                                        className={`block text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-2.5`}
                                    >
                                        {t.severityLevel}
                                    </label>
                                    <div className="flex gap-2">
                                        {(
                                            ["low", "moderate", "high"] as const
                                        ).map((level) => {
                                            const isActive = urgency === level;
                                            let colorClasses = "";
                                            let icon = null;

                                            // Penamaan berdasarkan bahasa
                                            const labelTranslation =
                                                level === "low"
                                                    ? t.severityLow
                                                    : level === "moderate"
                                                        ? t.severityModerate
                                                        : t.severityHigh;

                                            if (level === "low") {
                                                colorClasses = isActive
                                                    ? "bg-ds-positive-subtle border-ds-positive text-ds-positive-pressed"
                                                    : "";
                                                icon = (
                                                    <CheckCircleSolid
                                                        className={`w-4 h-4 ${isActive ? "text-ds-positive" : isDark ? "text-ds-border-bold" : "text-ds-disabled"}`}
                                                    />
                                                );
                                            } else if (level === "moderate") {
                                                colorClasses = isActive
                                                    ? "bg-ds-notice-subtle border-ds-notice text-ds-notice-pressed"
                                                    : "";
                                                icon = (
                                                    <DangerTriangleSolid
                                                        className={`w-4 h-4 ${isActive ? "text-ds-notice" : isDark ? "text-ds-border-bold" : "text-ds-disabled"}`}
                                                    />
                                                );
                                            } else {
                                                colorClasses = isActive
                                                    ? "bg-ds-negative-subtle border-ds-negative text-ds-negative-pressed"
                                                    : "";
                                                icon = (
                                                    <DangerTriangleSolid
                                                        className={`w-4 h-4 ${isActive ? "text-ds-negative" : isDark ? "text-ds-border-bold" : "text-ds-disabled"}`}
                                                    />
                                                );
                                            }

                                            return (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    onClick={() =>
                                                        setUrgency(level)
                                                    }
                                                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl border transition-all ${isActive ? colorClasses : `${isDark ? "bg-ds-bg-inverse border-ds-border-bold" : "bg-slate-50 border-slate-200"} ${textSecondary} hover:bg-slate-100`}`}
                                                >
                                                    {icon}
                                                    <span className="text-[11px] font-bold uppercase tracking-widest">
                                                        {labelTranslation}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* 5. REPORT NEEDS */}
                                <section>
                                    <label
                                        className={`block text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-2.5`}
                                    >
                                        {t.helpNeeds}
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={needInput}
                                            onChange={(e) =>
                                                setNeedInput(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                (e.preventDefault(), addNeed())
                                            }
                                            placeholder={t.needsPlaceholder}
                                            className={`flex-1 rounded-xl border ${inputBg} py-3 px-3.5 text-sm ${textPrimary} placeholder:text-ds-mono focus:border-ds-primary focus:ring-1 focus:ring-ds-primary/40 outline-none transition-colors`}
                                        />
                                        <button
                                            type="button"
                                            onClick={addNeed}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${isDark ? "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600"}`}
                                        >
                                            <svg
                                                className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2.5}
                                            >
                                                <path d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                        </button>
                                    </div>
                                    {needs.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {needs.map((need) => (
                                                <span
                                                    key={need}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200"}`}
                                                >
                                                    {need}
                                                    <button
                                                        onClick={() =>
                                                            removeNeed(need)
                                                        }
                                                        className="hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`px-6 py-5 border-t ${borderColor} flex items-center justify-end gap-3 ${isDark ? "bg-slate-900" : "bg-slate-50/50"}`}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-5 py-2.5 font-bold text-sm transition-colors ${isDark ? "text-slate-400 hover:text-slate-100" : "text-slate-500 hover:text-slate-800"}`}
                        >
                            {t.cancel}
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={
                                isSubmitting || isScanningAI || isAiRejected
                            }
                            className={`py-3 px-8 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${isScanningAI || isAiRejected || isSubmitting
                                ? `${isDark ? "bg-slate-800 text-slate-600" : "bg-slate-300 text-slate-500"} cursor-not-allowed shadow-none`
                                : "bg-[#a7e94a] text-slate-900 hover:bg-[#92d03b] hover:shadow-lg hover:-translate-y-0.5"
                                }`}
                        >
                            {isScanningAI ? (
                                <>
                                    <svg
                                        className="w-4 h-4 animate-spin"
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
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>{" "}
                                    {t.scanningAI}
                                </>
                            ) : isSubmitting ? (
                                <>
                                    <svg
                                        className="w-4 h-4 animate-spin"
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
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>{" "}
                                    {t.submitting}
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                    </svg>
                                    {t.submitReport}
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* INJEKSI CSS ANIMASI LASER SCANNER AI */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes scan {
                    0% { top: -10%; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 110%; opacity: 0; }
                }
            `,
                }}
            />
        </AnimatePresence>
    );
};

export default ReportModal;
