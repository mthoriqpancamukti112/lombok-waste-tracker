import InputError from "@/Components/InputError";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "@mynaui/icons-react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun" />

            <div className="pt-10 px-8 pb-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900">
                        Gabung Bersama Kami
                    </h2>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        Buat akun untuk mulai berkontribusi dalam menjaga Lombok.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 ml-1">NAMA LENGKAP</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData("name", e.target.value)}
                                placeholder="Nama Lengkap Anda"
                                className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-[#a7e94a] rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 placeholder-slate-300 transition-all"
                                required
                            />
                        </div>
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 ml-1">EMAIL</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData("email", e.target.value)}
                                placeholder="your@email.com"
                                className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-[#a7e94a] rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 placeholder-slate-300 transition-all"
                                required
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 ml-1">KATA SANDI</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={e => setData("password", e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-[#a7e94a] rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 placeholder-slate-300 transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 ml-1">KONFIRMASI</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={data.password_confirmation}
                                onChange={e => setData("password_confirmation", e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-[#a7e94a] rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 placeholder-slate-300 transition-all"
                                required
                            />
                        </div>
                    </div>
                    <InputError message={errors.password} />

                    <div className="flex justify-end px-1">
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase"
                        >
                            {showPassword ? "Sembunyikan Sandi" : "Lihat Sandi"}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#a7e94a] text-white py-4 rounded-2xl text-[13px] font-black shadow-lg shadow-[#a7e94a]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-4 h-[52px] flex items-center justify-center"
                    >
                        {processing ? "MEMPROSES..." : "DAFTAR SEKARANG"}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black text-slate-300 bg-white px-4 tracking-widest uppercase">
                        Atau Menggunakan
                    </div>
                </div>

                <a
                    href={route("google.redirect")}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-100 py-3.5 rounded-2xl shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-sm font-bold text-slate-700">Daftar dengan Google</span>
                </a>

                <div className="text-center mt-10">
                    <p className="text-xs text-slate-400 font-medium">
                        Sudah memiliki akun?{" "}
                        <Link
                            href={route("login")}
                            className="font-black text-[#a7e94a] hover:text-[#92ce40] transition-colors"
                        >
                            MASUK DI SINI
                        </Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
