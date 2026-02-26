import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@/types";

interface DashboardProps extends PageProps {
    stats: {
        total: number;
        menunggu: number;
        selesai: number;
    };
    riwayat: any[];
}

export default function WargaDashboard({
    auth,
    stats,
    riwayat,
}: DashboardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
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
                <h2 className="text-xl font-bold leading-tight text-slate-800">
                    Dashboard Warga
                </h2>
            }
        >
            <Head title="Dashboard Warga" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="text-2xl font-extrabold text-slate-800">
                                Halo, {auth.user?.name}! 👋
                            </h3>
                            <p className="text-slate-500 mt-2">
                                Terima kasih telah berkontribusi menjaga
                                kebersihan lingkungan kita.
                            </p>
                        </div>
                        <Link
                            href={route("report.create")}
                            className="whitespace-nowrap bg-[#a7e94a] hover:bg-[#92ce40] text-slate-900 font-bold py-3 px-6 rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>
                            Buat Laporan Baru
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">
                                    Total Laporan Anda
                                </p>
                                <p className="text-2xl font-black text-slate-800">
                                    {stats.total}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">
                                    Sedang Diproses
                                </p>
                                <p className="text-2xl font-black text-slate-800">
                                    {stats.menunggu}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
                            <div className="w-12 h-12 rounded-full bg-[#a7e94a]/30 flex items-center justify-center text-slate-800 flex-shrink-0">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">
                                    Laporan Selesai
                                </p>
                                <p className="text-2xl font-black text-slate-800">
                                    {stats.selesai}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                Riwayat Laporan Terbaru
                            </h3>
                        </div>

                        {riwayat.length === 0 ? (
                            <div className="p-10 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        className="w-8 h-8 text-slate-400"
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
                                </div>
                                <p className="text-slate-500 font-medium">
                                    Belum ada riwayat laporan.
                                </p>
                                <p className="text-sm text-slate-400 mt-1">
                                    Mulai laporkan tumpukan sampah di sekitar
                                    Anda.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {riwayat.map((report) => (
                                    <div
                                        key={report.id}
                                        className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <img
                                            src={`/storage/${report.photo_path}`}
                                            alt="Foto Laporan"
                                            className="w-20 h-20 rounded-xl object-cover bg-slate-200 flex-shrink-0"
                                        />

                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 line-clamp-2">
                                                {report.description ||
                                                    "Tumpukan Sampah"}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
                                                <span>
                                                    📍{" "}
                                                    {parseFloat(
                                                        report.latitude,
                                                    ).toFixed(4)}
                                                    ,{" "}
                                                    {parseFloat(
                                                        report.longitude,
                                                    ).toFixed(4)}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    🕒{" "}
                                                    {formatDate(
                                                        report.created_at,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-2 sm:mt-0">
                                            <span
                                                className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full
                                                ${
                                                    report.status === "menunggu"
                                                        ? "bg-red-100 text-red-600"
                                                        : report.status ===
                                                                "proses" ||
                                                            report.status ===
                                                                "divalidasi"
                                                          ? "bg-blue-100 text-blue-600"
                                                          : "bg-[#a7e94a] text-slate-900"
                                                }`}
                                            >
                                                {report.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
