import { Link } from "@inertiajs/react";
import { PropsWithChildren } from "react";

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-12 sm:justify-center font-sans">
            {/* Logo dan Teks EcoLombok */}
            {/* Margin bawah dikurangi sedikit agar tidak terlalu jauh dari form */}
            <div className="mb-6 mt-8 sm:mt-0">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 bg-[#a7e94a] rounded-xl flex items-center justify-center shadow-lg shadow-[#a7e94a]/30 group-hover:scale-105 transition-transform duration-300">
                        <svg
                            className="w-7 h-7 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                        </svg>
                    </div>
                    <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        Eco<span className="text-[#a7e94a]">Lombok</span>
                    </span>
                </Link>
            </div>

            {/* Kotak Form: Diperlebar menjadi max-w-[480px] */}
            <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 mb-10 sm:mb-0">
                {children}
            </div>
        </div>
    );
}
