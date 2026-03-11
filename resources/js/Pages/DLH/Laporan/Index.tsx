import { useState } from "react";
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
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Fungsi untuk menangani klik tombol Ekspor
    const handleExport = (
        e: React.MouseEvent<HTMLAnchorElement>,
        url: string,
        type: string,
    ) => {
        if (reports.length === 0) {
            e.preventDefault();
            Swal.fire({
                title: "Data Kosong!",
                text: `Tidak ada data laporan untuk diekspor ke ${type}. Silakan ubah filter Anda.`,
                icon: "warning",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    return (
        <DLHLayout
            auth={auth}
            header={
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <ChartPie className="w-7 h-7 text-[#86bf36]" /> Laporan
                        & Analitik
                    </h2>
                    <p className="text-xs lg:text-sm text-slate-500 mt-1">
                        Rekapitulasi data pelaporan, filter, dan ekspor dokumen.
                    </p>
                </div>
            }
        >
            <Head title="Laporan & Analitik" />

            <div className="space-y-6">
                {/* TOOLBAR FILTER & EXPORT */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                        {/* Kiri: Filter Group */}
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-3 flex-1">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                    Status Laporan
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                    className="rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] text-sm w-full md:w-48 bg-slate-50 p-2.5"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="menunggu">
                                        Menunggu Validasi
                                    </option>
                                    <option value="divalidasi">
                                        Menunggu Petugas (Divalidasi)
                                    </option>
                                    <option value="proses">
                                        Sedang Diproses
                                    </option>
                                    <option value="selesai">Selesai</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] text-sm w-full md:w-40 bg-slate-50 p-2.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                    Tanggal Akhir
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] text-sm w-full md:w-40 bg-slate-50 p-2.5"
                                />
                            </div>

                            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                <button
                                    onClick={applyFilter}
                                    className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Search className="w-4 h-4" /> Filter
                                </button>
                                <button
                                    onClick={resetFilter}
                                    className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                    title="Reset Filter"
                                >
                                    <Refresh className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Kanan: Export Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-slate-100 xl:border-0 xl:pt-0 w-full xl:w-auto">
                            <a
                                href={exportExcelUrl}
                                onClick={(e) =>
                                    handleExport(e, exportExcelUrl, "Excel")
                                }
                                className={`flex-1 xl:flex-none flex items-center justify-center gap-2 font-bold py-2.5 px-5 rounded-xl transition-all border text-sm ${
                                    reports.length === 0
                                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                        : "bg-[#107c41]/10 text-[#107c41] hover:bg-[#107c41] hover:text-white border-[#107c41]/20"
                                }`}
                            >
                                <FileText className="w-5 h-5" /> Excel
                            </a>
                            <a
                                href={exportPdfUrl}
                                onClick={(e) =>
                                    handleExport(e, exportPdfUrl, "PDF")
                                }
                                className={`flex-1 xl:flex-none flex items-center justify-center gap-2 font-bold py-2.5 px-5 rounded-xl transition-all border text-sm ${
                                    reports.length === 0
                                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                        : "bg-[#d83b01]/10 text-[#d83b01] hover:bg-[#d83b01] hover:text-white border-[#d83b01]/20"
                                }`}
                            >
                                <Download className="w-5 h-5" /> Cetak PDF
                            </a>
                        </div>
                    </div>
                </div>

                {/* TABEL DATA */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">
                                        Tanggal & Pelapor
                                    </th>
                                    <th className="px-6 py-4">
                                        Keterangan Lokasi
                                    </th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reports.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-6 py-12 text-center text-slate-400"
                                        >
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>
                                                Tidak ada data laporan yang
                                                sesuai dengan filter.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report) => (
                                        <tr
                                            key={report.id}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">
                                                    {formatDate(
                                                        report.created_at,
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    Oleh: {report.user.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className="font-medium text-slate-700 max-w-md truncate"
                                                    title={report.description}
                                                >
                                                    {report.description || "-"}
                                                </div>
                                                <div className="text-[10px] font-mono text-slate-400 mt-1">
                                                    Lat: {report.latitude}, Lng:{" "}
                                                    {report.longitude}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                        report.status ===
                                                        "selesai"
                                                            ? "bg-green-100 text-green-700"
                                                            : report.status ===
                                                                "menunggu"
                                                              ? "bg-red-100 text-red-700"
                                                              : "bg-blue-100 text-blue-700"
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
