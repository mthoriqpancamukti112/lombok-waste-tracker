import { Head, Link } from "@inertiajs/react";
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
import { Toaster, toast } from "react-hot-toast";
import {
    Bell,
    BellSolid,
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
    auth: { user: User | null };
    reports: Report[];
    dangerZones: DangerZone[];
    wasteDensityZones: WasteDensityZone[];
}>) {
    const [activePanel, setActivePanel] = useState<'reports' | 'profile' | 'report-detail' | 'none'>('none');
    const [selectedReportDetail, setSelectedReportDetail] = useState<{ report: Report; comments: any[]; isLiked: boolean } | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [lang, setLang] = useState<"id" | "en">("id");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [mapSettings, setMapSettings] = useState({
        showHeatmap: true,
        showMarkers: true,
        showDangerZones: true,
        showDensityZones: false,
    });
    const [showMobileMapSettings, setShowMobileMapSettings] = useState(false);

    const mapRef = useRef<{ centerOnUser: () => void } | null>(null);
    const t = landingDict[lang];

    useEffect(() => {
        const checkSize = () => setIsDesktop(window.innerWidth >= 1280);
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    // Auto-close profile panel on logout
    useEffect(() => {
        if (!auth.user && activePanel === 'profile') {
            setActivePanel('none');
        }
    }, [auth.user, activePanel]);

    // Fetch unread notification count if logged in
    useEffect(() => {
        if (!auth.user) return;
        const fetchCount = () => {
            fetch('/notifications/unread-count', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
                .then(r => r.json())
                .then(d => setUnreadCount(d.count ?? 0))
                .catch(() => { });
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
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

    const handleTabClick = (tab: 'reports' | 'profile') => {
        // If user clicks profile and is not logged in, that's handled in BottomBar (link to login)
        setActivePanel(prev => prev === tab ? 'none' : tab);
    };

    const toggleLang = () => setLang(prev => prev === "id" ? "en" : "id");
    const toggleDark = () => setIsDarkMode(prev => !prev);
    const handleGeolocate = () => {
        if (mapRef.current) mapRef.current.centerOnUser();
    };

    const toggleSetting = (setting: keyof typeof mapSettings) => {
        setMapSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
    };

    const handleReportSelect = async (reportId: number) => {
        setIsLoadingDetail(true);
        setActivePanel('report-detail');
        try {
            const response = await fetch(`/api/report/${reportId}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const data = await response.json();
            setSelectedReportDetail(data);
        } catch (error) {
            console.error("Failed to fetch report details:", error);
            toast.error("Gagal memuat detail laporan");
            setActivePanel('none');
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const markNotifRead = () => {
        if (!auth.user || unreadCount === 0) return;
        fetch('/notifications/read-all', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                'X-Requested-With': 'XMLHttpRequest',
            },
        }).then(() => setUnreadCount(0));
    };

    const mobileBtnBase = "w-10 h-10 shadow-[0_4px_14px_rgba(0,0,0,0.07)] border border-slate-100 rounded-xl flex items-center justify-center transition-all active:scale-90";
    const desktopBtn = "w-12 h-12 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-slate-100 rounded-2xl flex items-center justify-center transition-all hover:shadow-lg hover:scale-105 active:scale-95";

    const openAuthModal = (tab: "login" | "register" = "login") => {
        setAuthModalTab(tab);
        setIsAuthModalOpen(true);
    };

    return (
        <>
            <Head title={t.title} />

            <div className={`relative h-screen w-full overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
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
                    />
                </div>

                {/* ══════════════════════════════════════════
                    MOBILE TOP BAR
                    ══════════════════════════════════════════ */}
                <div className="xl:hidden absolute top-0 inset-x-0 z-50 px-4 pt-5 flex flex-col gap-2.5">
                    <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 rounded-2xl flex items-center px-4 py-3">
                        <input
                            type="text"
                            placeholder="Search Location"
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder-slate-400 text-sm font-medium"
                        />
                        <button className="ml-2 w-9 h-9 bg-[#a7e94a] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-[#a7e94a]/30">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex justify-end gap-2">
                        {/* Notifications — only show if logged in */}
                        {auth.user && (
                            <button
                                onClick={markNotifRead}
                                className={`${mobileBtnBase} bg-white relative text-slate-500`}
                            >
                                {unreadCount > 0 ? <BellSolid className="w-[18px] h-[18px]" /> : <Bell className="w-[18px] h-[18px]" />}
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                                )}
                            </button>
                        )}

                        {/* Language */}
                        <button onClick={toggleLang} className={`${mobileBtnBase} bg-white gap-0.5 px-1`}>
                            <Globe className="w-[15px] h-[15px] text-slate-500" />
                            <span className="text-[11px] font-black text-slate-600 tracking-tighter">{lang.toUpperCase()}</span>
                        </button>

                        {/* Dark mode */}
                        <button onClick={toggleDark} className={`${mobileBtnBase} bg-white text-slate-500`}>
                            {isDarkMode ? <MoonSolid className="w-[18px] h-[18px]" /> : <SunSolid className="w-[18px] h-[18px]" />}
                        </button>

                        {/* Geolocate */}
                        <button onClick={handleGeolocate} className={`${mobileBtnBase} bg-white text-slate-500`}>
                            <CrosshairSolid className="w-[18px] h-[18px]" />
                        </button>

                        {/* Map Layers Toggle */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMobileMapSettings(!showMobileMapSettings)}
                                className={`${mobileBtnBase} ${showMobileMapSettings ? 'bg-[#a7e94a] text-white border-[#a7e94a]' : 'text-slate-500 bg-white'}`}
                            >
                                <LayersThree className="w-[18px] h-[18px]" />
                            </button>

                            {/* Dropdown - Expands Downward */}
                            {showMobileMapSettings && (
                                <div className="absolute top-12 right-0 z-50 flex flex-col gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => toggleSetting('showMarkers')}
                                        className={`${mobileBtnBase} ${mapSettings.showMarkers ? 'bg-[#a7e94a] text-white' : 'bg-transparent text-slate-500 hover:bg-white/50'}`}
                                    >
                                        <MapPin className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => toggleSetting('showHeatmap')}
                                        className={`${mobileBtnBase} ${mapSettings.showHeatmap ? 'bg-[#a7e94a] text-white' : 'bg-transparent text-slate-500 hover:bg-white/50'}`}
                                    >
                                        <Flame className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => toggleSetting('showDangerZones')}
                                        className={`${mobileBtnBase} ${mapSettings.showDangerZones ? 'bg-[#a7e94a] text-white' : 'bg-transparent text-slate-500 hover:bg-white/50'}`}
                                    >
                                        <DangerTriangle className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => toggleSetting('showDensityZones')}
                                        className={`${mobileBtnBase} ${mapSettings.showDensityZones ? 'bg-[#a7e94a] text-white' : 'bg-transparent text-slate-500 hover:bg-white/50'}`}
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
                    <div className="flex-[7] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-slate-100 rounded-2xl flex items-center px-6 py-1.5 focus-within:ring-4 focus-within:ring-[#a7e94a]/15 transition-all">
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder ?? "Search location..."}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 font-medium"
                        />
                        <button className="ml-2 w-10 h-10 bg-[#a7e94a] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#a7e94a]/20 hover:scale-105 active:scale-95 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-[3] flex items-center justify-end gap-2.5">
                        {/* Notifications */}
                        {auth.user && (
                            <button
                                onClick={markNotifRead}
                                className={`${desktopBtn} relative text-slate-500`}
                            >
                                {unreadCount > 0 ? <BellSolid className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                                )}
                            </button>
                        )}

                        {/* Language toggle */}
                        <button onClick={toggleLang} className={`${desktopBtn} gap-1.5 px-4 w-auto`}>
                            <GlobeSolid className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-bold text-slate-600">{lang.toUpperCase()}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {/* Dark / Light mode */}
                        <button onClick={toggleDark} className={`${desktopBtn} text-slate-500`}>
                            {isDarkMode ? <MoonSolid className="w-5 h-5" /> : <SunSolid className="w-5 h-5" />}
                        </button>

                        <div className="h-8 w-px bg-slate-200 mx-1" />

                        {/* Map Settings Controls */}
                        <div className="flex items-center gap-1.5 bg-slate-50/50 p-1 rounded-2xl border border-slate-100 shadow-inner">
                            <button
                                onClick={() => toggleSetting('showMarkers')}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mapSettings.showMarkers ? 'bg-[#a7e94a] text-white shadow-md shadow-[#a7e94a]/20' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
                                title="Tampilkan Marker"
                            >
                                <MapPin className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => toggleSetting('showHeatmap')}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mapSettings.showHeatmap ? 'bg-[#a7e94a] text-white shadow-md shadow-[#a7e94a]/20' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
                                title="Tampilkan Heatmap"
                            >
                                <Flame className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => toggleSetting('showDangerZones')}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mapSettings.showDangerZones ? 'bg-[#a7e94a] text-white shadow-md shadow-[#a7e94a]/20' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
                                title="Tampilkan Zona Bahaya"
                            >
                                <DangerTriangle className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => toggleSetting('showDensityZones')}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mapSettings.showDensityZones ? 'bg-[#a7e94a] text-white shadow-md shadow-[#a7e94a]/20' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
                                title="Tampilkan Kepadatan Sampah"
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Geolocate */}
                        <button onClick={handleGeolocate} className={`${desktopBtn} text-slate-500`}>
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
                    DESKTOP: Bottom-anchored slide-up panel
                    ══════════════════════════════════════════ */}
                <div className={`fixed inset-x-0 bottom-0 z-[60] flex items-end justify-center transition-all duration-700 ease-out pointer-events-none ${isDesktop && activePanel !== 'none' ? 'h-full' : 'h-0'}`}>
                    <div
                        className={`absolute inset-0 bg-transparent transition-all duration-500 ${isDesktop && activePanel !== 'none' ? 'pointer-events-auto' : 'pointer-events-none'}`}
                        onClick={() => setActivePanel('none')}
                    />
                    <div className={`w-full h-[85vh] bg-white rounded-t-[40px] shadow-[0_-20px_80px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden relative transition-all duration-700 ease-out transform pointer-events-auto ${isDesktop && activePanel !== 'none' ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                        <div className="flex-1 flex overflow-hidden">
                            {activePanel === 'reports' ? (
                                <ReportListContent
                                    reports={reports}
                                    formatDate={formatDate}
                                    isDark={isDarkMode}
                                    onClose={() => setActivePanel('none')}
                                    currentUserId={auth.user?.id}
                                    onAuthRequired={() => openAuthModal("login")}
                                    onSelectReport={handleReportSelect}
                                />
                            ) : activePanel === 'profile' && auth.user ? (
                                <ProfileContent
                                    user={auth.user}
                                    reports={reports.filter(r => r.user?.id === auth.user?.id)}
                                    isDark={isDarkMode}
                                    onClose={() => setActivePanel('none')}
                                />
                            ) : activePanel === 'report-detail' ? (
                                isLoadingDetail ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ds-primary"></div>
                                    </div>
                                ) : selectedReportDetail ? (
                                    <ReportDetailContent
                                        report={selectedReportDetail.report}
                                        comments={selectedReportDetail.comments}
                                        isLiked={selectedReportDetail.isLiked}
                                        isDark={isDarkMode}
                                        formatDate={formatDate}
                                        onClose={() => setActivePanel('none')}
                                    />
                                ) : null
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    MOBILE: Drag-up Bottom Sheets
                    ══════════════════════════════════════════ */}
                {!isDesktop && (
                    <>
                        <BottomSheet
                            isOpen={activePanel === 'reports'}
                            onClose={() => setActivePanel('none')}
                            title="Report List"
                        >
                            <ReportListContent
                                reports={reports}
                                formatDate={formatDate}
                                isDark={isDarkMode}
                                onClose={() => setActivePanel("none")}
                                currentUserId={auth.user?.id}
                                onAuthRequired={() => openAuthModal("login")}
                                onSelectReport={handleReportSelect}
                            />
                        </BottomSheet>

                        {activePanel === "profile" && auth.user && (
                            <BottomSheet
                                isOpen={true}
                                onClose={() => setActivePanel("none")}
                                title="My Account"
                            >

                                <ProfileContent
                                    user={auth.user}
                                    reports={reports.filter(r => r.user?.id === auth.user?.id)}
                                    isDark={isDarkMode}
                                    onClose={() => setActivePanel("none")}
                                />
                            </BottomSheet>
                        )}

                        <BottomSheet
                            isOpen={activePanel === 'report-detail'}
                            onClose={() => setActivePanel('none')}
                            title="Detail Laporan"
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
                                    isDark={isDarkMode}
                                    formatDate={formatDate}
                                    onClose={() => setActivePanel('none')}
                                />
                            ) : (
                                <div className="py-12 text-center text-slate-400 text-sm">
                                    Laporan tidak ditemukan
                                </div>
                            )}
                        </BottomSheet>
                    </>
                )}

                {/* ─── Bottom Navigation ─── */}
                <BottomBar
                    activeTab={activePanel}
                    onTabClick={handleTabClick}
                    onAuthClick={() => openAuthModal("login")}
                    onCreateClick={() => setIsReportModalOpen(true)}
                    user={auth.user}
                />

                {/* ─── Global Auth Modal ─── */}
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setIsAuthModalOpen(false)}
                    initialTab={authModalTab}
                />

                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    onSubmit={(data) => {
                        console.log("Report submitted:", data);
                        toast.success("Thank you! Your report has been submitted for review.");
                    }}
                    isDark={isDarkMode}
                />



                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    gutter={8}
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: isDarkMode ? '#1e293b' : '#fff',
                            color: isDarkMode ? '#f1f5f9' : '#1e293b',
                            borderRadius: '1.5rem',
                            padding: '12px 20px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        },
                        success: {
                            iconTheme: {
                                primary: '#a7e94a',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </div>
        </>
    );
}
