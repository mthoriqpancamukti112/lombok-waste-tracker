import { useState, PropsWithChildren, ReactNode } from "react";
import { Link } from "@inertiajs/react";
import {
    Grid,
    Map,
    UsersGroup,
    Trash,
    Logout,
    ChartPie,
    Truck,
    Menu,
    X,
    Globe,
    Briefcase,
    User,
    ChevronDown,
    Earth,
} from "@mynaui/icons-react";

interface DLHLayoutProps {
    auth: any;
    header?: ReactNode;
}

export default function DLHLayout({
    auth,
    header,
    children,
}: PropsWithChildren<DLHLayoutProps>) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // STATE BARU: Untuk membuka/tutup menu profil dropdown
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Data Menu Sidebar (Profil Saya dipindah ke Dropdown Atas)
    const sidebarMenus = [
        {
            name: "Dashboard",
            icon: <Grid />,
            href: route("dashboard.dlh"),
            active: route().current("dashboard.dlh"),
        },
        {
            name: "Peta Sebaran",
            icon: <Map />,
            href: route("dlh.map"),
            active: route().current("dlh.map"),
        },
        {
            name: "Pemetaan Zona Rawan",
            icon: <Earth />,
            href: route("danger-zones.index"),
            active: route().current("danger-zones.*"),
        },
        {
            name: "Manajemen Kaling",
            icon: <UsersGroup />,
            href: route("kaling-management.index"),
            active: route().current("kaling-management.*"),
        },
        {
            name: "Armada & Petugas",
            icon: <Truck />,
            href: route("petugas-management.index"),
            active: route().current("petugas-management.*"),
        },
        {
            name: "Laporan & Analitik",
            icon: <ChartPie />,
            href: route("laporan.index"),
            active: route().current("laporan.*"),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Overlay Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Warna Khas: Slate / Abu Gelap) */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out ${
                    isSidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                {/* Logo */}
                <div className="h-20 flex flex-shrink-0 items-center px-6 border-b border-slate-800 justify-between lg:justify-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#a7e94a] rounded-xl flex items-center justify-center text-slate-900 shadow-[0_0_15px_rgba(167,233,74,0.3)]">
                            <Trash className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="font-black text-lg tracking-tight leading-tight text-white">
                                EcoLombok
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                Portal DLH
                            </p>
                        </div>
                    </div>
                    <button
                        className="lg:hidden text-slate-400 hover:text-white"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigasi (Kartu Profil dan Footer Dihapus dari Sini) */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                        Menu Utama
                    </p>
                    {sidebarMenus.map((menu, index) => (
                        <Link
                            key={index}
                            href={menu.href}
                            className={`flex items-center justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                                menu.active
                                    ? "bg-[#a7e94a] text-slate-900 font-bold shadow-md"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white font-medium"
                            }`}
                        >
                            <div
                                className={`flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform ${
                                    menu.active
                                        ? "scale-110"
                                        : "group-hover:scale-110"
                                }`}
                            >
                                <div className="[&>svg]:w-5 [&>svg]:h-5">
                                    {menu.icon}
                                </div>
                            </div>
                            <span className="text-sm leading-none mt-0.5">
                                {menu.name}
                            </span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                {/* Header Global */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" strokeWidth={2} />
                        </button>

                        {/* Area Render Header Dinamis */}
                        <div className="flex-1">{header}</div>
                    </div>

                    {/* Area Kanan Header (Dropdown Profil) */}
                    <div className="flex items-center gap-2 sm:gap-4 ml-4">
                        {/* --- DROPDOWN PROFIL PENGGUNA --- */}
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsProfileMenuOpen(!isProfileMenuOpen)
                                }
                                className="flex items-center gap-2 sm:gap-3 p-1 sm:pr-2 rounded-full sm:rounded-xl hover:bg-slate-100 transition-colors border border-transparent focus:outline-none focus:border-slate-200"
                            >
                                {/* Foto Profil / Avatar */}
                                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm border-2 border-white shadow-sm overflow-hidden relative flex-shrink-0">
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
                                    <p className="text-sm font-bold text-slate-800 leading-none truncate max-w-[100px]">
                                        {auth.user?.name.split(" ")[0]}
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">
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
                                    {/* Invisible overlay untuk menutup pop-up saat klik di luar */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() =>
                                            setIsProfileMenuOpen(false)
                                        }
                                    ></div>

                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 p-2">
                                        {/* Header Info Akun */}
                                        <div className="px-4 py-3 border-b border-slate-100 mb-2">
                                            <p className="text-sm font-bold text-slate-800 truncate">
                                                {auth.user?.name}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {auth.user?.email}
                                            </p>

                                            {/* Info Jabatan DLH */}
                                            {auth.user?.dlh?.jabatan && (
                                                <p className="text-xs font-bold text-slate-600 mt-1.5 flex items-center gap-1 bg-slate-100 w-fit px-2 py-0.5 rounded-md border border-slate-200">
                                                    <Briefcase className="w-3 h-3" />
                                                    {auth.user.dlh.jabatan}
                                                </p>
                                            )}
                                        </div>

                                        {/* Link Halaman Depan */}
                                        <Link
                                            href="/"
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#a7e94a]/20 transition-colors group"
                                        >
                                            <Globe
                                                className="w-5 h-5 text-slate-400 group-hover:text-slate-800"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-sm font-semibold">
                                                Beranda
                                            </span>
                                        </Link>

                                        {/* Separator */}
                                        <div className="h-px bg-slate-100 my-1.5 mx-2"></div>

                                        {/* Tombol Logout */}
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors group"
                                        >
                                            <Logout
                                                className="w-5 h-5 text-red-400 group-hover:text-red-500"
                                                strokeWidth={1.5}
                                            />
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

                {/* Konten Halaman */}
                <div className="p-6 lg:p-10 overflow-y-auto flex-1 bg-slate-50">
                    {children}
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
}
