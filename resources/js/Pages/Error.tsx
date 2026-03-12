import { Head, Link } from "@inertiajs/react";
import { ShieldMinus, Home, AnnoyedGhost } from "@mynaui/icons-react";

export default function ErrorPage({ status }: { status: number }) {
    // Definisi Judul berdasarkan Status HTTP
    const title =
        {
            503: "503: Layanan Tidak Tersedia",
            500: "500: Kesalahan Server",
            404: "404: Halaman Tidak Ditemukan",
            403: "403: Akses Ditolak (Forbidden)",
        }[status] || "Terjadi Kesalahan";

    // Definisi Pesan berdasarkan Status HTTP
    const description =
        {
            503: "Maaf, kami sedang melakukan pemeliharaan sistem. Silakan coba beberapa saat lagi.",
            500: "Oops, terjadi kesalahan pada server kami. Tim teknis sedang menanganinya.",
            404: "Waduh! Halaman yang Anda tuju sepertinya tidak ada atau sudah dihapus.",
            403: "Maaf, Anda tidak memiliki izin (role) yang sesuai untuk mengakses halaman ini.",
        }[status] || "Terjadi kesalahan yang tidak diketahui pada aplikasi.";

    // Ikon Dinamis
    const renderIcon = () => {
        if (status === 403) {
            return (
                <ShieldMinus
                    className="w-24 h-24 text-red-500 animate-pulse"
                    strokeWidth={1.5}
                />
            );
        }
        if (status === 404) {
            return (
                <AnnoyedGhost
                    className="w-24 h-24 text-slate-400 animate-bounce"
                    strokeWidth={1.5}
                />
            );
        }
        return (
            <ShieldMinus
                className="w-24 h-24 text-amber-500"
                strokeWidth={1.5}
            />
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
            <Head title={title} />

            {/* Efek Latar Belakang */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-100 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>

            <div className="relative z-10 text-center max-w-lg mx-auto bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100">
                <div className="bg-red-50 w-40 h-40 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-red-100">
                    {renderIcon()}
                </div>

                <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">
                    {status}
                </h1>

                <h2 className="text-xl font-bold text-slate-800 mb-3">
                    {status === 403
                        ? "Akses Terlarang!"
                        : "Halaman Tidak Ditemukan"}
                </h2>

                <p className="text-slate-500 mb-10 leading-relaxed">
                    {description}
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-transform hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto"
                >
                    <Home className="w-5 h-5" />
                    Kembali ke Dashboard Utama
                </Link>
            </div>

            {/* Footer Text */}
            <p className="mt-12 text-sm text-slate-400 font-medium z-10 relative">
                Sistem Pelaporan Sampah &copy; {new Date().getFullYear()}
            </p>
        </div>
    );
}
