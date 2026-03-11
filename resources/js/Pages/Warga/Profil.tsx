import React from "react";
import { Head, Link } from "@inertiajs/react";
import WargaLayout from "@/Layouts/WargaLayout";
import {
    Clock9,
    Heart,
    MessageX,
    ShieldCheck,
    Map,
    ChevronLeft,
    Check
} from "@mynaui/icons-react";

interface Comment {
    id: number;
    body: string;
    created_at: string;
    user: { name: string };
    replies?: Comment[];
}

interface Like {
    id: number;
    user_id: number;
}

interface Report {
    id: number;
    description: string;
    photo_path: string;
    status: string;
    latitude: string;
    longitude: string;
    created_at: string;
    likes: Like[];
    comments: Comment[];
}

interface Props {
    auth: any;
    profileUser: {
        id: number;
        name: string;
        avatar?: string;
        warga?: {
            is_terverifikasi: boolean;
            poin_kepercayaan: number;
        };
    };
    reports: Report[];
}

const PostCard = ({ report }: { report: Report }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6 group hover:shadow-md transition-all duration-300">
            <div className="p-4 flex justify-between items-center border-b border-slate-50">
                <div className="flex items-center gap-2">
                    <Clock9 className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">{formatDate(report.created_at)}</span>
                </div>
                <span className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full 
                    ${report.status === 'selesai' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                    {report.status}
                </span>
            </div>

            <div className="p-4">
                <p className="text-sm text-slate-700 leading-relaxed mb-4 line-clamp-3">
                    {report.description}
                </p>

                <div className="w-full h-64 bg-slate-50 rounded-xl overflow-hidden relative">
                    <img
                        src={`/storage/${report.photo_path}`}
                        alt="Report"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/20">
                        <Map className="w-3.5 h-3.5" />
                        {parseFloat(report.latitude).toFixed(4)}, {parseFloat(report.longitude).toFixed(4)}
                    </div>
                </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-50 flex gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                    {report.likes.length} Dukungan
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <MessageX className="w-4 h-4 text-emerald-500" />
                    {report.comments.length} Diskusi
                </div>
            </div>
        </div>
    );
};

export default function Profil({ auth, profileUser, reports }: Props) {
    return (
        <WargaLayout
            auth={auth}
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('laporan-publik.index')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-600" />
                    </Link>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Profil Warga</h2>
                        <p className="text-xs text-slate-500">Informasi dan kontribusi warga untuk Mataram.</p>
                    </div>
                </div>
            }
        >
            <Head title={`Profil ${profileUser.name}`} />

            <div className="max-w-2xl mx-auto py-8 px-4">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-10 text-center relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-400 to-[#a7e94a] opacity-10"></div>

                    <div className="relative">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white p-1.5 shadow-xl mx-auto mb-4 border border-slate-100">
                            <div className="w-full h-full rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-3xl sm:text-5xl overflow-hidden">
                                {profileUser.avatar ? (
                                    <img src={profileUser.avatar} className="w-full h-full object-cover" alt={profileUser.name} />
                                ) : (
                                    profileUser.name.charAt(0)
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-1">
                            <h1 className="text-2xl font-black text-slate-800">{profileUser.name}</h1>
                            {profileUser.warga?.is_terverifikasi && (
                                <ShieldCheck className="w-6 h-6 text-blue-500" strokeWidth={2.5} />
                            )}
                        </div>

                        <p className="text-slate-500 text-sm font-medium mb-6">
                            Warga Mataram &nbsp;&bull;&nbsp;
                            <span className="text-emerald-600 font-bold ml-1">
                                {profileUser.warga?.poin_kepercayaan || 0} Poin Kepercayaan
                            </span>
                        </p>

                        <div className="flex justify-center gap-8 sm:gap-12 py-6 border-t border-slate-50">
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-800">{reports.length}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Postingan</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-800">
                                    {reports.reduce((acc, r) => acc + r.likes.length, 0)}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dukungan</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-800 border-b-4 border-emerald-400 inline-block">
                                    {profileUser.warga?.is_terverifikasi ? 'Yes' : 'No'}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Postings Section */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        Semua Postingan
                    </h3>

                    {reports.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                            <p className="text-slate-400 font-bold">Belum ada postingan laporan.</p>
                        </div>
                    ) : (
                        reports.map(report => (
                            <PostCard key={report.id} report={report} />
                        ))
                    )}
                </div>
            </div>
        </WargaLayout>
    );
}
