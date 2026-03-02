export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: string;
    phone_number?: string | null;
    avatar?: string | null;
    kaling?: {
        id: number;
        nik: string;
        nama_wilayah: string;
        no_telp: string | null;
    } | null;
    warga?: {
        id: number;
        no_telp: string | null;
        alamat: string | null;
        is_terverifikasi: boolean;
        poin_kepercayaan: number;
    } | null;
    petugas?: {
        id: number;
        no_telp: string | null;
        jenis_kendaraan: string;
        plat_nomor: string | null;
    } | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
