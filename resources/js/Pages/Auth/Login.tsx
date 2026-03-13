import InputError from "@/Components/InputError";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useState, useEffect } from "react";
// Tambahkan import SunSolid dan MoonSolid
import {
    User,
    Lock,
    Eye,
    EyeOff,
    SunSolid,
    MoonSolid,
} from "@mynaui/icons-react";
import { landingDict } from "@/Lang/Landing";
import ForgotPasswordModal from "@/Components/ForgotPasswordModal";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    // --- STATE BAHASA ---
    const [lang, setLang] = useState<"id" | "en">("id");

    // --- STATE MODAL LUPA PASSWORD ---
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

    // --- STATE DARK MODE ---
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) {
            setLang(savedLang);
        }

        // --- INISIALISASI DARK MODE ---
        const savedTheme = localStorage.getItem("appTheme");
        if (savedTheme === "dark") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else if (savedTheme === "light") {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    // --- PERSIST DARK MODE SAAT BERUBAH ---
    useEffect(() => {
        localStorage.setItem("appTheme", isDarkMode ? "dark" : "light");
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    const toggleDark = () => setIsDarkMode((prev) => !prev);

    // Ambil kamus terjemahan berdasarkan state `lang` saat ini
    const t = landingDict[lang];
    // --------------------------------------------------

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
            <Head title={t.authLoginTitle} />

            <div className="p-8 sm:p-12 relative">
                {/* Header Section */}
                <div className="mb-8 text-center mt-2">
                    <h2 className="text-3xl font-extrabold text-[#a7e94a] tracking-tight mb-2">
                        {t.authWelcomeBack}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {t.authLoginSubtitle}
                    </p>
                </div>

                {/* Status Message */}
                {status && (
                    <div className="mb-6 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                            {t.authEmailLabel}
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#a7e94a] dark:group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                placeholder={t.authEmailPlaceholder}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-[#a7e94a] dark:focus:border-[#a7e94a] focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-[#a7e94a]/10 rounded-2xl h-14 pl-12 pr-4 text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300"
                                required
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                            {t.authPasswordLabel}
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#a7e94a] dark:group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                placeholder={t.authPasswordPlaceholder}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-[#a7e94a] dark:focus:border-[#a7e94a] focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-[#a7e94a]/10 rounded-2xl h-14 pl-12 pr-12 text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none transition-colors"
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
                                    className="peer w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-[#a7e94a] focus:ring-[#a7e94a]/20 transition-all cursor-pointer"
                                />
                            </div>
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                                {t.authRememberMe}
                            </span>
                        </label>

                        {canResetPassword && (
                            <button
                                type="button"
                                onClick={() => setIsForgotModalOpen(true)}
                                className="text-xs font-bold text-[#a7e94a] hover:text-green-600 hover:underline underline-offset-2 transition-all"
                            >
                                {t.authForgotPassword}
                            </button>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#a7e94a] text-slate-900 rounded-2xl text-base font-bold shadow-lg shadow-[#a7e94a]/30 hover:shadow-xl hover:shadow-[#a7e94a]/40 hover:bg-[#96d242] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-70 mt-4 h-14 flex items-center justify-center"
                    >
                        {processing ? (
                            <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        ) : (
                            t.authLoginButton
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-4 uppercase tracking-widest transition-colors duration-300">
                        {t.authOrUse}
                    </div>
                </div>

                {/* Google Sign In Button */}
                <a
                    href={route("google.redirect")}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-14 rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 active:scale-[0.98]"
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
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                        {t.authGoogleLogin}
                    </span>
                </a>

                {/* Sign Up Link */}
                <div className="text-center mt-8">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {t.authNoAccount}{" "}
                        <Link
                            href={route("register")}
                            className="text-[#a7e94a] font-bold hover:text-green-600 hover:underline underline-offset-4 transition-all"
                        >
                            {t.authSignUpLink}
                        </Link>
                    </p>
                </div>
            </div>

            {/* MODAL LUPA PASSWORD (Sekarang membaca state isDarkMode) */}
            <ForgotPasswordModal
                isOpen={isForgotModalOpen}
                onClose={() => setIsForgotModalOpen(false)}
                onBackToLogin={() => setIsForgotModalOpen(false)}
                isDark={isDarkMode}
                lang={lang}
            />
        </GuestLayout>
    );
}
