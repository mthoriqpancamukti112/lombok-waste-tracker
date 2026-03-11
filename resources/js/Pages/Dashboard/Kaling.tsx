import { useEffect, useState } from "react";
import KalingLayout from "@/Layouts/KalingLayout";
import { Head, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";
import {
    CheckCircleSolid,
    X,
    Map,
    Clock9,
    UsersGroup,
    ShieldCheck,
    DangerTriangle,
    Archive,
    InfoCircle,
    UserSquare,
    Telephone,
    MapPin,
    Ribbon,
} from "@mynaui/icons-react";

interface Report {
    id: number;
    description: string;
    status: string;
    photo_path: string;
    user: {
        name: string;
        email: string;
        warga?: {
            no_telp: string | null;
            alamat: string | null;
            poin_kepercayaan: number;
            is_terverifikasi: boolean;
        } | null;
    };
    created_at: string;
    latitude: string;
    longitude: string;
    severity_level: string;
    waste_type: string;
}

interface Props extends PageProps {
    reports: Report[];
    namaWilayah?: string;
}

export default function KalingDashboard({ auth, reports, namaWilayah }: Props) {
    // === STATE UNTUK MODAL ===
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    }, []);

    const handleValidate = (id: number) => {
        Swal.fire({
            title: "Validasi Laporan?",
            text: "Laporan ini akan diteruskan ke Petugas Pengangkut Sampah.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#6366f1",
            cancelButtonColor: "#94a3b8",
            confirmButtonText: "Ya, Validasi!",
            cancelButtonText: "Batal",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(
                    route("report.update-status", id),
                    { status: "divalidasi" },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            Swal.fire({
                                title: "Divalidasi!",
                                text: "Laporan diteruskan ke petugas.",
                                icon: "success",
                                timer: 1500,
                                showConfirmButton: false,
                            });
                            setSelectedReport(null);
                        },
                    },
                );
            }
        });
    };

    const handleReject = (id: number) => {
        Swal.fire({
            title: "Tolak Laporan?",
            text: "Laporan akan ditandai sebagai ditolak/tidak valid dan poin pelapor akan dikurangi.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#94a3b8",
            confirmButtonText: "Ya, Tolak!",
            cancelButtonText: "Batal",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(
                    route("report.update-status", id),
                    { status: "ditolak" },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            Swal.fire({
                                title: "Ditolak!",
                                text: "Laporan telah ditolak dan tidak akan diteruskan.",
                                icon: "info",
                                timer: 2000,
                                showConfirmButton: false,
                            });
                            setSelectedReport(null);
                        },
                    },
                );
            }
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case "tinggi":
                return "bg-red-100 text-red-700 border-red-200";
            case "sedang":
                return "bg-orange-100 text-orange-700 border-orange-200";
            case "rendah":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    return (
        <KalingLayout
            auth={auth}
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-500" />
                    Validasi Wilayah {namaWilayah ? `- ${namaWilayah}` : ""}
                </h2>
            }
        >
            <Head title="Dashboard Kaling" />

            <div className="space-y-6">
                <div
                    data-aos="fade-down"
                    className="bg-white overflow-hidden shadow-sm sm:rounded-2xl p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6"
                >
                    <div>
                        <h3 className="text-2xl font-extrabold text-slate-800">
                            Selamat Bertugas, Bapak/Ibu {auth.user?.name}!
                        </h3>
                        <p className="text-slate-500 mt-2">
                            Saat ini terdapat{" "}
                            <strong className="text-red-500 text-lg">
                                {reports.length} laporan
                            </strong>{" "}
                            warga di wilayah Anda yang membutuhkan verifikasi.
                        </p>
                    </div>
                </div>

                {reports.length === 0 ? (
                    <div
                        data-aos="zoom-in"
                        className="bg-white overflow-hidden shadow-sm sm:rounded-2xl p-16 text-center border border-slate-100"
                    >
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircleSolid className="w-12 h-12 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            Wilayah Anda Terpantau Bersih!
                        </h3>
                        <p className="text-slate-500">
                            Hebat, tidak ada antrean laporan tumpukan sampah
                            yang menunggu validasi saat ini.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {reports.map((report, index) => (
                            <div
                                key={report.id}
                                data-aos="fade-up"
                                data-aos-delay={100 * index}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col group"
                            >
                                <div className="h-56 w-full bg-slate-200 relative flex-shrink-0 overflow-hidden">
                                    <img
                                        src={`/storage/${report.photo_path}`}
                                        alt="Laporan Sampah"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm animate-pulse">
                                        Perlu Validasi
                                    </div>

                                    {/* Tombol Buka Modal Info Detail */}
                                    <button
                                        onClick={() =>
                                            setSelectedReport(report)
                                        }
                                        className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-indigo-600 p-1.5 rounded-full shadow-md hover:bg-indigo-50 hover:scale-110 transition-all border border-indigo-100"
                                        title="Lihat Detail Pelapor"
                                    >
                                        <InfoCircle className="w-5 h-5" />
                                    </button>

                                    {report.latitude && (
                                        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm border border-white/20">
                                            <Map className="w-3 h-3" />{" "}
                                            {parseFloat(
                                                report.latitude,
                                            ).toFixed(4)}
                                            ,{" "}
                                            {parseFloat(
                                                report.longitude,
                                            ).toFixed(4)}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span
                                            className={`text-[10px] font-bold border px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wide ${getSeverityColor(report.severity_level)}`}
                                        >
                                            <DangerTriangle className="w-3 h-3" />{" "}
                                            {report.severity_level ||
                                                "Tidak Diketahui"}
                                        </span>
                                        {report.waste_type ? (
                                            report.waste_type
                                                .split(",")
                                                .map((type, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wide"
                                                    >
                                                        {index === 0 && (
                                                            <Archive className="w-3 h-3" />
                                                        )}
                                                        {type.trim()}
                                                    </span>
                                                ))
                                        ) : (
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wide">
                                                <Archive className="w-3 h-3" />{" "}
                                                Umum
                                            </span>
                                        )}
                                    </div>

                                    <h4
                                        className="font-bold text-slate-800 line-clamp-2 mb-4"
                                        title={report.description}
                                    >
                                        {report.description ||
                                            "Tanpa keterangan tambahan dari pelapor."}
                                    </h4>

                                    <div
                                        className="mt-auto space-y-2 text-sm text-slate-500 bg-slate-50 p-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                                        onClick={() =>
                                            setSelectedReport(report)
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <UsersGroup className="w-4 h-4 text-indigo-400" />
                                            <p className="font-bold line-clamp-1 text-indigo-700">
                                                {report.user.name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock9 className="w-4 h-4 text-slate-400" />
                                            <p className="font-medium text-slate-700">
                                                {formatDate(report.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-2 flex gap-3">
                                        <button
                                            onClick={() =>
                                                handleReject(report.id)
                                            }
                                            className="p-3 text-slate-400 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-xl transition-colors"
                                            title="Tolak Laporan"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleValidate(report.id)
                                            }
                                            className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all hover:-translate-y-0.5"
                                        >
                                            <ShieldCheck
                                                className="w-5 h-5"
                                                strokeWidth={2.5}
                                            />{" "}
                                            Validasi & Teruskan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ================= MODAL DETAIL PELAPOR ================= */}
            {selectedReport && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedReport(null)}
                    ></div>

                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <UserSquare className="w-6 h-6 text-indigo-500" />{" "}
                                Detail Laporan & Warga
                            </h3>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Profil Warga Terpusat */}
                            <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-dashed border-slate-200">
                                <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-black uppercase mb-3 relative">
                                    {selectedReport.user.name.charAt(0)}
                                    {/* Badge Terverifikasi */}
                                    {selectedReport.user.warga
                                        ?.is_terverifikasi && (
                                        <div
                                            className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white"
                                            title="Akun Terverifikasi"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-xl font-bold text-slate-800">
                                    {selectedReport.user.name}
                                </h4>
                                <p className="text-sm text-slate-500">
                                    {selectedReport.user.email}
                                </p>

                                {/* Info Kontak & Reputasi */}
                                <div className="flex flex-wrap justify-center gap-3 mt-4">
                                    {/* Tampilkan Telepon jika ada, jika tidak, tampilkan "Belum diatur" */}
                                    <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                                        <Telephone className="w-3.5 h-3.5" />{" "}
                                        {selectedReport.user.warga?.no_telp ||
                                            "No. HP Belum Diatur"}
                                    </span>

                                    <span className="flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full">
                                        <Ribbon className="w-3.5 h-3.5" />{" "}
                                        {selectedReport.user.warga
                                            ?.poin_kepercayaan || 0}{" "}
                                        Poin
                                    </span>
                                </div>
                            </div>

                            {/* Alamat Warga */}
                            <div className="mb-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> Alamat
                                    Pelapor
                                </p>
                                <p className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">
                                    {selectedReport.user.warga?.alamat ||
                                        "Alamat belum dilengkapi oleh pelapor."}
                                </p>
                            </div>

                            {/* Info Laporan */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        Waktu Dilaporkan
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {formatDate(selectedReport.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        Deskripsi Lengkap
                                    </p>
                                    <p className="text-sm text-slate-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-50 whitespace-pre-wrap">
                                        {selectedReport.description ||
                                            "Tidak ada deskripsi tambahan dari pelapor."}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                            Keparahan
                                        </p>
                                        <span
                                            className={`text-[10px] font-bold border px-2 py-0.5 rounded flex items-center w-fit uppercase ${getSeverityColor(selectedReport.severity_level)}`}
                                        >
                                            {selectedReport.severity_level ||
                                                "Tidak Diketahui"}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                            Jenis Sampah
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedReport.waste_type ? (
                                                selectedReport.waste_type
                                                    .split(",")
                                                    .map((type, index) => (
                                                        <span
                                                            key={index}
                                                            className="text-[10px] font-bold bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center w-fit uppercase"
                                                        >
                                                            {type.trim()}
                                                        </span>
                                                    ))
                                            ) : (
                                                <span className="text-[10px] font-bold bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center w-fit uppercase">
                                                    Umum
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex gap-3">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="flex-1 py-2.5 font-bold text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() =>
                                    handleValidate(selectedReport.id)
                                }
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <ShieldCheck className="w-5 h-5" /> Validasi
                                Laporan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </KalingLayout>
    );
}
