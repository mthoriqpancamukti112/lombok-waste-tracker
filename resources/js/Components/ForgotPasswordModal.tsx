import React, { useState, useEffect } from "react";
import { X, Mail, Lock, ShieldCheck, Eye, EyeOff } from "@mynaui/icons-react";
import { toast } from "react-hot-toast";
import axios from "axios";

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBackToLogin: () => void;
    isDark?: boolean;
}

export default function ForgotPasswordModal({
    isOpen,
    onClose,
    onBackToLogin,
    isDark = false,
}: ForgotPasswordModalProps) {
    // State untuk mengontrol tahapan form (1: Email, 2: OTP, 3: Password Baru)
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // State Data
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Reset state jika modal ditutup
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setEmail("");
            setOtp("");
            setPassword("");
            setPasswordConfirm("");
            setIsLoading(false);
        }
    }, [isOpen]);

    // ─── FUNGSI HANDLER UNTUK BACKEND LARAVEL ───

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post("/forgot-password/send-otp", { email });
            toast.success("Kode OTP telah dikirim ke email Anda!");
            setStep(2);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    "Gagal mengirim OTP. Pastikan email benar.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post("/forgot-password/verify-otp", { email, otp });
            toast.success("OTP Valid! Silakan buat kata sandi baru.");
            setStep(3);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "OTP Salah atau Kedaluwarsa.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            toast.error("Konfirmasi kata sandi tidak cocok!");
            return;
        }

        setIsLoading(true);
        try {
            await axios.post("/forgot-password/reset", {
                email,
                otp,
                password,
            });
            toast.success("Kata sandi berhasil diubah! Silakan login.");
            onClose();
            onBackToLogin();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Gagal mengubah kata sandi.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const inputBg = isDark
        ? "bg-slate-800 border-slate-700 focus:bg-slate-800 text-slate-100 placeholder-slate-500"
        : "bg-slate-50 border-slate-200 focus:bg-white text-slate-700 placeholder-slate-400";

    return (
        <div className="fixed inset-0 z-[105] flex flex-col items-center justify-center p-4 sm:p-6 drop-shadow-2xl font-sans">
            <div
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            <div
                className={`relative w-full max-w-[400px] overflow-hidden rounded-[24px] shadow-2xl animate-in fade-in zoom-in duration-300 ${isDark ? "bg-slate-900 border border-slate-800" : "bg-white"}`}
            >
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10 ${isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-400" : "bg-slate-100 hover:bg-slate-200 text-slate-500"}`}
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-8">
                    {/* Header Dinamis Berdasarkan Langkah */}
                    <div className="text-center mb-8">
                        <div
                            className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-slate-800 text-[#a7e94a]" : "bg-[#a7e94a]/10 text-[#a7e94a]"}`}
                        >
                            {step === 1 && <Mail className="w-7 h-7" />}
                            {step === 2 && <ShieldCheck className="w-7 h-7" />}
                            {step === 3 && <Lock className="w-7 h-7" />}
                        </div>
                        <h2
                            className={`text-xl font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}
                        >
                            {step === 1 && "Lupa Kata Sandi?"}
                            {step === 2 && "Masukkan Kode OTP"}
                            {step === 3 && "Buat Kata Sandi Baru"}
                        </h2>
                        <p
                            className={`text-xs mt-2 font-medium leading-relaxed px-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                        >
                            {step === 1 &&
                                "Masukkan email yang terdaftar. Kami akan mengirimkan 6 digit kode OTP ke email tersebut."}
                            {step === 2 && (
                                <>
                                    Kode telah dikirim ke{" "}
                                    <span className="font-bold text-[#a7e94a]">
                                        {email}
                                    </span>
                                    . Silakan cek Inbox atau folder Spam Anda.
                                </>
                            )}
                            {step === 3 &&
                                "Pastikan kata sandi baru Anda kuat dan mudah diingat."}
                        </p>
                    </div>

                    {/* FORM LANGKAH 1: EMAIL */}
                    {step === 1 && (
                        <form
                            onSubmit={handleRequestOtp}
                            className="space-y-4 animate-in slide-in-from-right-4 duration-300"
                        >
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a] transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Alamat Email Anda"
                                    className={`w-full border focus:ring-2 focus:ring-[#a7e94a]/20 focus:border-[#a7e94a] rounded-xl h-12 pl-11 pr-4 text-sm font-semibold outline-none transition-all ${inputBg}`}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#a7e94a] text-slate-900 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:bg-[#96d242] active:scale-[0.98] transition-all h-12 flex justify-center items-center"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                ) : (
                                    "Kirim OTP"
                                )}
                            </button>
                        </form>
                    )}

                    {/* FORM LANGKAH 2: OTP */}
                    {step === 2 && (
                        <form
                            onSubmit={handleVerifyOtp}
                            className="space-y-4 animate-in slide-in-from-right-4 duration-300"
                        >
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value.replace(/[^0-9]/g, ""),
                                    )
                                } // Hanya angka
                                placeholder="• • • • • •"
                                className={`w-full border focus:ring-2 focus:ring-[#a7e94a]/20 focus:border-[#a7e94a] rounded-xl h-14 text-center text-2xl tracking-[0.5em] font-black outline-none transition-all ${inputBg}`}
                                required
                            />
                            <button
                                type="submit"
                                disabled={isLoading || otp.length < 6}
                                className="w-full bg-[#a7e94a] text-slate-900 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:bg-[#96d242] active:scale-[0.98] transition-all h-12 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                ) : (
                                    "Verifikasi OTP"
                                )}
                            </button>
                            <div className="text-center mt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-[11px] text-slate-400 hover:text-[#a7e94a] font-bold transition-colors"
                                >
                                    Salah email? Ganti email
                                </button>
                            </div>
                        </form>
                    )}

                    {/* FORM LANGKAH 3: KATA SANDI BARU */}
                    {step === 3 && (
                        <form
                            onSubmit={handleResetPassword}
                            className="space-y-4 animate-in slide-in-from-right-4 duration-300"
                        >
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a]">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Kata Sandi Baru"
                                    className={`w-full border focus:ring-2 focus:ring-[#a7e94a]/20 focus:border-[#a7e94a] rounded-xl h-12 pl-11 pr-10 text-sm font-semibold outline-none transition-all ${inputBg}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#a7e94a]"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7e94a]">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={passwordConfirm}
                                    onChange={(e) =>
                                        setPasswordConfirm(e.target.value)
                                    }
                                    placeholder="Ulangi Kata Sandi"
                                    className={`w-full border focus:ring-2 focus:ring-[#a7e94a]/20 focus:border-[#a7e94a] rounded-xl h-12 pl-11 pr-10 text-sm font-semibold outline-none transition-all ${inputBg}`}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#a7e94a] text-slate-900 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:bg-[#96d242] active:scale-[0.98] transition-all h-12 flex justify-center items-center"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                ) : (
                                    "Simpan Kata Sandi"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Footer / Back Button */}
                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onBackToLogin();
                            }}
                            className={`text-xs font-bold transition-colors ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"}`}
                        >
                            &larr; Kembali ke halaman Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
