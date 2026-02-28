import { useState, PropsWithChildren, ReactNode } from "react";
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
} from "@mynaui/icons-react";

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

    // STATE BARU: Untuk membuka/tutup menu profil dropdown
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Mengambil data notifikasi
    const notifications = auth.notifications || [];
    const unreadCount = notifications.length;

    // Fungsi Tandai Semua Sudah Dibaca
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

    // Data Menu Sidebar KHUSUS WARGA (Profil Saya dipindah ke Dropdown Atas)
    const sidebarMenus = [
        {
            name: "Beranda",
            icon: <Home />,
            href: route("dashboard.warga"),
            active: route().current("dashboard.warga"),
        },
        {
            name: "Laporan Publik",
            icon: <MessageX />,
            href: route("laporan-publik.index"),
            active: route().current("laporan-publik.*"),
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

            {/* Sidebar (Hijau Emerald) */}
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

                {/* Navigasi (Kartu Profil & Menu Bawah Dihapus dari Sini) */}
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
                            <div
                                className={`flex items-center justify-center flex-shrink-0 transition-transform ${menu.active ? "scale-110" : "group-hover:scale-110"}`}
                            >
                                <div className="flex items-center justify-center w-5 h-5 [&>svg]:w-full [&>svg]:h-full">
                                    {menu.icon}
                                </div>
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
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" strokeWidth={2} />
                        </button>
                        <div className="flex-1">{header}</div>
                    </div>

                    {/* Area Kanan Header (Notifikasi & Profil) */}
                    <div className="flex items-center gap-2 sm:gap-4 ml-4">
                        {/* LONCENG NOTIFIKASI (Tetap Sama) */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <Bell
                                    className={`w-6 h-6 ${unreadCount > 0 ? "text-slate-700" : ""}`}
                                    strokeWidth={2}
                                />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                                )}
                            </button>

                            {/* Pop-up Notifikasi */}
                            {isNotifOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsNotifOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-3 w-80 max-w-[90vw] bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                            <h4 className="font-bold text-slate-800">
                                                Notifikasi Anda
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
                                                <div className="divide-y divide-slate-50">
                                                    {notifications.map(
                                                        (notif: any) => (
                                                            <div
                                                                key={notif.id}
                                                                className="p-4 hover:bg-slate-50 transition-colors flex gap-3"
                                                            >
                                                                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 bg-emerald-100 text-emerald-600">
                                                                    <Bell className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-slate-700 leading-snug">
                                                                        {
                                                                            notif
                                                                                .data
                                                                                .message
                                                                        }
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                                                                        {new Date(
                                                                            notif.created_at,
                                                                        ).toLocaleDateString(
                                                                            "id-ID",
                                                                            {
                                                                                day: "numeric",
                                                                                month: "short",
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            },
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <div className="p-3 border-t border-slate-100 bg-slate-50">
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="w-full py-2 text-xs font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                                >
                                                    Tandai Semua Sudah Dibaca
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* GARIS PEMISAH */}
                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                        {/* --- DROPDOWN PROFIL PENGGUNA --- */}
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsProfileMenuOpen(!isProfileMenuOpen)
                                }
                                className="flex items-center gap-2 sm:gap-3 p-1 sm:pr-2 rounded-full sm:rounded-xl hover:bg-slate-100 transition-colors border border-transparent focus:outline-none focus:border-slate-200"
                            >
                                {/* Foto Profil / Avatar */}
                                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm border-2 border-white shadow-sm overflow-hidden relative flex-shrink-0">
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
                                    {/* Badge Verifikasi Mini di Pojok Foto */}
                                    {auth.user?.warga?.is_terverifikasi && (
                                        <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full border border-white">
                                            <ShieldCheck className="w-2.5 h-2.5 text-white" />
                                        </div>
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
                                        </div>

                                        {/* Link Profil */}
                                        <Link
                                            href={route("profile.edit")}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors group"
                                            onClick={() =>
                                                setIsProfileMenuOpen(false)
                                            }
                                        >
                                            <User
                                                className="w-5 h-5 text-slate-400 group-hover:text-emerald-500"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-sm font-semibold">
                                                Profil
                                            </span>
                                        </Link>

                                        {/* Link Halaman Depan */}
                                        <Link
                                            href="/"
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors group"
                                        >
                                            <Globe
                                                className="w-5 h-5 text-slate-400 group-hover:text-emerald-500"
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

                {/* Container Konten Utama */}
                <div className="p-6 lg:p-10 overflow-y-auto flex-1 bg-slate-50">
                    {children}
                </div>
            </main>
        </div>
    );
}
