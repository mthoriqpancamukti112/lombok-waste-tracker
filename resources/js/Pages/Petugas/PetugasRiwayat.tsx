import { useEffect, useState } from "react";
import PetugasLayout from "@/Layouts/PetugasLayout";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";
import AOS from "aos";
import "aos/dist/aos.css";
import {
    Map,
    UsersGroup,
    CheckCircleSolid,
    Calendar,
    Sparkles,
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
    updated_at: string; // Menggunakan updated_at untuk waktu selesai
    latitude: string;
    longitude: string;
    severity_level: string; // Ditambahkan
    waste_type: string; // Ditambahkan
    city?: string; // Ditambahkan
    needs?: string[]; // Ditambahkan
}

interface Props extends PageProps {
    reports: Report[];
}

export default function PetugasRiwayat({ auth, reports }: Props) {
    // === STATE UNTUK BAHASA ===
    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    useEffect(() => {
        // Ambil bahasa dari localStorage jika ada
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);

        AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    }, []);

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(
            lang === "id" ? "id-ID" : "en-US",
            {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            },
        );
    };

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

    return (
        <PetugasLayout
            auth={auth}
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
                    <CheckCircleSolid className="w-6 h-6 text-green-500" />
                    {t.petugasHistoryTitle}
                </h2>
            }
        >
            <Head title={t.petugasHistoryTitle} />

            <div className="space-y-6">
                {/* Header Statistik Pencapaian */}
                <div
                    data-aos="fade-down"
                    className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-2xl p-8 border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors"
                >
                    <div>
                        <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                            {t.petugasHistoryHeader}
                            <Sparkles className="w-7 h-7 text-yellow-500" />
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            {t.petugasTotalCleaned}{" "}
                            <strong className="text-green-600 dark:text-green-400 text-lg">
                                {reports.length} {t.petugasPointsCleaned}
                            </strong>{" "}
                            {t.petugasThanksDedication}
                        </p>
                    </div>
                </div>

                {/* Daftar Riwayat Selesai */}
                {reports.length === 0 ? (
                    <div
                        data-aos="zoom-in"
                        className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-700 transition-colors"
                    >
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                            <CheckCircleSolid className="w-12 h-12 text-slate-300 dark:text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                            {t.petugasNoHistoryTitle}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            {t.petugasNoHistoryDesc}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report, index) => (
                            <div
                                key={report.id}
                                data-aos="fade-up"
                                data-aos-delay={100 * index}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all flex flex-col"
                            >
                                {/* Foto Lokasi & Badge Success */}
                                <div className="h-48 w-full relative flex-shrink-0 bg-slate-200 dark:bg-slate-700">
                                    <img
                                        src={`/storage/${report.photo_path}`}
                                        alt="Lokasi Sampah"
                                        className="w-full h-full object-cover filter grayscale-[20%]" // Sedikit di-grayscale agar terkesan "masa lalu"
                                    />
                                    {/* Overlay Gradient Hijau Transparan */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 dark:from-green-900/60 to-transparent"></div>

                                    <div className="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm bg-green-500 text-white flex items-center gap-1">
                                        <CheckCircleSolid className="w-3 h-3" />{" "}
                                        {t.petugasDoneBadge}
                                    </div>

                                    <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                                        <Map className="w-3 h-3" />{" "}
                                        {parseFloat(report.latitude).toFixed(4)}
                                        ,{" "}
                                        {parseFloat(report.longitude).toFixed(
                                            4,
                                        )}
                                    </div>

                                    {/* CITY BADGE (opsional, ditaruh di pojok kanan bawah jika ada) */}
                                    {report.city && (
                                        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 backdrop-blur-md shadow-sm border border-slate-200 dark:border-slate-600 transition-colors">
                                            <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                            {report.city}
                                        </div>
                                    )}
                                </div>

                                {/* Detail Informasi */}
                                <div className="p-6 flex flex-col flex-1">
                                    {/* BADGE KEPARAHAN & JENIS SAMPAH */}
                                    <div className="flex flex-wrap gap-1.5 mb-3 opacity-80">
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

                                    {/* NEEDS BADGE (Kebutuhan Alat - Opsional ditampilkan di Riwayat) */}
                                    {report.needs &&
                                        report.needs.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3 opacity-80">
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

                                    <div className="mt-auto space-y-2 text-sm text-slate-600 dark:text-slate-300 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 p-4 rounded-xl transition-colors">
                                        <div className="flex items-center gap-2">
                                            <UsersGroup className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            <p className="font-medium line-clamp-1">
                                                {t.petugasReportedBy}{" "}
                                                <span className="dark:text-slate-200">
                                                    {report.user.name}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            <p className="font-medium">
                                                {t.petugasFinishedAt}{" "}
                                                <span className="dark:text-slate-200">
                                                    {formatDateTime(
                                                        report.updated_at,
                                                    )}
                                                </span>
                                            </p>
                                        </div>
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
