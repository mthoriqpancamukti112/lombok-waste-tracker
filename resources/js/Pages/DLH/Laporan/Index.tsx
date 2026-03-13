import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import DLHLayout from "@/Layouts/DLHLayout";
import {
    ChartPie,
    FileText,
    Download,
    Search,
    Refresh,
} from "@mynaui/icons-react";
import Swal from "sweetalert2";
import { landingDict } from "@/Lang/Landing";

interface Report {
    id: number;
    description: string;
    status: string;
    latitude: string;
    longitude: string;
    created_at: string;
    user: {
        name: string;
    };
}

interface Props extends PageProps {
    reports: Report[];
    filters: {
        status?: string;
        start_date?: string;
        end_date?: string;
    };
}

export default function Index({ auth, reports, filters }: Props) {
    // === STATE UNTUK BAHASA ===
    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    useEffect(() => {
        // Ambil bahasa dari localStorage jika ada
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);
    }, []);

    // State untuk form filter
    const [filterStatus, setFilterStatus] = useState(filters.status || "");
    const [startDate, setStartDate] = useState(filters.start_date || "");
    const [endDate, setEndDate] = useState(filters.end_date || "");

    // Fungsi Terapkan Filter
    const applyFilter = () => {
        router.get(
            route("laporan.index"),
            { status: filterStatus, start_date: startDate, end_date: endDate },
            { preserveState: true, replace: true },
        );
    };

    // Fungsi Reset Filter
    const resetFilter = () => {
        setFilterStatus("");
        setStartDate("");
        setEndDate("");
        router.get(route("laporan.index"));
    };

    // URL untuk tombol Export (menyertakan parameter filter saat ini)
    const exportExcelUrl = route("laporan.export.excel", {
        status: filterStatus,
        start_date: startDate,
        end_date: endDate,
    });
    const exportPdfUrl = route("laporan.export.pdf", {
        status: filterStatus,
        start_date: startDate,
        end_date: endDate,
    });

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

    // Fungsi untuk menangani klik tombol Ekspor
    const handleExport = (
        e: React.MouseEvent<HTMLAnchorElement>,
        url: string,
        type: string,
    ) => {
        if (reports.length === 0) {
            e.preventDefault();
            const isDarkMode =
                document.documentElement.classList.contains("dark");

            Swal.fire({
                title: t.saLaEmptyExportTitle,
                text: t.saLaEmptyExportText.replace("{type}", type),
                icon: "warning",
                timer: 3000,
                showConfirmButton: false,
                background: isDarkMode ? "#1e293b" : "#ffffff",
                color: isDarkMode ? "#f8fafc" : "#0f172a",
            });
        }
    };

    return (
        <DLHLayout
            auth={auth}
            header={
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2 transition-colors">
                        <ChartPie className="w-7 h-7 text-[#86bf36]" />{" "}
                        {t.laTitle}
                    </h2>
                    <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                        {t.laSubtitle}
                    </p>
                </div>
            }
        >
            <Head title={t.laTitle} />

            <div className="space-y-6">
                {/* TOOLBAR FILTER & EXPORT */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 transition-colors">
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                        {/* Kiri: Filter Group */}
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-3 flex-1">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">
                                    {t.laFilterStatusLabel}
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                    className="rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] text-sm w-full md:w-48 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 transition-colors"
                                >
                                    <option value="">
                                        {t.laFilterStatusAll}
                                    </option>
                                    <option value="menunggu">
                                        {t.laFilterStatusWait}
                                    </option>
                                    <option value="divalidasi">
                                        {t.laFilterStatusValidated}
                                    </option>
                                    <option value="proses">
                                        {t.laFilterStatusProcess}
                                    </option>
                                    <option value="selesai">
                                        {t.laFilterStatusDone}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">
                                    {t.laStartDate}
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] text-sm w-full md:w-40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">
                                    {t.laEndDate}
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] text-sm w-full md:w-40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 transition-colors"
                                />
                            </div>

                            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                <button
                                    onClick={applyFilter}
                                    className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Search className="w-4 h-4" />{" "}
                                    {t.laBtnFilter}
                                </button>
                                <button
                                    onClick={resetFilter}
                                    className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                    title={t.laBtnReset}
                                >
                                    <Refresh className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Kanan: Export Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 xl:border-0 xl:pt-0 w-full xl:w-auto transition-colors">
                            <a
                                href={exportExcelUrl}
                                onClick={(e) =>
                                    handleExport(e, exportExcelUrl, "Excel")
                                }
                                className={`flex-1 xl:flex-none flex items-center justify-center gap-2 font-bold py-2.5 px-5 rounded-xl transition-all border text-sm ${
                                    reports.length === 0
                                        ? "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 cursor-not-allowed"
                                        : "bg-[#107c41]/10 text-[#107c41] hover:bg-[#107c41] hover:text-white border-[#107c41]/20 dark:bg-[#107c41]/20 dark:text-[#4ade80] dark:border-[#107c41]/30 dark:hover:bg-[#107c41] dark:hover:text-white"
                                }`}
                            >
                                <FileText className="w-5 h-5" />{" "}
                                {t.laBtnExportExcel}
                            </a>
                            <a
                                href={exportPdfUrl}
                                onClick={(e) =>
                                    handleExport(e, exportPdfUrl, "PDF")
                                }
                                className={`flex-1 xl:flex-none flex items-center justify-center gap-2 font-bold py-2.5 px-5 rounded-xl transition-all border text-sm ${
                                    reports.length === 0
                                        ? "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 cursor-not-allowed"
                                        : "bg-[#d83b01]/10 text-[#d83b01] hover:bg-[#d83b01] hover:text-white border-[#d83b01]/20 dark:bg-[#d83b01]/20 dark:text-[#fb923c] dark:border-[#d83b01]/30 dark:hover:bg-[#d83b01] dark:hover:text-white"
                                }`}
                            >
                                <Download className="w-5 h-5" />{" "}
                                {t.laBtnExportPdf}
                            </a>
                        </div>
                    </div>
                </div>

                {/* TABEL DATA */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 transition-colors">
                            <thead className="bg-slate-50/80 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 transition-colors">
                                <tr>
                                    <th className="px-6 py-4">
                                        {t.laTableCol1}
                                    </th>
                                    <th className="px-6 py-4">
                                        {t.laTableCol2}
                                    </th>
                                    <th className="px-6 py-4">
                                        {t.laTableCol3}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 transition-colors">
                                {reports.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 transition-colors"
                                        >
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>{t.laEmptyData}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report) => (
                                        <tr
                                            key={report.id}
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 dark:text-slate-200 transition-colors">
                                                    {formatDate(
                                                        report.created_at,
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">
                                                    {t.laReportBy}{" "}
                                                    <span className="dark:text-slate-300">
                                                        {report.user.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className="font-medium text-slate-700 dark:text-slate-300 max-w-md truncate transition-colors"
                                                    title={report.description}
                                                >
                                                    {report.description ||
                                                        t.laNoDesc}
                                                </div>
                                                <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1 transition-colors">
                                                    Lat: {report.latitude}, Lng:{" "}
                                                    {report.longitude}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors ${
                                                        report.status ===
                                                        "selesai"
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                            : report.status ===
                                                                "menunggu"
                                                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                    }`}
                                                >
                                                    {report.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DLHLayout>
    );
}
