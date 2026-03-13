import { useEffect, useState } from "react";
import PetugasLayout from "@/Layouts/PetugasLayout";
import { Head, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";
import {
    Map,
    UsersGroup,
    Clock9,
    Navigation,
    CheckCircleSolid,
    Sparkles,
    Truck,
    DangerTriangle,
    Archive,
    MapPin,
    BriefcaseSolid,
} from "@mynaui/icons-react";
import { landingDict } from "@/Lang/Landing";

interface Report {
    id: number;
    description: string;
    status: string;
    photo_path: string;
    user: { name: string };
    created_at: string;
    latitude: string;
    longitude: string;
    severity_level: string;
    waste_type: string;
    city?: string;
    needs?: string[];
}

interface PetugasProfile {
    id: number;
    jenis_kendaraan: string;
    kapasitas_kg: number;
}

interface Props extends PageProps {
    reports: Report[];
    petugasProfile: PetugasProfile | null;
}

export default function PetugasDashboard({
    auth,
    reports,
    petugasProfile,
}: Props) {
    // === STATE UNTUK BAHASA ===
    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    useEffect(() => {
        // Ambil bahasa dari localStorage jika ada
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);

        AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    }, []);

    useEffect(() => {
        setTimeout(() => {
            AOS.refresh();
        }, 100);
    }, [reports]);

    // Fungsi warna badge keparahan (Disempurnakan untuk Dark Mode)
    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case "tinggi":
            case "high":
                return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800/50";
            case "sedang":
            case "moderate":
                return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800/50";
            case "rendah":
            case "low":
                return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600";
        }
    };

    // Fungsi cerdas update status (Dengan Peringatan Kapasitas)
    const updateStatus = (report: Report, newStatus: string) => {
        const isProses = newStatus === "proses";
        // Cek apakah mode dark sedang aktif untuk tema SweetAlert
        const isDarkMode = document.documentElement.classList.contains("dark");

        let title = "";
        let text = "";
        let icon: any = "";

        if (isProses) {
            title = t.saPetugasStartTitle;

            // Logika Cerdas Peringatan Kapasitas
            if (
                (report.severity_level?.toLowerCase() === "tinggi" ||
                    report.severity_level?.toLowerCase() === "high") &&
                petugasProfile?.jenis_kendaraan === "motor_gerobak"
            ) {
                text = t.saPetugasHighWarningMotor.replace(
                    "{kapasitas}",
                    petugasProfile?.kapasitas_kg.toString() || "0",
                );
                icon = "warning";
            } else if (
                (report.severity_level?.toLowerCase() === "tinggi" ||
                    report.severity_level?.toLowerCase() === "high") &&
                petugasProfile?.jenis_kendaraan === "pickup"
            ) {
                text = t.saPetugasHighWarningPickup.replace(
                    "{kapasitas}",
                    petugasProfile?.kapasitas_kg.toString() || "0",
                );
                icon = "warning";
            } else {
                text = t.saPetugasStartInfo;
                icon = "info";
            }
        } else {
            title = t.saPetugasFinishTitle;
            text = t.saPetugasFinishText;
            icon = "success";
        }

        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            background: isDarkMode ? "#1e293b" : "#ffffff", // Dark bg
            color: isDarkMode ? "#f8fafc" : "#0f172a", // Text color
            showCancelButton: true,
            confirmButtonColor: isProses ? "#3b82f6" : "#a7e94a",
            cancelButtonColor: isDarkMode ? "#64748b" : "#94a3b8",
            confirmButtonText: isProses
                ? t.saPetugasStartConfirm
                : t.saPetugasFinishConfirm,
            cancelButtonText: t.cancel || "Batal",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(
                    route("report.update-status", report.id),
                    { status: newStatus },
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            Swal.fire({
                                title: t.saPetugasSuccessTitle,
                                text: isProses
                                    ? t.saPetugasSuccessProcess
                                    : t.saPetugasSuccessFinish,
                                icon: "success",
                                background: isDarkMode ? "#1e293b" : "#ffffff",
                                color: isDarkMode ? "#f8fafc" : "#0f172a",
                                timer: 2000,
                                showConfirmButton: false,
                            });
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
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
            },
        );
    };

    const openGoogleMaps = (lat: string, lng: string) => {
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            "_blank",
            "noopener,noreferrer",
        );
    };

    return (
        <PetugasLayout
            auth={auth}
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
                    <Truck className="w-6 h-6 text-amber-500" />
                    {t.petugasHeader}
                </h2>
            }
        >
            <Head title={t.petugasTitle} />

            <div className="space-y-6">
                {/* Header Sapaan dgn Animasi */}
                <div
                    data-aos="fade-down"
                    className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-2xl p-8 border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors"
                >
                    <div>
                        <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                            {t.petugasWelcome} {auth.user?.name}!
                            <Sparkles className="w-6 h-6 text-amber-500" />
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            {t.petugasCurrentReports}{" "}
                            <strong className="text-blue-500 dark:text-blue-400">
                                {reports.length} {t.petugasLocationPoints}
                            </strong>{" "}
                            {t.petugasWaitingToClean}
                        </p>
                    </div>
                    {petugasProfile && (
                        <div className="bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-xl flex items-center gap-3 border border-slate-200 dark:border-slate-600 transition-colors">
                            <Truck className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                                    {t.petugasYourFleet}
                                </p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
                                    {petugasProfile.jenis_kendaraan.replace(
                                        "_",
                                        " ",
                                    )}
                                </p>
                            </div>
                            <div className="ml-2 pl-3 border-l border-slate-300 dark:border-slate-600">
                                <p className="text-xs font-bold text-[#86bf36] dark:text-[#a7e94a]">
                                    {petugasProfile.kapasitas_kg} Kg
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Daftar Tugas */}
                {reports.length === 0 ? (
                    <div
                        data-aos="zoom-in"
                        className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-700 mt-6 transition-colors"
                    >
                        <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircleSolid className="w-12 h-12 text-green-500 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                            {t.petugasAllCleanTitle}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            {t.petugasAllCleanDesc}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                        {reports.map((report, index) => (
                            <div
                                key={report.id}
                                data-aos="fade-up"
                                data-aos-delay={50 * index}
                                className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col group ${
                                    report.status === "proses"
                                        ? "border-amber-200 ring-2 ring-amber-100 dark:border-amber-500/50 dark:ring-amber-500/20"
                                        : "border-slate-100 dark:border-slate-700"
                                }`}
                            >
                                <div className="h-52 w-full relative flex-shrink-0 bg-slate-200 dark:bg-slate-700 group">
                                    <img
                                        src={`/storage/${report.photo_path}`}
                                        alt="Lokasi Sampah"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    <div
                                        className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm ${
                                            report.status === "proses"
                                                ? "bg-amber-500 text-amber-950 animate-pulse"
                                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300"
                                        }`}
                                    >
                                        {report.status === "proses"
                                            ? t.petugasStatusProcess
                                            : t.petugasStatusReady}
                                    </div>

                                    {/* --- TOMBOL CEK MAP --- */}
                                    {report.latitude && report.longitude && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="absolute bottom-3 left-3 bg-slate-900/70 hover:bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md border border-white/20 transition-all shadow-lg hover:scale-105"
                                        >
                                            <Map className="w-3.5 h-3.5" />
                                            Cek Map
                                        </a>
                                    )}

                                    {/* CITY BADGE */}
                                    {report.city && (
                                        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 backdrop-blur-md shadow-sm border border-slate-200 dark:border-slate-600 transition-colors">
                                            <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                            {report.city}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    {/* BADGE KEPARAHAN & JENIS SAMPAH */}
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        <span
                                            className={`text-[10px] font-bold border px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wide transition-colors ${getSeverityColor(
                                                report.severity_level,
                                            )}`}
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
                                                .map((type, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wide transition-colors"
                                                    >
                                                        {idx === 0 && (
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

                                    {/* NEEDS BADGE (Kebutuhan Alat) */}
                                    {report.needs &&
                                        report.needs.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {report.needs.map(
                                                    (need, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase transition-colors"
                                                        >
                                                            {idx === 0 && (
                                                                <BriefcaseSolid className="w-2.5 h-2.5" />
                                                            )}
                                                            {need}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                    <h4
                                        className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mb-4 transition-colors"
                                        title={report.description}
                                    >
                                        {report.description || t.petugasNoDesc}
                                    </h4>

                                    <div className="mt-auto space-y-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <UsersGroup className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                                <p className="font-medium line-clamp-1 text-slate-700 dark:text-slate-300">
                                                    {report.user.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock9 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                            <p className="font-medium text-slate-700 dark:text-slate-300 text-xs">
                                                {formatDate(report.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-3 transition-colors">
                                        <button
                                            onClick={() =>
                                                openGoogleMaps(
                                                    report.latitude,
                                                    report.longitude,
                                                )
                                            }
                                            className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Navigation className="w-5 h-5 text-blue-500 dark:text-blue-400" />{" "}
                                            {t.petugasOpenMaps}
                                        </button>

                                        {report.status === "divalidasi" ? (
                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        report,
                                                        "proses",
                                                    )
                                                }
                                                className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-transform hover:-translate-y-0.5 ${
                                                    (report.severity_level?.toLowerCase() ===
                                                        "tinggi" ||
                                                        report.severity_level?.toLowerCase() ===
                                                            "high") &&
                                                    petugasProfile?.jenis_kendaraan ===
                                                        "motor_gerobak"
                                                        ? "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                                                        : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                                                }`}
                                            >
                                                <Truck className="w-5 h-5" />{" "}
                                                {t.petugasStartWork}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        report,
                                                        "selesai",
                                                    )
                                                }
                                                className="w-full flex items-center justify-center gap-2 bg-[#a7e94a] hover:bg-[#92ce40] dark:bg-[#92ce40] dark:hover:bg-[#a7e94a] text-slate-900 font-bold py-3 px-4 rounded-xl shadow-sm transition-transform hover:-translate-y-0.5"
                                            >
                                                <CheckCircleSolid
                                                    className="w-5 h-5"
                                                    strokeWidth={2.5}
                                                />{" "}
                                                {t.petugasMarkClean}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PetugasLayout>
    );
}
