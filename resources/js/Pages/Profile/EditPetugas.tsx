import { FormEvent, useEffect } from "react";
import PetugasLayout from "@/Layouts/PetugasLayout";
import { Head, useForm } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
    User,
    ShieldCheck,
    Save,
    Truck,
    InfoCircle,
    Telephone,
} from "@mynaui/icons-react";
import Swal from "sweetalert2";

interface UserData {
    id: number;
    name: string;
    email: string;
    petugas?: {
        jenis_kendaraan: string;
        plat_nomor: string | null;
        kapasitas_kg: number;
        is_aktif: boolean;
        no_telp: string | null;
    } | null;
}

interface Props extends PageProps {
    userData: UserData;
    status?: string;
}

export default function EditPetugas({ auth, userData, status }: Props) {
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: userData.name,
            email: userData.email,
            no_telp: userData.petugas?.no_telp || "",
        });

    useEffect(() => {
        if (recentlySuccessful) {
            Swal.fire({
                title: "Tersimpan!",
                text: "Data profil Petugas berhasil diperbarui.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
            });
        }
    }, [recentlySuccessful]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route("profile.update"), { preserveScroll: true });
    };

    const formatKendaraan = (jenis: string) => {
        if (!jenis) return "Belum Diatur";
        return jenis
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <PetugasLayout
            auth={auth}
            header={
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <User className="w-7 h-7 text-amber-500" />
                        Profil & Armada
                    </h2>
                    <p className="text-xs lg:text-sm text-slate-500 mt-1">
                        Kelola informasi akun dan pantau status armada Anda.
                    </p>
                </div>
            }
        >
            <Head title="Profil Petugas" />

            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                {/* KARTU IDENTITAS ARMADA (ID CARD) */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-1 shadow-lg border border-amber-400 overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black opacity-10 blur-2xl"></div>

                    <div className="bg-white/10 backdrop-blur-md rounded-[22px] p-6 lg:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white flex items-center justify-center text-4xl sm:text-5xl font-black text-amber-600 shadow-xl border-4 border-amber-100 flex-shrink-0 relative">
                            {userData.name.charAt(0).toUpperCase()}
                            <div
                                className={`absolute bottom-0 right-0 ${userData.petugas?.is_aktif ? "bg-green-500" : "bg-red-500"} text-white p-1.5 rounded-full border-2 border-white shadow-sm`}
                                title={
                                    userData.petugas?.is_aktif
                                        ? "Status: Aktif"
                                        : "Status: Non-Aktif"
                                }
                            >
                                <Truck className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="text-center sm:text-left flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                                <h3 className="text-2xl font-bold text-white drop-shadow-sm">
                                    {userData.name}
                                </h3>
                                <span className="bg-amber-900/40 text-amber-50 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit mx-auto sm:mx-0 border border-amber-300/30">
                                    Petugas Lapangan
                                </span>
                            </div>
                            <p className="text-amber-100 font-medium text-sm mb-5">
                                {userData.email}
                            </p>

                            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                                    <div className="bg-white/20 p-1.5 rounded-lg text-white">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">
                                            Jenis Armada
                                        </p>
                                        <p className="text-sm font-bold text-white leading-none mt-1">
                                            {formatKendaraan(
                                                userData.petugas
                                                    ?.jenis_kendaraan || "",
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                                    <div className="text-left">
                                        <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">
                                            Plat Nomor
                                        </p>
                                        <p className="text-sm font-bold text-white leading-none mt-1 uppercase">
                                            {userData.petugas?.plat_nomor ||
                                                "TIDAK ADA"}
                                        </p>
                                    </div>
                                    <div className="w-px h-8 bg-white/20 mx-2"></div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">
                                            Kapasitas
                                        </p>
                                        <p className="text-sm font-bold text-white leading-none mt-1">
                                            {userData.petugas?.kapasitas_kg ||
                                                0}{" "}
                                            KG
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* INFO DATA ARMADA (Peringatan) */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
                    <InfoCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h5 className="text-sm font-bold text-blue-800">
                            Perubahan Data Armada
                        </h5>
                        <p className="text-xs text-blue-600 mt-1">
                            Data kendaraan (Jenis, Plat, Kapasitas) dikelola
                            langsung oleh pihak DLH. Jika Anda berganti armada
                            atau terdapat kesalahan data, silakan lapor ke
                            kantor DLH.
                        </p>
                    </div>
                </div>

                {/* FORM UPDATE PROFIL */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 lg:p-8 border-b border-slate-100 bg-slate-50/50">
                        <h4 className="text-lg font-bold text-slate-800">
                            Edit Akun
                        </h4>
                        <p className="text-sm text-slate-500">
                            Perbarui nama dan email untuk keperluan login
                            sistem.
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
                                        className="w-full pl-10 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 p-2.5 transition-colors"
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
                                        className="w-full pl-10 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 p-2.5 transition-colors"
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
                                    Nomor WhatsApp Aktif
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
                                        placeholder="Contoh: 628123456789"
                                        className="w-full pl-10 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 p-2.5 transition-colors"
                                    />
                                </div>
                                {errors.no_telp && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.no_telp}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Tombol Simpan */}
                        <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-md disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 min-w-[200px] flex justify-center items-center"
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
                                        <Save className="w-5 h-5" /> Simpan
                                        Profil
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PetugasLayout>
    );
}
