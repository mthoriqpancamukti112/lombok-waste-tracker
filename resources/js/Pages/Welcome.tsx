import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import { useState, useEffect, useRef } from "react";
import MapComponent from "@/Components/MapComponent";
import { landingDict } from "@/Lang/Landing";
import BottomBar from "@/Components/BottomBar";
import BottomSheet from "@/Components/BottomSheet";
import ReportListContent from "@/Components/ReportListContent";
import ProfileContent from "@/Components/ProfileContent";
import AuthModal from "@/Components/AuthModal";
import ReportModal from "@/Components/ReportModal";
import ReportDetailContent from "@/Components/ReportDetailContent";
import ChatbotWidget from "@/Components/ChatbotWidget";
import { Toaster, toast } from "react-hot-toast";
import {
    Globe,
    GlobeSolid,
    SunSolid,
    Moon,
    MoonSolid,
    CrosshairSolid,
    ChevronDown,
    MapPin,
    Flame,
    DangerTriangle,
    Grid,
    LayersThree,
    Bell,
    BellSolid,
} from "@mynaui/icons-react";

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    role?: string;
}

interface Report {
    id: number;
    latitude: string;
    longitude: string;
    description: string;
    status: string;
    severity_level?: string;
    waste_type?: string;
    address?: string;
    photo_path: string;
    user: { id: number; name: string; avatar?: string | null };
    likes_count: number;
    comments_count: number;
    created_at: string;
}

interface DangerZone {
    id: number;
    name: string;
    description?: string;
    type: string;
    severity: string;
    coordinates?: number[][];
    center_lat?: number;
    center_lng?: number;
    radius_meters?: number;
}

interface WasteDensityZone {
    id: number;
    name: string;
    coordinates?: number[][];
    density_level: string;
    kelurahan?: string;
    kecamatan?: string;
    report_count: number;
}

