import React, { useState, useMemo } from "react";
import { Link, router } from "@inertiajs/react";
import { X } from "@mynaui/icons-react";
import { toast } from "react-hot-toast";
import { landingDict } from "@/Lang/Landing";

interface Report {
    id: number;
    description: string;
    status: string;
    waste_type?: string;
    photo_path: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    address?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    google_id?: string | null;
    role?: string;
    warga?: {
        is_terverifikasi: boolean;
        poin_kepercayaan: number;
    } | null;
}

interface ProfileContentProps {
    user: User;
    reports: Report[];
    onClose?: () => void;
    isDark?: boolean;
    lang?: "id" | "en";
}

const statusCls: Record<string, string> = {
    menunggu: "bg-red-100 text-red-600",
    proses: "bg-blue-100 text-blue-600",
    selesai: "bg-[#a7e94a]/20 text-[#5a8a1a]",
};

const ProfileContent: React.FC<ProfileContentProps> = ({
    user,
    reports,
    onClose,
    isDark = false,
    lang = "id",
}) => {
    if (!user) return null;
    const t = landingDict[lang];
    const [activeTab, setActiveTab] = useState("all");

    const avatarSrc =
        user.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=a7e94a&color=fff&size=256`;

    const isGoogleLinked = !!user.google_id;

    const filteredReports =
        activeTab === "all"
            ? reports
            : activeTab === "high-upvote"
              ? [...reports]
                    .sort((a, b) => b.likes_count - a.likes_count)
                    .slice(0, 6)
              : reports.filter((r) => r.status === "selesai");

    const totalLikes = reports.reduce((sum, r) => sum + r.likes_count, 0);
    const totalComments = reports.reduce((sum, r) => sum + r.comments_count, 0);

    const bg = isDark
        ? "bg-slate-900 text-slate-100"
        : "bg-white text-slate-800";
    const cardBg = isDark
        ? "bg-slate-800 border-slate-700"
        : "bg-slate-50 border-slate-100";
    const inBg = isDark
        ? "bg-slate-700 border-slate-600"
        : "bg-white border-slate-100";
    const subtle = isDark ? "text-slate-400" : "text-slate-400";

    return (
        <div className={`flex flex-col ${bg}`}>
            {/* Header */}
            <div
                className={`sticky top-0 z-10 px-6 py-5 flex items-center justify-between flex-shrink-0 border-b ${isDark ? "border-slate-700" : "border-slate-100"} ${bg}`}
            >
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors`}
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                )}
                <h2 className="text-lg font-black tracking-tight">
                    {t.profile}
                </h2>
                <button
                    onClick={() => {
                        router.post(
                            route("logout"),
                            {},
                            {
                                onSuccess: () => {
                                    toast.success(t.logoutSuccess);
                                },
                            },
                        );
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                        />
                    </svg>
                    {t.logout}
                </button>
            </div>

            {/* Body */}
            <div>
                {/* ─── MOBILE layout ─── */}
                <div className="xl:hidden px-5 pt-5 pb-28 flex flex-col gap-4">
                    {/* User Info card */}
                    <div
                        className={`rounded-3xl p-5 border flex flex-col gap-5 ${cardBg}`}
                    >
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-28 h-28 rounded-[28px] overflow-hidden shadow-lg ring-4 ring-[#a7e94a]/20">
                                <img
                                    src={avatarSrc}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-black">
                                    {user.name}
                                </p>
                                <p className={`text-xs ${subtle}`}>
                                    {user.email}
                                </p>
                                {user.role && (
                                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-[#a7e94a]/15 text-[#5a8a1a] text-[10px] font-extrabold uppercase tracking-wide">
                                        {user.role}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                {
                                    label: t.reportsLabel,
                                    value: reports.length,
                                },
                                { label: t.likes, value: totalLikes },
                                { label: t.comments, value: totalComments },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className={`flex flex-col items-center py-3 rounded-2xl border ${inBg}`}
                                >
                                    <span className="text-xl font-black text-[#a7e94a]">
                                        {stat.value}
                                    </span>
                                    <span
                                        className={`text-[10px] font-bold ${subtle}`}
                                    >
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div
                            className={`h-px ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                        />

                        {/* Certified account */}
                        {user.role === "warga" && (
                            <div>
                                <span
                                    className={`text-xs font-bold uppercase tracking-wider ${subtle}`}
                                >
                                    {t.verifiedAccount}
                                </span>
                                <div
                                    className={`mt-2 border rounded-2xl px-4 py-3 flex items-center justify-between ${inBg}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${user.warga?.is_terverifikasi ? "bg-[#a7e94a]" : "bg-slate-200"}`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2.5}
                                                stroke={
                                                    user.warga?.is_terverifikasi
                                                        ? "#fff"
                                                        : "#94a3b8"
                                                }
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">
                                                {t.citizenStatus}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <div
                                                    className={`w-1.5 h-1.5 rounded-full ${user.warga?.is_terverifikasi ? "bg-[#a7e94a]" : "bg-slate-300"}`}
                                                />
                                                <span
                                                    className={`text-[10px] font-bold ${user.warga?.is_terverifikasi ? "text-[#a7e94a]" : subtle}`}
                                                >
                                                    {user.warga
                                                        ?.is_terverifikasi
                                                        ? t.verified
                                                        : t.unverified}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-black text-[#a7e94a]">
                                            {user.warga?.poin_kepercayaan || 0}
                                        </span>
                                        <span
                                            className={`text-[9px] font-bold ${subtle}`}
                                        >
                                            {t.point}
                                        </span>
                                    </div>
                                </div>
                                {!user.warga?.is_terverifikasi && (
                                    <p className={`mt-2 text-[10px] ${subtle}`}>
                                        {t.collectPointsInfo}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Posts card */}
                    <div
                        className={`rounded-3xl p-5 border flex flex-col gap-4 ${cardBg}`}
                    >
                        <h3 className="text-base font-black">{t.myReports}</h3>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                ["all", t.filterAll],
                                ["high-upvote", t.mostPopular],
                                ["selesai", t.filterCompleted],
                            ].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setActiveTab(val)}
                                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${activeTab === val ? "bg-[#a7e94a] text-white shadow-md" : isDark ? "bg-slate-700 text-slate-300" : "bg-white text-slate-400 border border-slate-100"}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {filteredReports.length === 0 ? (
                            <p className={`text-sm text-center py-8 ${subtle}`}>
                                {t.noReports}
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {filteredReports.slice(0, 6).map((report) => (
                                    <div
                                        key={report.id}
                                        className="aspect-square rounded-2xl overflow-hidden bg-slate-200 group relative"
                                    >
                                        <img
                                            src={`/storage/${report.photo_path}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt=""
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src =
                                                    "https://placehold.co/200/e2e8f0/94a3b8?text=📷";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 gap-1">
                                            <span
                                                className={`self-start px-2 py-0.5 rounded-md text-[9px] font-extrabold ${statusCls[report.status] ?? "bg-slate-100"}`}
                                            >
                                                {report.status === "selesai"
                                                    ? t.statusCompleted
                                                    : report.status === "proses"
                                                      ? t.statusInProcess
                                                      : t.statusWaiting}
                                            </span>
                                            <p className="text-white text-[10px] font-semibold line-clamp-2">
                                                {report.description}
                                            </p>
                                            <div className="flex gap-2 text-white/80">
                                                <span className="text-[9px] font-bold">
                                                    👍 {report.likes_count}
                                                </span>
                                                <span className="text-[9px] font-bold">
                                                    💬 {report.comments_count}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── DESKTOP layout (3-col) ─── */}
                <div className="hidden xl:grid xl:grid-cols-3 gap-12 px-12 pt-10 pb-32 max-w-[1400px] mx-auto">
                    {/* Col 1: User Info */}
                    <div className="flex flex-col gap-7">
                        {/* Avatar */}
                        <div>
                            <span
                                className={`text-[11px] font-black uppercase tracking-[0.1em] ${subtle}`}
                            >
                                Photo
                            </span>
                            <div className="mt-4 flex items-center gap-5">
                                <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-xl ring-4 ring-[#a7e94a]/20 shrink-0">
                                    <img
                                        src={avatarSrc}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-base font-black leading-tight">
                                        {user.name}
                                    </p>
                                    <p className={`text-xs ${subtle}`}>
                                        {user.email}
                                    </p>
                                    {user.role && (
                                        <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-[#a7e94a]/15 text-[#5a8a1a] text-[10px] font-extrabold uppercase">
                                            {user.role}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                {
                                    label: t.reportsLabel,
                                    value: reports.length,
                                },
                                { label: t.likes, value: totalLikes },
                                { label: t.comments, value: totalComments },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className={`flex flex-col items-center py-4 rounded-2xl border ${inBg}`}
                                >
                                    <span className="text-2xl font-black text-[#a7e94a]">
                                        {stat.value}
                                    </span>
                                    <span
                                        className={`text-[10px] font-bold ${subtle}`}
                                    >
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Certified account */}
                        {user.role === "warga" && (
                            <div>
                                <span
                                    className={`text-[11px] font-black uppercase tracking-[0.1em] ${subtle}`}
                                >
                                    {t.verifiedAccount}
                                </span>
                                <div
                                    className={`mt-3 border rounded-[24px] px-5 py-4 flex items-center justify-between ${inBg}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${user.warga?.is_terverifikasi ? "bg-[#a7e94a]" : "bg-slate-200"}`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2.5}
                                                stroke={
                                                    user.warga?.is_terverifikasi
                                                        ? "#fff"
                                                        : "#94a3b8"
                                                }
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">
                                                {t.citizenStatus}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <div
                                                    className={`w-1.5 h-1.5 rounded-full ${user.warga?.is_terverifikasi ? "bg-[#a7e94a]" : "bg-slate-300"}`}
                                                />
                                                <span
                                                    className={`text-[10px] font-bold ${user.warga?.is_terverifikasi ? "text-[#a7e94a]" : subtle}`}
                                                >
                                                    {user.warga
                                                        ?.is_terverifikasi
                                                        ? t.verified
                                                        : t.unverified}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-black text-[#a7e94a]">
                                            {user.warga?.poin_kepercayaan || 0}
                                        </span>
                                        <span
                                            className={`text-[9px] font-bold ${subtle}`}
                                        >
                                            {t.point}
                                        </span>
                                    </div>
                                </div>
                                {!user.warga?.is_terverifikasi && (
                                    <p className={`mt-2 text-[10px] ${subtle}`}>
                                        {t.collectPointsInfo}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Col 2: Posts */}
                    <div className="flex flex-col gap-6">
                        <h3 className="text-lg font-black">{t.myReports}</h3>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                ["all", t.filterAll],
                                ["high-upvote", t.mostPopular],
                                ["selesai", t.filterCompleted],
                            ].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setActiveTab(val)}
                                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === val ? "bg-[#a7e94a] text-white shadow-lg shadow-[#a7e94a]/25" : isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {filteredReports.length === 0 ? (
                            <p
                                className={`text-sm text-center py-12 ${subtle}`}
                            >
                                {t.noReports}
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {filteredReports.slice(0, 4).map((report) => (
                                    <div
                                        key={report.id}
                                        className="aspect-[4/5] rounded-[28px] overflow-hidden bg-slate-100 group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative"
                                    >
                                        <img
                                            src={`/storage/${report.photo_path}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt=""
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src =
                                                    "https://placehold.co/300/e2e8f0/94a3b8?text=📷";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 gap-2">
                                            <span
                                                className={`self-start px-2 py-0.5 rounded-md text-[9px] font-extrabold ${statusCls[report.status] ?? "bg-slate-100 text-slate-500"}`}
                                            >
                                                {report.status === "selesai"
                                                    ? t.statusCompleted
                                                    : report.status === "proses"
                                                      ? t.statusInProcess
                                                      : t.statusWaiting}
                                            </span>
                                            <p className="text-white text-xs font-semibold line-clamp-2">
                                                {report.description}
                                            </p>
                                            <div className="flex gap-3 text-white/80">
                                                <span className="text-xs font-bold">
                                                    👍 {report.likes_count}
                                                </span>
                                                <span className="text-xs font-bold">
                                                    💬 {report.comments_count}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Col 3: Recent reports list */}
                    <div className="flex flex-col gap-6">
                        <h3 className="text-lg font-black">{t.history}</h3>
                        <div className="space-y-3">
                            {reports.length === 0 ? (
                                <p className={`text-sm ${subtle}`}>
                                    {t.noReports}
                                </p>
                            ) : (
                                reports.slice(0, 6).map((report) => (
                                    <div
                                        key={report.id}
                                        className={`border rounded-[22px] p-4 flex gap-3 items-start shadow-sm ${inBg}`}
                                    >
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                                            <img
                                                src={`/storage/${report.photo_path}`}
                                                className="w-full h-full object-cover"
                                                alt=""
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).src =
                                                        "https://placehold.co/48/e2e8f0/94a3b8?text=📷";
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold leading-snug line-clamp-2">
                                                {report.description}
                                            </p>
                                            {report.address && (
                                                <p
                                                    className={`text-[10px] ${subtle} mt-0.5 truncate`}
                                                >
                                                    📍 {report.address}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-2">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${statusCls[report.status] ?? "bg-slate-100 text-slate-500"}`}
                                                >
                                                    {report.status === "selesai"
                                                        ? t.statusCompleted
                                                        : report.status ===
                                                            "proses"
                                                          ? t.statusInProcess
                                                          : t.statusWaiting}
                                                </span>
                                                <div className="flex gap-2 text-[10px] font-bold text-slate-400">
                                                    <span>
                                                        👍 {report.likes_count}
                                                    </span>
                                                    <span>
                                                        💬{" "}
                                                        {report.comments_count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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

export default ProfileContent;
