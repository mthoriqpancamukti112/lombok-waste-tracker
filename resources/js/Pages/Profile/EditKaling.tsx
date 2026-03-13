import { FormEvent, useEffect, useState } from "react";
import KalingLayout from "@/Layouts/KalingLayout";
import { Head, useForm } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
    User,
    Telephone,
    ShieldCheck,
    Save,
    UserDiamond,
    MapPin,
} from "@mynaui/icons-react";
import Swal from "sweetalert2";
import { landingDict } from "@/Lang/Landing";

interface UserData {
    id: number;
    name: string;
    email: string;
    kaling?: {
        nik: string;
        nama_wilayah: string;
        no_telp: string | null;
    } | null;
}

interface Props extends PageProps {
    userData: UserData;
    status?: string;
}

export default function EditKaling({ auth, userData, status }: Props) {
    // === STATE UNTUK BAHASA ===
    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    useEffect(() => {
        // Ambil bahasa dari localStorage jika ada
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);
    }, []);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: userData.name,
            email: userData.email,
            no_telp: userData.kaling?.no_telp || "",
        });

    useEffect(() => {
        if (recentlySuccessful) {
            // Cek apakah dark mode aktif untuk menyesuaikan pop-up SweetAlert
            const isDarkMode =
                document.documentElement.classList.contains("dark");

            Swal.fire({
                title: t.kalingSaveSuccessTitle,
                text: t.kalingSaveSuccessDesc,
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
                background: isDarkMode ? "#1e293b" : "#ffffff", // Dark bg
                color: isDarkMode ? "#f8fafc" : "#0f172a", // Text color
            });
        }
    }, [recentlySuccessful, t]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route("profile.update"), { preserveScroll: true });
    };

    return (
        <KalingLayout
            auth={auth}
            header={
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2 transition-colors">
                        <User className="w-7 h-7 text-indigo-500" />
                        {t.kalingProfileTitle}
                    </h2>
                    <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                        {t.kalingProfileSubtitle}
                    </p>
                </div>
            }
        >
            <Head title={t.kalingProfilePageTitle} />

            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                {/* KARTU IDENTITAS KALING (ID CARD) */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-1 shadow-lg border border-indigo-400 dark:border-indigo-500/50 overflow-hidden relative transition-colors">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black opacity-10 blur-2xl"></div>

                    <div className="bg-white/10 backdrop-blur-md rounded-[22px] p-6 lg:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white flex items-center justify-center text-4xl sm:text-5xl font-black text-indigo-600 shadow-xl border-4 border-indigo-100 flex-shrink-0 relative">
                            {userData.name.charAt(0).toUpperCase()}
                            <div
                                className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm"
                                title={t.kalingOfficialBadge}
                            >
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="text-center sm:text-left flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                                <h3 className="text-2xl font-bold text-white drop-shadow-sm">
                                    {userData.name}
                                </h3>
                                <span className="bg-indigo-900/50 text-indigo-100 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit mx-auto sm:mx-0 border border-indigo-400/30">
                                    {t.kalingRoleBadge}
                                </span>
                            </div>
                            <p className="text-indigo-100 font-medium text-sm mb-5">
                                {userData.email}
                            </p>

                            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                                    <div className="bg-white/20 p-1.5 rounded-lg text-white">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">
                                            {t.kalingWorkRegion}
                                        </p>
                                        <p className="text-sm font-bold text-white leading-none mt-1">
                                            {userData.kaling?.nama_wilayah ||
                                                t.kalingRegionNotSet}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                                    <div className="bg-white/20 p-1.5 rounded-lg text-white">
                                        <UserDiamond className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">
                                            {t.kalingNIK}
                                        </p>
                                        <p className="text-sm font-bold text-white leading-none mt-1">
                                            {userData.kaling?.nik ||
                                                t.kalingRegionNotSet}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FORM UPDATE PROFIL */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                    <div className="p-6 lg:p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center transition-colors">
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">
                                {t.kalingEditContactTitle}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                                {t.kalingEditContactDesc}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-6 lg:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                                    {t.kalingFullNameLabel}{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        required
                                        className="w-full pl-10 rounded-xl border-slate-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 transition-colors"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                                    {t.kalingEmailLabel}{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 dark:text-slate-500 font-bold text-lg">
                                            @
                                        </span>
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        required
                                        className="w-full pl-10 rounded-xl border-slate-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 transition-colors"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Nomor Telepon */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                                    {t.kalingPhoneLabel}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Telephone className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.no_telp}
                                        onChange={(e) =>
                                            setData("no_telp", e.target.value)
                                        }
                                        placeholder={t.kalingPhonePlaceholder}
                                        className="w-full pl-10 rounded-xl border-slate-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 transition-colors"
                                    />
                                </div>
                                {errors.no_telp && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                        {errors.no_telp}
                                    </p>
                                )}
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 ml-1 transition-colors">
                                    {t.kalingPhoneNote}
                                </p>
                            </div>
                        </div>

                        {/* Tombol Simpan */}
                        <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-700 mt-4 transition-colors">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 min-w-[200px] flex justify-center items-center"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        {t.kalingSavingBtn}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Save className="w-5 h-5" />{" "}
                                        {t.kalingSaveProfileBtn}
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </KalingLayout>
    );
}
