import React, { useState } from "react";
import { Search, X, Heart, HeartSolid, Message, MapPin } from "@mynaui/icons-react";

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
}

const statusLabel: Record<string, string> = {
    menunggu: "Menunggu",
    proses: "Diproses",
    selesai: "Selesai",
};

const statusCls: Record<string, string> = {
    menunggu: "bg-red-100 text-red-700",
    proses: "bg-blue-100 text-blue-700",
    selesai: "bg-[#a7e94a]/20 text-[#5a8a1a]",
};

const wastes = ["Semua", "Organik", "Plastik", "B3", "Elektronik", "Besar"];

const ReportListContent: React.FC<ReportListContentProps> = ({
    reports,
    formatDate,
    onClose,
    isDark,
    currentUserId,
    onAuthRequired,
}) => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("Semua");
    const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
    const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});

    const getLikeCount = (r: Report) => likeCounts[r.id] ?? r.likes_count;

    const handleLike = (id: number) => {
        if (!currentUserId) {
            onAuthRequired?.();
            return;
        }
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        fetch(`/reports/${id}/like`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
        })
            .then(r => r.json())
            .then(data => {
                setLikedIds(prev => {
                    const next = new Set(prev);
                    if (data.liked) next.add(id); else next.delete(id);
                    return next;
                });
                setLikeCounts(prev => ({ ...prev, [id]: data.count ?? prev[id] }));
            })
            .catch(() => { });
    };

    const filtered = reports.filter(r => {
        const matchSearch =
            r.description.toLowerCase().includes(search.toLowerCase()) ||
            (r.address ?? "").toLowerCase().includes(search.toLowerCase());
        const matchWaste = filter === "Semua" || (r.waste_type ?? "").toLowerCase().includes(filter.toLowerCase());
        return matchSearch && matchWaste;
    });

    const base = isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800";
    const cardBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100";
    const subtleTxt = isDark ? "text-slate-400" : "text-slate-500";
    const inputBg = isDark
        ? "bg-slate-800 text-slate-100 placeholder-slate-500 border-slate-700"
        : "bg-slate-50 text-slate-800 placeholder-slate-400 border-slate-200";

    return (
        <div className={`flex flex-col w-full h-full ${base}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 pt-6 pb-4 border-b ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <div>
                    <h2 className="text-xl font-extrabold tracking-tight leading-none">Daftar Laporan</h2>
                    <p className={`text-sm mt-0.5 ${subtleTxt}`}>{reports.length} laporan masuk</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${isDark ? "bg-slate-700 hover:bg-slate-600 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Search + filter */}
            <div className="px-6 py-3 flex flex-col gap-3">
                <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${inputBg}`}>
                    <Search className={`w-4 h-4 shrink-0 ${subtleTxt}`} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari laporan, alamat..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium min-w-0"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                    {wastes.map(w => (
                        <button
                            key={w}
                            onClick={() => setFilter(w)}
                            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${filter === w
                                ? "bg-[#a7e94a] text-white shadow-sm"
                                : isDark
                                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </div>

            {/* Report cards */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
                {filtered.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-20 ${subtleTxt}`}>
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold">Tidak ada laporan ditemukan</p>
                        <p className="text-xs mt-1">Coba ubah filter atau kata pencarian</p>
                    </div>
                ) : (
                    filtered.map(report => (
                        <div
                            key={report.id}
                            className={`flex gap-3 p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md ${cardBg}`}
                        >
                            {/* Thumbnail */}
                            <div className="shrink-0 w-[80px] h-[80px] rounded-xl overflow-hidden bg-slate-200">
                                <img
                                    src={`/storage/${report.photo_path}`}
                                    alt="Foto"
                                    className="w-full h-full object-cover"
                                    onError={e => {
                                        (e.target as HTMLImageElement).src =
                                            "https://placehold.co/80/e2e8f0/94a3b8?text=📷";
                                    }}
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-bold leading-snug line-clamp-2">{report.description}</p>
                                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${statusCls[report.status] ?? "bg-slate-100 text-slate-500"}`}>
                                        {statusLabel[report.status] ?? report.status}
                                    </span>
                                </div>

                                {report.address && (
                                    <p className={`text-[11px] flex items-center gap-1 ${subtleTxt} truncate`}>
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        {report.address}
                                    </p>
                                )}

                                {report.waste_type && (
                                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#a7e94a]/15 text-[#5a8a1a] w-fit">
                                        {report.waste_type}
                                    </span>
                                )}

                                <div className="flex items-center justify-between mt-auto pt-1">
                                    <div className="flex items-center gap-1.5">
                                        <img
                                            src={report.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.user?.name || 'U')}&background=e2e8f0&color=64748b&size=32`}
                                            alt={report.user?.name}
                                            className="w-5 h-5 rounded-full object-cover"
                                        />
                                        <span className={`text-[11px] font-semibold truncate max-w-[80px] ${subtleTxt}`}>
                                            {report.user?.name}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Like button */}
                                        <button
                                            onClick={() => handleLike(report.id)}
                                            className={`flex items-center gap-1 transition-colors ${likedIds.has(report.id) ? "text-[#a7e94a]" : subtleTxt}`}
                                        >
                                            {likedIds.has(report.id)
                                                ? <HeartSolid className="w-4 h-4" />
                                                : <Heart className="w-4 h-4" />
                                            }
                                            <span className="text-[11px] font-bold">
                                                {getLikeCount(report)}
                                            </span>
                                        </button>

                                        {/* Comment count */}
                                        <span className={`flex items-center gap-1 ${subtleTxt}`}>
                                            <Message className="w-4 h-4" />
                                            <span className="text-[11px] font-bold">{report.comments_count}</span>
                                        </span>

                                        <span className={`text-[10px] ${subtleTxt}`}>
                                            {formatDate(report.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReportListContent;
