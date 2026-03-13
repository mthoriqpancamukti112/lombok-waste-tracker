import { ImgHTMLAttributes } from "react";

// Kita ubah tipe props-nya menjadi ImgHTMLAttributes agar TypeScript tidak error
export default function ApplicationLogo(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return <img {...props} src="/assets/logo.png" alt="Logo Aplikasi" />;
}