export default function Welcome({
    auth,
    reports,
    dangerZones,
    wasteDensityZones,
}: PageProps<{
    auth: { user: (User & { notifications?: any[] }) | null };
    reports: Report[];
    dangerZones: DangerZone[];
    wasteDensityZones: WasteDensityZone[];
}>) {
    const [showMobileMapSettings, setShowMobileMapSettings] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [lang, setLang] = useState<"id" | "en">("id");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isDesktop, setIsDesktop] = useState(true);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedReportDetail, setSelectedReportDetail] = useState<any>(null);
    const [activePanel, setActivePanel] = useState<
        "none" | "reports" | "profile" | "report-detail"
    >("none");
    const [authModalTab, setAuthModalTab] = useState<"login" | "register">(
        "login",
    );
    const [showNotifications, setShowNotifications] = useState(false);
    const [mapSettings, setMapSettings] = useState({
        showMarkers: true,
        showHeatmap: false,
        showDangerZones: false,
        showDensityZones: false,
    });
    const [searchedLocation, setSearchedLocation] = useState<{
        lat: number;
        lng: number;
        address: string;
    } | null>(null);
    const [initialReportLocation, setInitialReportLocation] = useState<{
        lat: number;
        lng: number;
        address: string;
    } | null>(null);
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    const mapRef = useRef<{
        centerOnUser: () => void;
        flyTo: (lat: number, lng: number) => void;
        openPopup: (report: Report) => void;
    } | null>(null);
    const t = landingDict[lang];

    // Load persisted settings
    useEffect(() => {
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);

        const savedTheme = localStorage.getItem("appTheme");
        if (savedTheme === "dark") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else if (savedTheme === "light") {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    // Persist and apply theme
    useEffect(() => {
        localStorage.setItem("appTheme", isDarkMode ? "dark" : "light");
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    // Auto-detect location on mount
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.warn("Geolocation error:", error);
                },
            );
        }
    }, []);

    // Persist language
    useEffect(() => {
        localStorage.setItem("appLang", lang);
    }, [lang]);

    useEffect(() => {
        const checkSize = () => setIsDesktop(window.innerWidth >= 1280);
        checkSize();
        window.addEventListener("resize", checkSize);
        return () => window.removeEventListener("resize", checkSize);
    }, []);

    // Auto-close profile panel on logout
    useEffect(() => {
        if (!auth.user && activePanel === "profile") {
            setActivePanel("none");
        }
    }, [auth.user, activePanel]);

    // Check for pending report location after login
    useEffect(() => {
        if (auth.user) {
            const pendingLocation = sessionStorage.getItem(
                "pendingReportLocation",
            );
            if (pendingLocation) {
                try {
                    setInitialReportLocation(JSON.parse(pendingLocation));
                    setIsReportModalOpen(true);
                    sessionStorage.removeItem("pendingReportLocation");
                } catch (e) {
                    console.error("Failed to parse pending location", e);
                }
            }
        }
    }, [auth.user]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleTabClick = (tab: "reports" | "profile") => {
        // If user clicks profile and is not logged in, that's handled in BottomBar (link to login)
        setActivePanel((prev) => (prev === tab ? "none" : tab));
    };

    const toggleLang = () => setLang((prev) => (prev === "id" ? "en" : "id"));
    const toggleDark = () => setIsDarkMode((prev) => !prev);
    const handleGeolocate = () => {
        if (mapRef.current) mapRef.current.centerOnUser();
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 600); // Wait 600ms before triggering search
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchQuery.length < 3) {
                setSearchResults([]);
                setShowSearchResults(false);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                // Use OpenStreetMap Nominatim for free searches without API keys/billing
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedSearchQuery)}&format=json&addressdetails=1&limit=5&countrycodes=id`,
                );
                const data = await response.json();

                // Map Nominatim results to existing structure
                const formattedResults = data.map((place: any) => {
                    return {
                        id: place.place_id || Math.random().toString(),
                        place_name: place.display_name,
                        center: [parseFloat(place.lon), parseFloat(place.lat)],
                    };
                });

                setSearchResults(formattedResults);
                setShowSearchResults(true);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        };

        performSearch();
    }, [debouncedSearchQuery]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length > 0 && query.length < 3) {
            setIsSearching(false);
        } else if (query.length >= 3) {
            setIsSearching(true); // Show spinner immediately while user types
        }
    };

    const selectLocation = (feature: any) => {
        const [lng, lat] = feature.center;
        if (mapRef.current) {
            mapRef.current.flyTo(lat, lng);
        }
        setSearchQuery(feature.place_name);
        setSearchedLocation({ lat, lng, address: feature.place_name });
        setShowSearchResults(false);
    };

    const toggleSetting = (setting: keyof typeof mapSettings) => {
        setMapSettings((prev) => ({ ...prev, [setting]: !prev[setting] }));
    };

    const handleReportSelect = async (reportId: number) => {
        setIsLoadingDetail(true);
        setActivePanel("report-detail");
        try {
            const response = await fetch(`/api/report/${reportId}`, {
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });
            const data = await response.json();
            setSelectedReportDetail(data);
        } catch (error) {
            console.error("Failed to fetch report details:", error);
            toast.error("Gagal memuat detail laporan");
            setActivePanel("none");
        } finally {
            setIsLoadingDetail(false);
        }
    };

    // ======================================================================
    // MENGATUR MAP FOCUS & BUKA POPUP DARI LINK CHATBOT (INSTAN / SPA)
    // ======================================================================
    const handleFocusReportFromChatbot = (reportId: number) => {
        if (reports && reports.length > 0) {
            const targetReport = reports.find((r) => r.id === reportId);

            if (targetReport && mapRef.current) {
                // 1. Terbang ke titik koordinat
                mapRef.current.flyTo(
                    Number(targetReport.latitude),
                    Number(targetReport.longitude),
                );

                // 2. Munculkan popup kecil 0.5 detik kemudian
                setTimeout(() => {
                    mapRef.current?.openPopup(targetReport);
                }, 500);
            }
        }
    };

    const mobileBtnBase =
        "w-10 h-10 shadow-[0_4px_14px_rgba(0,0,0,0.07)] border border-slate-100 rounded-xl flex items-center justify-center transition-all active:scale-90";
    const desktopBtn =
        "w-12 h-12 bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center transition-all hover:shadow-lg hover:scale-105 active:scale-95";

    const openAuthModal = (tab: "login" | "register" = "login") => {
        setAuthModalTab(tab);
        setIsAuthModalOpen(true);
    };

    const unreadNotifications =
        auth.user?.notifications?.filter((n: any) => !n.read_at) || [];

    const handleMarkAsRead = async (id: string) => {
        try {
            await fetch(`/notifications/${id}/read`, {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN":
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || "",
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });
            router.reload({ only: ["auth"] });
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch("/notifications/read-all", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN":
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || "",
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });
            router.reload({
                only: ["auth"],
            });
            setShowNotifications(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Head title={t.title} />

            <div
                className={`fixed inset-0 w-full overflow-hidden ${isDarkMode ? "bg-slate-900" : "bg-slate-50"} h-[100dvh]`}
            >
                {/* ─── Map fills full viewport ─── */}
                <div className="absolute inset-0 z-0">
                    <MapComponent
                        ref={mapRef}
                        reports={reports}
                        dangerZones={dangerZones}
                        wasteDensityZones={wasteDensityZones}
                        isDarkMode={isDarkMode}
                        mapSettings={mapSettings}
                        onToggleSetting={toggleSetting}
                        onSelectReport={handleReportSelect}
                        searchedLocation={searchedLocation}
                        onClearSearchLocation={() => {
                            setSearchedLocation(null);
                            setSearchQuery("");
                        }}
                        onReportSearchedLocation={() => {
                            if (!auth.user) {
                                if (searchedLocation) {
                                    sessionStorage.setItem(
                                        "pendingReportLocation",
                                        JSON.stringify(searchedLocation),
                                    );
                                }
                                openAuthModal("login");
                            } else {
                                setInitialReportLocation(searchedLocation);
                                setIsReportModalOpen(true);
                            }
                        }}
                        onGeolocate={(lat, lng) =>
                            setUserLocation({ lat, lng })
                        }
                        lang={lang}
                    />
                </div>

                {/* ══════════════════════════════════════════
                    MOBILE TOP BAR
                    ══════════════════════════════════════════ */}
                <div className="xl:hidden absolute top-0 inset-x-0 z-50 px-4 pt-5 flex flex-col gap-2.5">
                    <div className="relative">
                        <div
                            className={`bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center px-4 py-1`}
                        >
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() =>
                                    searchQuery.length >= 3 &&
                                    setShowSearchResults(true)
                                }
                                placeholder={t.searchPlaceholder}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 placeholder-slate-400 text-sm font-medium"
                            />
                            {isSearching ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#a7e94a] ml-2" />
                            ) : (
                                <button className="ml-2 w-9 h-9 bg-[#a7e94a] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-[#a7e94a]/30">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={3}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {showSearchResults && searchResults.length > 0 && (
                            <div className="absolute top-14 inset-x-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                                {searchResults.map((res) => (
                                    <button
                                        key={res.id}
                                        onClick={() => selectLocation(res)}
                                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-50 dark:border-slate-700 last:border-none flex items-start gap-3 transition-colors"
                                    >
                                        <MapPin className="w-4 h-4 text-[#a7e94a] mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                                            {res.place_name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {showSearchResults &&
                            searchResults.length === 0 &&
                            !isSearching &&
                            searchQuery.length >= 3 && (
                                <div className="absolute top-14 inset-x-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 p-4 text-center">
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {lang === "id"
                                            ? "Lokasi tidak ditemukan"
                                            : "Location not found"}
                                    </span>
                                </div>
                            )}
                    </div>

                    <div className="flex justify-end gap-2">
                        {/* Language */}
                        <button
                            onClick={toggleLang}
                            className={`${mobileBtnBase} bg-white dark:bg-slate-800 dark:border-slate-700 gap-0.5 px-1`}
                        >
                            <Globe className="w-[15px] h-[15px] text-slate-500" />
                            <span className="text-[11px] font-black text-slate-600 tracking-tighter">
                                {lang.toUpperCase()}
                            </span>
                        </button>

                        {/* Notifications */}
                        {auth.user && (
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setShowNotifications(!showNotifications)
                                    }
                                    className={`${mobileBtnBase} bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-500 relative`}
                                >
                                    {unreadNotifications.length > 0 ? (
                                        <BellSolid className="w-[18px] h-[18px] text-[#a7e94a]" />
                                    ) : (
                                        <Bell className="w-[18px] h-[18px]" />
                                    )}
                                    {unreadNotifications.length > 0 && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <div className="absolute top-12 right-0 w-[85vw] max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 flex flex-col">
                                        <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                                Notifikasi
                                            </h3>
                                            {unreadNotifications.length > 0 && (
                                                <button
                                                    onClick={
                                                        handleMarkAllAsRead
                                                    }
                                                    className="text-[10px] font-bold text-[#a7e94a]"
                                                >
                                                    Tandai semua dibaca
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[60vh] overflow-y-auto p-2 flex flex-col gap-1">
                                            {auth.user.notifications?.length ===
                                            0 ? (
                                                <div className="p-6 text-center text-xs text-slate-400">
                                                    Tidak ada notifikasi
                                                </div>
                                            ) : (
                                                auth.user.notifications?.map(
                                                    (notif: any) => (
                                                        <button
                                                            key={notif.id}
                                                            onClick={() => {
                                                                if (
                                                                    !notif.read_at
                                                                )
                                                                    handleMarkAsRead(
                                                                        notif.id,
                                                                    );
                                                                if (
                                                                    notif.data
                                                                        .report_id
                                                                )
                                                                    handleReportSelect(
                                                                        notif
                                                                            .data
                                                                            .report_id,
                                                                    );
                                                                setShowNotifications(
                                                                    false,
                                                                );
                                                            }}
                                                            className={`w-full text-left p-2.5 rounded-xl transition-all ${!notif.read_at ? "bg-slate-50 dark:bg-slate-700/50" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                                                        >
                                                            <div className="flex gap-2">
                                                                <div
                                                                    className={`mt-1 w-1.5 h-1.5 shrink-0 rounded-full ${!notif.read_at ? "bg-[#a7e94a]" : "bg-transparent"}`}
                                                                />
                                                                <div className="flex-1">
                                                                    <p
                                                                        className={`text-[11px] ${!notif.read_at ? "font-bold text-slate-800 dark:text-slate-200" : "font-medium text-slate-600 dark:text-slate-400"}`}
                                                                    >
                                                                        {
                                                                            notif
                                                                                .data
                                                                                .message
                                                                        }
                                                                    </p>
                                                                    <p className="text-[9px] text-slate-400 mt-0.5">
                                                                        {new Date(
                                                                            notif.created_at,
                                                                        ).toLocaleDateString(
                                                                            "id-ID",
                                                                            {
                                                                                year: "numeric",
                                                                                month: "short",
                                                                                day: "numeric",
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            },
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ),
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Dark mode */}
                        <button
                            onClick={toggleDark}
                            className={`${mobileBtnBase} bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-500`}
                        >
                            {isDarkMode ? (
                                <MoonSolid className="w-[18px] h-[18px]" />
                            ) : (
                                <SunSolid className="w-[18px] h-[18px]" />
                            )}
                        </button>

                        {/* Geolocate */}
                        <button
                            onClick={handleGeolocate}
                            className={`${mobileBtnBase} bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-500`}
                        >
                            <CrosshairSolid className="w-[18px] h-[18px]" />
                        </button>

                        {/* Map Layers Toggle */}
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setShowMobileMapSettings(
                                        !showMobileMapSettings,
                                    )
                                }
                                className={`${mobileBtnBase} ${showMobileMapSettings ? "bg-[#a7e94a] text-white border-[#a7e94a]" : "text-slate-500 bg-white dark:bg-slate-800 dark:border-slate-700"}`}
                            >
                                <LayersThree className="w-[18px] h-[18px]" />
                            </button>

                            {/* Dropdown - Expands Downward */}
                            {showMobileMapSettings && (
                                <div className="absolute top-12 right-0 z-50 flex flex-col gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() =>
                                            toggleSetting("showMarkers")
                                        }
                                        className={`${mobileBtnBase} ${mapSettings.showMarkers ? "bg-[#a7e94a] text-white" : "bg-transparent text-slate-500 hover:bg-white/50"}`}
                                    >
                                        <MapPin className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            toggleSetting("showHeatmap")
                                        }
                                        className={`${mobileBtnBase} ${mapSettings.showHeatmap ? "bg-[#a7e94a] text-white" : "bg-transparent text-slate-500 hover:bg-white/50"}`}
                                    >
                                        <Flame className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            toggleSetting("showDangerZones")
                                        }
                                        className={`${mobileBtnBase} ${mapSettings.showDangerZones ? "bg-[#a7e94a] text-white" : "bg-transparent text-slate-500 hover:bg-white/50"}`}
                                    >
                                        <DangerTriangle className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            toggleSetting("showDensityZones")
                                        }
                                        className={`${mobileBtnBase} ${mapSettings.showDensityZones ? "bg-[#a7e94a] text-white" : "bg-transparent text-slate-500 hover:bg-white/50"}`}
                                    >
                                        <Grid className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    DESKTOP TOP BAR
                    ══════════════════════════════════════════ */}
                <div className="hidden xl:flex absolute top-6 inset-x-6 z-50 items-center gap-4">
                    <div className="flex-[7] relative">
                        <div className="bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center px-6 py-1.5 focus-within:ring-4 focus-within:ring-[#a7e94a]/15 transition-all">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() =>
                                    searchQuery.length >= 3 &&
                                    setShowSearchResults(true)
                                }
                                placeholder={t.searchPlaceholder}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 font-medium"
                            />
                            {isSearching ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#a7e94a] ml-2" />
                            ) : (
                                <button className="ml-2 w-10 h-10 bg-[#a7e94a] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#a7e94a]/20 hover:scale-105 active:scale-95 transition-all">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={3}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {showSearchResults && searchResults.length > 0 && (
                            <div className="absolute top-16 inset-x-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                                {searchResults.map((res) => (
                                    <button
                                        key={res.id}
                                        onClick={() => selectLocation(res)}
                                        className="w-full px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-50 dark:border-slate-700 last:border-none flex items-center gap-4 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-[#a7e94a]/10 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4 text-[#a7e94a]" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {res.place_name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {showSearchResults &&
                            searchResults.length === 0 &&
                            !isSearching &&
                            searchQuery.length >= 3 && (
                                <div className="absolute top-16 inset-x-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 p-6 text-center">
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {lang === "id"
                                            ? "Lokasi tidak ditemukan"
                                            : "Location not found"}
                                    </span>
                                </div>
                            )}
                    </div>

                    <div className="flex-[3] flex items-center justify-end gap-2.5">
                        {/* Language toggle */}
                        <button
                            onClick={toggleLang}
                            className={`${desktopBtn} gap-1.5 px-4 w-auto`}
                        >
                            <GlobeSolid className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-bold text-slate-600">
                                {lang.toUpperCase()}
                            </span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {/* Notifications */}
                        {auth.user && (
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setShowNotifications(!showNotifications)
                                    }
                                    className={`${desktopBtn} text-slate-500 relative`}
                                >
                                    {unreadNotifications.length > 0 ? (
                                        <BellSolid className="w-5 h-5 text-[#a7e94a]" />
                                    ) : (
                                        <Bell className="w-5 h-5" />
                                    )}
                                    {unreadNotifications.length > 0 && (
                                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <div className="absolute top-16 right-0 w-80 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 flex flex-col">
                                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200">
                                                Notifikasi
                                            </h3>
                                            {unreadNotifications.length > 0 && (
                                                <button
                                                    onClick={
                                                        handleMarkAllAsRead
                                                    }
                                                    className="text-[10px] font-bold text-[#a7e94a] hover:underline"
                                                >
                                                    Tandai semua dibaca
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1">
                                            {auth.user.notifications?.length ===
                                            0 ? (
                                                <div className="p-6 text-center text-sm text-slate-400">
                                                    Tidak ada notifikasi
                                                </div>
                                            ) : (
                                                auth.user.notifications?.map(
                                                    (notif: any) => (
                                                        <button
                                                            key={notif.id}
                                                            onClick={() => {
                                                                if (
                                                                    !notif.read_at
                                                                )
                                                                    handleMarkAsRead(
                                                                        notif.id,
                                                                    );
                                                                if (
                                                                    notif.data
                                                                        .report_id
                                                                )
                                                                    handleReportSelect(
                                                                        notif
                                                                            .data
                                                                            .report_id,
                                                                    );
                                                                setShowNotifications(
                                                                    false,
                                                                );
                                                            }}
                                                            className={`w-full text-left p-3 rounded-2xl transition-all ${!notif.read_at ? "bg-slate-50 dark:bg-slate-700/50" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div
                                                                    className={`mt-1.5 w-2 h-2 shrink-0 rounded-full ${!notif.read_at ? "bg-[#a7e94a]" : "bg-transparent"}`}
                                                                />
                                                                <div className="flex-1">
                                                                    <p
                                                                        className={`text-xs ${!notif.read_at ? "font-bold text-slate-800 dark:text-slate-200" : "font-medium text-slate-600 dark:text-slate-400"}`}
                                                                    >
                                                                        {
                                                                            notif
                                                                                .data
                                                                                .message
                                                                        }
                                                                    </p>
                                                                    <p className="text-[9px] text-slate-400 mt-1">
                                                                        {new Date(
                                                                            notif.created_at,
                                                                        ).toLocaleDateString(
                                                                            "id-ID",
                                                                            {
                                                                                year: "numeric",
                                                                                month: "short",
                                                                                day: "numeric",
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            },
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ),
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Dark / Light mode */}
                        <button
                            onClick={toggleDark}
                            className={`${desktopBtn} text-slate-500`}
                        >
                            {isDarkMode ? (
                                <MoonSolid className="w-5 h-5" />
                            ) : (
                                <SunSolid className="w-5 h-5" />
                            )}
                        </button>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                        {/* Map Settings Controls */}
                        <div className="flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
                            <button
                                onClick={() => toggleSetting("showMarkers")}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mapSettings.showMarkers ? "bg-[#a7e94a] text-white shadow-md shadow-[#a7e94a]/20" : "text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200"}`}
                                title="Tampilkan Marker"
                            >
                                <MapPin className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => toggleSetting("showHeatmap")}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mapSettings.showHeatmap ? "bg-[#a7e94a] text-white shadow-md shadow-[#a7e94a]/20" : "text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200"}`}
                                title="Tampilkan Heatmap"
                            >
                                <Flame className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => toggleSetting("showDangerZones")}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mapSettings.showDangerZones ? "bg-[#a7e94a] text-white shadow-md shadow-[#a7e94a]/20" : "text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200"}`}
                                title="Tampilkan Zona Bahaya"
                            >
                                <DangerTriangle className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() =>
                                    toggleSetting("showDensityZones")
                                }
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mapSettings.showDensityZones ? "bg-[#a7e94a] text-white shadow-md shadow-[#a7e94a]/20" : "text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200"}`}
                                title="Tampilkan Kepadatan Sampah"
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Geolocate */}
                        <button
                            onClick={handleGeolocate}
                            className={`${desktopBtn} text-slate-500`}
                        >
                            <CrosshairSolid className="w-5 h-5" />
                        </button>

                        {/* Profile Avatar (desktop top bar) - Only show when logged in */}
                        {/* {auth.user && (
                            <button
                                onClick={() => handleTabClick('profile')}
                                className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-2xl pl-2 pr-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all"
                            >
                                <img
                                    src={auth.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=a7e94a&color=fff&size=64`}
                                    alt={auth.user.name}
                                    className="w-8 h-8 rounded-xl object-cover"
                                />
                                <span className="text-sm font-bold text-slate-700 max-w-[100px] truncate">
                                    {auth.user.name.split(' ')[0]}
                                </span>
                            </button>
                        )} */}
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    Drag-up Bottom Sheets (Mobile & Desktop)
                    ══════════════════════════════════════════ */}
                <>
                    <BottomSheet
                        isOpen={activePanel === "reports"}
                        onClose={() => setActivePanel("none")}
                        title="Daftar Laporan"
                        isDark={isDarkMode}
                    >
                        <ReportListContent
                            reports={reports}
                            formatDate={formatDate}
                            isDark={isDarkMode}
                            onClose={() => setActivePanel("none")}
                            currentUserId={auth.user?.id}
                            onAuthRequired={() => openAuthModal("login")}
                            onSelectReport={handleReportSelect}
                            userLocation={userLocation}
                            lang={lang}
                        />
                    </BottomSheet>

                    {activePanel === "profile" && auth.user && (
                        <BottomSheet
                            isOpen={true}
                            onClose={() => setActivePanel("none")}
                            title="My Account"
                            isDark={isDarkMode}
                        >
                            <ProfileContent
                                user={auth.user}
                                reports={reports.filter(
                                    (r) => r.user?.id === auth.user?.id,
                                )}
                                isDark={isDarkMode}
                                lang={lang}
                                onClose={() => setActivePanel("none")}
                            />
                        </BottomSheet>
                    )}

                    <BottomSheet
                        isOpen={activePanel === "report-detail"}
                        onClose={() => setActivePanel("none")}
                        title="Detail Laporan"
                        isDark={isDarkMode}
                    >
                        {isLoadingDetail ? (
                            <div className="py-12 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ds-primary"></div>
                            </div>
                        ) : selectedReportDetail ? (
                            <ReportDetailContent
                                report={selectedReportDetail.report}
                                comments={selectedReportDetail.comments}
                                isLiked={selectedReportDetail.isLiked}
                                userLocation={userLocation}
                                isDark={isDarkMode}
                                lang={lang}
                                formatDate={formatDate}
                                onClose={() => setActivePanel("none")}
                            />
                        ) : (
                            <div className="py-12 text-center text-slate-400 text-sm">
                                Laporan tidak ditemukan
                            </div>
                        )}
                    </BottomSheet>
                </>

                {/* ─── Bottom Navigation ─── */}
                <BottomBar
                    activeTab={
                        activePanel === "report-detail"
                            ? "reports"
                            : activePanel
                    }
                    onTabClick={handleTabClick}
                    onAuthClick={() => openAuthModal("login")}
                    onCreateClick={() => setIsReportModalOpen(true)}
                    user={auth.user}
                    lang={lang}
                    isDark={isDarkMode}
                />

                {/* ─── Global Auth Modal ─── */}
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setIsAuthModalOpen(false)}
                    initialTab={authModalTab}
                    lang={lang}
                    isDark={isDarkMode}
                />

                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => {
                        setIsReportModalOpen(false);
                        setInitialReportLocation(null);
                    }}
                    onSubmit={(data) => {
                        console.log("Report submitted:", data);
                        toast.success(
                            lang === "id"
                                ? "Terima kasih! Laporan Anda telah dikirim untuk ditinjau."
                                : "Thank you! Your report has been submitted for review.",
                        );
                        setInitialReportLocation(null);
                    }}
                    isDark={isDarkMode}
                    initialLocation={initialReportLocation}
                    lang={lang}
                />

                <ChatbotWidget
                    isDark={isDarkMode}
                    userId={auth.user?.id}
                    onFocusReport={handleFocusReportFromChatbot}
                />

                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    gutter={8}
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: isDarkMode ? "#1e293b" : "#fff",
                            color: isDarkMode ? "#f1f5f9" : "#1e293b",
                            borderRadius: "1.5rem",
                            padding: "12px 20px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                        },
                        success: {
                            iconTheme: {
                                primary: "#a7e94a",
                                secondary: "#fff",
                            },
                        },
                    }}
                />
            </div>
        </>
    );
}
