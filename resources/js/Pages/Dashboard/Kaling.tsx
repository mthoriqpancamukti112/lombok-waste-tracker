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
import { landingDict } from "@/Lang/Landing";

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
    // === STATE UNTUK BAHASA ===
    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    // === STATE UNTUK MODAL ===
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        // Ambil bahasa dari localStorage jika ada
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);

        AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    }, []);

    // Fungsi pembantu untuk mengambil tema Swal
    const getSwalConfig = () => {
        const isDarkMode = document.documentElement.classList.contains("dark");
        return {
            background: isDarkMode ? "#1e293b" : "#ffffff",
            color: isDarkMode ? "#f8fafc" : "#0f172a",
        };
    };

    const handleValidate = (id: number) => {
        const swalTheme = getSwalConfig();
        const isDarkMode = document.documentElement.classList.contains("dark");

        Swal.fire({
            title: t.saValidateTitle,
            text: t.saValidateText,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#6366f1",
            cancelButtonColor: isDarkMode ? "#64748b" : "#94a3b8",
            confirmButtonText: t.saValidateConfirm,
            cancelButtonText: t.saValidateCancel,
            reverseButtons: true,
            ...swalTheme,
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(
                    route("report.update-status", id),
                    { status: "divalidasi" },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            Swal.fire({
                                title: t.saValidatedTitle,
                                text: t.saValidatedText,
                                icon: "success",
                                timer: 1500,
                                showConfirmButton: false,
                                ...swalTheme,
                            });
                            setSelectedReport(null);
                        },
                    },
                );
            }
        });
    };

    const handleReject = (id: number) => {
        const swalTheme = getSwalConfig();
        const isDarkMode = document.documentElement.classList.contains("dark");

        Swal.fire({
            title: t.saRejectTitle,
            text: t.saRejectText,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: isDarkMode ? "#64748b" : "#94a3b8",
            confirmButtonText: t.saRejectConfirm,
            cancelButtonText: t.saValidateCancel,
            reverseButtons: true,
            ...swalTheme,
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(
                    route("report.update-status", id),
                    { status: "ditolak" },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            Swal.fire({
                                title: t.saRejectedTitle,
                                text: t.saRejectedText,
                                icon: "info",
                                timer: 2000,
                                showConfirmButton: false,
                                ...swalTheme,
                            });
                            setSelectedReport(null);
                        },
                    },
                );
            }
        });
    };

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

    // FUNGSI WARNA YANG SUDAH DUKUNG DARK MODE
    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case "tinggi":
            case "high":
                return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
            case "sedang":
            case "moderate":
                return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50";
            case "rendah":
            case "low":
                return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
        }
    };

    return (
        <KalingLayout
            auth={auth}
            header={
                // PERBAIKAN RESPONSIVITAS HEADER: flex-1 dan min-w-0
                <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-top-4 duration-500 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 transition-colors">
                        <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <h2 className="text-base sm:text-xl lg:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate transition-colors">
                            {t.kalingValidateRegion}
                        </h2>
                        {namaWilayah && (
                            // Ditambahkan class 'hidden sm:block' agar teks panjang HILANG di HP
                            <p className="hidden sm:block text-xs lg:text-sm text-indigo-600 dark:text-indigo-400 font-bold truncate transition-colors mt-0.5">
                                {namaWilayah}
                            </p>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={t.kalingTitle} />

            <div className="space-y-6">
                <div
                    data-aos="fade-down"
                    className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start sm:items-center gap-4 transition-colors"
                >
                    <div>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 transition-colors">
                            {t.kalingWelcome} {auth.user?.name}!
                        </h3>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                            {t.kalingCurrentReports}{" "}
                            <strong className="text-red-500 dark:text-red-400 text-lg transition-colors">
                                {reports.length} {t.kalingReportsCount}
                            </strong>{" "}
                            {t.kalingNeedsVerification}
                        </p>
                    </div>
                </div>

                {reports.length === 0 ? (
                    <div
                        data-aos="zoom-in"
                        className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-2xl p-12 sm:p-16 text-center border border-slate-100 dark:border-slate-700 transition-colors"
                    >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                            <CheckCircleSolid className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 dark:text-green-400 transition-colors" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 mb-2 transition-colors">
                            {t.kalingAllCleanTitle}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 transition-colors">
                            {t.kalingAllCleanDesc}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {reports.map((report, index) => (
                            <div
                                key={report.id}
                                data-aos="fade-up"
                                data-aos-delay={100 * index}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all hover:-translate-y-1 flex flex-col group"
                            >
                                <div className="h-56 w-full bg-slate-200 dark:bg-slate-700 relative flex-shrink-0 overflow-hidden transition-colors">
                                    <img
                                        src={`/storage/${report.photo_path}`}
                                        alt="Laporan Sampah"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm animate-pulse">
                                        {t.kalingNeedValidationBadge}
                                    </div>

                                    {/* Tombol Buka Modal Info Detail */}
                                    <button
                                        onClick={() =>
                                            setSelectedReport(report)
                                        }
                                        className="absolute top-3 left-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 p-1.5 rounded-full shadow-md hover:bg-indigo-50 dark:hover:bg-slate-700 hover:scale-110 transition-all border border-indigo-100 dark:border-slate-600"
                                        title={t.kalingDetailTooltip}
                                    >
                                        <InfoCircle className="w-5 h-5" />
                                    </button>

                                    {/* Tombol Cek Map */}
                                    {report.latitude && report.longitude && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute bottom-3 left-3 bg-slate-900/70 hover:bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md border border-white/20 transition-all shadow-lg hover:scale-105"
                                        >
                                            <Map className="w-3.5 h-3.5" />
                                            Cek Map
                                        </a>
                                    )}
                                </div>

                                <div className="p-5 sm:p-6 flex flex-col flex-1">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span
                                            className={`text-[10px] font-bold border px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wide transition-colors ${getSeverityColor(report.severity_level)}`}
                                        >
                                            <DangerTriangle className="w-3 h-3" />{" "}
                                            {report.severity_level ===
                                                "tinggi" ||
                                            report.severity_level === "high"
                                                ? t.urgencyHigh
                                                : report.severity_level ===
                                                        "sedang" ||
                                                    report.severity_level ===
                                                        "moderate"
                                                  ? t.urgencyModerate
                                                  : report.severity_level ===
                                                          "rendah" ||
                                                      report.severity_level ===
                                                          "low"
                                                    ? t.urgencyLow
                                                    : report.severity_level ||
                                                      t.kalingUnknownSeverity}
                                        </span>
                                        {report.waste_type ? (
                                            report.waste_type
                                                .split(",")
                                                .map((type, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wide transition-colors"
                                                    >
                                                        {index === 0 && (
                                                            <Archive className="w-3 h-3" />
                                                        )}
                                                        {type.trim()}
                                                    </span>
                                                ))
                                        ) : (
                                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wide transition-colors">
                                                <Archive className="w-3 h-3" />{" "}
                                                {t.kalingGeneralWaste}
                                            </span>
                                        )}
                                    </div>

                                    <h4
                                        className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mb-4 transition-colors"
                                        title={report.description}
                                    >
                                        {report.description || t.kalingNoDesc}
                                    </h4>

                                    <div
                                        className="mt-auto space-y-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                                        onClick={() =>
                                            setSelectedReport(report)
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <UsersGroup className="w-4 h-4 text-indigo-400 shrink-0" />
                                            <p className="font-bold line-clamp-1 text-indigo-700 dark:text-indigo-400 transition-colors">
                                                {report.user.name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock9 className="w-4 h-4 text-slate-400 shrink-0" />
                                            <p className="font-medium text-slate-700 dark:text-slate-300 transition-colors truncate">
                                                {formatDate(report.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 sm:mt-6 pt-2 flex gap-2 sm:gap-3">
                                        <button
                                            onClick={() =>
                                                handleReject(report.id)
                                            }
                                            className="p-2.5 sm:p-3 text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors"
                                            title={t.kalingRejectReport}
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleValidate(report.id)
                                            }
                                            className="flex-1 flex justify-center items-center gap-1 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm sm:text-base font-bold py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl shadow-sm transition-all hover:-translate-y-0.5"
                                        >
                                            <ShieldCheck
                                                className="w-5 h-5 shrink-0"
                                                strokeWidth={2.5}
                                            />{" "}
                                            <span className="truncate">
                                                {t.kalingValidateAndForward}
                                            </span>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedReport(null)}
                    ></div>

                    <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700 transition-colors flex flex-col max-h-[90vh]">
                        {/* Header Modal */}
                        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md transition-colors shrink-0">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors truncate">
                                <UserSquare className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400 shrink-0" />{" "}
                                <span className="truncate">
                                    {t.kalingModalTitle}
                                </span>
                            </h3>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 sm:p-2 rounded-xl transition-colors shrink-0 ml-2"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
                            {/* Profil Warga Terpusat */}
                            <div className="flex flex-col items-center text-center mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-dashed border-slate-200 dark:border-slate-700 transition-colors">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-2xl sm:text-3xl font-black uppercase mb-3 relative shadow-inner transition-colors">
                                    {selectedReport.user.name.charAt(0)}
                                    {selectedReport.user.warga
                                        ?.is_terverifikasi && (
                                        <div
                                            className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-800 transition-colors"
                                            title={t.verifiedAccount}
                                        >
                                            <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors px-2">
                                    {selectedReport.user.name}
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors px-2 break-all">
                                    {selectedReport.user.email}
                                </p>

                                {/* Info Kontak & Reputasi */}
                                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                                    <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors">
                                        <Telephone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                                        {selectedReport.user.warga?.no_telp ||
                                            t.kalingNoPhone}
                                    </span>

                                    <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors">
                                        <Ribbon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                                        {selectedReport.user.warga
                                            ?.poin_kepercayaan || 0}{" "}
                                        {t.point}
                                    </span>
                                </div>
                            </div>

                            {/* Alamat Warga */}
                            <div className="mb-4 sm:mb-5">
                                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1 transition-colors">
                                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                                    {t.kalingReporterAddress}
                                </p>
                                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 px-3 py-2 rounded-lg transition-colors">
                                    {selectedReport.user.warga?.alamat ||
                                        t.kalingNoAddress}
                                </p>
                            </div>

                            {/* Info Laporan */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 transition-colors">
                                        {t.kalingReportTime}
                                    </p>
                                    <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors">
                                        {formatDate(selectedReport.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 transition-colors">
                                        {t.kalingFullDesc}
                                    </p>
                                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-50 dark:border-indigo-900/20 whitespace-pre-wrap transition-colors">
                                        {selectedReport.description ||
                                            t.kalingNoDesc}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 transition-colors">
                                            {t.kalingSeverity}
                                        </p>
                                        <span
                                            className={`text-[9px] sm:text-[10px] font-bold border px-2 py-0.5 rounded flex items-center w-fit uppercase transition-colors ${getSeverityColor(selectedReport.severity_level)}`}
                                        >
                                            {selectedReport.severity_level ===
                                                "tinggi" ||
                                            selectedReport.severity_level ===
                                                "high"
                                                ? t.urgencyHigh
                                                : selectedReport.severity_level ===
                                                        "sedang" ||
                                                    selectedReport.severity_level ===
                                                        "moderate"
                                                  ? t.urgencyModerate
                                                  : selectedReport.severity_level ===
                                                          "rendah" ||
                                                      selectedReport.severity_level ===
                                                          "low"
                                                    ? t.urgencyLow
                                                    : selectedReport.severity_level ||
                                                      t.kalingUnknownSeverity}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 transition-colors">
                                            {t.kalingWasteType}
                                        </p>
                                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                            {selectedReport.waste_type ? (
                                                selectedReport.waste_type
                                                    .split(",")
                                                    .map((type, index) => (
                                                        <span
                                                            key={index}
                                                            className="text-[9px] sm:text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded flex items-center w-fit uppercase transition-colors"
                                                        >
                                                            {type.trim()}
                                                        </span>
                                                    ))
                                            ) : (
                                                <span className="text-[9px] sm:text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded flex items-center w-fit uppercase transition-colors">
                                                    {t.kalingGeneralWaste}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 flex gap-2 sm:gap-3 transition-colors shrink-0">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="flex-1 py-2 sm:py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            >
                                {t.kalingCloseModal}
                            </button>
                            <button
                                onClick={() =>
                                    handleValidate(selectedReport.id)
                                }
                                className="flex-[2] sm:flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm sm:text-base font-bold py-2 sm:py-2.5 rounded-xl shadow-sm transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />{" "}
                                <span className="truncate">
                                    {t.kalingValidateBtn}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </KalingLayout>
    );
}
