import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
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
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-extrabold leading-tight text-slate-800 tracking-tight">
                        Executive Dashboard
                    </h2>
                    <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Dinas Lingkungan Hidup
                    </span>
                </div>
            }
        >
            <Head title="Dashboard Executive DLH" />

            <div className="py-10 bg-slate-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">
                                Selamat datang, {auth.user?.name}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Berikut adalah ringkasan performa penanganan
                                sampah wilayah secara real-time.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Card Total */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                                    Total Laporan
                                </p>
                                <p className="text-4xl font-black text-slate-800">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">📊</span>
                            </div>
                        </div>

                        {/* Card Menunggu */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">
                                    Menunggu Validasi
                                </p>
                                <p className="text-4xl font-black text-slate-800">
                                    {stats.menunggu}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                                <span className="text-xl">⏳</span>
                            </div>
                        </div>

                        {/* Card Proses */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">
                                    Sedang Diproses
                                </p>
                                <p className="text-4xl font-black text-slate-800">
                                    {stats.proses}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                <span className="text-xl">🚛</span>
                            </div>
                        </div>

                        {/* Card Selesai */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">
                                    Telah Diselesaikan
                                </p>
                                <p className="text-4xl font-black text-slate-800">
                                    {stats.selesai}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                                <span className="text-xl">✅</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 lg:col-span-2 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">
                                Distribusi Status Penanganan
                            </h3>
                            <div className="h-80 w-full flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: -20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#e2e8f0"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "#64748b",
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
                                                fill: "#64748b",
                                                fontSize: 12,
                                            }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "#f1f5f9" }}
                                            contentStyle={{
                                                borderRadius: "12px",
                                                border: "none",
                                                boxShadow:
                                                    "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                            }}
                                        />
                                        <Bar
                                            dataKey="jumlah"
                                            radius={[6, 6, 0, 0]}
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

                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 flex flex-col h-full">
                            <div className="flex justify-between items-end mb-6">
                                <h3 className="text-lg font-bold text-slate-800">
                                    Log Aktivitas Terakhir
                                </h3>
                            </div>

                            <div className="space-y-5 overflow-y-auto flex-1 pr-2">
                                {recentReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="relative pl-4 border-l-2 border-slate-200"
                                    >
                                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#a7e94a] ring-4 ring-white"></div>
                                        <p
                                            className="text-sm font-bold text-slate-800 line-clamp-1"
                                            title={report.description}
                                        >
                                            {report.description ||
                                                "Laporan Tanpa Keterangan"}
                                        </p>
                                        <div className="flex flex-col mt-1 gap-1">
                                            <span className="text-xs font-medium text-slate-500">
                                                Oleh: {report.user.name}
                                            </span>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {formatDate(
                                                        report.created_at,
                                                    )}
                                                </span>
                                                <span
                                                    className={`text-[9px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider ${
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
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {recentReports.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 h-full">
                                        <p className="text-sm text-slate-400 font-medium text-center">
                                            Belum ada aktivitas yang direkam
                                            oleh sistem.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
