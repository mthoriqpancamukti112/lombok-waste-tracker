import React, { useState, useEffect, FormEvent, useRef } from "react";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import WargaLayout from "@/Layouts/WargaLayout";
import AOS from "aos";
import "aos/dist/aos.css";
import {
    Heart,
    MessageX,
    Map,
    Clock9,
    Send,
    User,
    ShieldCheck,
} from "@mynaui/icons-react";

// --- DEFINISI TIPE DATA ---
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
    user: {
        name: string;
        warga?: {
            is_terverifikasi: boolean;
        };
    };
    user_id?: number;
    likes: Like[];
    comments: Comment[];
}

interface Props extends PageProps {
    reports: Report[];
    currentFilter: string;
}

// --- KOMPONEN KARTU LAPORAN (Dibuat terpisah agar performa ringan) ---
const ReportCard = ({ report, auth }: { report: Report; auth: any }) => {
    // State untuk menampilkan/menyembunyikan kolom komentar
    const [showComments, setShowComments] = useState(false);
    const commentInputRef = useRef<HTMLInputElement>(null);
    const commentsCount = report.comments
        ? report.comments.reduce((total, comment) => {
            return total + 1 + (comment.replies ? comment.replies.length : 0);
        }, 0)
        : 0;

    // Form khusus untuk komentar laporan ini
    const { data, setData, post, processing, reset } = useForm({
        body: "",
        parent_id: null as number | null,
    });

    // Cek apakah user saat ini sudah me-like laporan ini
    const isLiked = report.likes.some((like) => like.user_id === auth.user?.id);

    // Fungsi Toggle Like
    const handleLike = () => {
        router.post(
            route("laporan-publik.like", report.id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    // Fungsi Kirim Komentar
    const submitComment = (e: FormEvent) => {
        e.preventDefault();
        if (!data.body.trim()) return;

        post(route("laporan-publik.comment", report.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => reset(),
        });
    };

    // Format Tanggal (Instagram style: d M Y)
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Fungsi untuk membalas komentar (Auto-tagging)
    const handleReply = (commentId: number, userName: string) => {
        const replyText = `@${userName.replace(/\s+/g, "")} `;
        setData({
            body: replyText,
            parent_id: commentId,
        });

        if (!showComments) setShowComments(true);

        setTimeout(() => {
            const input = commentInputRef.current;
            if (input) {
                input.focus();
                const textLength = input.value.length;
                input.setSelectionRange(textLength, textLength);
            }
        }, 50);
    };

    // Fungsi untuk mewarnai teks yang mengandung "@" (seperti Instagram)
    const renderCommentBody = (text: string) => {
        return text.split(" ").map((word, index) => {
            if (word.startsWith("@")) {
                return (
                    <span key={index} className="text-emerald-600 font-bold">
                        {word}{" "}
                    </span>
                );
            }
            return word + " ";
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-6 transition-all duration-300">
            {/* Header Kartu (Info Pembuat) */}
            <div className="p-4 sm:p-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('laporan-publik.profile', report.user_id || (report as any).user?.id)}
                        className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg flex-shrink-0 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                    >
                        {report.user.name.charAt(0)}
                    </Link>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <Link
                                href={route('laporan-publik.profile', report.user_id || (report as any).user?.id)}
                                className="font-bold text-slate-800 dark:text-slate-100 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                                {report.user.name}
                            </Link>

                            {!!report.user.warga?.is_terverifikasi && (
                                <span
                                    title="Pelapor Terverifikasi (Reputasi Tinggi)"
                                    className="flex items-center bg-blue-50 dark:bg-blue-900/30 p-0.5 rounded-full"
                                >
                                    <ShieldCheck
                                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                        strokeWidth={2.5}
                                    />
                                </span>
                            )}
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <Clock9 className="w-3.5 h-3.5" />{" "}
                            {formatDate(report.created_at)}
                        </p>
                    </div>
                </div>
                {/* Badge Status */}
                <span
                    className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-sm
                    ${report.status === "menunggu"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                            : report.status === "proses" ||
                                report.status === "divalidasi"
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                : "bg-emerald-400 text-emerald-950 dark:bg-emerald-500 dark:text-emerald-950"
                        }`}
                >
                    {report.status}
                </span>
            </div>

            {/* Body Kartu (Konten Laporan) */}
            <div className="p-4 sm:p-5">
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                    {report.description || "Melaporkan tumpukan sampah."}
                </p>

                {/* Foto Laporan (Full Width Style) */}
                <div className="w-full h-64 sm:h-80 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden relative group">
                    <img
                        src={`/storage/${report.photo_path}`}
                        alt="Kondisi Sampah"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/60 dark:bg-black/80 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/20 shadow-lg">
                        <Map className="w-3.5 h-3.5" />{" "}
                        {parseFloat(report.latitude).toFixed(4)},{" "}
                        {parseFloat(report.longitude).toFixed(4)}
                    </div>
                </div>
            </div>

            {/* Aksi (Like & Comment Bar) */}
            <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-6">
                <button
                    onClick={handleLike}
                    className="flex items-center gap-2 text-sm font-bold group transition-colors"
                >
                    <div
                        className={`p-2 rounded-full transition-all ${isLiked ? "bg-red-50 dark:bg-red-900/20" : "bg-slate-50 dark:bg-slate-800 group-hover:bg-red-50 dark:group-hover:bg-red-900/30"}`}
                    >
                        <Heart
                            className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLiked ? "text-red-500 fill-red-500" : "text-slate-400 group-hover:text-red-500 dark:text-slate-500"}`}
                        />
                    </div>
                    <span
                        className={isLiked ? "text-red-500" : "text-slate-500"}
                    >
                        {report.likes.length} Dukungan
                    </span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 group transition-colors"
                >
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                        <MessageX className="w-5 h-5 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <span className="group-hover:text-emerald-600 transition-colors">
                        {commentsCount} Diskusi
                    </span>
                </button>
            </div>

            {/* Section Komentar (Animasi Expand) */}
            {showComments && (
                <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 p-4 sm:p-5 animate-in slide-in-from-top-2 duration-300">
                    {/* List Komentar */}
                    {report.comments.length === 0 ? (
                        <p className="text-xs text-center text-slate-400 italic py-2">
                            Belum ada komentar. Jadilah yang pertama berdiskusi!
                        </p>
                    ) : (
                        report.comments.map((comment) => {
                            const isAuthor =
                                comment.user.name === report.user.name;

                            return (
                                <div
                                    key={comment.id}
                                    className="flex gap-3 mb-4"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold flex-shrink-0 z-10 relative">
                                        {comment.user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        {/* KOMENTAR UTAMA */}
                                        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 shadow-sm inline-block min-w-full sm:min-w-[80%]">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                        {comment.user.name}
                                                    </span>
                                                    {isAuthor && (
                                                        <span className="text-[8px] bg-slate-800 dark:bg-emerald-500 dark:text-emerald-950 text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold">
                                                            Pembuat
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-slate-400 whitespace-nowrap ml-2">
                                                    {formatDate(
                                                        comment.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                {renderCommentBody(
                                                    comment.body,
                                                )}
                                            </p>
                                        </div>

                                        <div className="pl-2 pt-1 mb-1">
                                            <button
                                                onClick={() =>
                                                    handleReply(
                                                        comment.id,
                                                        comment.user.name,
                                                    )
                                                }
                                                className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                            >
                                                Balas
                                            </button>
                                        </div>

                                        {/* BALASAN (REPLIES) DENGAN GARIS SAMBUNG */}
                                        {comment.replies &&
                                            comment.replies.length > 0 && (
                                                <div className="mt-2 space-y-3 relative pl-6">
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
                                                                    className="flex gap-2 relative"
                                                                >
                                                                    {/* Garis Pembelok L siku */}
                                                                    <div className="absolute -left-6 top-0 w-6 h-4 border-l-2 border-b-2 border-slate-200 dark:border-slate-800 rounded-bl-lg"></div>

                                                                    <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-[10px] font-bold flex-shrink-0 relative z-10">
                                                                        {reply.user.name.charAt(
                                                                            0,
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 bg-white dark:bg-slate-900 p-2.5 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 shadow-sm">
                                                                        <div className="flex justify-between items-start mb-0.5">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                                                                    {
                                                                                        reply
                                                                                            .user
                                                                                            .name
                                                                                    }
                                                                                </span>
                                                                                {isReplyAuthor && (
                                                                                    <span className="text-[8px] bg-slate-800 dark:bg-emerald-500 dark:text-emerald-950 text-white px-1 py-0.5 rounded uppercase tracking-wider font-extrabold">
                                                                                        Pembuat
                                                                                    </span>
                                                                                )}
                                                                            </div>
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
                                </div>
                            );
                        })
                    )}

                    {/* Input Tambah Komentar */}
                    <div className="relative mt-2">
                        {/* Indikator Sedang Membalas */}
                        {data.parent_id && (
                            <div className="flex justify-between items-center text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 border-b-0 px-4 py-1.5 rounded-t-xl -mb-3 pt-2 pb-4">
                                <span className="font-bold">
                                    Membalas komentar...
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setData({ body: "", parent_id: null })
                                    }
                                    className="font-bold hover:text-red-500"
                                >
                                    Batal (X)
                                </button>
                            </div>
                        )}

                        <form
                            onSubmit={submitComment}
                            className="flex items-center gap-2 relative z-10"
                        >
                            <input
                                ref={commentInputRef}
                                type="text"
                                value={data.body}
                                onChange={(e) =>
                                    setData("body", e.target.value)
                                }
                                placeholder="Tulis komentar/tanggapan..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-full pl-4 pr-12 py-2.5 text-sm focus:border-emerald-400 focus:ring-emerald-400 dark:text-slate-200 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={processing || !data.body.trim()}
                                className="absolute right-1.5 p-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-full transition-colors shadow-sm"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- HALAMAN UTAMA ---
export default function FeedLaporanPublik({
    auth,
    reports,
    currentFilter,
}: Props) {
    // Fungsi untuk memicu filter
    const handleFilter = (status: string) => {
        router.get(
            route("laporan-publik.index"),
            { status: status },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ["reports", "currentFilter"],
            },
        );
    };

    return (
        <WargaLayout
            auth={auth}
            header={
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <MessageX className="w-7 h-7 text-emerald-500" />
                        Forum Laporan Publik
                    </h2>
                    <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Dukung dan pantau laporan dari warga lainnya.
                    </p>
                </div>
            }
        >
            <Head title="Laporan Publik" />

            <div className="max-w-2xl mx-auto py-4">
                {/* ================= AREA FILTER ================= */}
                <div
                    className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide px-1"
                    data-aos="fade-down"
                >
                    <button
                        onClick={() => handleFilter("semua")}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${currentFilter === "semua"
                            ? "bg-slate-800 dark:bg-emerald-500 text-white dark:text-emerald-950"
                            : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                            }`}
                    >
                        Semua Laporan
                    </button>
                    <button
                        onClick={() => handleFilter("menunggu")}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${currentFilter === "menunggu"
                            ? "bg-red-500 text-white"
                            : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-500 border border-slate-200 dark:border-slate-800"
                            }`}
                    >
                        Menunggu
                    </button>
                    <button
                        onClick={() => handleFilter("proses")}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${currentFilter === "proses"
                            ? "bg-blue-500 text-white"
                            : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-500 border border-slate-200 dark:border-slate-800"
                            }`}
                    >
                        Diproses
                    </button>
                    <button
                        onClick={() => handleFilter("selesai")}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${currentFilter === "selesai"
                            ? "bg-green-500 text-white"
                            : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/40 hover:text-green-500 border border-slate-200 dark:border-slate-800"
                            }`}
                    >
                        Selesai
                    </button>
                </div>

                {reports.length === 0 ? (
                    <div
                        data-aos="zoom-in"
                        className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center"
                    >
                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Map className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                            Belum Ada Laporan
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Jadilah warga pertama yang melaporkan kondisi
                            lingkungan di Mataram!
                        </p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            auth={auth}
                        />
                    ))
                )}
            </div>
        </WargaLayout>
    );
}
