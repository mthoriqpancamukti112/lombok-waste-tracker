import WargaLayout from "@/Layouts/WargaLayout";
import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
    Plus,
    FileText,
    Clock9,
    CheckCircleSolid,
    Map,
    Sparkles,
    Trash,
} from "@mynaui/icons-react";

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
    // Inisialisasi AOS saat komponen pertama kali di-render
    useEffect(() => {
        AOS.init({
            duration: 800, // Durasi animasi 800ms
            once: true, // Animasi hanya berjalan sekali saat pertama kali muncul
            easing: "ease-out-cubic", // Kurva animasi yang lebih halus
        });
    }, []);

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
        <WargaLayout
            auth={auth}
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800">
                    Dashboard Warga
                </h2>
            }
        >
            <Head title="Dashboard Warga" />

            <div className="space-y-6">
                {/* Header Card dengan efek Fade Down */}
                <div
                    data-aos="fade-down"
                    className="bg-white overflow-hidden shadow-sm sm:rounded-2xl p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6"
                >
                    <div>
                        <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                            Halo, {auth.user?.name}!
                            <Sparkles className="w-6 h-6 text-yellow-500" />
                        </h3>
                        <p className="text-slate-500 mt-2">
                            Terima kasih telah berkontribusi menjaga kebersihan
                            lingkungan kita.
                        </p>
                    </div>
                    <Link
                        href={route("report.create")}
                        className="whitespace-nowrap bg-[#a7e94a] hover:bg-[#92ce40] text-slate-900 font-bold py-3 px-6 rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                        Buat Laporan Baru
                    </Link>
                </div>

                {/* Kartu Statistik dengan efek berurutan (Delay) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Laporan */}
                    <div
                        data-aos="fade-up"
                        data-aos-delay="100"
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <FileText className="w-6 h-6" />
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

                    {/* Menunggu / Proses */}
                    <div
                        data-aos="fade-up"
                        data-aos-delay="200"
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition"
                    >
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                            <Clock9 className="w-6 h-6" />
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

                    {/* Selesai */}
                    <div
                        data-aos="fade-up"
                        data-aos-delay="300"
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#a7e94a]/30 flex items-center justify-center text-slate-800 flex-shrink-0">
                            <CheckCircleSolid className="w-6 h-6 text-[#86bf36]" />
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

                {/* Kontainer Riwayat Laporan dengan efek Fade In */}
                <div
                    data-aos="fade-in"
                    data-aos-delay="400"
                    className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100"
                >
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">
                            Riwayat Laporan Terbaru
                        </h3>
                    </div>

                    {riwayat.length === 0 ? (
                        <div className="p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Trash className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">
                                Belum ada riwayat laporan.
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Mulai laporkan tumpukan sampah di sekitar Anda.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {riwayat.map((report, index) => (
                                <Link
                                    key={report.id}
                                    href={route('report.show', report.id)}
                                    data-aos="fade-left"
                                    data-aos-delay={100 * index}
                                    className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-50 transition-all group"
                                >
                                    <div className="relative">
                                        <img
                                            src={`/storage/${report.photo_path}`}
                                            alt="Foto Laporan"
                                            className="w-20 h-20 rounded-xl object-cover bg-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                                        />
                                        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm
                                            ${report.severity_level === 'high' ? 'bg-red-500' : report.severity_level === 'moderate' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                            <Sparkles className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 line-clamp-2 group-hover:text-ds-primary transition-colors">
                                            {report.description || "Tumpukan Sampah"}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Map className="w-3.5 h-3.5" />
                                                {report.address || `${parseFloat(report.latitude).toFixed(4)}, ${parseFloat(report.longitude).toFixed(4)}`}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock9 className="w-3.5 h-3.5" />
                                                {formatDate(report.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2 sm:mt-0 flex flex-col items-end gap-2">
                                        <span
                                            className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm
                                                ${report.status === "menunggu" ? "bg-red-100 text-red-600 border border-red-200" :
                                                    report.status === "proses" ? "bg-blue-100 text-blue-600 border border-blue-200" :
                                                        report.status === "selesai" ? "bg-[#a7e94a]/30 text-slate-800 border border-[#a7e94a]/50" :
                                                            "bg-slate-100 text-slate-600 border border-slate-200"}`}
                                        >
                                            {report.status === 'menunggu' ? 'Menunggu' :
                                                report.status === 'proses' ? 'Diproses' :
                                                    report.status === 'selesai' ? 'Selesai' :
                                                        report.status === 'ditolak' ? 'Ditolak' : report.status}
                                        </span>
                                        <div className="flex items-center text-[10px] font-bold text-slate-400 group-hover:text-ds-primary transition-colors">
                                            Lihat Detail
                                            <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor font-black"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </WargaLayout>
    );
}
