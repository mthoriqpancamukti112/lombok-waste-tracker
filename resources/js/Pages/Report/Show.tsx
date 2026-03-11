import WargaLayout from "@/Layouts/WargaLayout";
import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import { ArrowLeft } from "@mynaui/icons-react";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import ReportDetailContent from "@/Components/ReportDetailContent";

interface User {
    id: number;
    name: string;
    avatar?: string | null;
}

interface Comment {
    id: number;
    body: string;
    user: User;
    created_at: string;
}

interface Report {
    id: number;
    latitude: string;
    longitude: string;
    description: string;
    status: string;
    severity_level?: string;
    waste_type?: string;
    address?: string;
    photo_path: string;
    user: User;
    likes_count: number;
    comments_count: number;
    created_at: string;
}

interface Props extends PageProps {
    report: Report;
    comments: Comment[];
    isLiked: boolean;
}

export default function Show({ auth, report, comments, isLiked }: Props) {
    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <WargaLayout
            auth={auth}
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('dashboard.warga')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <h2 className="text-xl font-black leading-tight text-slate-800">
                        Detail Laporan #{report.id}
                    </h2>
                </div>
            }
        >
            <Head title={`Detail Laporan #${report.id}`} />

            <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
                <div className="px-6 py-4">
                    <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-ds-primary transition-colors group">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Beranda
                    </Link>
                </div>

                <div className="flex-1 bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-10">
                    <ReportDetailContent
                        report={report}
                        comments={comments}
                        isLiked={isLiked}
                        formatDate={formatDate}
                        isDark={false}
                    />
                </div>
            </div>
        </WargaLayout>
    );
}
