import React, { useState, useMemo } from "react";
import { Search, X, Heart, Message, MapPin } from "@mynaui/icons-react";
import { Link } from "@inertiajs/react";

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
    user: { id: number; name: string; avatar?: string | null };
    likes_count: number;
    comments_count: number;
    created_at: string;
}

interface ReportListContentProps {
    reports: Report[];
    formatDate: (d: string) => string;
    onClose?: () => void;
    isDark?: boolean;
    currentUserId?: number;
    onAuthRequired?: () => void;
    onSelectReport?: (id: number) => void;
}

const filterOptions = [
    { label: "All Report", value: "all" },
    { label: "Low Urgency", value: "low" },
    { label: "High Urgency", value: "high" },
    { label: "Nearest", value: "nearest" },
    { label: "Completed", value: "selesai" },
];

const AvatarImage = ({ user }: { user: { name: string; avatar?: string | null } }) => {
    const src = useMemo(() => user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e2e8f0&color=64748b&size=64`, [user?.avatar, user?.name]);
    return <img src={src} alt={user?.name} className="w-full h-full object-cover" />;
};

const ReportListContent: React.FC<ReportListContentProps> = ({
    reports,
    formatDate,
    onClose,
    isDark,
    currentUserId,
    onAuthRequired,
    onSelectReport,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const filteredReports = reports.filter(r => {
        const matchesSearch = r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.address ?? "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === "all" || r.status === activeFilter || r.severity_level === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const bg = isDark ? "bg-slate-900" : "bg-white";
    const textBase = isDark ? "text-slate-100" : "text-slate-900";
    const textSubtle = isDark ? "text-slate-400" : "text-slate-500";
    const cardBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100";

    return (
        <div className={`flex flex-col w-full h-full overflow-hidden ${bg} ${textBase}`}>
            {/* Header Section */}
            <div className="px-6 pt-8 pb-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black tracking-tight">Report List</h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {filterOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setActiveFilter(opt.value)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeFilter === opt.value
                                    ? "bg-[#a7e94a] text-white shadow-lg shadow-[#a7e94a]/30"
                                    : isDark ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className={`relative flex items-center min-w-[300px] px-4 py-2.5 rounded-2xl border transition-all ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100 focus-within:bg-white focus-within:border-[#a7e94a]/50"
                        }`}>
                        <input
                            type="text"
                            placeholder="Search Report or location"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-400"
                        />
                        <Search className="w-4 h-4 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Grid Body */}
            <div className="flex-1 overflow-y-auto px-6 pb-12 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredReports.map((report) => (
                        <div
                            key={report.id}
                            onClick={() => onSelectReport?.(report.id)}
                            className={`flex flex-col rounded-[32px] border p-5 gap-4 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 group ${cardBg}`}
                        >
                            {/* Card Header: User Info */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-100 group-hover:border-ds-primary transition-colors">
                                        <AvatarImage user={report.user} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black leading-tight truncate max-w-[120px] group-hover:text-ds-primary transition-colors">
                                            {report.user?.name || "Username"}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {formatDate(report.created_at)}
                                </span>
                            </div>

                            {/* Card Body: Image */}
                            <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-200">
                                <img
                                    src={`/storage/${report.photo_path}`}
                                    alt="Waste"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=600&auto=format&fit=crop'; }}
                                />
                            </div>

                            {/* Card Footer: Info & Tags */}
                            <div className="flex flex-col gap-3">
                                {/* Interaction counts */}
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full group-hover:border-pink-200 group-hover:bg-pink-50 group-hover:text-pink-500 transition-all">
                                        <Heart className="w-4 h-4" />
                                        <span className="text-xs font-black">{report.likes_count ?? 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                                        <Message className="w-4 h-4" />
                                        <span className="text-xs font-black">{report.comments_count ?? 0}</span>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border
                                        ${report.severity_level === 'high' ? 'bg-red-50 text-red-500 border-red-100' :
                                            report.severity_level === 'moderate' ? 'bg-orange-50 text-orange-500 border-orange-100' :
                                                'bg-[#a7e94a]/10 text-ds-primary border-[#a7e94a]/20'}`}>
                                        {report.severity_level || "Low"}
                                    </span>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border
                                        ${report.status === 'selesai' ? 'bg-[#a7e94a]/20 text-slate-800 border-[#a7e94a]/30' :
                                            report.status === 'proses' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                                                'bg-red-50 text-red-500 border-red-100'}`}>
                                        {report.status}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-xs font-semibold leading-relaxed text-slate-600 line-clamp-2 group-hover:text-slate-900 transition-colors">
                                    {report.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportListContent;
