import React, { useState, useMemo } from "react";
import { Search, X, Heart, Message, MapPin } from "@mynaui/icons-react";
import { Link } from "@inertiajs/react";
import { landingDict } from "@/Lang/Landing";

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
    lang?: "id" | "en";
    userLocation?: { lat: number; lng: number } | null;
}

const AvatarImage = ({
    user,
}: {
    user: { name: string; avatar?: string | null };
}) => {
    const src = useMemo(
        () =>
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=e2e8f0&color=64748b&size=64`,
        [user?.avatar, user?.name],
    );
    return (
        <img
            src={src}
            alt={user?.name}
            className="w-full h-full object-cover"
        />
    );
};

const ReportListContent: React.FC<ReportListContentProps> = ({
    reports,
    formatDate,
    onClose,
    isDark,
    currentUserId,
    onSelectReport,
    lang = "id", // Menerima prop lang
    userLocation,
}) => {
    // Ambil kamus terjemahan berdasarkan bahasa yang sedang aktif
    const t = landingDict[lang];
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const filteredReports = reports.filter((r) => {
        const matchesSearch =
            r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.address ?? "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            activeFilter === "all" ||
            r.status === activeFilter ||
            r.severity_level === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const bg = isDark ? "bg-slate-900" : "bg-white";
    const textBase = isDark ? "text-slate-100" : "text-slate-900";
    const textSubtle = isDark ? "text-slate-400" : "text-slate-500";
    const cardBg = isDark
        ? "bg-slate-800 border-slate-700"
        : "bg-white border-slate-100";

    return (
        <div className={`flex flex-col w-full h-full ${bg} ${textBase}`}>
            {/* Header Section */}
            <div
                className={`sticky top-0 z-10 px-6 pt-8 pb-6 flex flex-col gap-6 ${bg}`}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black tracking-tight">
                        {t.reportList}
                    </h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                        >
                            <X
                                className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-400"}`}
                            />
                        </button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Filter Pills - DI RENDER LANGSUNG DI SINI AGAR BISA BACA `t` */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {[
                            { label: t.filterAll, value: "all" },
                            { label: t.filterLow, value: "low" },
                            { label: t.filterHigh, value: "high" },
                            { label: t.filterNearest, value: "nearest" },
                            { label: t.filterCompleted, value: "selesai" },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setActiveFilter(opt.value)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                    activeFilter === opt.value
                                        ? "bg-[#a7e94a] text-slate-900 shadow-lg shadow-[#a7e94a]/30"
                                        : isDark
                                          ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div
                        className={`relative flex items-center min-w-[300px] px-4 py-2.5 rounded-2xl border transition-all ${
                            isDark
                                ? "bg-slate-800 border-slate-700 focus-within:border-[#a7e94a]/50"
                                : "bg-slate-50 border-slate-100 focus-within:bg-white focus-within:border-[#a7e94a]/50 shadow-sm"
                        }`}
                    >
                        <input
                            type="text"
                            placeholder={t.searchFallback}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-400 ${isDark ? "text-slate-100" : "text-slate-900"}`}
                        />
                        <Search className="w-4 h-4 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Grid Body */}
            <div className="px-6 pb-32">
                {/* Fallback Jika Laporan Kosong */}
                {filteredReports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className={`text-sm ${textSubtle}`}>{t.noReports}</p>
                    </div>
                ) : (
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
                                        <div
                                            className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border transition-colors ${isDark ? "bg-slate-800 border-slate-700 group-hover:border-[#a7e94a]" : "bg-slate-100 border-slate-100 group-hover:border-[#a7e94a]"}`}
                                        >
                                            <AvatarImage user={report.user} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black leading-tight truncate max-w-[120px] group-hover:text-[#a7e94a] transition-colors">
                                                {report.user?.name ||
                                                    t.anonymous}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {formatDate(report.created_at)}
                                        </span>
                                        {(() => {
                                            if (!userLocation) return null;
                                            const R = 6371e3; // metres
                                            const φ1 =
                                                (userLocation.lat * Math.PI) /
                                                180;
                                            const φ2 =
                                                (parseFloat(report.latitude) *
                                                    Math.PI) /
                                                180;
                                            const Δφ =
                                                ((parseFloat(report.latitude) -
                                                    userLocation.lat) *
                                                    Math.PI) /
                                                180;
                                            const Δλ =
                                                ((parseFloat(report.longitude) -
                                                    userLocation.lng) *
                                                    Math.PI) /
                                                180;

                                            const a =
                                                Math.sin(Δφ / 2) *
                                                    Math.sin(Δφ / 2) +
                                                Math.cos(φ1) *
                                                    Math.cos(φ2) *
                                                    Math.sin(Δλ / 2) *
                                                    Math.sin(Δλ / 2);
                                            const c =
                                                2 *
                                                Math.atan2(
                                                    Math.sqrt(a),
                                                    Math.sqrt(1 - a),
                                                );

                                            const d = R * c; // in metres
                                            const dist =
                                                d < 1000
                                                    ? `${Math.round(d)} m`
                                                    : `${(d / 1000).toFixed(1)} km`;
                                            return (
                                                <span className="text-[9px] font-black text-[#a7e94a] uppercase tracking-tight flex items-center gap-1">
                                                    <MapPin className="w-2.5 h-2.5" />
                                                    {dist}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Card Body: Image */}
                                <div
                                    className={`aspect-[4/3] w-full rounded-2xl overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}
                                >
                                    <img
                                        src={`/storage/${report.photo_path}`}
                                        alt="Waste"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=600&auto=format&fit=crop";
                                        }}
                                    />
                                </div>

                                {/* Card Footer: Info & Tags */}
                                <div className="flex flex-col gap-3">
                                    {/* Interaction counts */}
                                    <div className="flex items-center gap-4 text-slate-400">
                                        <div
                                            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full group-hover:border-pink-2 transition-all ${isDark ? "bg-slate-700/50 border-slate-600" : "bg-slate-50 border-slate-100"}`}
                                        >
                                            <Heart className="w-4 h-4" />
                                            <span className="text-xs font-black">
                                                {report.likes_count ?? 0}
                                            </span>
                                        </div>
                                        <div
                                            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full group-hover:border-blue-2 transition-all ${isDark ? "bg-slate-700/50 border-slate-600" : "bg-slate-50 border-slate-100"}`}
                                        >
                                            <Message className="w-4 h-4" />
                                            <span className="text-xs font-black">
                                                {report.comments_count ?? 0}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border
                                            ${
                                                report.severity_level === "high"
                                                    ? isDark
                                                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                        : "bg-red-50 text-red-500 border-red-100"
                                                    : report.severity_level ===
                                                        "moderate"
                                                      ? isDark
                                                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                                          : "bg-orange-50 text-orange-500 border-orange-100"
                                                      : isDark
                                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                        : "bg-[#a7e94a]/10 text-ds-primary border-[#a7e94a]/20"
                                            }`}
                                        >
                                            {report.severity_level === "high"
                                                ? t.urgencyHigh
                                                : report.severity_level ===
                                                    "moderate"
                                                  ? t.urgencyModerate
                                                  : t.urgencyLow}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border
                                            ${
                                                report.status === "selesai"
                                                    ? isDark
                                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                        : "bg-[#a7e94a]/20 text-slate-800 border-[#a7e94a]/30"
                                                    : report.status === "proses"
                                                      ? isDark
                                                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                                          : "bg-blue-50 text-blue-500 border-blue-100"
                                                      : isDark
                                                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                        : "bg-red-50 text-red-500 border-red-100"
                                            }`}
                                        >
                                            {report.status === "selesai"
                                                ? t.statusCompleted
                                                : report.status === "proses"
                                                  ? t.statusInProcess
                                                  : t.statusWaiting}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p
                                        className={`text-xs font-semibold leading-relaxed line-clamp-2 transition-colors ${isDark ? "text-slate-400 group-hover:text-slate-200" : "text-slate-600 group-hover:text-slate-900"}`}
                                    >
                                        {report.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportListContent;
