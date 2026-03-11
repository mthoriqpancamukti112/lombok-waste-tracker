import { FormEvent, useState, useEffect } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import DLHLayout from "@/Layouts/DLHLayout";
import { Plus, Trash, Edit, UsersGroup, X } from "@mynaui/icons-react";
import Swal from "sweetalert2"; // Import SweetAlert

interface Kaling {
    id: number;
    nik: string;
    nama_wilayah: string;
    no_telp: string;
    user: {
        name: string;
        email: string;
    };
}

// Tipe data untuk API Wilayah
interface Region {
    id: string;
    name: string;
}

export default function Index({
    auth,
    kalings,
}: PageProps<{ kalings: Kaling[] }>) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null); // State untuk mode Edit

    // Setup Form Inertia (tambahkan 'put')
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            email: "",
            password: "",
            nik: "",
            nama_wilayah: "",
            no_telp: "",
        });

    // ================= STATE UNTUK API WILAYAH =================
    const [provinces, setProvinces] = useState<Region[]>([]);
    const [regencies, setRegencies] = useState<Region[]>([]);
    const [districts, setDistricts] = useState<Region[]>([]);
    const [villages, setVillages] = useState<Region[]>([]);

    const [selectedProv, setSelectedProv] = useState({ id: "", name: "" });
    const [selectedReg, setSelectedReg] = useState({ id: "", name: "" });
    const [selectedDist, setSelectedDist] = useState({ id: "", name: "" });
    const [selectedVill, setSelectedVill] = useState({ id: "", name: "" });
    const [namaLingkungan, setNamaLingkungan] = useState("");

    // 1. Ambil Data Provinsi saat Modal Dibuka
    useEffect(() => {
        if (isModalOpen) {
            fetch(
                "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
            )
                .then((res) => res.json())
                .then((data) => setProvinces(data));
        }
    }, [isModalOpen]);

    // 2. Ambil Kabupaten saat Provinsi dipilih
    useEffect(() => {
        if (selectedProv.id) {
            fetch(
                `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProv.id}.json`,
            )
                .then((res) => res.json())
                .then((data) => {
                    setRegencies(data);
                    setDistricts([]); // Reset kebawahnya
                    setVillages([]);
                });
        }
    }, [selectedProv.id]);

    // 3. Ambil Kecamatan saat Kabupaten dipilih
    useEffect(() => {
        if (selectedReg.id) {
            fetch(
                `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedReg.id}.json`,
            )
                .then((res) => res.json())
                .then((data) => {
                    setDistricts(data);
                    setVillages([]);
                });
        }
    }, [selectedReg.id]);

    // 4. Ambil Kelurahan saat Kecamatan dipilih
    useEffect(() => {
        if (selectedDist.id) {
            fetch(
                `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDist.id}.json`,
            )
                .then((res) => res.json())
                .then((data) => setVillages(data));
        }
    }, [selectedDist.id]);

    // 5. GABUNGKAN SEMUA STRING MENJADI 'nama_wilayah' UNTUK DATABASE
    useEffect(() => {
        if (namaLingkungan && selectedVill.name) {
            const combinedWilayah = `Lingkungan ${namaLingkungan}, Kel. ${selectedVill.name}, Kec. ${selectedDist.name}`;
            setData("nama_wilayah", combinedWilayah);
        }
        // else dihilangkan agar saat Edit, nama_wilayah tidak terhapus otomatis
    }, [namaLingkungan, selectedVill, selectedDist]);

    // ================= FUNGSI AKSI =================

    const openAddModal = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (kaling: Kaling) => {
        setEditingId(kaling.id);
        clearErrors();
        // Isi form dengan data kaling yang ada
        setData({
            name: kaling.user.name,
            email: kaling.user.email,
            password: "", // Dikosongkan, admin hanya isi jika ingin ubah password
            nik: kaling.nik,
            nama_wilayah: kaling.nama_wilayah,
            no_telp: kaling.no_telp || "",
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
        setEditingId(null);
        // Reset state API
        setSelectedProv({ id: "", name: "" });
        setSelectedReg({ id: "", name: "" });
        setSelectedDist({ id: "", name: "" });
        setSelectedVill({ id: "", name: "" });
        setNamaLingkungan("");
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (editingId) {
            put(route("kaling-management.update", editingId), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        title: "Berhasil!",
                        text: "Data Kaling diperbarui.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                },
            });
        } else {
            post(route("kaling-management.store"), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        title: "Berhasil!",
                        text: "Kaling baru ditambahkan.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                },
            });
        }
    };

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: "Hapus Kaling?",
            text: `Data ${name} dan akun loginnya akan dihapus permanen!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#94a3b8",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("kaling-management.destroy", id), {
                    onSuccess: () => {
                        Swal.fire(
                            "Terhapus!",
                            "Data Kaling telah dihapus.",
                            "success",
                        );
                    },
                });
            }
        });
    };

    return (
        <DLHLayout
            auth={auth}
            header={
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <UsersGroup className="w-7 h-7 text-[#86bf36]" />
                            Manajemen Kaling
                        </h2>
                        <p className="text-xs lg:text-sm text-slate-500 mt-1">
                            Kelola data Kepala Lingkungan dan wilayahnya.
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-[#a7e94a] hover:bg-[#92ce40] text-slate-900 font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs lg:text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:block">Tambah Kaling</span>
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Kaling" />

            {/* TABEL DATA */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">
                                    Nama Lengkap & Email
                                </th>
                                <th className="px-6 py-4">Wilayah & NIK</th>
                                <th className="px-6 py-4">No. HP</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {kalings.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-slate-400"
                                    >
                                        <UsersGroup className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Belum ada data Kepala Lingkungan.</p>
                                    </td>
                                </tr>
                            ) : (
                                kalings.map((kaling) => (
                                    <tr
                                        key={kaling.id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">
                                                {kaling.user.name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {kaling.user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-1.5 font-bold text-[#86bf36] leading-tight">
                                                <span className="line-clamp-2">
                                                    {kaling.nama_wilayah}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                NIK: {kaling.nik}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {kaling.no_telp || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(kaling)
                                                    }
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            kaling.id,
                                                            kaling.user.name,
                                                        )
                                                    }
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= MODAL TAMBAH & EDIT KALING DENGAN API WILAYAH ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    ></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {editingId ? (
                                    <Edit className="w-5 h-5 text-blue-500" />
                                ) : (
                                    <Plus className="w-5 h-5 text-[#86bf36]" />
                                )}
                                {editingId
                                    ? "Edit Kepala Lingkungan"
                                    : "Tambah Kepala Lingkungan"}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            <form
                                id="kaling-form"
                                onSubmit={submit}
                                className="space-y-6"
                            >
                                {/* Info Akun */}
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                        Informasi Akun (Login)
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                Nama Lengkap
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 p-2.5"
                                                placeholder="Cth: Budi Santoso"
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 p-2.5"
                                                placeholder="Cth: budi@email.com"
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                {editingId
                                                    ? "Password Baru (Opsional)"
                                                    : "Password Sementara"}
                                            </label>
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData(
                                                        "password",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 p-2.5"
                                                placeholder={
                                                    editingId
                                                        ? "Kosongkan jika tidak diganti"
                                                        : "Minimal 8 karakter"
                                                }
                                            />
                                            {errors.password && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                Nomor Induk Kependudukan
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nik}
                                                onChange={(e) =>
                                                    setData(
                                                        "nik",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 p-2.5"
                                                placeholder="16 Digit NIK"
                                            />
                                            {errors.nik && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.nik}
                                                </p>
                                            )}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                Nomor WhatsApp/HP
                                            </label>
                                            <input
                                                type="text"
                                                value={data.no_telp}
                                                onChange={(e) =>
                                                    setData(
                                                        "no_telp",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 p-2.5"
                                                placeholder="Cth: 081234567890"
                                            />
                                            {errors.no_telp && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.no_telp}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Profil Wilayah (API Emsifa) */}
                                <div className="pt-2 border-t border-dashed border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">
                                        Cakupan Wilayah (API Otomatis)
                                    </p>

                                    {/* INFO: Jika Edit, berikan keterangan wilayah lama */}
                                    {editingId && (
                                        <div className="mb-4 bg-blue-50 border border-blue-100 p-3 rounded-xl">
                                            <p className="text-xs text-blue-600 font-bold mb-1">
                                                Data Wilayah Saat Ini:
                                            </p>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {data.nama_wilayah}
                                            </p>
                                            <p className="text-[10px] text-blue-500 mt-1">
                                                *Gunakan dropdown di bawah HANYA
                                                JIKA Anda ingin mengubah
                                                wilayahnya.
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Dropdown Provinsi */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                Provinsi
                                            </label>
                                            <select
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] sm:text-sm bg-slate-50 p-2.5"
                                                onChange={(e) => {
                                                    const selected =
                                                        provinces.find(
                                                            (p) =>
                                                                p.id ===
                                                                e.target.value,
                                                        );
                                                    setSelectedProv({
                                                        id: selected?.id || "",
                                                        name:
                                                            selected?.name ||
                                                            "",
                                                    });
                                                }}
                                            >
                                                <option value="">
                                                    Pilih Provinsi
                                                </option>
                                                {provinces.map((prov) => (
                                                    <option
                                                        key={prov.id}
                                                        value={prov.id}
                                                    >
                                                        {prov.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Dropdown Kabupaten */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                Kabupaten / Kota
                                            </label>
                                            <select
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] sm:text-sm bg-slate-50 p-2.5 disabled:opacity-50"
                                                disabled={
                                                    regencies.length === 0
                                                }
                                                onChange={(e) => {
                                                    const selected =
                                                        regencies.find(
                                                            (r) =>
                                                                r.id ===
                                                                e.target.value,
                                                        );
                                                    setSelectedReg({
                                                        id: selected?.id || "",
                                                        name:
                                                            selected?.name ||
                                                            "",
                                                    });
                                                }}
                                            >
                                                <option value="">
                                                    Pilih Kabupaten
                                                </option>
                                                {regencies.map((reg) => (
                                                    <option
                                                        key={reg.id}
                                                        value={reg.id}
                                                    >
                                                        {reg.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Dropdown Kecamatan */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                Kecamatan
                                            </label>
                                            <select
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] sm:text-sm bg-slate-50 p-2.5 disabled:opacity-50"
                                                disabled={
                                                    districts.length === 0
                                                }
                                                onChange={(e) => {
                                                    const selected =
                                                        districts.find(
                                                            (d) =>
                                                                d.id ===
                                                                e.target.value,
                                                        );
                                                    setSelectedDist({
                                                        id: selected?.id || "",
                                                        name:
                                                            selected?.name ||
                                                            "",
                                                    });
                                                }}
                                            >
                                                <option value="">
                                                    Pilih Kecamatan
                                                </option>
                                                {districts.map((dist) => (
                                                    <option
                                                        key={dist.id}
                                                        value={dist.id}
                                                    >
                                                        {dist.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Dropdown Kelurahan */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                Kelurahan / Desa
                                            </label>
                                            <select
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] sm:text-sm bg-slate-50 p-2.5 disabled:opacity-50"
                                                disabled={villages.length === 0}
                                                onChange={(e) => {
                                                    const selected =
                                                        villages.find(
                                                            (v) =>
                                                                v.id ===
                                                                e.target.value,
                                                        );
                                                    setSelectedVill({
                                                        id: selected?.id || "",
                                                        name:
                                                            selected?.name ||
                                                            "",
                                                    });
                                                }}
                                            >
                                                <option value="">
                                                    Pilih Kelurahan
                                                </option>
                                                {villages.map((vill) => (
                                                    <option
                                                        key={vill.id}
                                                        value={vill.id}
                                                    >
                                                        {vill.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Input Lingkungan Manual */}
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                Nama Lingkungan / Dusun
                                            </label>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 sm:text-sm font-bold">
                                                    Lingkungan
                                                </span>
                                                <input
                                                    type="text"
                                                    value={namaLingkungan}
                                                    onChange={(e) =>
                                                        setNamaLingkungan(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 min-w-0 block w-full rounded-none rounded-r-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 p-2.5 disabled:opacity-50"
                                                    placeholder="Cth: Ampenan"
                                                    disabled={!selectedVill.id}
                                                />
                                            </div>
                                            {/* Preview Nama Akhir saat mengetik dari API */}
                                            {namaLingkungan &&
                                                selectedVill.name && (
                                                    <p className="text-xs text-green-600 font-semibold mt-2 bg-green-50 border border-green-100 p-2 rounded-lg">
                                                        Preview Update Wilayah:{" "}
                                                        <br />{" "}
                                                        {data.nama_wilayah}
                                                    </p>
                                                )}
                                            {errors.nama_wilayah && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.nama_wilayah}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="kaling-form"
                                disabled={processing || !data.nama_wilayah}
                                // PERBAIKAN: Tambahkan flex, items-center, dan gap-2
                                className={`flex items-center justify-center gap-2 text-white text-sm font-bold py-2 px-6 rounded-xl shadow-md disabled:opacity-50 transition-all ${
                                    editingId
                                        ? "bg-blue-500 hover:bg-blue-600"
                                        : "bg-[#a7e94a] hover:bg-[#92ce40] !text-slate-900"
                                }`}
                            >
                                {processing ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4 text-current"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : editingId ? (
                                    "Update Data"
                                ) : (
                                    "Simpan Data"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DLHLayout>
    );
}
