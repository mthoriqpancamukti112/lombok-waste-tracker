import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import DLHLayout from "@/Layouts/DLHLayout";
import {
    DangerTriangle,
    MapPin,
    User,
    Clock9,
    ChevronRight,
    Inbox,
} from "@mynaui/icons-react";
import { toast } from "react-hot-toast";
import { landingDict } from "@/Lang/Landing";

interface Report {
    id: number;
    description: string;
    address: string;
    created_at: string;
    user: { name: string };
}

interface Kaling {
    id: number;
    nama_wilayah: string;
    nama_kaling: string;
}

interface Props extends PageProps {
    unassignedReports: Report[];
    kalings: Kaling[];
}

// === KOMPONEN KARTU LAPORAN ===
const UnassignedReportCard = ({
    report,
    kalings,
    t,
    lang,
}: {
    report: Report;
    kalings: Kaling[];
    t: any;
    lang: string;
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchKaling, setSearchKaling] = useState("");

    const filteredKalings = kalings.filter(
        (k) =>
            k.nama_wilayah.toLowerCase().includes(searchKaling.toLowerCase()) ||
            k.nama_kaling.toLowerCase().includes(searchKaling.toLowerCase()),
    );

    const handleAssignKaling = (reportId: number, kalingId: string) => {
        if (!kalingId) return;

        router.patch(
            route("dlh.reports.assign", reportId),
            { kaling_id: kalingId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t.dlhUnassignedSuccess);
                    setIsDropdownOpen(false);
                },
                onError: () => toast.error(t.dlhUnassignedError),
            },
        );
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

    return (
        <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm hover:shadow-md transition-shadow relative">
            {/* Bagian Atas: Informasi Laporan */}
            <div className="p-5 sm:p-6 w-full">
                <p className="text-base font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                    {report.description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 shrink-0 text-red-500" />
                    <span>
                        {t.dlhUnassignedSystemAddress}{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {report.address || t.dlhUnassignedNotFound}
                        </span>
                    </span>
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50 px-3 py-1.5 rounded-lg">
                        <User className="w-4 h-4 text-indigo-500" />
                        {report.user.name}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50 px-3 py-1.5 rounded-lg">
                        <Clock9 className="w-4 h-4 text-slate-400" />
                        {formatDate(report.created_at)}
                    </span>
                </div>
            </div>

            {/* Garis Pemisah */}
            <div className="w-full h-px bg-slate-100 dark:bg-slate-700/50"></div>

            {/* Bagian Bawah: Aksi / Dropdown (Bergaya Accordion) */}
            <div className="p-4 sm:px-6 sm:py-5 bg-slate-50/50 dark:bg-slate-800/50 w-full rounded-b-2xl">
                <div className="w-full relative z-10">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                    >
                        <span className="truncate">
                            {t.dlhUnassignedSelectKaling}
                        </span>
                        <ChevronRight
                            className={`w-5 h-5 transition-transform duration-300 ${
                                isDropdownOpen ? "rotate-90" : ""
                            }`}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className="mt-4 mb-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                                <input
                                    type="text"
                                    placeholder={
                                        t.dlhUnassignedSearchPlaceholder
                                    }
                                    value={searchKaling}
                                    onChange={(e) =>
                                        setSearchKaling(e.target.value)
                                    }
                                    className="w-full text-xs px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5">
                                {filteredKalings.length === 0 ? (
                                    <div className="px-3 py-8 text-center text-sm font-medium text-slate-400">
                                        {t.dlhUnassignedSearchEmpty}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                        {filteredKalings.map((kaling) => (
                                            <button
                                                key={kaling.id}
                                                onClick={() =>
                                                    handleAssignKaling(
                                                        report.id,
                                                        kaling.id.toString(),
                                                    )
                                                }
                                                className="w-full flex flex-col items-start px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors text-left group border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                                            >
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                                                    {kaling.nama_wilayah}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5" />{" "}
                                                    {kaling.nama_kaling}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {isDropdownOpen && (
                    <div
                        className="fixed inset-0 z-0"
                        onClick={() => setIsDropdownOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

// === HALAMAN UTAMA ===
export default function DLHUnassigned({
    auth,
    unassignedReports,
    kalings,
}: Props) {
    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    useEffect(() => {
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);
    }, []);

    return (
        <DLHLayout
            auth={auth}
            header={
                <div className="flex justify-between items-center w-full animate-in fade-in slide-in-from-top-4 duration-500">
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3 transition-colors">
                        <Inbox className="w-7 h-7 text-red-500" />
                        {t.dlhUnassignedTitle}
                    </h2>
                </div>
            }
        >
            <Head title={t.dlhUnassignedPageTitle} />

            <div className="w-full space-y-6 pb-12">
                {/* Header Informasi */}
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl p-6 md:p-8 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center shrink-0">
                            <DangerTriangle className="w-6 h-6 text-red-600 dark:text-red-400 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-extrabold text-red-700 dark:text-red-400 mb-1">
                                {t.dlhUnassignedAlertTitle}
                            </h3>
                            <p className="text-sm text-red-600/80 dark:text-red-400/80 max-w-4xl leading-relaxed">
                                {t.dlhUnassignedAlertDescPart1}{" "}
                                <strong className="text-red-700 dark:text-red-300">
                                    {unassignedReports.length}{" "}
                                    {t.dlhUnassignedAlertDescPart2}
                                </strong>{" "}
                                {t.dlhUnassignedAlertDescPart3}
                            </p>
                        </div>
                    </div>
                </div>

                {/* List Laporan */}
                {unassignedReports.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                            <Inbox className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                            {t.dlhUnassignedEmptyTitle}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                            {t.dlhUnassignedEmptyDesc}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {unassignedReports.map((report) => (
                            <UnassignedReportCard
                                key={report.id}
                                report={report}
                                kalings={kalings}
                                t={t}
                                lang={lang}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DLHLayout>
    );
}
