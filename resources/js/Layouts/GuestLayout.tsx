import { Link } from "@inertiajs/react";
import { PropsWithChildren } from "react";

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 dark:bg-slate-900 px-4 py-12 sm:justify-center font-sans">
            {/* Logo Area */}
            <div className="mb-8 mt-8 sm:mt-0">
                <Link
                    href="/"
                    className="flex items-center justify-center group"
                >
                    {/* Logo Mode Terang */}
                    <img
                        src="/assets/logo-dashboard.png"
                        alt="Logo Dashboard"
                        // Memperbesar ukuran tinggi menjadi h-14 atau h-16 agar pas untuk halaman login
                        className="h-14 w-auto object-contain block dark:hidden group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Logo Mode Gelap */}
                    <img
                        src="/assets/logo-dashboard-dark.png"
                        alt="Logo Dashboard Dark"
                        className="h-14 w-auto object-contain hidden dark:block group-hover:scale-105 transition-transform duration-300"
                    />
                </Link>
            </div>

            {/* Kotak Form */}
            <div className="w-full max-w-[480px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden border border-slate-100 dark:border-slate-700 mb-10 sm:mb-0">
                {children}
            </div>
        </div>
    );
}
