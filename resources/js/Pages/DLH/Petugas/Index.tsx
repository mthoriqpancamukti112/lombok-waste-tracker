import { FormEvent, useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import DLHLayout from "@/Layouts/DLHLayout";
import { Plus, Trash, Edit, Truck, X, Hash } from "@mynaui/icons-react";
import Swal from "sweetalert2";

interface Petugas {
    id: number;
    jenis_kendaraan: "truk_besar" | "pickup" | "motor_gerobak";
    plat_nomor: string | null;
    kapasitas_kg: number;
    is_aktif: boolean;
    user: {
        name: string;
        email: string;
    };
}

export default function Index({
    auth,
    petugasList,
}: PageProps<{ petugasList: Petugas[] }>) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            email: "",
            password: "",
            jenis_kendaraan: "pickup",
            plat_nomor: "",
            kapasitas_kg: 0,
            is_aktif: true,
        });

    const formatKendaraan = (jenis: string) => {
        switch (jenis) {
            case "truk_besar":
                return "Truk Besar";
            case "pickup":
                return "Mobil Pickup";
            case "motor_gerobak":
                return "Motor Gerobak";
            default:
                return jenis;
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (petugas: Petugas) => {
        setEditingId(petugas.id);
        clearErrors();
        setData({
            name: petugas.user.name,
            email: petugas.user.email,
            password: "",
            jenis_kendaraan: petugas.jenis_kendaraan,
            plat_nomor: petugas.plat_nomor || "",
            kapasitas_kg: petugas.kapasitas_kg,
            is_aktif: !!petugas.is_aktif,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
        setEditingId(null);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route("petugas-management.update", editingId), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        title: "Berhasil!",
                        text: "Data diperbarui.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                },
            });
        } else {
            post(route("petugas-management.store"), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        title: "Berhasil!",
                        text: "Petugas ditambahkan.",
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
            title: "Hapus Petugas?",
            text: `Data ${name} akan dihapus permanen!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#94a3b8",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("petugas-management.destroy", id), {
                    onSuccess: () =>
                        Swal.fire({
                            title: "Terhapus!",
                            icon: "success",
                            timer: 1500,
                            showConfirmButton: false,
                        }),
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
                            <Truck className="w-7 h-7 text-[#86bf36]" />
                            Armada & Petugas
                        </h2>
                        <p className="text-xs lg:text-sm text-slate-500 mt-1">
                            Kelola data petugas pengangkut dan armadanya.
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-[#a7e94a] hover:bg-[#92ce40] text-slate-900 font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs lg:text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:block">Tambah Petugas</span>
                    </button>
                </div>
            }
        >
            <Head title="Armada & Petugas" />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Nama Petugas</th>
                                <th className="px-6 py-4">Kendaraan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {petugasList.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-slate-400"
                                    >
                                        <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Belum ada data armada & petugas.</p>
                                    </td>
                                </tr>
                            ) : (
                                petugasList.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">
                                                {p.user.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[#86bf36]">
                                                {formatKendaraan(
                                                    p.jenis_kendaraan,
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {p.plat_nomor || "Tanpa Plat"} •{" "}
                                                {p.kapasitas_kg} kg
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${p.is_aktif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                            >
                                                {p.is_aktif
                                                    ? "Aktif"
                                                    : "Non-Aktif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(p)
                                                    }
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            p.id,
                                                            p.user.name,
                                                        )
                                                    }
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={closeModal}
                    ></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {editingId ? (
                                    <Edit className="w-5 h-5 text-blue-500" />
                                ) : (
                                    <Plus className="w-5 h-5 text-[#86bf36]" />
                                )}
                                {editingId
                                    ? "Edit Petugas"
                                    : "Tambah Petugas Baru"}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            <form
                                id="petugas-form"
                                onSubmit={submit}
                                className="space-y-6"
                            >
                                {/* Akun */}
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                        Informasi Akun
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
                                                placeholder="Contoh: Ahmad Subarjo"
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 p-2.5 transition-colors placeholder:text-slate-400"
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
                                                placeholder="Contoh: ahmad@gmail.com"
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 p-2.5 transition-colors placeholder:text-slate-400"
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                {editingId
                                                    ? "Password Baru (Opsional)"
                                                    : "Password"}
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
                                                placeholder={
                                                    editingId
                                                        ? "Kosongkan jika tidak ingin mengubah password"
                                                        : "Minimal 8 karakter"
                                                }
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 p-2.5 transition-colors placeholder:text-slate-400"
                                            />
                                            {errors.password && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Armada */}
                                <div className="pt-2 border-t border-dashed border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">
                                        Detail Armada
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                Jenis Kendaraan
                                            </label>
                                            <select
                                                value={data.jenis_kendaraan}
                                                onChange={(e) =>
                                                    setData(
                                                        "jenis_kendaraan",
                                                        e.target.value as any,
                                                    )
                                                }
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 p-2.5 transition-colors"
                                            >
                                                <option value="pickup">
                                                    Mobil Pickup
                                                </option>
                                                <option value="motor_gerobak">
                                                    Motor Gerobak (Tossa)
                                                </option>
                                                <option value="truk_besar">
                                                    Truk Besar
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                Plat Nomor
                                            </label>
                                            <input
                                                type="text"
                                                value={data.plat_nomor}
                                                onChange={(e) =>
                                                    setData(
                                                        "plat_nomor",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: DR 1234 AB"
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 p-2.5 transition-colors uppercase placeholder:normal-case placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                Kapasitas Muatan (Kg)
                                            </label>
                                            <input
                                                type="number"
                                                value={data.kapasitas_kg}
                                                onChange={(e) =>
                                                    setData(
                                                        "kapasitas_kg",
                                                        e.target.value === ""
                                                            ? 0
                                                            : parseInt(
                                                                  e.target
                                                                      .value,
                                                              ),
                                                    )
                                                }
                                                placeholder="Contoh: 1500"
                                                className="w-full rounded-xl border-slate-200 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 p-2.5 transition-colors placeholder:text-slate-400"
                                                min="0"
                                            />
                                            {errors.kapasitas_kg && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.kapasitas_kg}
                                                </p>
                                            )}
                                        </div>
                                        {editingId && (
                                            <div className="sm:col-span-2 mt-2">
                                                <label className="flex items-center gap-3 cursor-pointer w-fit group">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.is_aktif}
                                                        onChange={(e) =>
                                                            setData(
                                                                "is_aktif",
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="rounded-md border-slate-300 text-[#a7e94a] focus:ring-[#a7e94a] w-5 h-5 transition-colors cursor-pointer"
                                                    />
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                                                        Status Petugas Aktif
                                                    </span>
                                                </label>
                                                <p className="text-xs text-slate-400 mt-1 ml-8">
                                                    Hapus centang jika petugas
                                                    sedang cuti panjang,
                                                    diskors, atau tidak
                                                    beroperasi.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="petugas-form"
                                disabled={processing}
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
