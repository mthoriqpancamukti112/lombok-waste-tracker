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
import ForgotPasswordModal from "@/Components/ForgotPasswordModal";
import ReportModal from "@/Components/ReportModal";
import ReportDetailContent from "@/Components/ReportDetailContent";
import ChatbotWidget from "@/Components/ChatbotWidget";
import { Toaster, toast } from "react-hot-toast";
import { driver } from "driver.js";
import { renderToString } from "react-dom/server";
import "driver.js/dist/driver.css";
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
    CheckCircleSolid,
    Like,
    MessageDots,
    MapSolid,
    Search,
    FilePlusSolid,
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
    comments?: { id: number; report_id: number; user_id: number }[];
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
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
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

    // Auto-open Report Modal jika ada query ?action=lapor di URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get("action");

        if (action === "lapor") {
            if (!auth.user) {
                sessionStorage.setItem("pendingAction", "lapor");
                openAuthModal("login");
            } else {
                setIsReportModalOpen(true);
            }
        }

        if (auth.user) {
            const pendingAction = sessionStorage.getItem("pendingAction");
            if (pendingAction === "lapor") {
                setIsReportModalOpen(true);
                sessionStorage.removeItem("pendingAction");
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
        }, 600);
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
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedSearchQuery)}&format=json&addressdetails=1&limit=5&countrycodes=id`,
                );
                const data = await response.json();

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
            setIsSearching(true);
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

    const handleFocusReportFromChatbot = (reportId: number) => {
        if (reports && reports.length > 0) {
            const targetReport = reports.find((r) => r.id === reportId);
            if (targetReport && mapRef.current) {
                mapRef.current.flyTo(
                    Number(targetReport.latitude),
                    Number(targetReport.longitude),
                );
                setTimeout(() => {
                    mapRef.current?.openPopup(targetReport);
                }, 500);
            }
        }
    };

    const mobileBtnBase =
        "shrink-0 w-10 h-10 shadow-[0_4px_14px_rgba(0,0,0,0.07)] border border-slate-100 rounded-xl flex items-center justify-center transition-all active:scale-90";

    const desktopBtn =
        "shrink-0 w-12 h-12 bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center transition-all hover:shadow-lg hover:scale-105 active:scale-95";

    const openAuthModal = (tab: "login" | "register" = "login") => {
        setAuthModalTab(tab);
        setIsAuthModalOpen(true);
    };

    const unreadNotifications =
        auth.user?.notifications?.filter((n: any) => !n.read_at) || [];

    const handleMarkAsRead = (id: string) => {
        router.post(
            `/notifications/${id}/read`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ["auth"],
            },
        );
    };

    const handleMarkAllAsRead = () => {
        router.post(
            "/notifications/read-all",
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ["auth"],
                onSuccess: () => {
                    setShowNotifications(false);
                    toast.success(
                        lang === "id"
                            ? "Semua notifikasi dibaca"
                            : "All notifications read",
                    );
                },
            },
        );
    };

    const renderNotificationIcon = (iconName?: string) => {
        switch (iconName) {
            case "like":
                return <Like className="w-4 h-4" />;
            case "comment":
                return <MessageDots className="w-4 h-4" />;
            case "status":
                return <CheckCircleSolid className="w-4 h-4" />;
            default:
                return <Bell className="w-4 h-4" />;
        }
    };

    const renderNotificationMessage = (notif: any) => {
        const key = notif.data.translation_key;
        if (key === "notif_liked") {
            return t.notifLiked.replace("{name}", notif.data.actor_name);
        } else if (key === "notif_commented") {
            return t.notifCommented
                .replace("{name}", notif.data.actor_name)
                .replace("{snippet}", notif.data.snippet || "");
        } else if (key === "notif_report_submitted") {
            return t.notifReportSubmitted;
        } else if (key === "notif_status_updated") {
            const status = notif.data.new_status;
            if (status === "divalidasi") return t.notifStatusValidated;
            if (status === "proses") return t.notifStatusProcess;
            if (status === "selesai") return t.notifStatusCompleted;
            if (status === "ditolak") return t.notifStatusRejected;
            return t.notifStatusGeneric.replace("{status}", status);
        }
        return notif.data.message;
    };

    // ────────────────────────────────────────────────────────────────────────
    // TOUR (DRIVER.JS) SETUP DENGAN IKON SVG CLEAN & TARGET YANG TEPAT
    // ────────────────────────────────────────────────────────────────────────
    const getTourTitle = (iconSvg: string, text: string) => {
        return `<div style="display:flex; align-items:center; gap:8px;">
                    <div style="color:#a7e94a; display:flex;">${iconSvg}</div>
                    <span style="font-weight:800; letter-spacing:-0.02em;">${text}</span>
                </div>`;
    };

    const tourIcons = {
        map: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>`,
        search: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>`,
        location: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m0 14v1m8-8h-1M5 12H4" /></svg>`,
        report: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>`,
    };

    // ────────────────────────────────────────────────────────────────────────
    // TOUR (DRIVER.JS) SETUP - VERSI PREMIUM UI (TANPA PANAH)
    // ────────────────────────────────────────────────────────────────────────
    const startReportingTour = () => {
        const getTourTitle = (
            iconElement: React.ReactElement,
            text: string,
        ) => {
            const iconString = renderToString(iconElement);
            return `<div style="display: flex; align-items: center; gap: 14px; margin-bottom: 6px;">
                        <div style="flex-shrink: 0 !important; width: 36px !important; height: 36px !important; min-width: 36px !important; min-height: 36px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 50% !important; background-color: rgba(167, 233, 74, 0.1) !important; color: #a7e94a !important; overflow: hidden !important;">
                            ${iconString}
                        </div>
                        <span style="font-weight: 700; font-size: 15px; letter-spacing: -0.02em; line-height: 1.25; margin: 0;">${text}</span>
                    </div>`;
        };

        // Inject CSS dengan gaya ala Tailwind
        const styleId = "driver-tour-theme";
        let styleEl = document.getElementById(
            styleId,
        ) as HTMLStyleElement | null;
        if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        // Tampilan UI Premium + Sembunyikan Panah
        if (isDarkMode) {
            styleEl.textContent = `
                @import url("https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap");

                .driver-tour-themed, .driver-tour-themed * {
                    font-family: "Google Sans", sans-serif !important;
                }

                .driver-tour-themed {
                    background-color: #1e293b !important;
                    color: #f8fafc !important;
                    border: 1px solid #334155 !important;
                    border-radius: 24px !important;
                    padding: 20px 24px !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
                }

                .driver-popover-description {
                    color: #94a3b8 !important;
                    font-size: 13px !important;
                    line-height: 1.6 !important;
                    margin-top: 8px !important;
                }

                .driver-popover-footer { margin-top: 24px !important; }
                .driver-popover-progress-text {
                    color: #64748b !important;
                    font-weight: 600 !important;
                    font-size: 12px !important;
                }

                .driver-popover-close-btn {
                    top: 16px !important;
                    right: 16px !important;
                    width: 28px !important;
                    height: 28px !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    color: #64748b !important;
                    background-color: transparent !important;
                    transition: all 0.2s ease-in-out !important;
                }
                .driver-popover-close-btn:hover {
                    color: #f8fafc !important;
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    transform: scale(1.05) !important;
                }

                .driver-popover-navigation-btns button {
                    border-radius: 12px !important;
                    padding: 8px 16px !important;
                    font-size: 12px !important;
                    font-weight: 700 !important;
                    transition: all 0.2s !important;
                    text-shadow: none !important;
                }
                .driver-popover-prev-btn { background-color: #334155 !important; color: #cbd5e1 !important; border: none !important; }
                .driver-popover-prev-btn:hover { background-color: #475569 !important; }
                .driver-popover-next-btn { background-color: #a7e94a !important; color: #0f172a !important; border: none !important; }
                .driver-popover-next-btn:hover { background-color: #95d43e !important; transform: translateY(-1px) !important; }

                /* SEMBUNYIKAN PANAH */
                .driver-popover-arrow { display: none !important; }
            `;
        } else {
            styleEl.textContent = `
                @import url("https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap");

                .driver-tour-themed, .driver-tour-themed * {
                    font-family: "Google Sans", sans-serif !important;
                }

                .driver-tour-themed {
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                    border: 1px solid #f1f5f9 !important;
                    border-radius: 24px !important;
                    padding: 20px 24px !important;
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1), 0 0 20px rgba(167, 233, 74, 0.1) !important;
                }

                .driver-popover-description {
                    color: #64748b !important;
                    font-size: 13px !important;
                    line-height: 1.6 !important;
                    margin-top: 8px !important;
                }

                .driver-popover-footer { margin-top: 24px !important; }
                .driver-popover-progress-text {
                    color: #94a3b8 !important;
                    font-weight: 600 !important;
                    font-size: 12px !important;
                }

                .driver-popover-close-btn {
                    top: 16px !important;
                    right: 16px !important;
                    width: 28px !important;
                    height: 28px !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    color: #94a3b8 !important;
                    background-color: transparent !important;
                    transition: all 0.2s ease-in-out !important;
                }
                .driver-popover-close-btn:hover {
                    color: #0f172a !important;
                    background-color: rgba(0, 0, 0, 0.05) !important;
                    transform: scale(1.05) !important;
                }

                .driver-popover-navigation-btns button {
                    border-radius: 12px !important;
                    padding: 8px 16px !important;
                    font-size: 12px !important;
                    font-weight: 700 !important;
                    transition: all 0.2s !important;
                    text-shadow: none !important;
                }
                .driver-popover-prev-btn { background-color: #f1f5f9 !important; color: #475569 !important; border: none !important; }
                .driver-popover-prev-btn:hover { background-color: #e2e8f0 !important; }
                .driver-popover-next-btn { background-color: #a7e94a !important; color: #0f172a !important; border: none !important; box-shadow: 0 4px 10px rgba(167, 233, 74, 0.3) !important;}
                .driver-popover-next-btn:hover { background-color: #95d43e !important; transform: translateY(-1px) !important; }

                /* SEMBUNYIKAN PANAH */
                .driver-popover-arrow { display: none !important; }
            `;
        }

        const driverObj = driver({
            showProgress: true,
            popoverClass: "driver-tour-themed",
            nextBtnText: lang === "id" ? "Lanjut" : "Next",
            prevBtnText: lang === "id" ? "Kembali" : "Back",
            doneBtnText: lang === "id" ? "Mengerti" : "Got it",
            steps: [
                // LANGKAH 1
                {
                    popover: {
                        title: getTourTitle(
                            <MapSolid className="w-5 h-5" />,
                            lang === "id"
                                ? "Selamat Datang di TRACEA"
                                : "Welcome to TRACEA",
                        ),
                        description:
                            lang === "id"
                                ? "Ini adalah peta pemantauan interaktif. Anda dapat melihat lokasi tumpukan sampah yang dilaporkan secara <i>real-time</i> di sini."
                                : "This is an interactive monitoring map. You can view reported waste piles in real-time here.",
                    },
                },
                // LANGKAH 2
                {
                    element: isDesktop
                        ? "#search-wrapper-desktop"
                        : "#search-wrapper-mobile",
                    popover: {
                        title: getTourTitle(
                            <Search className="w-5 h-5" />,
                            lang === "id"
                                ? "Pencarian Lokasi"
                                : "Search Location",
                        ),
                        description:
                            lang === "id"
                                ? "Ketikkan nama jalan atau daerah spesifik untuk mengecek kondisi kebersihan dan laporan di area tersebut."
                                : "Type a specific street or area name to check the cleanliness reports in that location.",
                        side: "bottom",
                        align: "start",
                    },
                },
                // LANGKAH 3
                {
                    element: isDesktop
                        ? "#btn-geolocate-desktop"
                        : "#btn-geolocate",
                    popover: {
                        title: getTourTitle(
                            <CrosshairSolid className="w-5 h-5" />,
                            lang === "id" ? "Pusatkan Peta" : "Center Map",
                        ),
                        description:
                            lang === "id"
                                ? "Gunakan tombol ini untuk menarik peta agar fokus pada posisi Anda saat ini."
                                : "Use this button to pull the map focus to your current position.",
                        side: "bottom",
                        align: "end",
                    },
                },
                // LANGKAH 4
                {
                    element: isDesktop
                        ? "#btn-lapor-desktop"
                        : "#btn-lapor-mobile",
                    popover: {
                        // Tidak ada lagi custom class step-lapor-center di sini
                        title: getTourTitle(
                            <FilePlusSolid className="w-5 h-5" />,
                            lang === "id" ? "Buat Laporan" : "Create Report",
                        ),
                        description:
                            lang === "id"
                                ? "Menemukan tumpukan sampah? Klik tombol ini untuk melaporkannya ke petugas. Pastikan Anda sudah login ya!"
                                : "Found a pile of waste? Click this button to report it to the officers. Ensure you are logged in!",
                        side: "top",
                        align: "center",
                    },
                    onHighlightStarted: () => {
                        window.dispatchEvent(
                            new CustomEvent("force-dock", {
                                detail: { visible: true },
                            }),
                        );
                        setTimeout(() => {
                            // @ts-ignore
                            if (window.driverObj) window.driverObj.refresh();
                        }, 400);
                    },
                    onDeselected: () => {
                        if (isDesktop) {
                            window.dispatchEvent(
                                new CustomEvent("force-dock", {
                                    detail: { visible: false },
                                }),
                            );
                        }
                    },
                },
            ],
        });

        // @ts-ignore
        window.driverObj = driverObj;
        driverObj.drive();
    };

    return (
        <>
            <Head title={t.title} />

            <div
                className={`fixed inset-0 w-full overflow-hidden ${isDarkMode ? "bg-slate-900" : "bg-slate-50"} h-[100dvh]`}
            >
                {/* ─── Map fills full viewport ─── */}
                <div id="map-container" className="absolute inset-0 z-0">
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
                            id="search-wrapper-mobile"
                            className={`bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center px-4 py-1`}
                        >
                            <input
                                id="search-input-mobile"
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

                        {/* Notifications (Mobile) */}
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
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() =>
                                                setShowNotifications(false)
                                            }
                                        ></div>

                                        <div className="fixed top-[120px] right-4 w-[calc(100vw-32px)] max-w-[340px] bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 flex flex-col animate-in slide-in-from-top-2 duration-200">
                                            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                                                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                                    {t.notifTitle}
                                                </h3>
                                                {unreadNotifications.length >
                                                    0 && (
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#a7e94a] bg-[#a7e94a]/10 dark:bg-[#a7e94a]/20 px-2 py-0.5 rounded-full">
                                                        {
                                                            unreadNotifications.length
                                                        }{" "}
                                                        {t.notifNew}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col">
                                                {!auth.user?.notifications ||
                                                auth.user?.notifications
                                                    .length === 0 ? (
                                                    <div className="p-8 text-center flex flex-col items-center justify-center">
                                                        <CheckCircleSolid
                                                            className={`w-10 h-10 mb-3 transition-opacity ${isDarkMode ? "text-slate-600 opacity-50" : "text-slate-300 opacity-70"}`}
                                                        />
                                                        <p
                                                            className={`text-sm font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                                                        >
                                                            {t.notifEmptyTitle}
                                                        </p>
                                                        <p
                                                            className={`text-[11px] ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                                                        >
                                                            {t.notifEmptyDesc}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                                        {auth.user?.notifications?.map(
                                                            (notif: any) => (
                                                                <button
                                                                    key={
                                                                        notif.id
                                                                    }
                                                                    onClick={() => {
                                                                        if (
                                                                            !notif.read_at
                                                                        )
                                                                            handleMarkAsRead(
                                                                                notif.id,
                                                                            );
                                                                        if (
                                                                            notif
                                                                                .data
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
                                                                    className={`w-full text-left p-3 transition-all flex gap-3.5 ${!notif.read_at ? "bg-slate-50 dark:bg-slate-700/50" : "hover:bg-slate-50 dark:hover:bg-slate-700/30"}`}
                                                                >
                                                                    <div
                                                                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 shadow-sm ${!notif.read_at ? "bg-[#a7e94a]/20 text-[#5a8a1a] dark:text-[#a7e94a]" : "bg-slate-100 dark:bg-slate-700 text-slate-400"}`}
                                                                    >
                                                                        {renderNotificationIcon(
                                                                            notif
                                                                                .data
                                                                                .icon,
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p
                                                                            className={`text-xs leading-snug ${!notif.read_at ? "font-semibold text-slate-800 dark:text-slate-200" : "font-normal text-slate-600 dark:text-slate-400"}`}
                                                                        >
                                                                            {renderNotificationMessage(
                                                                                notif,
                                                                            )}
                                                                        </p>

                                                                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                                                            {new Date(
                                                                                notif.created_at,
                                                                            ).toLocaleString(
                                                                                lang ===
                                                                                    "id"
                                                                                    ? "id-ID"
                                                                                    : "en-US",
                                                                                {
                                                                                    day: "numeric",
                                                                                    month: "long",
                                                                                    year: "numeric",
                                                                                    hour: "2-digit",
                                                                                    minute: "2-digit",
                                                                                },
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {unreadNotifications.length > 0 && (
                                                <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                    <button
                                                        onClick={
                                                            handleMarkAllAsRead
                                                        }
                                                        className="w-full py-2.5 text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:text-[#a7e94a] dark:hover:text-[#a7e94a] hover:bg-[#a7e94a]/10 dark:hover:bg-slate-800"
                                                    >
                                                        <CheckCircleSolid className="w-4 h-4" />
                                                        {t.notifMarkAllRead}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
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
                            id="btn-geolocate"
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
                        <div
                            id="search-wrapper-desktop"
                            className="bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center px-6 py-1.5 focus-within:ring-4 focus-within:ring-[#a7e94a]/15 transition-all"
                        >
                            <input
                                id="search-input-desktop"
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

                        {/* Notifications (Desktop) */}
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
                                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() =>
                                                setShowNotifications(false)
                                            }
                                        ></div>

                                        <div className="absolute top-16 right-0 w-80 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 flex flex-col animate-in slide-in-from-top-4 duration-200 origin-top-right">
                                            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                                                <h3 className="font-bold text-slate-800 dark:text-slate-200">
                                                    {t.notifTitle}
                                                </h3>
                                                {unreadNotifications.length >
                                                    0 && (
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#a7e94a] bg-[#a7e94a]/10 dark:bg-[#a7e94a]/20 px-2 py-0.5 rounded-full">
                                                        {
                                                            unreadNotifications.length
                                                        }{" "}
                                                        {t.notifNew}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="max-h-96 overflow-y-auto custom-scrollbar flex flex-col">
                                                {!auth.user?.notifications ||
                                                auth.user?.notifications
                                                    .length === 0 ? (
                                                    <div className="p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                                                        <div
                                                            className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? "bg-slate-700/50" : "bg-slate-100"}`}
                                                        >
                                                            <CheckCircleSolid
                                                                className={`w-7 h-7 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                                                            />
                                                        </div>
                                                        <p
                                                            className={`text-sm font-bold mb-1 ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                                                        >
                                                            {t.notifEmptyTitle}
                                                        </p>
                                                        <p
                                                            className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                                                        >
                                                            {t.notifEmptyDesc}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                                        {auth.user?.notifications?.map(
                                                            (notif: any) => (
                                                                <button
                                                                    key={
                                                                        notif.id
                                                                    }
                                                                    onClick={() => {
                                                                        if (
                                                                            !notif.read_at
                                                                        )
                                                                            handleMarkAsRead(
                                                                                notif.id,
                                                                            );
                                                                        if (
                                                                            notif
                                                                                .data
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
                                                                    className={`w-full text-left p-3 transition-all flex gap-3.5 ${!notif.read_at ? "bg-slate-50 dark:bg-slate-700/50" : "hover:bg-slate-50 dark:hover:bg-slate-700/30"}`}
                                                                >
                                                                    <div
                                                                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 shadow-sm ${!notif.read_at ? "bg-[#a7e94a]/20 text-[#5a8a1a] dark:text-[#a7e94a]" : "bg-slate-100 dark:bg-slate-700 text-slate-400"}`}
                                                                    >
                                                                        {renderNotificationIcon(
                                                                            notif
                                                                                .data
                                                                                .icon,
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p
                                                                            className={`text-[13px] leading-snug ${!notif.read_at ? "font-semibold text-slate-800 dark:text-slate-200" : "font-normal text-slate-600 dark:text-slate-400"}`}
                                                                        >
                                                                            {renderNotificationMessage(
                                                                                notif,
                                                                            )}
                                                                        </p>

                                                                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                                                            {new Date(
                                                                                notif.created_at,
                                                                            ).toLocaleString(
                                                                                lang ===
                                                                                    "id"
                                                                                    ? "id-ID"
                                                                                    : "en-US",
                                                                                {
                                                                                    day: "numeric",
                                                                                    month: "long",
                                                                                    year: "numeric",
                                                                                    hour: "2-digit",
                                                                                    minute: "2-digit",
                                                                                },
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {unreadNotifications.length > 0 && (
                                                <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                    <button
                                                        onClick={
                                                            handleMarkAllAsRead
                                                        }
                                                        className="w-full py-2.5 text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:text-[#a7e94a] dark:hover:text-[#a7e94a] hover:bg-[#a7e94a]/10 dark:hover:bg-slate-800"
                                                    >
                                                        <CheckCircleSolid className="w-4 h-4" />
                                                        {t.notifMarkAllRead}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
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
                        <div className="shrink-0 flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
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
                            id="btn-geolocate-desktop"
                            onClick={handleGeolocate}
                            className={`${desktopBtn} text-slate-500`}
                        >
                            <CrosshairSolid className="w-5 h-5" />
                        </button>
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
                                discussionReports={reports.filter(
                                    (r) =>
                                        r.comments?.some(
                                            (c) => c.user_id === auth.user?.id,
                                        ) && r.user?.id !== auth.user?.id,
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
                                onCommentAdded={() =>
                                    router.reload({ only: ["reports"] })
                                }
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
                    onOpenForgot={() => {
                        setIsAuthModalOpen(false); // Tutup login
                        setIsForgotModalOpen(true); // Buka Lupa Password
                    }}
                />

                {/* ─── Forgot Password Modal OTP ─── */}
                <ForgotPasswordModal
                    isOpen={isForgotModalOpen}
                    onClose={() => setIsForgotModalOpen(false)}
                    onBackToLogin={() => {
                        setIsForgotModalOpen(false);
                        openAuthModal("login"); // Kembali ke form login
                    }}
                    isDark={isDarkMode}
                    lang={lang}
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
                    onStartTour={startReportingTour}
                    lang={lang}
                    onOpenReportModal={() => {
                        if (!auth.user) {
                            openAuthModal("login");
                        } else {
                            setIsReportModalOpen(true);
                        }
                    }}
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
