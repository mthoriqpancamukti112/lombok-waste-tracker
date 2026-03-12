import { useState, useEffect, PropsWithChildren, ReactNode } from "react";
import { Link, router } from "@inertiajs/react";
import {
    Home,
    MessageX,
    User,
    Logout,
    Menu,
    X,
    Trash,
    Bell,
    CheckCircleSolid,
    Globe,
    ShieldCheck,
    ChevronDown,
    Moon,
    SunSolid,
} from "@mynaui/icons-react";
import BottomBar from "@/Components/BottomBar";

interface WargaLayoutProps {
    auth: any;
    header?: ReactNode;
}

export default function WargaLayout({
    auth,
    header,
    children,
}: PropsWithChildren<WargaLayoutProps>) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // PERSISTENT DARK MODE LOGIC
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("appTheme");
        if (savedTheme === "dark") {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        } else if (savedTheme === "light") {
            setIsDark(false);
            document.documentElement.classList.remove("dark");
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        localStorage.setItem("appTheme", newDark ? "dark" : "light");
        if (newDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const notifications = auth.notifications || [];
    const unreadCount = notifications.length;

    const markAllAsRead = () => {
        router.post(
            route("notifications.markAllRead"),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setIsNotifOpen(false),
            },
        );
    };

    const sidebarMenus = [
        {
            name: "Beranda",
            icon: <Home />,
            href: route("dashboard.warga"),
            active: route().current("dashboard.warga"),
        },
        // {
        //     name: "Laporan Publik",
        //     icon: <MessageX />,
        //     href: route("laporan-publik.index"),
        //     active: route().current("laporan-publik.*"),
        // },
    ];

    return (
        <div
            className={`min-h-screen flex ${isDark ? "bg-slate-950" : "bg-slate-50"} transition-colors duration-300`}
        >
            {/* Overlay Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Emerald) */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-emerald-900 text-white flex flex-col transition-transform duration-300 ease-in-out ${
                    isSidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                {/* Logo */}
                <div className="h-20 flex flex-shrink-0 items-center px-6 border-b border-emerald-800 justify-between lg:justify-start">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center text-emerald-950 shadow-[0_0_15px_rgba(52,211,153,0.3)] group-hover:scale-105 transition-transform">
                            <Trash className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="font-black text-lg tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
                                EcoLombok
                            </h1>
                            <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest">
                                Portal Warga
                            </p>
                        </div>
                    </Link>
                    <button
                        className="lg:hidden text-emerald-300 hover:text-white"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    <p className="px-4 text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3">
                        Menu Utama
                    </p>
                    {sidebarMenus.map((menu, index) => (
                        <Link
                            key={index}
                            href={menu.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                menu.active
                                    ? "bg-emerald-400 text-emerald-950 shadow-md"
                                    : "text-emerald-300 hover:bg-emerald-800 hover:text-white"
                            }`}
                        >
                            <div className="flex items-center justify-center w-5 h-5 [&>svg]:w-full [&>svg]:h-full transition-transform group-hover:scale-110">
                                {menu.icon}
                            </div>
                            <span
                                className={`text-sm tracking-wide ${menu.active ? "font-bold" : "font-medium"}`}
                            >
                                {menu.name}
                            </span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                {/* Header Utama */}
                <header
                    className={`h-20 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border-b flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 transition-colors duration-300`}
                >
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" strokeWidth={2} />
                        </button>
                        <div className="flex-1">{header}</div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 ml-4">
                        {/* Lonceng Notifikasi */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className={`relative p-2 rounded-full transition-colors ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
                            >
                                <Bell
                                    className={`w-6 h-6 ${unreadCount > 0 ? (isDark ? "text-slate-200" : "text-slate-800") : ""}`}
                                />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsNotifOpen(false)}
                                    />
                                    <div
                                        className={`absolute right-0 mt-3 w-80 max-w-[90vw] ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"} rounded-2xl shadow-xl border z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200`}
                                    >
                                        <div
                                            className={`p-4 border-b ${isDark ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50/50"} flex justify-between items-center`}
                                        >
                                            <h4
                                                className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}
                                            >
                                                Notifikasi
                                            </h4>
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                {unreadCount} Baru
                                            </span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                            {unreadCount === 0 ? (
                                                <div className="p-8 text-center text-slate-400">
                                                    <CheckCircleSolid className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                    <p className="text-sm">
                                                        Belum ada pembaruan.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                                    {notifications.map(
                                                        (notif: any) => (
                                                            <div
                                                                key={notif.id}
                                                                className={`p-4 ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"} transition-colors flex gap-3`}
                                                            >
                                                                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                                                    <Bell className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <p
                                                                        className={`text-sm leading-snug ${isDark ? "text-slate-300" : "text-slate-700"}`}
                                                                    >
                                                                        {
                                                                            notif
                                                                                .data
                                                                                ?.message
                                                                        }
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                                        {new Date(
                                                                            notif.created_at,
                                                                        ).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className={`w-full py-3 text-xs font-bold ${isDark ? "bg-slate-800 text-emerald-400 hover:bg-slate-700" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                                            >
                                                Tandai Semua Sudah Dibaca
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-full transition-colors ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
                        >
                            {isDark ? (
                                <SunSolid className="w-6 h-6" />
                            ) : (
                                <Moon className="w-6 h-6" />
                            )}
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsProfileMenuOpen(!isProfileMenuOpen)
                                }
                                className={`flex items-center gap-2 p-1.5 pr-3 rounded-full transition-all ${isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-700"}`}
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500/30">
                                    <img
                                        src={
                                            auth.user.avatar ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=10b981&color=fff`
                                        }
                                        className="w-full h-full object-cover"
                                        alt={auth.user.name}
                                    />
                                </div>
                                <span className="hidden sm:inline text-sm font-bold">
                                    {auth.user.name.split(" ")[0]}
                                </span>
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {isProfileMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() =>
                                            setIsProfileMenuOpen(false)
                                        }
                                    />
                                    <div
                                        className={`absolute right-0 mt-3 w-56 ${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-100 text-slate-700"} rounded-2xl shadow-xl border z-50 p-2 animate-in fade-in slide-in-from-top-4 duration-200`}
                                    >
                                        <div className="px-3 py-3 mb-2 border-b border-slate-50 dark:border-slate-800 sm:hidden">
                                            <p className="font-bold text-sm truncate">
                                                {auth.user.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">
                                                Warga
                                            </p>
                                        </div>
                                        {/* <Link
                                            href={route(
                                                "warga.profile",
                                                auth.user.id,
                                            )}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors group`}
                                        >
                                            <User className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                                            <span className="text-sm font-semibold">
                                                Profil
                                            </span>
                                        </Link> */}
                                        <Link
                                            href="/"
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors group`}
                                        >
                                            <Globe className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                                            <span className="text-sm font-semibold">
                                                Beranda
                                            </span>
                                        </Link>
                                        <div
                                            className={`h-px ${isDark ? "bg-slate-800" : "bg-slate-100"} my-1.5 mx-2`}
                                        />
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group`}
                                        >
                                            <Logout className="w-5 h-5" />
                                            <span className="text-sm font-semibold">
                                                Keluar
                                            </span>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div
                    className={`p-6 lg:p-10 overflow-y-auto flex-1 ${isDark ? "bg-slate-950" : "bg-slate-50"} pb-32 xl:pb-10 transition-colors duration-300`}
                >
                    {children}
                </div>

                <BottomBar
                    activeTab={
                        route().current("laporan-publik.*")
                            ? "reports"
                            : route().current("dashboard.warga") ||
                                route().current("warga.profile")
                              ? "profile"
                              : "none"
                    }
                    onTabClick={(tab) => {
                        if (tab === "reports")
                            router.visit(route("laporan-publik.index"));
                        if (tab === "profile")
                            router.visit(route("dashboard.warga"));
                    }}
                    onAuthClick={() => {}}
                    user={auth.user}
                    isDark={isDark}
                />
            </main>
        </div>
    );
}
