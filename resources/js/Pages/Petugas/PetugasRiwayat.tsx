import { useEffect } from "react";
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
} from "@mynaui/icons-react";

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
}

interface Props extends PageProps {
    reports: Report[];
}

export default function PetugasRiwayat({ auth, reports }: Props) {
    useEffect(() => {
        AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    }, []);

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <PetugasLayout
            auth={auth}
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 flex items-center gap-2">
                    <CheckCircleSolid className="w-6 h-6 text-green-500" />
                    Riwayat Pekerjaan Selesai
                </h2>
            }
        >
            <Head title="Riwayat Pekerjaan" />

            <div className="space-y-6">
                {/* Header Statistik Pencapaian */}
                <div
                    data-aos="fade-down"
                    className="bg-white overflow-hidden shadow-sm sm:rounded-2xl p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6"
                >
                    <div>
                        <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                            Catatan Kinerja Anda
                            <Sparkles className="w-7 h-7 text-yellow-500" />
                        </h3>
                        <p className="text-slate-500 mt-2">
                            Total Anda telah membersihkan{" "}
                            <strong className="text-green-600 text-lg">
                                {reports.length} titik
                            </strong>{" "}
                            tumpukan sampah. Terima kasih atas dedikasi Anda
                            menjaga kebersihan lingkungan!
                        </p>
                    </div>
                </div>

                {/* Daftar Riwayat Selesai */}
                {reports.length === 0 ? (
                    <div
                        data-aos="zoom-in"
                        className="bg-white overflow-hidden shadow-sm sm:rounded-2xl p-16 text-center border border-slate-100"
                    >
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircleSolid className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            Belum Ada Riwayat
                        </h3>
                        <p className="text-slate-500">
                            Anda belum menyelesaikan tugas apa pun. Mulai
                            kerjakan tugas di menu Daftar Tugas.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report, index) => (
                            <div
                                key={report.id}
                                data-aos="fade-up"
                                data-aos-delay={100 * index}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                            >
                                {/* Foto Lokasi & Badge Success */}
                                <div className="h-48 w-full relative flex-shrink-0 bg-slate-200">
                                    <img
                                        src={`/storage/${report.photo_path}`}
                                        alt="Lokasi Sampah"
                                        className="w-full h-full object-cover filter grayscale-[20%]" // Sedikit di-grayscale agar terkesan "masa lalu"
                                    />
                                    {/* Overlay Gradient Hijau Transparan */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent"></div>

                                    <div className="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm bg-green-500 text-white flex items-center gap-1">
                                        <CheckCircleSolid className="w-3 h-3" />{" "}
                                        Tuntas
                                    </div>

                                    <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                                        <Map className="w-3 h-3" />{" "}
                                        {parseFloat(report.latitude).toFixed(4)}
                                        ,{" "}
                                        {parseFloat(report.longitude).toFixed(
                                            4,
                                        )}
                                    </div>
                                </div>

                                {/* Detail Informasi */}
                                <div className="p-6 flex flex-col flex-1">
                                    <h4
                                        className="font-bold text-slate-800 line-clamp-2 mb-4"
                                        title={report.description}
                                    >
                                        {report.description ||
                                            "Lokasi tumpukan sampah."}
                                    </h4>

                                    <div className="mt-auto space-y-2 text-sm text-slate-600 bg-green-50 border border-green-100 p-4 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <UsersGroup className="w-4 h-4 text-green-600" />
                                            <p className="font-medium line-clamp-1">
                                                Dilaporkan: {report.user.name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-green-600" />
                                            <p className="font-medium">
                                                Selesai:{" "}
                                                {formatDateTime(
                                                    report.updated_at,
                                                )}
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
