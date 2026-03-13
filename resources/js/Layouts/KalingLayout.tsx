import { useState, PropsWithChildren, ReactNode, useEffect } from "react";
import { Link } from "@inertiajs/react";
import {
    Home,
    User,
    Logout,
    Menu,
    X,
    ShieldCheck,
    Map,
    Globe,
    MapPin,
    ChevronDown,
    Moon, // Tambahkan icon Moon
    Sun, // Tambahkan icon Sun
} from "@mynaui/icons-react";
import { landingDict } from "@/Lang/Landing";

interface KalingLayoutProps {
    auth: any;
    header?: ReactNode;
}

export default function KalingLayout({
    auth,
    header,
    children,
}: PropsWithChildren<KalingLayoutProps>) {
    // State untuk bahasa
    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    // State untuk UI
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // State untuk Dark Mode
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 1. Efek saat komponen pertama kali dimuat (Check LocalStorage)
    useEffect(() => {
        // Cek Bahasa
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);

        // Cek Tema (Dark/Light Mode)
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

    // 2. Efek untuk menyimpan tema setiap kali tombol toggle ditekan
    useEffect(() => {
        localStorage.setItem("appTheme", isDarkMode ? "dark" : "light");
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    const toggleDark = () => setIsDarkMode((prev) => !prev);

    // Data Menu Sidebar KHUSUS KALING
    const sidebarMenus = [
        {
            name: t.kalingMenuDashboard,
            icon: <Home />,
            href: route("dashboard.kaling"),
            active: route().current("dashboard.kaling"),
        },
        {
            name: t.kalingMenuMap,
            icon: <Map />,
            href: route("kaling.map"),
            active: route().current("kaling.map"),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
            {/* Overlay Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Warna Khas: Biru Tua / Indigo - Dipertahankan gelap meski mode light agar kontras) */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-indigo-950 dark:bg-slate-950 text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-transparent dark:border-slate-800 ${
                    isSidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                {/* Logo */}
                <div className="h-20 flex flex-shrink-0 items-center px-6 border-b border-indigo-900 dark:border-slate-800 justify-between lg:justify-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            <ShieldCheck className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="font-black text-lg tracking-tight leading-tight">
                                EcoLombok
                            </h1>
                            <p className="text-[10px] text-indigo-300 dark:text-slate-400 font-bold uppercase tracking-widest">
                                {t.kalingPortal}
                            </p>
                        </div>
                    </div>
                    <button
                        className="lg:hidden text-indigo-300 hover:text-white"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigasi */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    <p className="px-4 text-[10px] font-bold text-indigo-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                        {t.kalingMainMenu}
                    </p>
                    {sidebarMenus.map((menu, index) => (
                        <Link
                            key={index}
                            href={menu.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                menu.active
                                    ? "bg-indigo-500 dark:bg-indigo-600 text-white shadow-md"
                                    : "text-indigo-300 dark:text-slate-400 hover:bg-indigo-800 dark:hover:bg-slate-800 hover:text-white"
                            }`}
                        >
                            <div
                                className={`flex items-center justify-center flex-shrink-0 transition-transform ${
                                    menu.active
                                        ? "scale-110"
                                        : "group-hover:scale-110"
                                }`}
                            >
                                <div className="flex items-center justify-center w-5 h-5 [&>svg]:w-full [&>svg]:h-full">
                                    {menu.icon}
                                </div>
                            </div>
                            <span
                                className={`text-sm tracking-wide ${
                                    menu.active ? "font-bold" : "font-medium"
                                }`}
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
                <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 transition-colors duration-300">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" strokeWidth={2} />
                        </button>
                        <div className="flex-1">{header}</div>
                    </div>

                    {/* Area Kanan Header (Toggle Dark Mode & Dropdown Profil) */}
                    <div className="flex items-center gap-3 sm:gap-4 ml-4">
                        {/* Tombol Dark Mode Toggle */}
                        <button
                            onClick={toggleDark}
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
                            title="Ganti Tema"
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsProfileMenuOpen(!isProfileMenuOpen)
                                }
                                className="flex items-center gap-2 sm:gap-3 p-1 sm:pr-2 rounded-full sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-transparent focus:outline-none focus:border-slate-200 dark:focus:border-slate-600"
                            >
                                {/* Foto Profil / Avatar */}
                                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-black text-sm border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden relative flex-shrink-0">
                                    {auth.user?.avatar ? (
                                        <img
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                            referrerPolicy="no-referrer"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>
                                            {auth.user?.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Nama (Sembunyi di Mobile) */}
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[100px]">
                                        {auth.user?.name.split(" ")[0]}
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">
                                        {auth.user?.role}
                                    </p>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* Isi Pop-up Dropdown Profil */}
                            {isProfileMenuOpen && (
                                <>
                                    {/* Invisible overlay */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() =>
                                            setIsProfileMenuOpen(false)
                                        }
                                    ></div>

                                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 p-2">
                                        {/* Header Info Akun */}
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 mb-2">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                                                {auth.user?.name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {auth.user?.email}
                                            </p>

                                            {/* Info Nama Wilayah Kaling */}
                                            {auth.user?.kaling
                                                ?.nama_wilayah && (
                                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1.5 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 w-fit px-2 py-0.5 rounded-md">
                                                    <MapPin className="w-3 h-3" />
                                                    {
                                                        auth.user.kaling
                                                            .nama_wilayah
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* Link Profil */}
                                        <Link
                                            href={route("profile.edit")}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors group"
                                            onClick={() =>
                                                setIsProfileMenuOpen(false)
                                            }
                                        >
                                            <User
                                                className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-sm font-semibold">
                                                {t.kalingProfileMenu}
                                            </span>
                                        </Link>

                                        {/* Link Halaman Depan */}
                                        <Link
                                            href="/"
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors group"
                                        >
                                            <Globe
                                                className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-sm font-semibold">
                                                {t.kalingHomeMenu}
                                            </span>
                                        </Link>

                                        {/* Separator */}
                                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1.5 mx-2"></div>

                                        {/* Tombol Logout */}
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                                        >
                                            <Logout
                                                className="w-5 h-5 text-red-400 dark:text-red-500 group-hover:text-red-500 dark:group-hover:text-red-400"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-sm font-semibold">
                                                {t.logout}
                                            </span>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-10 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                    {children}
                </div>
            </main>
        </div>
    );
}
