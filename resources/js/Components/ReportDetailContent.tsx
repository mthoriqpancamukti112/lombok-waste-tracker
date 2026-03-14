import React, { useMemo, useState, useRef } from "react";
import { MapPin, Message, Heart, Archive, Send } from "@mynaui/icons-react";
import { useForm } from "@inertiajs/react";
import { landingDict } from "@/Lang/Landing";
import axios from "axios";
import toast from "react-hot-toast";

interface User {
    id: number;
    name: string;
    avatar?: string | null;
}

// 1. UPDATE INTERFACE COMMENT UNTUK MENAMPUNG BALASAN
interface Comment {
    id: number;
    body: string;
    user: User;
    created_at: string;
    parent_id?: number | null;
    replies?: Comment[]; // <-- Array untuk menampung balasan
}

interface Report {
    id: number;
    latitude: string;
    longitude: string;
    description: string;
    status: string;
    severity_level?: string;
    waste_type?: string;
    needs?: string[];
    address?: string;
    city?: string;
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
    userLocation?: { lat: number; lng: number } | null;
    onCommentAdded?: () => void;
}

const AvatarImage = ({ user }: { user: User }) => {
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

const ReportDetailContent: React.FC<ReportDetailContentProps> = ({
    report,
    comments,
    isLiked,
    onClose,
    isDark = false,
    formatDate,
    lang = "id",
    userLocation,
    onCommentAdded,
}) => {
    const t = landingDict[lang];

    // 2. TAMBAHKAN parent_id DI DALAM useForm
    const { data, setData, processing } = useForm({
        body: "",
        parent_id: null as number | null,
    });

    const commentInputRef = useRef<HTMLTextAreaElement>(null);
    const [localComments, setLocalComments] = useState<Comment[]>(comments);
    const [localIsLiked, setLocalIsLiked] = useState(isLiked);
    const [localLikesCount, setLocalLikesCount] = useState(report.likes_count);

    const bg = isDark
        ? "bg-slate-900 text-slate-100"
        : "bg-white text-slate-800";
    const subtle = isDark ? "text-slate-400" : "text-slate-500";
    const labelColor = isDark ? "text-slate-300" : "text-slate-700";
    const valueColor = isDark ? "text-slate-400" : "text-slate-500";
    const commentBg = isDark
        ? "bg-slate-800 border-slate-700"
        : "bg-slate-50/80 border-slate-100";

    const urgencyColor =
        report.severity_level === "high"
            ? isDark
                ? "border-red-500/20 text-red-400 bg-red-500/10"
                : "border-red-400 text-red-500 bg-red-50"
            : report.severity_level === "moderate"
                ? isDark
                    ? "border-orange-500/20 text-orange-400 bg-orange-500/10"
                    : "border-orange-400 text-orange-500 bg-orange-50"
                : isDark
                    ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/10"
                    : "border-[#a7e94a] text-[#5a8a1a] bg-[#a7e94a]/10";

    const distanceText = useMemo(() => {
        if (!userLocation) return null;
        const R = 6371e3; // metres
        const φ1 = (userLocation.lat * Math.PI) / 180;
        const φ2 = (parseFloat(report.latitude) * Math.PI) / 180;
        const Δφ =
            ((parseFloat(report.latitude) - userLocation.lat) * Math.PI) / 180;
        const Δλ =
            ((parseFloat(report.longitude) - userLocation.lng) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c; // in metres
        if (d < 1000) return `${Math.round(d)} m`;
        return `${(d / 1000).toFixed(1)} km`;
    }, [userLocation, report.latitude, report.longitude]);

    // =======================================================
    // FUNGSI KOMENTAR
    // =======================================================
    const submitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.body.trim() || processing) return;

        const newCommentBody = data.body;
        const newParentId = data.parent_id;

        // Reset form seketika
        setData({ body: "", parent_id: null });

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? "";
            const response = await axios.post(
                route("report.comment", report.id),
                {
                    body: newCommentBody,
                    parent_id: newParentId,
                },
                {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                },
            );

            const savedComment = response.data.comment;

            // Update state komentar
            if (newParentId) {
                // Jika ini adalah BALASAN, cari parent-nya dan masukkan ke dalam array replies
                setLocalComments((prevComments) =>
                    prevComments.map((c) => {
                        if (c.id === newParentId) {
                            return {
                                ...c,
                                replies: [...(c.replies || []), savedComment],
                            };
                        }
                        return c;
                    }),
                );
            } else {
                // Jika komentar utama, taruh di atas
                setLocalComments((prev) => [savedComment, ...prev]);
            }
            onCommentAdded?.();
        } catch (error: any) {
            setData({ body: newCommentBody, parent_id: newParentId }); // Rollback
            if (error.response?.status === 401) {
                toast.error(
                    lang === "id"
                        ? "Silakan login terlebih dahulu untuk berkomentar."
                        : "Please login to leave a comment.",
                );
            } else if (error.response?.status === 419) {
                toast.error(
                    lang === "id"
                        ? "Sesi kadaluarsa. Silakan muat ulang halaman."
                        : "Session expired. Please refresh the page.",
                );
            } else {
                toast.error(
                    lang === "id" ? "Gagal mengirim komentar." : "Failed to send comment.",
                );
            }
        }
    };

    const handleLike = async () => {
        setLocalIsLiked(!localIsLiked);
        setLocalLikesCount((prev) => (localIsLiked ? prev - 1 : prev + 1));

        try {
            const response = await axios.post(
                route("report.like", report.id),
                {},
                { headers: { "X-Requested-With": "XMLHttpRequest" } },
            );
            setLocalIsLiked(response.data.liked);
            setLocalLikesCount(response.data.count);
        } catch (error: any) {
            setLocalIsLiked(localIsLiked);
            setLocalLikesCount(localLikesCount);
            if (error.response && error.response.status === 401) {
                toast.error(
                    lang === "id"
                        ? "Silakan login terlebih dahulu untuk menyukai laporan."
                        : "Please login to like this report.",
                );
            }
        }
    };

    // =======================================================
    // LOGIKA BALAS KOMENTAR
    // =======================================================
    const handleReply = (commentId: number, userName: string) => {
        const replyText = `@${userName.replace(/\s+/g, "")} `;
        setData({
            body: replyText,
            parent_id: commentId,
        });

        // Fokus ke input text box
        setTimeout(() => {
            const input = commentInputRef.current;
            if (input) {
                input.focus();
                const textLength = input.value.length;
                input.setSelectionRange(textLength, textLength);
            }
        }, 50);
    };

    // Warnai teks tag @nama
    const renderCommentBody = (text: string) => {
        return text.split(" ").map((word, index) => {
            if (word.startsWith("@")) {
                return (
                    <span key={index} className="text-[#a7e94a] font-bold">
                        {word}{" "}
                    </span>
                );
            }
            return word + " ";
        });
    };

    // Hitung total semua komentar + balasan
    const totalCommentsCount = localComments.reduce((total, comment) => {
        return total + 1 + (comment.replies ? comment.replies.length : 0);
    }, 0);

    return (
        <div className={`flex flex-col ${bg}`}>
            {/* Header — centered */}
            <div
                className={`sticky top-0 z-10 px-8 xl:px-12 pb-5 pt-2 flex items-center justify-center flex-shrink-0 border-b ${isDark ? "border-slate-700" : "border-slate-100"} ${bg}`}
            >
                <div className="flex items-center gap-3 flex-wrap justify-center">
                    <h2 className="text-lg font-black tracking-tight">
                        {lang === "id" ? "Laporan" : "Report"} #{report.id}{" "}
                        &nbsp;&bull;&nbsp; {formatDate(report.created_at)}
                    </h2>

                    {distanceText && (
                        <div className="relative group cursor-help">
                            <span
                                className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 ${isDark ? "bg-[#a7e94a]/10 text-[#a7e94a] border-[#a7e94a]/20 shadow-[0_0_20px_rgba(167,233,74,0.1)]" : "bg-[#a7e94a] text-slate-900 border-[#a7e94a] shadow-lg shadow-[#a7e94a]/20"}`}
                            >
                                <MapPin className="w-3.5 h-3.5" />
                                {distanceText}
                            </span>
                        </div>
                    )}

                    <span
                        className={`px-3 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-wide ${urgencyColor}`}
                    >
                        {report.severity_level === "high"
                            ? t.urgencyHigh
                            : report.severity_level === "moderate"
                                ? t.urgencyModerate
                                : t.urgencyLow}
                    </span>

                    <span
                        className={`px-3 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-wide ${report.status === "selesai"
                            ? isDark
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-[#a7e94a]/20 text-ds-primary border-[#a7e94a]/30"
                            : isDark
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-blue-50 text-blue-600 border-blue-100"
                            }`}
                    >
                        {t.status}:{" "}
                        {report.status === "selesai"
                            ? t.statusCompleted
                            : report.status === "proses"
                                ? t.statusInProcess
                                : t.statusWaiting}
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
                                <span
                                    className={`text-sm font-bold ${labelColor}`}
                                >
                                    {t.location}
                                </span>
                            </div>
                            <div className="pl-6 space-y-1">
                                <p
                                    className={`text-sm font-bold mb-2 ${valueColor}`}
                                >
                                    {report.address || t.addressUnavailable}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span
                                        className={`text-sm font-semibold min-w-[72px] ${labelColor}`}
                                    >
                                        Latitude
                                    </span>
                                    <span className={`text-sm ${labelColor}`}>
                                        :
                                    </span>
                                    <span className={`text-sm ${valueColor}`}>
                                        {report.latitude}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span
                                        className={`text-sm font-semibold min-w-[72px] ${labelColor}`}
                                    >
                                        Longitude
                                    </span>
                                    <span className={`text-sm ${labelColor}`}>
                                        :
                                    </span>
                                    <span className={`text-sm ${valueColor}`}>
                                        {report.longitude}
                                    </span>
                                </div>

                                {distanceText && (
                                    <div className="pt-2 mt-1 border-t border-dashed border-slate-100 dark:border-slate-700/50">
                                        <p className="text-[11px] font-bold text-ds-primary flex items-center gap-1.5">
                                            <span className="text-[15px]">
                                                {distanceText}
                                            </span>
                                            <span className="">
                                                {t.distanceFromLocation}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ── Description ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <Archive className="w-4 h-4 shrink-0 text-slate-400" />
                                <span
                                    className={`text-sm font-bold ${labelColor}`}
                                >
                                    {t.description}
                                </span>
                            </div>
                            <p
                                className={`pl-6 text-sm leading-relaxed ${subtle} whitespace-pre-wrap`}
                            >
                                {report.description}
                            </p>
                        </section>

                        {/* ── Needs fallback ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-4 h-4 shrink-0"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span
                                    className={`text-sm font-bold ${labelColor}`}
                                >
                                    {t.needs}
                                </span>
                            </div>
                            <div className="pl-6 flex flex-wrap gap-2">
                                {report.needs && report.needs.length > 0 ? (
                                    report.needs.map((need) => (
                                        <span
                                            key={need}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "text-[#5a8a1a] bg-[#a7e94a]/10 border-[#a7e94a]/20"}`}
                                        >
                                            {need}
                                        </span>
                                    ))
                                ) : (
                                    <span
                                        className={`text-xs ${subtle} italic`}
                                    >
                                        {lang === "id"
                                            ? "Tidak ada kebutuhan khusus"
                                            : "No specific needs"}
                                    </span>
                                )}
                            </div>
                        </section>

                        {/* ── Reporter ── */}
                        <section>
                            <span
                                className={`text-sm font-bold ${labelColor} block mb-3`}
                            >
                                {lang === "id" ? "Pelapor" : "Reporter"}
                            </span>
                            <div
                                className={`px-4 py-3 rounded-2xl border flex items-center justify-between ${commentBg}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-9 h-9 rounded-full overflow-hidden shrink-0 ${isDark ? "bg-slate-800 border border-slate-700" : "bg-slate-200"}`}
                                    >
                                        <AvatarImage user={report.user} />
                                    </div>
                                    <span className="text-sm font-bold">
                                        {report.user.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <span className="text-xs">
                                        {lang === "id"
                                            ? `Warga ${report.city || "Lombok"}`
                                            : `Residents of ${report.city || "Lombok"}`}
                                    </span>
                                    <MapPin className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ═══════════ Column 2: Image ═══════════ */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black">
                                {t.documentation}
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${localIsLiked ? "bg-pink-500 text-white shadow-lg shadow-pink-200" : `${isDark ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-500"}`}`}
                                >
                                    <Heart
                                        className={`w-3.5 h-3.5 ${localIsLiked ? "fill-white" : ""}`}
                                    />
                                    {localLikesCount} {t.likes}
                                </button>
                            </div>
                        </div>
                        <div
                            className={`rounded-3xl overflow-hidden border shadow-sm relative group ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-100"}`}
                        >
                            <img
                                src={`/storage/${report.photo_path}`}
                                className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt={t.documentation}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        `https://placehold.co/800x600/e2e8f0/94a3b8?text=📷+${encodeURIComponent(t.photoNotFound)}`;
                                }}
                            />
                        </div>
                    </div>

                    {/* ═══════════ Column 3: Comment ═══════════ */}
                    <div className="flex flex-col gap-4 relative">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black">
                                {t.discussion} ({totalCommentsCount})
                            </h3>
                        </div>

                        {/* Indikator Membalas */}
                        <div className="relative">
                            {data.parent_id && (
                                <div className="flex justify-between items-center text-[10px] text-[#5a8a1a] dark:text-[#a7e94a] bg-[#a7e94a]/20 dark:bg-[#a7e94a]/10 border border-[#a7e94a]/30 border-b-0 px-4 py-1.5 rounded-t-xl -mb-3 pt-2 pb-4 transition-all">
                                    <span className="font-bold">
                                        Membalas komentar...
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData({
                                                body: "",
                                                parent_id: null,
                                            })
                                        }
                                        className="font-bold hover:text-red-500"
                                    >
                                        Batal (X)
                                    </button>
                                </div>
                            )}

                            {/* New Comment Input */}
                            <form
                                onSubmit={submitComment}
                                className="relative group z-10"
                            >
                                <textarea
                                    ref={commentInputRef}
                                    value={data.body}
                                    onChange={(e) =>
                                        setData("body", e.target.value)
                                    }
                                    placeholder={t.addComment}
                                    className={`w-full p-4 ${isDark ? "bg-slate-800 text-slate-100 placeholder:text-slate-500" : "bg-slate-50 text-slate-900"} border-transparent rounded-[20px] text-xs font-medium focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-[#a7e94a]/30 focus:border-[#a7e94a] transition-all resize-none shadow-sm`}
                                    rows={2}
                                />
                                <button
                                    type="submit"
                                    disabled={processing || !data.body.trim()}
                                    className="absolute bottom-3 right-3 p-2 bg-[#a7e94a] text-slate-900 rounded-xl shadow-md disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>

                        <div className="space-y-4 pb-10 mt-2">
                            {localComments.length === 0 ? (
                                <div className="py-10 text-center opacity-40">
                                    <Message className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-xs font-bold uppercase tracking-widest">
                                        {t.noDiscussion}
                                    </p>
                                </div>
                            ) : (
                                localComments.map((comment) => {
                                    const isAuthor =
                                        comment.user.name === report.user.name;

                                    return (
                                        <div
                                            key={comment.id}
                                            className="flex flex-col gap-2"
                                        >
                                            {/* KOMENTAR UTAMA */}
                                            <div
                                                className={`p-4 rounded-2xl border flex flex-col gap-2.5 transition-all hover:border-[#a7e94a]/50 ${commentBg}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-8 h-8 rounded-full overflow-hidden shrink-0 ${isDark ? "bg-slate-800 border border-slate-700" : "bg-slate-300"}`}
                                                        >
                                                            <AvatarImage
                                                                user={
                                                                    comment.user
                                                                }
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold leading-tight">
                                                                    {
                                                                        comment
                                                                            .user
                                                                            .name
                                                                    }
                                                                </span>
                                                                {isAuthor && (
                                                                    <span className="text-[8px] bg-slate-800 dark:bg-[#a7e94a] dark:text-slate-900 text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold">
                                                                        Pembuat
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-medium text-slate-400 capitalize">
                                                                {formatDate(
                                                                    comment.created_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p
                                                    className={`text-xs leading-relaxed font-medium ${subtle}`}
                                                >
                                                    {renderCommentBody(
                                                        comment.body,
                                                    )}
                                                </p>

                                                {/* Tombol Balas */}
                                                <div className="pt-1 border-t border-slate-100 dark:border-slate-700/50 mt-1">
                                                    <button
                                                        onClick={() =>
                                                            handleReply(
                                                                comment.id,
                                                                comment.user
                                                                    .name,
                                                            )
                                                        }
                                                        className="text-[10px] font-bold text-slate-400 hover:text-[#a7e94a] transition-colors"
                                                    >
                                                        Balas
                                                    </button>
                                                </div>
                                            </div>

                                            {/* BALASAN KOMENTAR (REPLIES) */}
                                            {comment.replies &&
                                                comment.replies.length > 0 && (
                                                    <div className="mt-1 space-y-2 relative pl-10 pr-2">
                                                        {comment.replies.map(
                                                            (reply) => {
                                                                const isReplyAuthor =
                                                                    reply.user
                                                                        .name ===
                                                                    report.user
                                                                        .name;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            reply.id
                                                                        }
                                                                        className="flex gap-2 relative group"
                                                                    >
                                                                        {/* Garis L-Shape Penghubung */}
                                                                        <div className="absolute -left-6 top-0 w-6 h-5 border-l-2 border-b-2 border-slate-200 dark:border-slate-700 rounded-bl-xl group-hover:border-[#a7e94a] transition-colors"></div>

                                                                        <div
                                                                            className={`w-7 h-7 rounded-full overflow-hidden flex-shrink-0 relative z-10 border-2 border-white dark:border-slate-900 shadow-sm ${isDark ? "bg-slate-800" : "bg-slate-300"}`}
                                                                        >
                                                                            <AvatarImage
                                                                                user={
                                                                                    reply.user
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div
                                                                            className={`flex-1 p-3 rounded-2xl rounded-tl-none border shadow-sm transition-all hover:border-[#a7e94a]/40 ${commentBg}`}
                                                                        >
                                                                            <div className="flex justify-between items-start mb-1">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                                                        {
                                                                                            reply
                                                                                                .user
                                                                                                .name
                                                                                        }
                                                                                    </span>
                                                                                    {isReplyAuthor && (
                                                                                        <span className="text-[8px] bg-slate-800 dark:bg-[#a7e94a] dark:text-slate-900 text-white px-1 py-0.5 rounded uppercase tracking-wider font-extrabold">
                                                                                            Pembuat
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-[9px] text-slate-400 whitespace-nowrap ml-2">
                                                                                    {formatDate(
                                                                                        reply.created_at,
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                                                                {renderCommentBody(
                                                                                    reply.body,
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailContent;
