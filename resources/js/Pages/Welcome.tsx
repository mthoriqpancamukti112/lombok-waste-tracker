import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import { useState } from "react";
import MapComponent from "@/Components/MapComponent";
import { landingDict } from "@/Lang/Landing";

interface Report {
    id: number;
    latitude: string;
    longitude: string;
    description: string;
    status: string;
    photo_path: string;
    user: { name: string };
    created_at: string;
}

export default function Welcome({
    auth,
    reports,
}: PageProps<{ auth: any; reports: Report[] }>) {
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [isDockHovered, setIsDockHovered] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <>
            <Head title={t.title} />

            <div className="relative h-screen w-full overflow-hidden bg-gray-100">
                <div className="absolute inset-0 z-0">
                    <MapComponent reports={reports} isDarkMode={isDarkMode} />
                </div>

                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-40 flex items-center gap-3">
                    {/* Search Bar */}
                    <div
                        className={`flex-1 backdrop-blur-md shadow-lg rounded-full flex items-center px-4 py-3 transition-colors duration-300 border ${isDarkMode ? "bg-slate-800/90 border-slate-700" : "bg-white/90 border-gray-200"}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            className={`w-full bg-transparent border-none focus:ring-0 outline-none text-sm px-3 placeholder-gray-400 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                        />
                    </div>

                    {/* Tombol Toggle Bahasa (ID / EN) */}
                    <button
                        onClick={() => setLang(lang === "id" ? "en" : "id")}
                        className={`w-12 h-12 flex-shrink-0 backdrop-blur-md shadow-lg rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 hover:text-[#a7e94a] hover:border-[#a7e94a] border ${isDarkMode ? "bg-slate-800/90 text-white border-slate-700" : "bg-white/90 text-slate-800 border-gray-200"}`}
                        title={t.changeLang}
                    >
                        {lang === "id" ? "EN" : "ID"}
                    </button>

                    {/* Tombol Dark Mode */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`w-12 h-12 flex-shrink-0 backdrop-blur-md shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:text-[#a7e94a] border ${isDarkMode ? "bg-slate-800/90 text-yellow-400 border-slate-700" : "bg-white/90 text-gray-500 border-gray-200"}`}
                        title={t.mapTheme}
                    >
                        {isDarkMode ? (
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
                                    d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-2.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                />
                            </svg>
                        ) : (
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
                                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                {/* --- Bottom Floating Dock --- */}
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 z-40 pb-6"
                    onMouseEnter={() => setIsDockHovered(true)}
                    onMouseLeave={() => setIsDockHovered(false)}
                >
                    {/* Indikator buka dock saat di-hover/mobile */}
                    <div
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/90 backdrop-blur-md rounded-t-2xl flex items-center justify-center transition-all duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] border-t border-x border-gray-200 cursor-pointer ${isDockHovered ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-0 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto"}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                            className="w-5 h-5 text-gray-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 15.75l7.5-7.5 7.5 7.5"
                            />
                        </svg>
                    </div>

                    {/* Isi Menu Dock */}
                    <div
                        className={`transition-all duration-300 ease-out flex items-center bg-white/90 backdrop-blur-md rounded-full px-8 py-2.5 gap-8 shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-gray-200 ${isDockHovered ? "opacity-100 translate-y-0 scale-100" : "opacity-100 translate-y-0 scale-100 md:opacity-0 md:translate-y-10 md:scale-95 md:pointer-events-none"}`}
                    >
                        <button
                            onClick={() => setIsBottomSheetOpen(true)}
                            className="group relative p-2 text-gray-500 hover:text-[#a7e94a] transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                                />
                            </svg>
                            <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700 shadow-lg">
                                {t.reportList}
                            </span>
                        </button>

                        {/* Tombol Buat Laporan Cepat */}
                        <Link
                            href={route("report.create")}
                            className="group relative w-14 h-14 bg-[#a7e94a] rounded-2xl flex items-center justify-center text-slate-900 shadow-[0_4px_20px_rgba(167,233,74,0.5)] hover:scale-105 transition-transform"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke="currentColor"
                                className="w-8 h-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>
                            <span className="hidden md:block absolute -top-12 left-1/2 -translate-x-1/2 bg-[#a7e94a] text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                                {t.quickReport}
                            </span>
                        </Link>

                        {/* Tombol Login */}
                        <Link
                            href={
                                auth.user ? route("dashboard") : route("login")
                            }
                            className="group relative p-2 text-gray-500 hover:text-[#a7e94a] transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25"
                                />
                            </svg>
                            <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700 shadow-lg">
                                {auth.user ? t.dashboard : t.login}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* --- Daftar Laporan --- */}
                <div
                    className={`absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] h-[75vh] flex flex-col ${isBottomSheetOpen ? "translate-y-0" : "translate-y-full"}`}
                >
                    <div
                        className="w-full flex justify-center p-4 cursor-pointer hover:bg-slate-50 rounded-t-3xl transition"
                        onClick={() => setIsBottomSheetOpen(false)}
                    >
                        <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                    </div>

                    <div className="px-6 pb-6 overflow-y-auto flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">
                                {t.recentReportsTitle}
                            </h2>
                            <button
                                onClick={() => setIsBottomSheetOpen(false)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* List Laporan */}
                        <div className="space-y-4 pb-20">
                            {reports.length === 0 ? (
                                <div className="text-center py-10 flex flex-col items-center">
                                    <svg
                                        className="w-12 h-12 text-slate-300 mb-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        />
                                    </svg>
                                    <p className="text-slate-500 text-sm font-medium">
                                        {t.noReports}
                                    </p>
                                </div>
                            ) : (
                                reports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="p-4 border border-slate-100 rounded-2xl shadow-sm bg-slate-50/50 flex gap-4 hover:shadow-md hover:bg-white transition-all"
                                    >
                                        <img
                                            src={`/storage/${report.photo_path}`}
                                            alt="Laporan"
                                            className="w-20 h-20 bg-slate-200 rounded-xl flex-shrink-0 object-cover"
                                        />
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="font-bold text-slate-800 line-clamp-1 mb-1">
                                                {report.description ||
                                                    "Lokasi Tumpukan Sampah"}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span
                                                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${report.status === "menunggu" ? "bg-red-100 text-red-600" : report.status === "proses" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}
                                                >
                                                    {report.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {t.reportedBy}{" "}
                                                <span className="font-bold text-slate-700">
                                                    {report.user?.name}
                                                </span>{" "}
                                                <span className="mx-1">•</span>{" "}
                                                {formatDate(report.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
