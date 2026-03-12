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

            {/* Padding disamakan dengan halaman Login */}
            <div className="p-8 sm:p-12">
                {/* Header Section */}
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-extrabold text-[#a7e94a] tracking-tight mb-2">
                        Join to Preserve
                    </h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                        Sign up to start reporting waste and help the
                        environment.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Full Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1 block">
                            Full Name
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="Enter your name..."
                                className="w-full bg-slate-50 border border-slate-200 focus:border-[#a7e94a] focus:bg-white focus:ring-4 focus:ring-[#a7e94a]/10 rounded-2xl h-14 pl-12 pr-4 text-sm font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all duration-300"
                                required
                            />
                        </div>
                        <InputError message={errors.name} />
                    </div>

                    {/* Email Address Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1 block">
                            Email Address
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                placeholder="Enter your email..."
                                className="w-full bg-slate-50 border border-slate-200 focus:border-[#a7e94a] focus:bg-white focus:ring-4 focus:ring-[#a7e94a]/10 rounded-2xl h-14 pl-12 pr-4 text-sm font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all duration-300"
                                required
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    {/* Password & Confirm Password (Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1 block">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#a7e94a] focus:bg-white focus:ring-4 focus:ring-[#a7e94a]/10 rounded-2xl h-14 pl-12 pr-4 text-sm font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1 block">
                                Confirm
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#a7e94a] focus:bg-white focus:ring-4 focus:ring-[#a7e94a]/10 rounded-2xl h-14 pl-12 pr-4 text-sm font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <InputError message={errors.password} />

                    <div className="flex justify-end px-1 pt-1">
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-xs font-bold text-slate-400 hover:text-[#a7e94a] transition-colors flex items-center gap-1.5"
                        >
                            {showPassword ? (
                                <>
                                    <EyeOff className="w-3.5 h-3.5" /> Hide
                                    Password
                                </>
                            ) : (
                                <>
                                    <Eye className="w-3.5 h-3.5" /> Show
                                    Password
                                </>
                            )}
                        </button>
                    </div>

                    {/* Submit Button (Solid #a7e94a) */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#a7e94a] text-slate-900 rounded-2xl text-base font-bold shadow-lg shadow-[#a7e94a]/30 hover:shadow-xl hover:shadow-[#a7e94a]/40 hover:bg-[#96d242] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-70 mt-6 h-14 flex items-center justify-center"
                    >
                        {processing ? (
                            <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs font-bold text-slate-400 bg-white px-4 uppercase tracking-widest">
                        OR
                    </div>
                </div>

                {/* Google Sign Up Button */}
                <a
                    href={route("google.redirect")}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 h-14 rounded-2xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 active:scale-[0.98]"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    <span className="text-sm font-bold text-slate-700 tracking-tight">
                        Continue with Google
                    </span>
                </a>

                {/* Sign In Link */}
                <div className="text-center mt-8">
                    <p className="text-sm text-slate-500 font-medium">
                        Already have an account?{" "}
                        <Link
                            href={route("login")}
                            className="text-[#a7e94a] font-bold hover:text-green-600 hover:underline underline-offset-4 transition-all"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
