import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-extrabold text-slate-800">
                    Selamat Datang Kembali!
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                    Silakan masuk untuk mengelola laporan lingkungan Anda.
                </p>
            </div>

            {status && (
                <div className="mb-6 text-sm font-medium text-green-700 bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Email"
                        className="font-bold text-slate-700 ml-1 mb-1.5"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full border-gray-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] rounded-xl shadow-sm transition-colors py-2.5 px-4 bg-gray-50/50"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData("email", e.target.value)}
                        placeholder="contoh@email.com"
                    />

                    <InputError message={errors.email} className="mt-2 ml-1" />
                </div>

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
                        autoComplete="current-password"
                        onChange={(e) => setData("password", e.target.value)}
                        placeholder="••••••••"
                    />

                    <InputError
                        message={errors.password}
                        className="mt-2 ml-1"
                    />
                </div>

                <div className="flex items-center justify-between mt-6 px-1">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                            className="text-[#a7e94a] border-gray-300 rounded focus:ring-[#a7e94a] w-4 h-4 transition-colors"
                        />
                        <span className="ms-2 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                            Ingat saya
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="text-sm font-semibold text-slate-500 hover:text-[#a7e94a] underline decoration-transparent hover:decoration-[#a7e94a] transition-all focus:outline-none focus:ring-2 focus:ring-[#a7e94a] focus:ring-offset-2 rounded-md"
                        >
                            Lupa sandi?
                        </Link>
                    )}
                </div>

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
                                Memproses...
                            </span>
                        ) : (
                            "Masuk ke Sistem"
                        )}
                    </button>
                </div>

                <div className="text-center mt-6">
                    <p className="text-sm text-slate-500">
                        Belum punya akun warga?{" "}
                        <Link
                            href={route("register")}
                            className="font-bold text-[#a7e94a] hover:text-[#92ce40] hover:underline transition-colors"
                        >
                            Daftar di sini
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
