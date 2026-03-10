import React, { useMemo } from 'react';
import { MapPin, Message, Plus, Heart, Archive } from "@mynaui/icons-react";
import { useForm, router } from "@inertiajs/react";
import { landingDict } from "@/Lang/Landing";

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

interface ReportDetailContentProps {
    report: Report;
    comments: Comment[];
    isLiked: boolean;
    onClose?: () => void;
    isDark?: boolean;
    formatDate: (d: string) => string;
    lang?: "id" | "en";
}

const AvatarImage = ({ user }: { user: User }) => {
    const src = useMemo(() => user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e2e8f0&color=64748b&size=64`, [user?.avatar, user?.name]);
    return <img src={src} alt={user?.name} className="w-full h-full object-cover" />;
};

const ReportDetailContent: React.FC<ReportDetailContentProps> = ({
    report,
    comments,
    isLiked,
    onClose,
    isDark = false,
    formatDate,
    lang = "id",
}) => {
    const t = landingDict[lang];
    const { data, setData, post, processing, reset, errors } = useForm({
        body: '',
    });

    const bg = isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800';
    const subtle = isDark ? 'text-slate-400' : 'text-slate-500';
    const labelColor = isDark ? 'text-slate-300' : 'text-slate-700';
    const valueColor = isDark ? 'text-slate-400' : 'text-slate-500';
    const commentBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50/80 border-slate-100';

    const urgencyColor = report.severity_level === 'high'
        ? 'border-red-400 text-red-500 bg-red-50'
        : report.severity_level === 'moderate'
            ? 'border-orange-400 text-orange-500 bg-orange-50'
            : 'border-[#a7e94a] text-[#5a8a1a] bg-[#a7e94a]/10';

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.body.trim()) return;
        post(route('comments.store', report.id), {
            preserveScroll: true,
            onSuccess: () => reset('body'),
        });
    };

    const handleLike = () => {
        router.post(route('laporan-publik.like', report.id), {}, {
            preserveScroll: true,
        });
    };

    return (
        <div className={`flex flex-col ${bg}`}>
            {/* Header — centered */}
            <div className={`sticky top-0 z-10 px-8 xl:px-12 pb-5 pt-2 flex items-center justify-center flex-shrink-0 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} ${bg}`}>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                    <h2 className="text-lg font-black tracking-tight">
                        {lang === 'id' ? 'Laporan' : 'Report'} #{report.id} &nbsp;&bull;&nbsp; {formatDate(report.created_at)}
                    </h2>
                    <span className={`px-3 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-wide ${urgencyColor}`}>
                        {report.severity_level === 'high' ? t.urgencyHigh :
                            report.severity_level === 'moderate' ? t.urgencyModerate :
                                t.urgencyLow}
                    </span>
                    <span className={`px-3 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-wide ${report.status === 'selesai' ? 'bg-[#a7e94a]/20 text-ds-primary border-[#a7e94a]/30' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {t.status}: {report.status === 'selesai' ? t.statusCompleted :
                            report.status === 'proses' ? t.statusInProcess :
                                t.statusWaiting}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="pb-28">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-10 px-8 xl:px-12 py-8 max-w-[1600px] mx-auto">

                    {/* ═══════════ Column 1: Info ═══════════ */}
                    <div className="flex flex-col gap-7">

                        {/* ── Location ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="w-4 h-4 shrink-0 text-ds-primary" />
                                <span className={`text-sm font-bold ${labelColor}`}>{t.location}</span>
                            </div>
                            <div className="pl-6 space-y-1">
                                <p className={`text-sm font-bold mb-2 ${valueColor}`}>{report.address || t.addressUnavailable}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-sm font-semibold min-w-[72px] ${labelColor}`}>Latitude</span>
                                    <span className={`text-sm ${labelColor}`}>:</span>
                                    <span className={`text-sm ${valueColor}`}>{report.latitude}</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-sm font-semibold min-w-[72px] ${labelColor}`}>Longitude</span>
                                    <span className={`text-sm ${labelColor}`}>:</span>
                                    <span className={`text-sm ${valueColor}`}>{report.longitude}</span>
                                </div>
                            </div>
                        </section>

                        {/* ── Description ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <Archive className="w-4 h-4 shrink-0 text-slate-400" />
                                <span className={`text-sm font-bold ${labelColor}`}>{t.description}</span>
                            </div>
                            <p className={`pl-6 text-sm leading-relaxed ${subtle} whitespace-pre-wrap`}>
                                {report.description}
                            </p>
                        </section>

                        {/* ── Needs fallback ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span className={`text-sm font-bold ${labelColor}`}>{t.needs}</span>
                            </div>
                            <div className="pl-6 flex flex-wrap gap-2">
                                {[lang === 'id' ? 'Penanganan Segera' : 'Immediate Care', lang === 'id' ? 'Pembersihan' : 'Cleaning'].map(need => (
                                    <span
                                        key={need}
                                        className="px-4 py-1.5 rounded-full text-xs font-bold text-[#5a8a1a] bg-[#a7e94a]/10 border border-[#a7e94a]/20"
                                    >
                                        {need}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* ── Reporter ── */}
                        <section>
                            <span className={`text-sm font-bold ${labelColor} block mb-3`}>{lang === 'id' ? 'Pelapor' : 'Reporter'}</span>
                            <div className={`px-4 py-3 rounded-2xl border flex items-center justify-between ${commentBg}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                        <AvatarImage user={report.user} />
                                    </div>
                                    <span className="text-sm font-bold">{report.user.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <span className="text-xs">{lang === 'id' ? 'Warga Mataram' : 'Residents of Mataram'}</span>
                                    <MapPin className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ═══════════ Column 2: Image ═══════════ */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black">{t.documentation}</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${isLiked ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-500'}`}
                                >
                                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                                    {report.likes_count} {t.likes}
                                </button>
                            </div>
                        </div>
                        <div className="rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm relative group">
                            <img
                                src={`/storage/${report.photo_path}`}
                                className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt={t.documentation}
                                onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/800x600/e2e8f0/94a3b8?text=📷+${encodeURIComponent(t.photoNotFound)}`; }}
                            />
                        </div>
                    </div>

                    {/* ═══════════ Column 3: Comment ═══════════ */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black">{t.discussion} ({comments.length})</h3>
                        </div>

                        {/* New Comment Input */}
                        <form onSubmit={submitComment} className="relative group">
                            <textarea
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                placeholder={t.addComment}
                                className={`w-full p-4 bg-slate-50 border-transparent rounded-[20px] text-xs font-medium focus:bg-white focus:ring-4 focus:ring-ds-primary/10 focus:border-ds-primary transition-all resize-none ${errors.body ? 'ring-2 ring-red-100' : ''}`}
                                rows={2}
                            />
                            <button
                                type="submit"
                                disabled={processing || !data.body.trim()}
                                className="absolute bottom-3 right-3 p-2 bg-ds-primary text-white rounded-xl shadow-md disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </form>

                        <div className="space-y-3 pb-10">
                            {comments.length === 0 ? (
                                <div className="py-10 text-center opacity-40">
                                    <Message className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-xs font-bold uppercase tracking-widest">{t.noDiscussion}</p>
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className={`p-4 rounded-2xl border flex flex-col gap-2.5 transition-all hover:border-ds-primary/20 ${commentBg}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden shrink-0">
                                                <AvatarImage user={comment.user} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold leading-tight">{comment.user.name}</span>
                                                <span className="text-[10px] font-medium text-slate-400 capitalize">
                                                    {formatDate(comment.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className={`text-xs leading-relaxed font-medium ${subtle}`}>
                                            {comment.body}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailContent;
