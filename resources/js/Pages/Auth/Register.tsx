import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun" />

            {/* Header Pendaftaran */}
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-extrabold text-slate-800">
                    Buat Akun Warga
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                    Mari bergabung untuk memantau dan menjaga kebersihan
                    lingkungan bersama.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                {/* 1. Input Nama Lengkap */}
                <div>
                    <InputLabel
                        htmlFor="name"
                        value="Nama Lengkap"
                        className="font-bold text-slate-700 ml-1 mb-1.5"
                    />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="block w-full border-gray-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] rounded-xl shadow-sm transition-colors py-2.5 px-4 bg-gray-50/50"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Masukkan nama lengkap Anda"
                        required
                    />

                    <InputError message={errors.name} className="mt-2 ml-1" />
                </div>

                {/* 2. Input Email */}
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Alamat Email"
                        className="font-bold text-slate-700 ml-1 mb-1.5"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full border-gray-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] rounded-xl shadow-sm transition-colors py-2.5 px-4 bg-gray-50/50"
                        autoComplete="username"
                        onChange={(e) => setData("email", e.target.value)}
                        placeholder="contoh@email.com"
                        required
                    />

                    <InputError message={errors.email} className="mt-2 ml-1" />
                </div>

                {/* 3. Input Password */}
                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Kata Sandi"
                        className="font-bold text-slate-700 ml-1 mb-1.5"
                    />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full border-gray-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] rounded-xl shadow-sm transition-colors py-2.5 px-4 bg-gray-50/50"
                        autoComplete="new-password"
                        onChange={(e) => setData("password", e.target.value)}
                        placeholder="Minimal 8 karakter"
                        required
                    />

                    <InputError
                        message={errors.password}
                        className="mt-2 ml-1"
                    />
                </div>

                {/* 4. Konfirmasi Password */}
                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Kata Sandi"
                        className="font-bold text-slate-700 ml-1 mb-1.5"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="block w-full border-gray-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] rounded-xl shadow-sm transition-colors py-2.5 px-4 bg-gray-50/50"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        placeholder="Ulangi kata sandi"
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2 ml-1"
                    />
                </div>

                {/* 5. Tombol Register */}
                <div className="mt-8 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-black text-slate-900 bg-[#a7e94a] hover:bg-[#92ce40] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a7e94a] disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <svg
                                    className="animate-spin h-4 w-4 text-slate-900"
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
                                Mendaftarkan...
                            </span>
                        ) : (
                            "Daftar Sekarang"
                        )}
                    </button>
                </div>

                {/* Info Tambahan untuk Login */}
                <div className="text-center mt-6">
                    <p className="text-sm text-slate-500">
                        Sudah memiliki akun?{" "}
                        <Link
                            href={route("login")}
                            className="font-bold text-[#a7e94a] hover:text-[#92ce40] hover:underline transition-colors"
                        >
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
