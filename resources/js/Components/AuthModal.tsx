import React, { useState, useEffect } from "react";
import { useForm, Link } from "@inertiajs/react";
import { X, Mail, Lock, User, Eye, EyeOff } from "@mynaui/icons-react";
import InputError from "./InputError";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, initialTab = "login" }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
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
            onSuccess: () => onClose(),
            onFinish: () => loginForm.reset("password"),
        });
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        registerForm.post(route("register"), {
            onSuccess: () => onClose(),
            onFinish: () => registerForm.reset("password", "password_confirmation"),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 drop-shadow-2xl">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-[440px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                {/* Tabs Area */}
                <div className="pt-10 px-8 pb-4">
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8">
                        <button
                            onClick={() => setActiveTab("login")}
                            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === "login"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            MASUK
                        </button>
                        <button
                            onClick={() => setActiveTab("register")}
                            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === "register"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            DAFTAR
                        </button>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-slate-900">
                            {activeTab === "login" ? "Selamat Datang" : "Gabung Bersama Kami"}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1 font-medium">
                            {activeTab === "login"
                                ? "Masuk untuk melanjutkan aksi pelestarian lingkungan."
                                : "Buat akun untuk mulai berkontribusi dalam menjaga Lombok."}
                        </p>
                    </div>

                    {/* Forms */}
                    {activeTab === "login" ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 ml-1">EMAIL</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        value={loginForm.data.email}
                                        onChange={e => loginForm.setData("email", e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-[#a7e94a] rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 placeholder-slate-300 transition-all"
                                        required
                                    />
                                </div>
                                <InputError message={loginForm.errors.email} />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 ml-1">KATA SANDI</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={loginForm.data.password}
                                        onChange={e => loginForm.setData("password", e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-[#a7e94a] rounded-2xl py-3.5 pl-11 pr-12 text-sm font-bold text-slate-700 placeholder-slate-300 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <InputError message={loginForm.errors.password} />
                            </div>

                            <div className="flex justify-between items-center px-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={loginForm.data.remember}
                                        onChange={e => loginForm.setData("remember", e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-200 text-[#a7e94a] focus:ring-[#a7e94a] transition-all"
                                    />
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600">Ingat Saya</span>
                                </label>
                                <button type="button" className="text-xs font-black text-slate-400 hover:text-slate-600 transition-all">LUPA SANDI?</button>
                            </div>

                            <button
                                type="submit"
                                disabled={loginForm.processing}
                                className="w-full bg-[#a7e94a] text-white py-4 rounded-2xl text-[13px] font-black shadow-lg shadow-[#a7e94a]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                            >
                                {loginForm.processing ? "MEMPROSES..." : "MASUK SEKARANG"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-3.5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 ml-1">NAMA LENGKAP</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={registerForm.data.name}
                                        onChange={e => registerForm.setData("name", e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-[#a7e94a] rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 placeholder-slate-300 transition-all"
                                        required
                                    />
                                </div>
                                <InputError message={registerForm.errors.name} />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 ml-1">EMAIL</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        value={registerForm.data.email}
                                        onChange={e => registerForm.setData("email", e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-[#a7e94a] rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 placeholder-slate-300 transition-all"
                                        required
                                    />
                                </div>
                                <InputError message={registerForm.errors.email} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 ml-1">SANDI</label>
                                    <input
                                        type="password"
                                        value={registerForm.data.password}
                                        onChange={e => registerForm.setData("password", e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-[#a7e94a] rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 placeholder-slate-300 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 ml-1">KONFIRMASI</label>
                                    <input
                                        type="password"
                                        value={registerForm.data.password_confirmation}
                                        onChange={e => registerForm.setData("password_confirmation", e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-[#a7e94a] rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 placeholder-slate-300 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <InputError message={registerForm.errors.password} />

                            <button
                                type="submit"
                                disabled={registerForm.processing}
                                className="w-full bg-[#a7e94a] text-white py-4 rounded-2xl text-[13px] font-black shadow-lg shadow-[#a7e94a]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                            >
                                {registerForm.processing ? "MEMPROSES..." : "DAFTAR SEKARANG"}
                            </button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100 italic" />
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black text-slate-300 bg-white px-4 tracking-widest uppercase">
                            Atau Menggunakan
                        </div>
                    </div>

                    {/* Google Login */}
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
                        <span className="text-sm font-bold text-slate-700">Masuk dengan Google</span>
                    </a>

                    <div className="mt-8 text-center pb-6">
                        <p className="text-[11px] text-slate-400 font-medium">
                            Dengan masuk, Anda menyetujui <span className="text-[#a7e94a] font-bold">Syarat & Ketentuan</span> kami.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
