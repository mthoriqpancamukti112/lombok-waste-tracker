import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { X, Mail, Lock, User, Eye, EyeOff } from "@mynaui/icons-react";
import InputError from "./InputError";
import { toast } from "react-hot-toast";
import { landingDict } from "@/Lang/Landing";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: "login" | "register";
    lang?: "id" | "en";
    isDark?: boolean;
}

export default function AuthModal({
    isOpen,
    onClose,
    initialTab = "login",
    lang = "id",
    isDark = false,
}: AuthModalProps) {
    const t = landingDict[lang];

    const [activeTab, setActiveTab] = useState<"login" | "register">(
        initialTab,
    );
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        } else {
            loginForm.reset();
            registerForm.reset();
            loginForm.clearErrors();
            registerForm.clearErrors();
            setShowPassword(false);
        }
    }, [isOpen, initialTab]);

    const loginForm = useForm({
        email: "",
        password: "",
        remember: true,
    });

    const registerForm = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        loginForm.post(route("login"), {
            onSuccess: () => {
                loginForm.reset(); // <--- TAMBAHKAN INI: Bersihkan semua isian
                loginForm.clearErrors();
                onClose();
                toast.success(t.authLoginSuccess);
            },
            onFinish: () => loginForm.reset("password"),
        });
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        registerForm.post(route("register"), {
            onSuccess: () => {
                registerForm.reset(); // <--- TAMBAHKAN INI: Bersihkan Nama, Email, dan Password
                registerForm.clearErrors();
                onClose();
                toast.success(t.authRegisterSuccess);
            },
            onFinish: () =>
                registerForm.reset("password", "password_confirmation"),
        });
    };

    if (!isOpen) return null;

    // Styling helpers untuk light/dark mode
    const inputBg = isDark
        ? "bg-slate-800 border-slate-700 focus:bg-slate-800 text-slate-100 placeholder-slate-500"
        : "bg-slate-50 border-slate-200 focus:bg-white text-slate-700 placeholder-slate-400";

    const GoogleBtnBg = isDark
        ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-100"
        : "bg-white border-slate-200 hover:bg-slate-50 hover:shadow-md text-slate-700";

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 drop-shadow-2xl font-sans">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content - Lebar proporsional max-w-[420px] untuk modal */}
            <div
                className={`relative w-full max-w-[420px] max-h-[90vh] overflow-y-auto rounded-[24px] sm:rounded-[32px] shadow-2xl animate-in fade-in zoom-in duration-300 custom-scrollbar ${isDark ? "bg-slate-900 border border-slate-800" : "bg-white"}`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full transition-colors z-10 ${isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-400" : "bg-slate-100 hover:bg-slate-200 text-slate-500"}`}
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Body Area - Padding distandarkan */}
                <div className="p-6 sm:p-8">
                    {/* Tabs Switcher */}
                    <div
                        className={`flex p-1 rounded-xl mb-6 sm:mb-8 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                    >
                        <button
                            type="button"
                            onClick={() => setActiveTab("login")}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                                activeTab === "login"
                                    ? isDark
                                        ? "bg-slate-700 text-slate-100 shadow-sm"
                                        : "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            {t.authLoginTab}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("register")}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                                activeTab === "register"
                                    ? isDark
                                        ? "bg-slate-700 text-slate-100 shadow-sm"
                                        : "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            {t.authRegisterTab}
                        </button>
                    </div>

                    {/* Header Texts */}
                    <div className="mb-6 text-center">
                        <h2
                            className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-[#a7e94a]"}`}
                        >
                            {activeTab === "login"
                                ? t.authWelcome
                                : t.authJoinUs}
                        </h2>
                        <p
                            className={`text-xs sm:text-sm mt-1.5 font-medium leading-relaxed max-w-[260px] mx-auto ${isDark ? "text-slate-400" : "text-slate-500"}`}
                        >
                            {activeTab === "login"
                                ? t.authLoginSubtitle
                                : t.authRegisterSubtitle}
                        </p>
                    </div>

                    {/* Form Switcher */}
                    {activeTab === "login" ? (
                        /* ================= LOGIN FORM ================= */
                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label
                                    className={`text-xs font-bold ml-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                                >
                                    {t.authEmailLabel}
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        value={loginForm.data.email}
                                        onChange={(e) =>
                                            loginForm.setData(
                                                "email",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="your@email.com"
                                        className={`w-full border focus:ring-2 focus:ring-[#a7e94a]/20 focus:border-[#a7e94a] rounded-xl h-12 pl-10 pr-4 text-sm font-semibold outline-none transition-all duration-300 ${inputBg}`}
                                        required
                                    />
                                </div>
                                <InputError message={loginForm.errors.email} />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label
                                    className={`text-xs font-bold ml-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                                >
                                    {t.authPasswordLabel}
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={loginForm.data.password}
                                        onChange={(e) =>
                                            loginForm.setData(
                                                "password",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="••••••••"
                                        className={`w-full border focus:ring-2 focus:ring-[#a7e94a]/20 focus:border-[#a7e94a] rounded-xl h-12 pl-10 pr-10 text-sm font-semibold outline-none transition-all duration-300 ${inputBg}`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#a7e94a] focus:outline-none transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={loginForm.errors.password}
                                />
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex justify-between items-center px-1 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={loginForm.data.remember}
                                        onChange={(e) =>
                                            loginForm.setData(
                                                "remember",
                                                e.target.checked,
                                            )
                                        }
                                        className="peer w-4 h-4 rounded-sm border-2 border-slate-300 text-[#a7e94a] focus:ring-[#a7e94a]/20 transition-all cursor-pointer bg-transparent"
                                    />
                                    <span
                                        className={`text-xs font-semibold transition-colors mt-0.5 ${isDark ? "text-slate-400 group-hover:text-slate-200" : "text-slate-500 group-hover:text-slate-700"}`}
                                    >
                                        {t.authRememberMe}
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    className="text-xs font-bold text-[#a7e94a] hover:text-[#96d242] transition-colors"
                                >
                                    {t.authForgotPassword}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loginForm.processing}
                                className="w-full bg-[#a7e94a] text-slate-900 rounded-xl text-sm font-bold shadow-md shadow-[#a7e94a]/20 hover:shadow-lg hover:shadow-[#a7e94a]/30 hover:bg-[#96d242] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 mt-4 h-12 flex items-center justify-center"
                            >
                                {loginForm.processing ? (
                                    <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                ) : (
                                    t.authLoginButton
                                )}
                            </button>
                        </form>
                    ) : (
                        /* ================= REGISTER FORM ================= */
                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label
                                    className={`text-xs font-bold ml-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                                >
                                    {t.authNameLabel}
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={registerForm.data.name}
                                        onChange={(e) =>
                                            registerForm.setData(
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                        placeholder={t.authNamePlaceholder}
                                        className={`w-full border focus:ring-2 focus:ring-[#a7e94a]/20 focus:border-[#a7e94a] rounded-xl h-12 pl-10 pr-4 text-sm font-semibold outline-none transition-all duration-300 ${inputBg}`}
                                        required
                                    />
                                </div>
                                <InputError
                                    message={registerForm.errors.name}
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label
                                    className={`text-xs font-bold ml-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                                >
                                    {t.authEmailLabel}
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        value={registerForm.data.email}
                                        onChange={(e) =>
                                            registerForm.setData(
                                                "email",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="your@email.com"
                                        className={`w-full border focus:ring-2 focus:ring-[#a7e94a]/20 focus:border-[#a7e94a] rounded-xl h-12 pl-10 pr-4 text-sm font-semibold outline-none transition-all duration-300 ${inputBg}`}
                                        required
                                    />
                                </div>
                                <InputError
                                    message={registerForm.errors.email}
                                />
                            </div>

                            {/* Passwords (Grid) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label
                                        className={`text-xs font-bold ml-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                                    >
                                        {t.authPasswordLabel}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={registerForm.data.password}
                                            onChange={(e) =>
                                                registerForm.setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="••••••••"
                                            className={`w-full border focus:ring-2 focus:ring-[#a7e94a]/20 focus:border-[#a7e94a] rounded-xl h-12 pl-10 pr-4 text-sm font-semibold outline-none transition-all duration-300 ${inputBg}`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        className={`text-xs font-bold ml-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                                    >
                                        {t.authConfirmPasswordLabel}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors duration-300">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                registerForm.data
                                                    .password_confirmation
                                            }
                                            onChange={(e) =>
                                                registerForm.setData(
                                                    "password_confirmation",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="••••••••"
                                            className={`w-full border focus:ring-2 focus:ring-[#a7e94a]/20 focus:border-[#a7e94a] rounded-xl h-12 pl-10 pr-4 text-sm font-semibold outline-none transition-all duration-300 ${inputBg}`}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <InputError
                                message={registerForm.errors.password}
                            />

                            <div className="flex justify-end px-1">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="text-[11px] font-bold text-slate-400 hover:text-[#a7e94a] transition-colors flex items-center gap-1"
                                >
                                    {showPassword ? (
                                        <>
                                            <EyeOff className="w-3 h-3" /> Hide
                                            Password
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-3 h-3" /> Show
                                            Password
                                        </>
                                    )}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={registerForm.processing}
                                className="w-full bg-[#a7e94a] text-slate-900 rounded-xl text-sm font-bold shadow-md shadow-[#a7e94a]/20 hover:shadow-lg hover:shadow-[#a7e94a]/30 hover:bg-[#96d242] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 mt-4 h-12 flex items-center justify-center"
                            >
                                {registerForm.processing ? (
                                    <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                ) : (
                                    t.authRegisterButton
                                )}
                            </button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div
                                className={`w-full border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}
                            />
                        </div>
                        <div
                            className={`relative flex justify-center text-[11px] font-bold px-4 uppercase tracking-widest ${isDark ? "bg-slate-900 text-slate-500" : "bg-white text-slate-400"}`}
                        >
                            {t.authOrUse}
                        </div>
                    </div>

                    {/* Google Login */}
                    <a
                        href={route("google.redirect")}
                        className={`w-full flex items-center justify-center gap-3 h-12 rounded-xl border transition-all duration-300 active:scale-[0.98] ${GoogleBtnBg}`}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                        <span className="text-sm font-bold tracking-tight">
                            {t.authGoogleLogin}
                        </span>
                    </a>

                    {/* Terms Info */}
                    <div className="mt-6 text-center">
                        <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                            {t.authTermsInfo}{" "}
                            <span className="text-[#a7e94a] font-bold hover:underline cursor-pointer">
                                {t.authTermsLink}
                            </span>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
