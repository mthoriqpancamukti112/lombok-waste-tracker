import InputError from "@/Components/InputError";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import { User, Lock, Eye, EyeOff } from "@mynaui/icons-react";

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
        remember: true,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="p-8 sm:p-12">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    {/* Menggunakan warna #a7e94a */}
                    <h2 className="text-3xl font-extrabold text-[#a7e94a] tracking-tight mb-2">
                        Welcome Back!
                    </h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Sign in to report and provide feedback regarding waste.
                    </p>
                </div>

                {/* Status Message */}
                {status && (
                    <div className="mb-6 text-sm font-bold text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                            Email
                        </label>
                        <div className="relative group">
                            {/* Icon menggunakan warna #a7e94a saat difokuskan */}
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
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

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                            Password
                        </label>
                        <div className="relative group">
                            {/* Icon menggunakan warna #a7e94a saat difokuskan */}
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                placeholder="Enter your password..."
                                className="w-full bg-slate-50 border border-slate-200 focus:border-[#a7e94a] focus:bg-white focus:ring-4 focus:ring-[#a7e94a]/10 rounded-2xl h-14 pl-12 pr-12 text-sm font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all duration-300"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex justify-between items-center px-1 pt-1">
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                    // Menggunakan warna #a7e94a
                                    className="peer w-5 h-5 rounded-md border-2 border-slate-300 text-[#a7e94a] focus:ring-[#a7e94a]/20 transition-all cursor-pointer"
                                />
                            </div>
                            <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                                Keep me signed in
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="text-xs font-bold text-[#a7e94a] hover:text-green-600 hover:underline underline-offset-2 transition-all"
                            >
                                Forgot Password?
                            </Link>
                        )}
                    </div>

                    {/* Submit Button (Solid #a7e94a) */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#a7e94a] text-slate-900 rounded-2xl text-base font-bold shadow-lg shadow-[#a7e94a]/30 hover:shadow-xl hover:shadow-[#a7e94a]/40 hover:bg-[#96d242] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-70 mt-4 h-14 flex items-center justify-center"
                    >
                        {processing ? (
                            <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        ) : (
                            "Sign In"
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

                {/* Google Sign In Button */}
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

                {/* Sign Up Link */}
                <div className="text-center mt-8">
                    <p className="text-sm text-slate-500 font-medium">
                        Don't have an account?{" "}
                        <Link
                            href={route("register")}
                            className="text-[#a7e94a] font-bold hover:text-green-600 hover:underline underline-offset-4 transition-all"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
