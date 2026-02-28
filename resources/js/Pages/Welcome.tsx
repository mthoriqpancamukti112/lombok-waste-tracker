import { Head, Link, router, useForm } from "@inertiajs/react";
import { PageProps } from "@/types";
import { useState, useEffect, FormEvent, useRef } from "react";
import MapComponent from "@/Components/MapComponent";
import { landingDict } from "@/Lang/Landing";
import { motion, Variants } from "framer-motion";
import Swal from "sweetalert2";
import {
    UserWaves,
    ListCheck,
    FilePlus,
    Search,
    Target,
    Bell,
    CheckCircleSolid,
    Heart,
    MessageX,
    Map as MapIcon,
    Clock9,
    Send,
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
    latitude: string;
    longitude: string;
    description: string;
    status: string;
    photo_path: string;
    user: {
        name: string;
        warga?: {
            is_terverifikasi: boolean;
        };
    };
    created_at: string;
    likes: Like[];
    comments: Comment[];
}

// ==========================================
// KOMPONEN ITEM LAPORAN (KHUSUS LANDING PAGE)
// ==========================================
const LandingReportItem = ({
    report,
    auth,
    isDarkMode,
}: {
    report: Report;
    auth: any;
    isDarkMode: boolean;
}) => {
    const [showComments, setShowComments] = useState(false);
    const commentInputRef = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, reset } = useForm({
        body: "",
        parent_id: null as number | null,
    });

    // Status Login
    const isLoggedIn = !!auth?.user;

    // Cek apakah user yang sedang login sudah me-like
    const isLiked =
        isLoggedIn && report.likes
            ? report.likes.some((like) => like.user_id === auth.user.id)
            : false;
    const likesCount = report.likes ? report.likes.length : 0;
    const commentsCount = report.comments
        ? report.comments.reduce((total, comment) => {
              return total + 1 + (comment.replies ? comment.replies.length : 0);
          }, 0)
        : 0;

    // Format Tanggal
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Fungsi Like
    const handleLike = () => {
        if (!isLoggedIn) {
            Swal.fire({
                title: "Belum Login",
                text: "Silakan login terlebih dahulu untuk memberikan dukungan.",
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Login Sekarang",
                cancelButtonText: "Batal",
                confirmButtonColor: "#10b981",
                customClass: {
                    popup: isDarkMode
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "",
                    title: isDarkMode ? "text-white" : "",
                },
            }).then((result) => {
                if (result.isConfirmed) router.visit(route("login"));
            });
            return;
        }
        router.post(
            route("laporan-publik.like", report.id),
            {},
            { preserveScroll: true },
        );
    };

    // Fungsi Submit Komentar (Hanya untuk yang sudah login)
    const submitComment = (e: FormEvent) => {
        e.preventDefault();
        if (!data.body.trim()) return;

        post(route("laporan-publik.comment", report.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => reset(),
        });
    };

    const handleReply = (commentId: number, userName: string) => {
        if (!isLoggedIn) {
            Swal.fire({
                title: "Belum Login",
                text: "Silakan login untuk membalas komentar.",
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Login Sekarang",
                cancelButtonText: "Batal",
                confirmButtonColor: "#10b981",
                customClass: {
                    popup: isDarkMode
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "",
                    title: isDarkMode ? "text-white" : "",
                },
            }).then((result) => {
                if (result.isConfirmed) router.visit(route("login"));
            });
            return;
        }

        setData({
            body: `@${userName.replace(/\s+/g, "")} `,
            parent_id: commentId,
        });

        if (!showComments) setShowComments(true);
        setTimeout(() => commentInputRef.current?.focus(), 100);
    };

    const renderCommentBody = (text: string) => {
        return text.split(" ").map((word, index) => {
            if (word.startsWith("@")) {
                return (
                    <span key={index} className="text-emerald-500 font-bold">
                        {word}{" "}
                    </span>
                );
            }
            return word + " ";
        });
    };

    return (
        <div
            className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
                isDarkMode
                    ? "bg-slate-800/90 border-slate-700"
                    : "bg-white border-slate-100"
            }`}
        >
            {/* Header Kartu */}
            <div
                className={`p-4 sm:p-5 border-b flex justify-between items-center ${isDarkMode ? "border-slate-700 bg-slate-900/50" : "border-slate-50 bg-slate-50/50"}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg flex-shrink-0 relative">
                        {report.user.name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p
                                className={`font-bold text-sm ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}
                            >
                                {report.user.name}
                            </p>

                            {report.user.warga &&
                            report.user.warga.is_terverifikasi ? (
                                <span
                                    title="Pelapor Terverifikasi (Reputasi Tinggi)"
                                    className="flex items-center bg-blue-50 p-0.5 rounded-full"
                                >
                                    <ShieldCheck
                                        className="w-4 h-4 text-blue-600"
                                        strokeWidth={2.5}
                                    />
                                </span>
                            ) : null}
                        </div>
                        <p
                            className={`text-[11px] font-medium flex items-center gap-1 mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                        >
                            <Clock9 className="w-3.5 h-3.5" />{" "}
                            {formatDate(report.created_at)}
                        </p>
                    </div>
                </div>
                <span
                    className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-sm ${
                        report.status === "menunggu"
                            ? "bg-red-100 text-red-600"
                            : report.status === "proses" ||
                                report.status === "divalidasi"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-[#a7e94a] text-slate-900"
                    }`}
                >
                    {report.status}
                </span>
            </div>

            {/* Body Laporan */}
            <div className="p-4 sm:p-5">
                <p
                    className={`text-sm leading-relaxed mb-4 whitespace-pre-wrap ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                    {report.description || "Melaporkan tumpukan sampah."}
                </p>

                <div className="w-full h-64 sm:h-80 bg-slate-100 rounded-xl overflow-hidden relative group">
                    <img
                        src={`/storage/${report.photo_path}`}
                        alt="Kondisi Sampah"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/20 shadow-lg">
                        <MapIcon className="w-3.5 h-3.5" />{" "}
                        {parseFloat(report.latitude).toFixed(4)},{" "}
                        {parseFloat(report.longitude).toFixed(4)}
                    </div>
                </div>
            </div>

            {/* Aksi (Like & Komen Counter) */}
            <div
                className={`px-4 sm:px-5 py-3 border-t flex items-center gap-6 ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}
            >
                <button
                    onClick={handleLike}
                    className="flex items-center gap-2 text-sm font-bold group transition-colors"
                >
                    <div
                        className={`p-2 rounded-full transition-all ${
                            isLiked
                                ? "bg-red-50"
                                : isDarkMode
                                  ? "bg-slate-700 group-hover:bg-red-900/30"
                                  : "bg-slate-50 group-hover:bg-red-50"
                        }`}
                    >
                        <Heart
                            className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                                isLiked
                                    ? "text-red-500 fill-red-500"
                                    : isDarkMode
                                      ? "text-slate-400 group-hover:text-red-400"
                                      : "text-slate-400 group-hover:text-red-500"
                            }`}
                        />
                    </div>
                    <span
                        className={
                            isLiked
                                ? "text-red-500"
                                : isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-500"
                        }
                    >
                        {likesCount} Dukungan
                    </span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-sm font-bold group transition-colors"
                >
                    <div
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? "bg-slate-700 group-hover:bg-emerald-900/30" : "bg-slate-50 group-hover:bg-emerald-50"}`}
                    >
                        <MessageX
                            className={`w-5 h-5 transition-colors ${isDarkMode ? "text-slate-400 group-hover:text-emerald-400" : "text-slate-400 group-hover:text-emerald-500"}`}
                        />
                    </div>
                    <span
                        className={
                            isDarkMode
                                ? "text-slate-400 group-hover:text-emerald-400"
                                : "text-slate-500 group-hover:text-emerald-600"
                        }
                    >
                        {commentsCount} Diskusi
                    </span>
                </button>
            </div>

            {/* Area Diskusi / Komentar */}
            {showComments && (
                <div
                    className={`border-t p-4 sm:p-5 animate-in slide-in-from-top-2 duration-300 ${isDarkMode ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-100"}`}
                >
                    {/* List Komentar */}
                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {report.comments?.length === 0 ? (
                            <p
                                className={`text-xs text-center italic py-2 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                            >
                                Belum ada komentar. Jadilah yang pertama
                                berdiskusi!
                            </p>
                        ) : (
                            report.comments?.map((comment) => {
                                const isAuthor =
                                    comment.user.name === report.user.name;

                                return (
                                    <div
                                        key={comment.id}
                                        className="flex gap-3 mb-4"
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 z-10 relative ${
                                                isDarkMode
                                                    ? "bg-slate-800 border-slate-600 text-slate-300"
                                                    : "bg-white border-slate-200 text-slate-500"
                                            }`}
                                        >
                                            {comment.user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            {/* Komentar Utama */}
                                            <div
                                                className={`p-3 rounded-2xl rounded-tl-none border shadow-sm inline-block min-w-full sm:min-w-[80%] ${
                                                    isDarkMode
                                                        ? "bg-slate-800 border-slate-700"
                                                        : "bg-white border-slate-100"
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span
                                                            className={`text-xs font-bold ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}
                                                        >
                                                            {comment.user.name}
                                                        </span>
                                                        {isAuthor && (
                                                            <span className="text-[8px] bg-slate-800 text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold">
                                                                Pembuat
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`text-[9px] whitespace-nowrap ml-2 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                                                    >
                                                        {formatDate(
                                                            comment.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                                <p
                                                    className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
                                                >
                                                    {renderCommentBody(
                                                        comment.body,
                                                    )}
                                                </p>
                                            </div>

                                            {/* Tombol Balas */}
                                            <div className="pl-2 pt-1 mb-1">
                                                <button
                                                    onClick={() =>
                                                        handleReply(
                                                            comment.id,
                                                            comment.user.name,
                                                        )
                                                    }
                                                    className={`text-[10px] font-bold transition-colors ${isDarkMode ? "text-slate-500 hover:text-emerald-400" : "text-slate-400 hover:text-emerald-600"}`}
                                                >
                                                    Balas
                                                </button>
                                            </div>

                                            {/* Balasan (Replies) */}
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
                                                                        {/* Garis Pembelok */}
                                                                        <div
                                                                            className={`absolute -left-6 top-0 w-6 h-4 border-l-2 border-b-2 rounded-bl-lg ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}
                                                                        ></div>

                                                                        <div
                                                                            className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0 relative z-10 ${isDarkMode ? "bg-slate-800 border-slate-600 text-slate-300" : "bg-white border-slate-200 text-slate-500"}`}
                                                                        >
                                                                            {reply.user.name.charAt(
                                                                                0,
                                                                            )}
                                                                        </div>
                                                                        <div
                                                                            className={`flex-1 p-2.5 rounded-2xl rounded-tl-none border shadow-sm ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                                                                        >
                                                                            <div className="flex justify-between items-start mb-0.5">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <span
                                                                                        className={`text-[11px] font-bold ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}
                                                                                    >
                                                                                        {
                                                                                            reply
                                                                                                .user
                                                                                                .name
                                                                                        }
                                                                                    </span>
                                                                                    {isReplyAuthor && (
                                                                                        <span className="text-[8px] bg-slate-800 text-white px-1 py-0.5 rounded uppercase tracking-wider font-extrabold">
                                                                                            Pembuat
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <p
                                                                                className={`text-[11px] leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
                                                                            >
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
                    </div>

                    {/* Input Komentar (HANYA BISA JIKA LOGIN) */}
                    {isLoggedIn ? (
                        <div className="relative mt-2">
                            {/* Indikator Membalas */}
                            {data.parent_id && (
                                <div
                                    className={`flex justify-between items-center text-[10px] px-4 py-1.5 rounded-t-xl -mb-3 pt-2 pb-4 border border-b-0 ${isDarkMode ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}
                                >
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
                                    placeholder="Tulis komentar/balasan..."
                                    className={`w-full border rounded-full pl-4 pr-12 py-2.5 text-sm transition-colors shadow-sm ${
                                        isDarkMode
                                            ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
                                            : "bg-white border-slate-200 text-slate-800 focus:border-emerald-400 focus:ring-emerald-400"
                                    }`}
                                />
                                <button
                                    type="submit"
                                    disabled={processing || !data.body.trim()}
                                    className="absolute right-1.5 p-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:opacity-50 text-white rounded-full transition-colors shadow-sm"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div
                            className={`p-3 rounded-xl border border-dashed flex justify-between items-center ${isDarkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"}`}
                        >
                            <p
                                className={`text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                            >
                                Ingin ikut berdiskusi?
                            </p>
                            <Link
                                href={route("login")}
                                className="text-xs font-bold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Login Sekarang
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface DangerZone {
    id: number;
    name: string;
    description: string;
    type: string;
    severity: string;
    coordinates: any;
    is_active: boolean;
}

// ==========================================
// HALAMAN UTAMA WELCOME (LANDING PAGE)
// ==========================================
export default function Welcome({
    auth,
    reports,
    dangerZones = [],
}: PageProps<{ auth: any; reports: Report[]; dangerZones?: DangerZone[] }>) {
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [isDockHovered, setIsDockHovered] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifications = auth.notifications || [];
    const unreadCount = notifications.length;

    const markAllAsRead = () => {
        router.post(
            route("notifications.markAllRead"),
            {},
            { preserveScroll: true, onSuccess: () => setIsNotifOpen(false) },
        );
    };

    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    const containerVariants = {
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 40 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
    };

    const handleMyLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation tidak didukung oleh browser Anda.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsLocating(false);
            },
            (error) => {
                console.error("Gagal mengambil lokasi:", error);
                alert(
                    "Gagal mendapatkan lokasi. Pastikan izin lokasi browser diaktifkan.",
                );
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
    };

    const getDashboardRoute = (role: string) => {
        switch (role) {
            case "dlh":
                return route("dashboard.dlh");
            case "kaling":
                return route("dashboard.kaling");
            case "petugas":
                return route("dashboard.petugas");
            default:
                return route("dashboard.warga");
        }
    };

    return (
        <>
            <Head title={t.title} />

            <div
                className={`relative h-screen w-full overflow-hidden ${isDarkMode ? "bg-slate-900" : "bg-gray-100"}`}
            >
                <div className="absolute inset-0 z-0">
                    <MapComponent
                        reports={reports}
                        isDarkMode={isDarkMode}
                        userLocation={userLocation}
                        dangerZones={dangerZones}
                    />
                </div>

                {/* Search Bar */}
                <div className="absolute top-4 left-4 right-4 md:top-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[45%] lg:w-[35%] z-50 pointer-events-auto">
                    <div
                        className={`w-full flex items-center pl-4 pr-1.5 py-1.5 shadow-lg rounded-xl backdrop-blur-md transition-colors duration-300 border ${isDarkMode ? "bg-slate-800/90 border-slate-700" : "bg-white/90 border-gray-200"}`}
                    >
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            className={`w-full bg-transparent border-none focus:ring-0 outline-none text-sm placeholder-gray-400 font-medium ${isDarkMode ? "text-white" : "text-slate-800"}`}
                        />
                        <button className="w-9 h-9 flex-shrink-0 bg-[#a7e94a] hover:bg-[#92ce40] rounded-lg flex items-center justify-center transition-colors shadow-sm ml-2 text-slate-900">
                            <Search className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Kontrol Menu (Kanan Atas) */}
                <div className="absolute top-[72px] left-4 right-4 md:top-6 md:left-auto md:right-6 flex flex-col items-start md:items-end gap-3 z-40 pointer-events-none">
                    <div className="flex flex-row items-center gap-2 md:gap-3 pointer-events-auto w-full md:w-auto justify-between md:justify-end">
                        {/* Bahasa */}
                        <div className="relative h-11 w-auto">
                            <button
                                onClick={() =>
                                    setIsLangMenuOpen(!isLangMenuOpen)
                                }
                                className={`h-full px-3 md:px-4 flex items-center justify-between gap-1.5 md:gap-2 backdrop-blur-md shadow-md rounded-xl font-black tracking-wide text-sm transition-all duration-300 border ${isDarkMode ? "bg-slate-800/90 text-white border-slate-700 hover:border-[#a7e94a]" : "bg-white/90 text-slate-800 border-gray-200 hover:border-[#a7e94a]"}`}
                            >
                                <span className="pt-[2px]">
                                    {lang.toUpperCase()}
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke="currentColor"
                                    className={`w-3 h-3 transition-transform ${isLangMenuOpen ? "rotate-180" : ""}`}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                    />
                                </svg>
                            </button>
                            <div
                                className={`absolute top-[calc(100%+6px)] left-0 md:left-auto md:right-0 w-36 rounded-xl shadow-xl border overflow-hidden backdrop-blur-md transition-all duration-200 origin-top-left md:origin-top-right ${isLangMenuOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"} ${isDarkMode ? "bg-slate-800/95 border-slate-700 text-white" : "bg-white/95 border-gray-200 text-slate-800"}`}
                            >
                                <button
                                    onClick={() => {
                                        setLang("id");
                                        setIsLangMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-[#a7e94a] hover:text-slate-900 transition-colors ${lang === "id" ? "text-[#86bf36]" : ""}`}
                                >
                                    Indonesia (ID)
                                </button>
                                <button
                                    onClick={() => {
                                        setLang("en");
                                        setIsLangMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-[#a7e94a] hover:text-slate-900 transition-colors ${lang === "en" ? "text-[#86bf36]" : ""}`}
                                >
                                    English (EN)
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2 md:gap-3">
                            {/* Dark Mode */}
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`w-11 h-11 flex-shrink-0 backdrop-blur-md shadow-md rounded-xl flex items-center justify-center transition-all duration-300 border ${isDarkMode ? "bg-slate-800/90 text-yellow-400 border-slate-700 hover:text-[#a7e94a]" : "bg-white/90 text-slate-500 border-gray-200 hover:text-[#a7e94a]"}`}
                                title={t.mapTheme}
                            >
                                {isDarkMode ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-2.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                                        />
                                    </svg>
                                )}
                            </button>

                            {/* Lokasi Mobile */}
                            <button
                                onClick={handleMyLocation}
                                disabled={isLocating}
                                className={`w-11 h-11 flex md:hidden flex-shrink-0 backdrop-blur-md shadow-md rounded-xl items-center justify-center transition-all duration-300 border ${isDarkMode ? "bg-slate-800/90 text-blue-400 border-slate-700 hover:text-blue-300" : "bg-white/90 text-blue-500 border-gray-200 hover:text-blue-600"} ${isLocating ? "opacity-70 cursor-not-allowed" : ""}`}
                                title="Lokasi Saat Ini"
                            >
                                <Target
                                    className={`w-5 h-5 ${isLocating ? "animate-spin" : ""}`}
                                    strokeWidth={2}
                                />
                            </button>

                            {/* Notifikasi */}
                            {auth.user && (
                                <div className="relative flex-shrink-0">
                                    <button
                                        onClick={() =>
                                            setIsNotifOpen(!isNotifOpen)
                                        }
                                        className={`w-11 h-11 backdrop-blur-md shadow-md rounded-xl flex items-center justify-center transition-all duration-300 border relative ${isDarkMode ? "bg-slate-800/90 text-white border-slate-700 hover:text-[#a7e94a]" : "bg-white/90 text-slate-600 border-gray-200 hover:text-[#a7e94a]"}`}
                                    >
                                        <Bell
                                            className="w-5 h-5"
                                            strokeWidth={2}
                                        />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                                        )}
                                    </button>

                                    {/* Dropdown Notifikasi */}
                                    {isNotifOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() =>
                                                    setIsNotifOpen(false)
                                                }
                                            ></div>
                                            <div
                                                className={`absolute right-0 mt-3 w-[85vw] sm:w-80 max-w-sm rounded-2xl shadow-2xl border z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right ${isDarkMode ? "bg-slate-800/95 border-slate-700 text-white" : "bg-white/95 border-gray-200 text-slate-800"}`}
                                            >
                                                <div
                                                    className={`p-4 border-b flex justify-between items-center ${isDarkMode ? "border-slate-700 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"}`}
                                                >
                                                    <h4 className="font-bold text-sm">
                                                        Notifikasi Anda
                                                    </h4>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                        {unreadCount} Baru
                                                    </span>
                                                </div>
                                                <div className="max-h-[60vh] md:max-h-80 overflow-y-auto custom-scrollbar">
                                                    {unreadCount === 0 ? (
                                                        <div
                                                            className={`p-8 text-center ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}
                                                        >
                                                            <CheckCircleSolid className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                            <p className="text-sm font-medium">
                                                                Belum ada
                                                                pembaruan.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={`divide-y ${isDarkMode ? "divide-slate-700" : "divide-slate-50"}`}
                                                        >
                                                            {notifications.map(
                                                                (
                                                                    notif: any,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            notif.id
                                                                        }
                                                                        className={`p-4 transition-colors flex gap-3 ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-50"}`}
                                                                    >
                                                                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 bg-emerald-100 text-emerald-600 shadow-sm">
                                                                            <Bell className="w-4 h-4" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm leading-snug font-medium text-left">
                                                                                {
                                                                                    notif
                                                                                        .data
                                                                                        .message
                                                                                }
                                                                            </p>
                                                                            <p
                                                                                className={`text-[10px] mt-1.5 font-semibold text-left ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                                                                            >
                                                                                {new Date(
                                                                                    notif.created_at,
                                                                                ).toLocaleDateString(
                                                                                    "id-ID",
                                                                                    {
                                                                                        day: "numeric",
                                                                                        month: "short",
                                                                                        hour: "2-digit",
                                                                                        minute: "2-digit",
                                                                                    },
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {unreadCount > 0 && (
                                                    <div
                                                        className={`p-3 border-t ${isDarkMode ? "border-slate-700 bg-slate-900/50" : "border-slate-100 bg-slate-50"}`}
                                                    >
                                                        <button
                                                            onClick={
                                                                markAllAsRead
                                                            }
                                                            className={`w-full py-2.5 text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2 ${isDarkMode ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-800" : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"}`}
                                                        >
                                                            <CheckCircleSolid className="w-4 h-4" />{" "}
                                                            Tandai Semua Dibaca
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lokasi Desktop */}
                    <div className="hidden md:flex pointer-events-auto">
                        <button
                            onClick={handleMyLocation}
                            disabled={isLocating}
                            className={`w-11 h-11 flex-shrink-0 backdrop-blur-md shadow-md rounded-xl flex items-center justify-center transition-all duration-300 border ${isDarkMode ? "bg-slate-800/90 text-blue-400 border-slate-700 hover:text-blue-300" : "bg-white/90 text-blue-500 border-gray-200 hover:text-blue-600"} ${isLocating ? "opacity-70 cursor-not-allowed" : ""}`}
                            title="Lokasi Saat Ini"
                        >
                            <Target
                                className={`w-5 h-5 ${isLocating ? "animate-spin" : ""}`}
                                strokeWidth={2}
                            />
                        </button>
                    </div>
                </div>

                {/* ================= BOTTOM FLOATING DOCK ================= */}
                <div
                    className="absolute bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:right-auto w-full md:w-auto z-40 pb-0 md:pb-6 pointer-events-auto"
                    onMouseEnter={() => setIsDockHovered(true)}
                    onMouseLeave={() => setIsDockHovered(false)}
                >
                    <div
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/90 backdrop-blur-md rounded-t-2xl flex items-center justify-center transition-all duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] border-t border-x border-gray-200 cursor-pointer ${isDockHovered ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-0 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto"}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                            className="w-5 h-5 text-gray-400 animate-bounce mt-1"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 15.75l7.5-7.5 7.5 7.5"
                            />
                        </svg>
                    </div>

                    <div
                        className={`transition-all duration-300 ease-out flex items-center justify-evenly md:justify-center bg-white/90 backdrop-blur-md rounded-t-[2.5rem] md:rounded-2xl h-20 w-full md:w-auto px-2 md:px-10 gap-0 md:gap-12 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] md:shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-t md:border border-gray-200 relative ${isDockHovered ? "opacity-100 translate-y-0 scale-100" : "opacity-100 translate-y-0 scale-100 md:opacity-0 md:translate-y-10 md:scale-95 md:pointer-events-none"}`}
                    >
                        <button
                            onClick={() => setIsBottomSheetOpen(true)}
                            className="group relative flex flex-col items-center justify-center h-full text-gray-500 hover:text-[#a7e94a] transition-colors w-16"
                        >
                            <ListCheck
                                className="w-7 h-7 mb-3"
                                strokeWidth={1.5}
                            />
                            <span className="absolute bottom-2.5 text-[10px] font-extrabold text-center whitespace-nowrap">
                                {t.reportList}
                            </span>
                        </button>

                        <div className="relative flex items-center justify-center w-16 h-full">
                            <Link
                                href={route("report.create")}
                                className="absolute -translate-y-6 w-16 h-16 bg-[#a7e94a] hover:bg-[#92ce40] rounded-2xl flex items-center justify-center text-white shadow-[0_8px_25px_rgba(167,233,74,0.6)] hover:scale-105 transition-all duration-300 group"
                            >
                                <FilePlus
                                    className="w-9 h-9"
                                    strokeWidth={1.5}
                                />
                                <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-[#a7e94a] text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                                    {t.quickReport}
                                </span>
                            </Link>
                        </div>

                        {/* Tombol Profil / Nama User */}
                        <Link
                            href={
                                auth.user
                                    ? getDashboardRoute(auth.user.role)
                                    : route("login")
                            }
                            className="group relative flex flex-col items-center justify-center h-full text-gray-500 hover:text-[#a7e94a] transition-colors w-16"
                        >
                            {auth.user ? (
                                auth.user.avatar ? (
                                    <img
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                        referrerPolicy="no-referrer"
                                        className="w-8 h-8 mb-3 rounded-full object-cover shadow-sm border border-emerald-200 group-hover:border-[#a7e94a] transition-all"
                                    />
                                ) : (
                                    <div className="w-8 h-8 mb-3 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xs shadow-sm border border-emerald-200 group-hover:bg-[#a7e94a] group-hover:text-slate-900 group-hover:border-[#a7e94a] transition-all">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                )
                            ) : (
                                <UserWaves
                                    className="w-8 h-8 mb-3"
                                    strokeWidth={1.5}
                                />
                            )}

                            <span className="absolute bottom-2.5 text-[10px] font-extrabold text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px]">
                                {auth.user
                                    ? auth.user.name.split(" ")[0]
                                    : t.profile}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* ================= OVERLAY GELAP (BACKDROP) ================= */}
                {/* Muncul meredupkan background saat Bottom Sheet terbuka */}
                <div
                    className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-50 transition-opacity duration-500 ${
                        isBottomSheetOpen
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                    }`}
                    onClick={() => setIsBottomSheetOpen(false)}
                ></div>

                {/* ================= BOTTOM SHEET DAFTAR LAPORAN ================= */}
                <div
                    className={`absolute bottom-0 left-0 right-0 z-[60] mx-auto w-full md:max-w-2xl lg:max-w-3xl ${
                        isDarkMode ? "bg-slate-900" : "bg-slate-50"
                    } rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] h-[95vh] sm:h-[90vh] flex flex-col ${
                        isBottomSheetOpen ? "translate-y-0" : "translate-y-full"
                    }`}
                >
                    {/* Header Bottom Sheet (Garis Tarik) */}
                    <div
                        className={`w-full flex justify-center p-5 cursor-pointer rounded-t-[2.5rem] transition ${
                            isDarkMode
                                ? "hover:bg-slate-800"
                                : "hover:bg-slate-100"
                        }`}
                        onClick={() => setIsBottomSheetOpen(false)}
                    >
                        <div
                            className={`w-16 h-1.5 rounded-full ${
                                isDarkMode ? "bg-slate-600" : "bg-slate-300"
                            }`}
                        ></div>
                    </div>

                    {/* Area Scrollable Konten */}
                    <div className="px-6 sm:px-10 pb-6 overflow-y-auto flex-1 custom-scrollbar">
                        {/* Judul & Tombol Close */}
                        <div
                            className={`flex justify-between items-center mb-8 sticky top-0 backdrop-blur-sm z-10 py-2 ${
                                isDarkMode
                                    ? "bg-slate-900/90"
                                    : "bg-slate-50/90"
                            }`}
                        >
                            <h2
                                className={`text-xl sm:text-2xl font-black tracking-tight ${
                                    isDarkMode ? "text-white" : "text-slate-800"
                                }`}
                            >
                                {t.recentReportsTitle}
                            </h2>
                            <button
                                onClick={() => setIsBottomSheetOpen(false)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                    isDarkMode
                                        ? "bg-slate-800 text-slate-400 hover:bg-red-900/50 hover:text-red-400"
                                        : "bg-white border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* List Kartu Laporan */}
                        <motion.div
                            className="space-y-6 pb-24"
                            variants={containerVariants}
                            initial="hidden"
                            animate={isBottomSheetOpen ? "show" : "hidden"}
                        >
                            {reports.length === 0 ? (
                                <motion.div
                                    variants={itemVariants}
                                    className="text-center py-16 flex flex-col items-center"
                                >
                                    <div
                                        className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                                            isDarkMode
                                                ? "bg-slate-800"
                                                : "bg-white shadow-sm border border-slate-100"
                                        }`}
                                    >
                                        <ListCheck
                                            className={`w-10 h-10 ${
                                                isDarkMode
                                                    ? "text-slate-600"
                                                    : "text-slate-300"
                                            }`}
                                        />
                                    </div>
                                    <p
                                        className={`text-base font-semibold ${
                                            isDarkMode
                                                ? "text-slate-400"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        {t.noReports}
                                    </p>
                                </motion.div>
                            ) : (
                                reports.map((report) => (
                                    <motion.div
                                        key={report.id}
                                        variants={itemVariants}
                                    >
                                        <LandingReportItem
                                            report={report}
                                            auth={auth}
                                            isDarkMode={isDarkMode}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}
