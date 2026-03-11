import React, { useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import {
    FilePlusSolid,
    ChevronUp,
    ListCheck,
    ListCheckSolid,
} from "@mynaui/icons-react";
import { landingDict } from "@/Lang/Landing"; // Import kamus bahasa

interface User {
    id: number;
    name: string;
    avatar?: string | null;
}

interface BottomBarProps {
    activeTab: "reports" | "profile" | "none";
    onTabClick: (tab: "reports" | "profile") => void;
    onAuthClick: () => void;
    onCreateClick?: () => void;
    isDark?: boolean;
    user?: User | null;
    lang?: "id" | "en"; // Tambahkan prop lang
}

const BottomBar: React.FC<BottomBarProps> = ({
    activeTab,
    onTabClick,
    onAuthClick,
    onCreateClick,
    user,
    lang = "id", // Default ke id
}) => {
    // Inisialisasi kamus
    const t = landingDict[lang];

    const [dockVisible, setDockVisible] = useState(false);
    const isLoggedIn = !!user;

    const avatarSrc = useMemo(
        () =>
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=a7e94a&color=fff&size=128`,
        [user?.avatar, user?.name],
    );

    /** Left nav item — Reports (Mobile) */
    const ReportsItem = () => (
        <button
            onClick={() => onTabClick("reports")}
            className={`flex flex-col items-center gap-1.5 outline-none transition-all min-w-[72px] ${activeTab === "reports" ? "text-[#a7e94a]" : "text-slate-400 hover:text-slate-600"}`}
        >
            {activeTab === "reports" ? (
                <ListCheckSolid className="w-7 h-7" />
            ) : (
                <ListCheck className="w-7 h-7" />
            )}
            <span className="text-[11px] font-bold tracking-tight">
                {t.reportList} {/* Menggunakan kamus */}
            </span>
        </button>
    );

    /** Right nav item — Profile/Login (Mobile) */
    const AuthItem = () => {
        if (isLoggedIn) {
            return (
                <button
                    onClick={() => onTabClick("profile")}
                    className={`flex flex-col items-center gap-1.5 outline-none transition-all min-w-[72px] ${activeTab === "profile" ? "opacity-100" : "opacity-60 hover:opacity-90"}`}
                >
                    <div
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${activeTab === "profile" ? "border-[#a7e94a] scale-110" : "border-transparent"}`}
                    >
                        <img
                            src={avatarSrc}
                            alt={user?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span
                        className={`text-[11px] font-bold tracking-tight max-w-[72px] truncate ${activeTab === "profile" ? "text-[#a7e94a]" : "text-slate-400"}`}
                    >
                        {user?.name?.split(" ")[0] || t.profile}{" "}
                        {/* Menggunakan kamus */}
                    </span>
                </button>
            );
        }

        return (
            <button
                onClick={onAuthClick}
                className="flex flex-col items-center gap-1.5 outline-none transition-all min-w-[72px] text-slate-400 hover:text-slate-600"
            >
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            fillRule="evenodd"
                            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <span className="text-[11px] font-bold tracking-tight">
                    {t.login} {/* Menggunakan kamus */}
                </span>
            </button>
        );
    };

    /** Desktop-sized versions (slightly larger icons) */
    const ReportsItemDesktop = () => (
        <button
            onClick={() => onTabClick("reports")}
            className={`flex flex-col items-center gap-1.5 outline-none transition-all min-w-[64px] ${activeTab === "reports" ? "text-[#a7e94a]" : "text-slate-400 hover:text-slate-600"}`}
        >
            {activeTab === "reports" ? (
                <ListCheckSolid className="w-6 h-6" />
            ) : (
                <ListCheck className="w-6 h-6" />
            )}
            <span className="text-[11px] font-bold tracking-tight">
                {t.reportList} {/* Menggunakan kamus */}
            </span>
        </button>
    );

    const AuthItemDesktop = () => {
        if (isLoggedIn) {
            return (
                <button
                    onClick={() => onTabClick("profile")}
                    className={`flex flex-col items-center gap-1.5 outline-none transition-all min-w-[64px] ${activeTab === "profile" ? "opacity-100" : "opacity-60 hover:opacity-90"}`}
                >
                    <div
                        className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all ${activeTab === "profile" ? "border-[#a7e94a] scale-110" : "border-transparent"}`}
                    >
                        <img
                            src={avatarSrc}
                            alt={user?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span
                        className={`text-[11px] font-bold tracking-tight max-w-[64px] truncate ${activeTab === "profile" ? "text-[#a7e94a]" : "text-slate-400"}`}
                    >
                        {user?.name?.split(" ")[0] || t.profile}{" "}
                        {/* Menggunakan kamus */}
                    </span>
                </button>
            );
        }
        return (
            <button
                onClick={onAuthClick}
                className="flex flex-col items-center gap-1.5 outline-none transition-all min-w-[64px] text-slate-400 hover:text-[#a7e94a]"
            >
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center transition-colors group-hover:border-[#a7e94a]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3.5 h-3.5"
                    >
                        <path
                            fillRule="evenodd"
                            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <span className="text-[11px] font-bold tracking-tight">
                    {t.login} {/* Menggunakan kamus */}
                </span>
            </button>
        );
    };

    const Fab = ({ size = "lg" }: { size?: "lg" | "sm" }) => {
        const dim = size === "lg" ? "w-[72px] h-[72px]" : "w-[64px] h-[64px]";
        const icon = size === "lg" ? "w-9 h-9" : "w-8 h-8";
        return (
            <Link
                href={isLoggedIn ? route("report.create") : "#"}
                className={`${dim} bg-[#a7e94a] rounded-[22px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#a7e94a]/30`}
                onClick={(e) => {
                    if (!isLoggedIn) {
                        e.preventDefault();
                        onAuthClick();
                    } else if (onCreateClick) {
                        e.preventDefault();
                        onCreateClick();
                    }
                }}
            >
                <FilePlusSolid className={`${icon} text-white`} />
            </Link>
        );
    };

    return (
        <>
            {/* ─────────────────────── MOBILE ─────────────────────── */}
            <div className="fixed bottom-0 inset-x-0 z-[100] xl:hidden">
                <div className="relative">
                    <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-10">
                        <Fab size="lg" />
                    </div>
                    <div className="bg-white border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.07)] flex items-center justify-between px-10 pt-5 pb-7">
                        <ReportsItem />
                        <div className="w-[72px]" />
                        <AuthItem />
                    </div>
                </div>
            </div>

            {/* ────────────────────── DESKTOP ─────────────────────── */}
            <div
                className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] hidden xl:flex flex-col items-center"
                style={{ paddingTop: "80px" }}
                onMouseEnter={() => setDockVisible(true)}
                onMouseLeave={() => setDockVisible(false)}
            >
                <div
                    className={`transition-all duration-300 ease-out ${dockVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
                >
                    <div className="relative mb-2">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-9 z-10">
                            <Fab size="sm" />
                        </div>
                        <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.10)] flex items-center justify-between px-12 pt-5 pb-5">
                            <ReportsItemDesktop />
                            <div className="w-[64px]" />
                            <AuthItemDesktop />
                        </div>
                    </div>
                </div>
                <div
                    className={`flex items-center justify-center w-24 h-7 bg-[#a7e94a] backdrop-blur-sm rounded-t-2xl shadow-lg transition-all duration-300 cursor-pointer ${dockVisible ? "opacity-50" : "opacity-100 hover:opacity-80"}`}
                >
                    <ChevronUp
                        className={`w-6 h-6 text-white transition-transform duration-300 ${dockVisible ? "rotate-180" : "rotate-0"}`}
                    />
                </div>
            </div>
        </>
    );
};

export default BottomBar;
