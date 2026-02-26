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
    latitude: string;
    longitude: string;
}

interface Props extends PageProps {
    reports: Report[];
}

export default function PetugasDashboard({ auth, reports }: Props) {
    // Fungsi untuk memperbarui status
    const updateStatus = (id: number, newStatus: string) => {
        let message =
            newStatus === "proses"
                ? "Mulai kerjakan pembersihan di titik ini?"
                : "Tandai lokasi ini sudah bersih?";

        if (confirm(message)) {
            router.patch(route("report.update-status", id), {
                status: newStatus,
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const openGoogleMaps = (lat: string, lng: string) => {
        window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800">
                    Dashboard Petugas Kebersihan
                </h2>
            }
        >
            <Head title="Dashboard Petugas" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="text-2xl font-extrabold text-slate-800">
                                Semangat bertugas, {auth.user?.name}! 🚛
                            </h3>
                            <p className="text-slate-500 mt-2">
                                Terdapat{" "}
                                <strong className="text-blue-500">
                                    {reports.length} titik lokasi
                                </strong>{" "}
                                yang menunggu untuk dibersihkan hari ini.
                            </p>
                        </div>
                    </div>

                    {/* Daftar Tugas */}
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
                                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Pekerjaan Selesai!
                            </h3>
                            <p className="text-slate-500">
                                Luar biasa! Semua titik tumpukan sampah sudah
                                dibersihkan. Anda bisa beristirahat sejenak.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-shadow hover:shadow-md flex flex-col ${
                                        report.status === "proses"
                                            ? "border-blue-200 ring-2 ring-blue-50/50"
                                            : "border-slate-100"
                                    }`}
                                >
                                    {/* Foto Lokasi & Badge */}
                                    <div className="h-48 w-full relative flex-shrink-0 bg-slate-200">
                                        <img
                                            src={`/storage/${report.photo_path}`}
                                            alt="Lokasi Sampah"
                                            className="w-full h-full object-cover"
                                        />
                                        <div
                                            className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm ${
                                                report.status === "proses"
                                                    ? "bg-blue-500/90 text-white"
                                                    : "bg-orange-100 text-orange-600"
                                            }`}
                                        >
                                            {report.status}
                                        </div>
                                    </div>

                                    {/* Detail Informasi */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <h4
                                            className="font-bold text-slate-800 line-clamp-2 mb-4"
                                            title={report.description}
                                        >
                                            {report.description ||
                                                "Lokasi tumpukan sampah"}
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

                                        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                                            {/* Tombol Rute */}
                                            <button
                                                onClick={() =>
                                                    openGoogleMaps(
                                                        report.latitude,
                                                        report.longitude,
                                                    )
                                                }
                                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                                            >
                                                <span>📍</span> Lihat Rute
                                                Lokasi
                                            </button>

                                            {/* Tombol Aksi Berdasarkan Status */}
                                            {report.status === "divalidasi" ? (
                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            report.id,
                                                            "proses",
                                                        )
                                                    }
                                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all hover:-translate-y-0.5"
                                                >
                                                    🚀 Mulai Kerjakan
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            report.id,
                                                            "selesai",
                                                        )
                                                    }
                                                    className="w-full flex items-center justify-center gap-2 bg-[#a7e94a] hover:bg-[#92ce40] text-slate-900 font-bold py-3 px-4 rounded-xl shadow-sm transition-all hover:-translate-y-0.5"
                                                >
                                                    ✅ Tandai Bersih (Selesai)
                                                </button>
                                            )}
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
