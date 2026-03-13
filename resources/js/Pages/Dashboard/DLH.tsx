import { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { PageProps } from "@/types";
import DLHLayout from "@/Layouts/DLHLayout";
import {
    Grid,
    Clock9,
    CheckCircleSolid,
    Truck,
    ChartPie,
    Map,
    UsersGroup,
    ChevronRight,
} from "@mynaui/icons-react";
import { landingDict } from "@/Lang/Landing";

interface Props extends PageProps {
    stats: {
        total: number;
        menunggu: number;
        proses: number;
        selesai: number;
    };
    chartData: { name: string; jumlah: number; fill: string }[];
    recentReports: {
        id: number;
        description: string;
        status: string;
        created_at: string;
        user: { name: string };
    }[];
}

export default function DLHDashboard({
    auth,
    stats,
    chartData,
    recentReports,
}: Props) {
    // === STATE UNTUK BAHASA ===
    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    // === STATE UNTUK DETEKSI DARK MODE (Khusus Grafik Recharts) ===
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Ambil bahasa dari localStorage jika ada
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);

        // Fungsi untuk mengecek dark mode dari elemen HTML
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
        };

        // Cek saat pertama kali dimuat
        checkDarkMode();

        // Observer untuk memantau perubahan class "dark" pada tag HTML agar grafik ikut berubah real-time
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    // State untuk Filter Log Aktivitas
    const [logFilter, setLogFilter] = useState<
        "semua" | "menunggu" | "proses" | "selesai"
    >("semua");

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(
            lang === "id" ? "id-ID" : "en-US",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            },
        );
    };

    // Logika Filtering Log
    const filteredReports = recentReports.filter((report) =>
        logFilter === "semua" ? true : report.status === logFilter,
    );

    return (
        <DLHLayout
            auth={auth}
            header={
                <div className="flex justify-between items-center w-full animate-in fade-in slide-in-from-top-4 duration-500">
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
                        {t.dlhHeader}
                    </h2>
                    <div className="hidden sm:flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 px-4 py-2 rounded-full shadow-sm transition-colors">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-green-700 dark:text-green-400 transition-colors">
                            {t.dlhSystemOnline}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title={t.dlhTitle} />

            <div className="space-y-8">
                {/* Ucapan Selamat Datang */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 animate-in fade-in zoom-in-95 duration-500 transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {t.dlhWelcome} {auth.user?.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t.dlhSubtitle}
                    </p>
                </div>

                {/* ================= KARTU STATISTIK ================= */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card Total */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-lg transition-all hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                                {t.dlhTotalReports}
                            </p>
                            <p className="text-4xl font-black text-slate-800 dark:text-slate-100">
                                {stats.total}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:bg-slate-800 dark:group-hover:bg-slate-600 group-hover:text-white transition-all">
                            <Grid className="w-7 h-7" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Card Menunggu */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-lg transition-all hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                        <div>
                            <p className="text-xs text-red-500 dark:text-red-400 font-bold uppercase tracking-wider mb-1">
                                {t.dlhWaitingValidation}
                            </p>
                            <p className="text-4xl font-black text-slate-800 dark:text-slate-100">
                                {stats.menunggu}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 dark:text-red-400 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all">
                            <Clock9 className="w-7 h-7" strokeWidth={2} />
                        </div>
                    </div>

                    {/* Card Proses */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-lg transition-all hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                        <div>
                            <p className="text-xs text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">
                                {t.dlhInProcess}
                            </p>
                            <p className="text-4xl font-black text-slate-800 dark:text-slate-100">
                                {stats.proses}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <Truck className="w-7 h-7" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Card Selesai */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-lg transition-all hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                        <div>
                            <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-1">
                                {t.dlhCompletedClean}
                            </p>
                            <p className="text-4xl font-black text-slate-800 dark:text-slate-100">
                                {stats.selesai}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all">
                            <CheckCircleSolid className="w-7 h-7" />
                        </div>
                    </div>
                </div>

                {/* ================= BAGIAN BAWAH: GRAFIK & LOG ================= */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Grafik Distribusi */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 border border-slate-100 dark:border-slate-700 xl:col-span-2 flex flex-col h-[480px] animate-in fade-in slide-in-from-left-4 duration-700 transition-colors">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#a7e94a]/20 dark:bg-[#a7e94a]/10 flex items-center justify-center rounded-xl text-[#86bf36] dark:text-[#a7e94a]">
                                    <ChartPie className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                        {t.dlhChartTitle}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t.dlhChartSubtitle}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route("laporan.index")}
                                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 group transition-colors"
                            >
                                {t.dlhViewFullAnalytics}{" "}
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -20,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke={
                                            isDarkMode ? "#334155" : "#f1f5f9"
                                        }
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: isDarkMode
                                                ? "#94a3b8"
                                                : "#64748b",
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}
                                        dy={10}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: isDarkMode
                                                ? "#64748b"
                                                : "#94a3b8",
                                            fontSize: 12,
                                        }}
                                    />
                                    <Tooltip
                                        cursor={{
                                            fill: isDarkMode
                                                ? "#334155"
                                                : "#f8fafc",
                                        }}
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: `1px solid ${
                                                isDarkMode
                                                    ? "#334155"
                                                    : "#e2e8f0"
                                            }`,
                                            boxShadow:
                                                "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                            fontWeight: "bold",
                                            backgroundColor: isDarkMode
                                                ? "#1e293b"
                                                : "#ffffff",
                                            color: isDarkMode
                                                ? "#f8fafc"
                                                : "#0f172a",
                                        }}
                                    />
                                    <Bar
                                        dataKey="jumlah"
                                        radius={[8, 8, 0, 0]}
                                        barSize={60}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.fill}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Log Aktivitas Terkini */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700 flex flex-col h-[480px] animate-in fade-in slide-in-from-right-4 duration-700 transition-colors">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400">
                                <Map className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    {t.dlhActivityRadar}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t.dlhActivitySubtitle}
                                </p>
                            </div>
                        </div>

                        {/* Tabs Filter Cepat */}
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg mb-5 flex-shrink-0 transition-colors">
                            <button
                                onClick={() => setLogFilter("semua")}
                                className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-colors ${
                                    logFilter === "semua"
                                        ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                            >
                                {t.dlhFilterAll}
                            </button>
                            <button
                                onClick={() => setLogFilter("menunggu")}
                                className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-colors ${
                                    logFilter === "menunggu"
                                        ? "bg-red-500 text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                            >
                                {t.dlhFilterWaiting}
                            </button>
                            <button
                                onClick={() => setLogFilter("proses")}
                                className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-colors ${
                                    logFilter === "proses"
                                        ? "bg-blue-500 text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                            >
                                {t.dlhFilterProcess}
                            </button>
                        </div>

                        {/* List Laporan */}
                        <div className="space-y-5 overflow-y-auto flex-1 pr-2 pl-4 py-2 custom-scrollbar">
                            {filteredReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="relative pl-5 border-l-2 border-slate-100 dark:border-slate-700 group hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                                >
                                    {/* Titik Indikator Timeline */}
                                    <div
                                        className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white dark:ring-slate-800 transition-transform group-hover:scale-125 ${
                                            report.status === "menunggu"
                                                ? "bg-red-500"
                                                : report.status === "proses"
                                                  ? "bg-blue-500"
                                                  : "bg-green-500"
                                        }`}
                                    ></div>

                                    <p
                                        className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug transition-colors"
                                        title={report.description}
                                    >
                                        {report.description ||
                                            t.dlhNoDescription}
                                    </p>

                                    <div className="flex flex-col mt-2 gap-1.5">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 transition-colors">
                                            <UsersGroup className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />{" "}
                                            {report.user.name}
                                        </span>

                                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/30 p-2 rounded-lg mt-1 group-hover:bg-slate-100 dark:group-hover:bg-slate-700/60 transition-colors">
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 transition-colors">
                                                <Clock9 className="w-3 h-3 text-slate-400 dark:text-slate-500" />{" "}
                                                {formatDate(report.created_at)}
                                            </span>
                                            <span
                                                className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest transition-colors ${
                                                    report.status === "selesai"
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                                        : report.status ===
                                                            "menunggu"
                                                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                                }`}
                                            >
                                                {report.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredReports.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 transition-colors">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-3 transition-colors">
                                        <CheckCircleSolid className="w-6 h-6 text-slate-300 dark:text-slate-500" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                        {t.dlhEmptyLogTitle}
                                    </p>
                                    <p className="text-xs text-center mt-1">
                                        {t.dlhEmptyLogDesc}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DLHLayout>
    );
}
