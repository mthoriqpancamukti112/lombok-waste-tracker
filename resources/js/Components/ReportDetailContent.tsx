import React from 'react';
import { MapPin, Message, Plus } from "@mynaui/icons-react";

interface User {
    id: number;
    name: string;
    avatar?: string | null;
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
    onClose: () => void;
    isDark?: boolean;
    formatDate: (d: string) => string;
}

const ReportDetailContent: React.FC<ReportDetailContentProps> = ({
    report,
    onClose,
    isDark = false,
    formatDate,
}) => {
    const bg = isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800';
    const subtle = isDark ? 'text-slate-400' : 'text-slate-500';
    const labelColor = isDark ? 'text-slate-300' : 'text-slate-700';
    const valueColor = isDark ? 'text-slate-400' : 'text-slate-500';
    const commentBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50/80 border-slate-100';

    const urgencyColor = report.severity_level === 'high'
        ? 'border-red-400 text-red-500 bg-red-50'
        : 'border-[#a7e94a] text-[#5a8a1a] bg-[#a7e94a]/10';
    const urgencyLabel = report.severity_level === 'high' ? 'High Urgency' : 'Low Urgency';

    // Masonry heights for visual variation
    const masonryHeights = ['h-48', 'h-64', 'h-52', 'h-40', 'h-56', 'h-44'];

    // Format date & time naturally based on device locale
    const reportDate = new Date(report.created_at);
    const displayDate = reportDate.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const displayTime = reportDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'shortOffset',
    });

    return (
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${bg}`}>
          {/* Header — centered */}
            <div className={`px-8 xl:px-12 pb-5 pt-2 flex items-center justify-center flex-shrink-0${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                    <h2 className="text-lg font-black tracking-tight">
                        {displayDate} &nbsp;&bull;&nbsp; {displayTime}
                    </h2>
                    <span className={`px-3 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-wide ${urgencyColor}`}>
                        {urgencyLabel}
                    </span>
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-10 px-8 xl:px-12 py-8 max-w-[1600px] mx-auto">

                    {/* ═══════════ Column 1: Info ═══════════ */}
                    <div className="flex flex-col gap-7">

                        {/* ── Location ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                {/* Pin icon — inline, no bg box */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a7e94a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                    <circle cx="12" cy="9" r="2.5" />
                                </svg>
                                <span className={`text-sm font-bold ${labelColor}`}>Location</span>
                            </div>
                            <div className="pl-6 space-y-1">
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
                            <p className="pl-6 mt-2.5">
                                <span className="text-sm font-bold text-[#a7e94a]">824 m</span>
                                <span className={`text-sm ml-1.5 ${subtle}`}>from your location</span>
                            </p>
                        </section>

                        {/* ── Description ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                {/* Clipboard / description icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                                <span className={`text-sm font-bold ${labelColor}`}>Description</span>
                            </div>
                            <p className={`pl-6 text-sm leading-relaxed ${subtle}`}>
                                {report.description}
                            </p>
                        </section>

                        {/* ── Needs ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                {/* Exclamation circle icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span className={`text-sm font-bold ${labelColor}`}>Needs</span>
                            </div>
                            <div className="pl-6 flex flex-wrap gap-2">
                                {['Water', 'People', 'Shovel', 'Trash Bin'].map(need => (
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
                            <span className={`text-sm font-bold ${labelColor} block mb-3`}>Reporter</span>
                            <div className={`px-4 py-3 rounded-2xl border flex items-center justify-between ${commentBg}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                        <img
                                            src={report.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.user.name)}&background=e2e8f0&color=64748b&size=64`}
                                            alt={report.user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="text-sm font-bold">{report.user.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <span className="text-xs">Mataram</span>
                                    <MapPin className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ═══════════ Column 2: Image (Masonry) ═══════════ */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black">Image</h3>
                            <button className="flex items-center gap-1.5 px-4 py-2 bg-[#a7e94a] text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-[#a7e94a]/20 transition-all active:scale-95">
                                <Plus className="w-3.5 h-3.5" />
                                Add Image
                            </button>
                        </div>
                        {/* CSS Masonry via columns */}
                        <div className="columns-2 gap-3 [column-fill:_balance]">
                            {[0, 1, 2, 3, 4, 5].map(i => (
                                <div
                                    key={i}
                                    className={`mb-3 break-inside-avoid rounded-2xl overflow-hidden bg-slate-100 group ${masonryHeights[i % masonryHeights.length]}`}
                                >
                                    <img
                                        src={`/storage/${report.photo_path}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt=""
                                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=📷'; }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ═══════════ Column 3: Comment ═══════════ */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black">Comment</h3>
                            <button className="flex items-center gap-1.5 px-4 py-2 bg-[#a7e94a] text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-[#a7e94a]/20 transition-all active:scale-95">
                                <Message className="w-3.5 h-3.5" />
                                Add Comment
                            </button>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`p-4 rounded-2xl border flex flex-col gap-2.5 ${commentBg}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden shrink-0">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=Dominic+Lement&background=cbd5e1&color=475569&size=64`}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-sm font-bold">Dominic L. Ement</span>
                                    </div>
                                    <p className={`text-xs leading-relaxed ${subtle}`}>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-300">
                                        12 January 2025 &bull; 11:23:20 PM (UTC+7)
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailContent;
