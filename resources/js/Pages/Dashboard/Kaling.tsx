import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { PageProps } from "@/types";

interface Report {
    id: number;
    description: string;
    status: string;
    photo_path: string;
    user: { name: string };
    created_at: string;
}

interface Props extends PageProps {
    reports: Report[];
}

export default function KalingDashboard({ auth, reports }: Props) {
    const handleValidate = (id: number) => {
        if (
            confirm(
                "Apakah Anda yakin laporan ini valid dan siap diteruskan ke Petugas Lapangan?",
            )
        ) {
            router.patch(route("report.update-status", id), {
                status: "divalidasi",
            });
        }
    };

    // Format Tanggal
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800">
                    Dashboard Kepala Lingkungan
                </h2>
            }
        >
            <Head title="Dashboard Kaling" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="text-2xl font-extrabold text-slate-800">
                                Halo, {auth.user?.name}! 👋
                            </h3>
                            <p className="text-slate-500 mt-2">
                                Saat ini ada{" "}
                                <strong className="text-red-500">
                                    {reports.length} laporan
                                </strong>{" "}
                                warga yang membutuhkan tinjauan dan validasi
                                Anda.
                            </p>
                        </div>
                    </div>

                    {/* Daftar Laporan (Menunggu Validasi) */}
                    {reports.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl p-12 text-center border border-slate-100">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-10 h-10 text-green-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Semua Bersih!
                            </h3>
                            <p className="text-slate-500">
                                Hebat, tidak ada tumpukan sampah yang menunggu
                                validasi di wilayah Anda saat ini.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                                >
                                    {/* Foto Laporan dengan Badge Melayang */}
                                    <div className="h-52 w-full bg-slate-200 relative flex-shrink-0">
                                        <img
                                            src={`/storage/${report.photo_path}`}
                                            alt="Laporan Sampah"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-3 right-3 bg-red-100 text-red-600 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
                                            Menunggu
                                        </div>
                                    </div>

                                    {/* Detail Informasi */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <h4
                                            className="font-bold text-slate-800 line-clamp-2 mb-4"
                                            title={report.description}
                                        >
                                            {report.description ||
                                                "Tanpa keterangan tambahan"}
                                        </h4>

                                        <div className="mt-auto space-y-2 text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">
                                            <div className="flex items-start gap-2">
                                                <span className="text-lg leading-none">
                                                    👤
                                                </span>
                                                <p className="font-medium line-clamp-1">
                                                    {report.user.name}
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-lg leading-none">
                                                    🕒
                                                </span>
                                                <p className="font-medium">
                                                    {formatDate(
                                                        report.created_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tombol Aksi */}
                                        <div className="mt-6 pt-2">
                                            <button
                                                onClick={() =>
                                                    handleValidate(report.id)
                                                }
                                                className="w-full flex justify-center items-center gap-2 bg-[#a7e94a] hover:bg-[#92ce40] text-slate-900 font-bold py-3 px-4 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
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
                                                        d="M4.5 12.75l6 6 9-13.5"
                                                    />
                                                </svg>
                                                Validasi Laporan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
