import { FormEvent, useEffect } from "react";
import WargaLayout from "@/Layouts/WargaLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
    User,
    Telephone,
    MapPin,
    Ribbon,
    ShieldCheck,
    CheckCircleSolid,
    Save,
} from "@mynaui/icons-react";
import Swal from "sweetalert2";

interface UserData {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    warga?: {
        no_telp: string | null;
        alamat: string | null;
        poin_kepercayaan: number;
        is_terverifikasi: boolean;
    } | null;
}

interface Props extends PageProps {
    userData: UserData;
    status?: string;
}

export default function Edit({ auth, userData, status }: Props) {
    // Setup form menggunakan useForm Inertia
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: userData.name,
            email: userData.email,
            no_telp: userData.warga?.no_telp || "",
            alamat: userData.warga?.alamat || "",
        });

    // Notifikasi sukses
    useEffect(() => {
        if (recentlySuccessful) {
            Swal.fire({
                title: "Berhasil!",
                text: "Profil Anda telah diperbarui.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
        }
    }, [recentlySuccessful]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route("profile.update"), { preserveScroll: true });
    };

    return (
        <WargaLayout
            auth={auth}
            header={
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <User className="w-7 h-7 text-emerald-500" />
                        Pengaturan Profil
                    </h2>
                    <p className="text-xs lg:text-sm text-slate-500 mt-1">
                        Kelola informasi identitas dan kredibilitas akun Anda.
                    </p>
                </div>
            }
        >
            <Head title="Profil Saya" />

            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                {/* KARTU REPUTASI / GAMIFIKASI */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-1 shadow-lg border border-emerald-400 overflow-hidden relative">
                    {/* Hiasan Latar */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black opacity-10 blur-2xl"></div>

                    <div className="bg-white/10 backdrop-blur-md rounded-[22px] p-6 lg:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                        {/* Avatar */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white flex items-center justify-center text-4xl sm:text-5xl font-black text-emerald-600 shadow-xl border-4 border-emerald-100 flex-shrink-0 relative">
                            {auth.user?.avatar || userData.avatar ? (
                                <img
                                    src={
                                        (auth.user?.avatar ||
                                            userData.avatar) as string
                                    }
                                    alt={userData.name}
                                    referrerPolicy="no-referrer"
                                    className="absolute inset-0 w-full h-full rounded-full object-cover z-0"
                                />
                            ) : (
                                <span className="relative z-10">
                                    {userData.name.charAt(0).toUpperCase()}
                                </span>
                            )}

                            {/* Badge Verifikasi */}
                            {userData.warga?.is_terverifikasi && (
                                <div
                                    className="absolute bottom-0 right-0 sm:bottom-0.5 sm:right-0.5 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm z-20"
                                    title="Akun Terverifikasi"
                                >
                                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            )}
                        </div>

                        {/* Info Reputasi */}
                        <div className="text-center sm:text-left flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                                <h3 className="text-2xl font-bold text-white drop-shadow-sm">
                                    {userData.name}
                                </h3>
                                <span className="bg-white/20 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit mx-auto sm:mx-0 border border-white/30">
                                    Warga
                                </span>
                            </div>
                            <p className="text-emerald-50 font-medium text-sm mb-5">
                                {userData.email}
                            </p>

                            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                <div className="bg-white/20 border border-white/30 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-sm shadow-sm">
                                    <div className="bg-amber-400 p-1.5 rounded-lg text-amber-900">
                                        <Ribbon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-emerald-50 font-bold uppercase tracking-wider">
                                            Poin Kepercayaan
                                        </p>
                                        <p className="text-lg font-black text-white leading-none">
                                            {userData.warga?.poin_kepercayaan ||
                                                0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FORM UPDATE PROFIL */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 lg:p-8 border-b border-slate-100 bg-slate-50/50">
                        <h4 className="text-lg font-bold text-slate-800">
                            Informasi Pribadi
                        </h4>
                        <p className="text-sm text-slate-500">
                            Perbarui nama, nomor telepon, dan alamat domisili
                            Anda.
                        </p>
                    </div>

                    <form onSubmit={submit} className="p-6 lg:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Nama Lengkap{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        required
                                        className="w-full pl-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-slate-50 p-2.5 transition-colors"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Alamat Email{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-bold text-lg">
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
                                        className="w-full pl-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-slate-50 p-2.5 transition-colors"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Nomor Telepon */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Nomor WhatsApp / Telepon
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Telephone className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.no_telp}
                                        onChange={(e) =>
                                            setData("no_telp", e.target.value)
                                        }
                                        placeholder="081234567890"
                                        className="w-full pl-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-slate-50 p-2.5 transition-colors"
                                    />
                                </div>
                                {errors.no_telp && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.no_telp}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Alamat */}
                        <div>
                            <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                Domisili Saat Ini
                            </label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <MapPin className="h-5 w-5 text-slate-400" />
                                </div>
                                <textarea
                                    value={data.alamat}
                                    onChange={(e) =>
                                        setData("alamat", e.target.value)
                                    }
                                    rows={3}
                                    placeholder="Tuliskan alamat lengkap beserta nama lingkungan/kelurahan..."
                                    className="w-full pl-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-slate-50 p-2.5 transition-colors resize-none"
                                ></textarea>
                            </div>
                            {errors.alamat && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.alamat}
                                </p>
                            )}
                        </div>

                        {/* Tombol Simpan */}
                        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-md disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 min-w-[200px] flex justify-center items-center"
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
                                        Menyimpan...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Simpan Perubahan
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* AREA GANTI PASSWORD (Opsional tapi direkomendasikan) */}
                <div className="text-center mt-8">
                    <p className="text-sm text-slate-400 mb-2">
                        Ingin mengganti kata sandi atau menghapus akun?
                    </p>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            Swal.fire(
                                "Fitur Segera Hadir",
                                "Halaman keamanan akun sedang dalam pengembangan.",
                                "info",
                            );
                        }}
                        className="text-sm font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
                    >
                        Ke Pengaturan Keamanan
                    </a>
                </div>
            </div>
        </WargaLayout>
    );
}
