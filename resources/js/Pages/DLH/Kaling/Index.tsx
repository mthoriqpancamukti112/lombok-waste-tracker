import { FormEvent, useState, useEffect } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import DLHLayout from "@/Layouts/DLHLayout";
import { Plus, Trash, Edit, UsersGroup, X } from "@mynaui/icons-react";
import Swal from "sweetalert2";
import { landingDict } from "@/Lang/Landing";

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

interface Region {
    id: string;
    name: string;
}

export default function Index({
    auth,
    kalings,
}: PageProps<{ kalings: Kaling[] }>) {
    // === STATE UNTUK BAHASA ===
    const [lang, setLang] = useState<"id" | "en">("id");
    const t = landingDict[lang];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Load bahasa dari localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem("appLang") as "id" | "en";
        if (savedLang) setLang(savedLang);
    }, []);

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

    // 1. Ambil Data Provinsi
    useEffect(() => {
        if (isModalOpen) {
            fetch(
                "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
            )
                .then((res) => res.json())
                .then((data) => setProvinces(data));
        }
    }, [isModalOpen]);

    // 2. Ambil Kabupaten
    useEffect(() => {
        if (selectedProv.id) {
            fetch(
                `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProv.id}.json`,
            )
                .then((res) => res.json())
                .then((data) => {
                    setRegencies(data);
                    setDistricts([]);
                    setVillages([]);
                });
        }
    }, [selectedProv.id]);

    // 3. Ambil Kecamatan
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

    // 4. Ambil Kelurahan
    useEffect(() => {
        if (selectedDist.id) {
            fetch(
                `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDist.id}.json`,
            )
                .then((res) => res.json())
                .then((data) => setVillages(data));
        }
    }, [selectedDist.id]);

    // 5. Gabungkan nama wilayah
    useEffect(() => {
        if (namaLingkungan && selectedVill.name) {
            const combinedWilayah = `Lingkungan ${namaLingkungan}, Kel. ${selectedVill.name}, Kec. ${selectedDist.name}`;
            setData("nama_wilayah", combinedWilayah);
        }
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
        setData({
            name: kaling.user.name,
            email: kaling.user.email,
            password: "",
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
        setSelectedProv({ id: "", name: "" });
        setSelectedReg({ id: "", name: "" });
        setSelectedDist({ id: "", name: "" });
        setSelectedVill({ id: "", name: "" });
        setNamaLingkungan("");
    };

    const getSwalConfig = () => {
        const isDarkMode = document.documentElement.classList.contains("dark");
        return {
            background: isDarkMode ? "#1e293b" : "#ffffff",
            color: isDarkMode ? "#f8fafc" : "#0f172a",
        };
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const swalTheme = getSwalConfig();

        if (editingId) {
            put(route("kaling-management.update", editingId), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        title: t.saKmSavedTitle,
                        text: t.saKmUpdatedText,
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                        ...swalTheme,
                    });
                },
            });
        } else {
            post(route("kaling-management.store"), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        title: t.saKmSavedTitle,
                        text: t.saKmAddedText,
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                        ...swalTheme,
                    });
                },
            });
        }
    };

    const handleDelete = (id: number, name: string) => {
        const isDarkMode = document.documentElement.classList.contains("dark");

        Swal.fire({
            title: t.saKmDeleteTitle,
            text: t.saKmDeleteText.replace("{name}", name),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: isDarkMode ? "#64748b" : "#94a3b8",
            confirmButtonText: t.saKmDeleteConfirm,
            cancelButtonText: t.kmCancel,
            reverseButtons: true,
            background: isDarkMode ? "#1e293b" : "#ffffff",
            color: isDarkMode ? "#f8fafc" : "#0f172a",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("kaling-management.destroy", id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: t.saKmDeletedTitle,
                            text: t.saKmDeletedText,
                            icon: "success",
                            background: isDarkMode ? "#1e293b" : "#ffffff",
                            color: isDarkMode ? "#f8fafc" : "#0f172a",
                        });
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
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2 transition-colors">
                            <UsersGroup className="w-7 h-7 text-[#86bf36]" />
                            {t.kmTitle}
                        </h2>
                        <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                            {t.kmSubtitle}
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-[#a7e94a] hover:bg-[#92ce40] text-slate-900 font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs lg:text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:block">{t.kmAddBtn}</span>
                    </button>
                </div>
            }
        >
            <Head title={t.kmTitle} />

            {/* TABEL DATA */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 transition-colors">
                        <thead className="bg-slate-50/80 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 transition-colors">
                            <tr>
                                <th className="px-6 py-4">{t.kmTableCol1}</th>
                                <th className="px-6 py-4">{t.kmTableCol2}</th>
                                <th className="px-6 py-4">{t.kmTableCol3}</th>
                                <th className="px-6 py-4 text-center">
                                    {t.kmTableCol4}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 transition-colors">
                            {kalings.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                                    >
                                        <UsersGroup className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>{t.kmEmptyData}</p>
                                    </td>
                                </tr>
                            ) : (
                                kalings.map((kaling) => (
                                    <tr
                                        key={kaling.id}
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 dark:text-slate-200 transition-colors">
                                                {kaling.user.name}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                                                {kaling.user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-1.5 font-bold text-[#86bf36] leading-tight">
                                                <span className="line-clamp-2">
                                                    {kaling.nama_wilayah}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                                                NIK: {kaling.nik}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300 transition-colors">
                                            {kaling.no_telp || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(kaling)
                                                    }
                                                    className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title={t.kmTooltipEdit}
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
                                                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title={t.kmTooltipDelete}
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

            {/* ================= MODAL TAMBAH & EDIT KALING ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    ></div>
                    <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700 transition-colors">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80 transition-colors">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
                                {editingId ? (
                                    <Edit className="w-5 h-5 text-blue-500" />
                                ) : (
                                    <Plus className="w-5 h-5 text-[#86bf36]" />
                                )}
                                {editingId ? t.kmEditTitle : t.kmAddTitle}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-xl transition-colors"
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
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 transition-colors">
                                        {t.kmAccountInfo}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.kmFullNameLabel}
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
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 transition-colors"
                                                placeholder={
                                                    t.kmFullNamePlaceholder
                                                }
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 transition-colors">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.kmEmailLabel}
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
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 transition-colors"
                                                placeholder={
                                                    t.kmEmailPlaceholder
                                                }
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 transition-colors">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {editingId
                                                    ? t.kmPasswordNew
                                                    : t.kmPasswordTemp}
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
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 transition-colors"
                                                placeholder={
                                                    editingId
                                                        ? t.kmPasswordPlaceholderEdit
                                                        : t.kmPasswordPlaceholderAdd
                                                }
                                            />
                                            {errors.password && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 transition-colors">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.kmNIKLabel}
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
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 transition-colors"
                                                placeholder={t.kmNIKPlaceholder}
                                            />
                                            {errors.nik && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 transition-colors">
                                                    {errors.nik}
                                                </p>
                                            )}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.kmPhoneLabel}
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
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 transition-colors"
                                                placeholder={
                                                    t.kmPhonePlaceholder
                                                }
                                            />
                                            {errors.no_telp && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 transition-colors">
                                                    {errors.no_telp}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Profil Wilayah (API Emsifa) */}
                                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 transition-colors">
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 mt-2 transition-colors">
                                        {t.kmRegionCoverage}
                                    </p>

                                    {editingId && (
                                        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-3 rounded-xl transition-colors">
                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1 transition-colors">
                                                {t.kmCurrentRegion}
                                            </p>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors">
                                                {data.nama_wilayah}
                                            </p>
                                            <p className="text-[10px] text-blue-500 dark:text-blue-400/80 mt-1 transition-colors">
                                                {t.kmRegionNote}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.kmProvinceLabel}
                                            </label>
                                            <select
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 transition-colors"
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
                                                    {t.kmProvinceSelect}
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

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.kmRegencyLabel}
                                            </label>
                                            <select
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 disabled:opacity-50 transition-colors"
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
                                                    {t.kmRegencySelect}
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

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.kmDistrictLabel}
                                            </label>
                                            <select
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 disabled:opacity-50 transition-colors"
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
                                                    {t.kmDistrictSelect}
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

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.kmVillageLabel}
                                            </label>
                                            <select
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 disabled:opacity-50 transition-colors"
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
                                                    {t.kmVillageSelect}
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

                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.kmHamletLabel}
                                            </label>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 sm:text-sm font-bold transition-colors">
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
                                                    className="flex-1 min-w-0 block w-full rounded-none rounded-r-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 disabled:opacity-50 transition-colors"
                                                    placeholder={
                                                        t.kmHamletPlaceholder
                                                    }
                                                    disabled={!selectedVill.id}
                                                />
                                            </div>
                                            {/* Preview Nama Akhir saat mengetik dari API */}
                                            {namaLingkungan &&
                                                selectedVill.name && (
                                                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 p-2 rounded-lg transition-colors">
                                                        {t.kmRegionPreview}{" "}
                                                        <br />{" "}
                                                        <span className="text-slate-800 dark:text-slate-200">
                                                            {data.nama_wilayah}
                                                        </span>
                                                    </p>
                                                )}
                                            {errors.nama_wilayah && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 transition-colors">
                                                    {errors.nama_wilayah}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/80 transition-colors">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            >
                                {t.kmCancel}
                            </button>
                            <button
                                type="submit"
                                form="kaling-form"
                                disabled={processing || !data.nama_wilayah}
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
                                        {t.kmProcessing}
                                    </>
                                ) : editingId ? (
                                    t.kmUpdateData
                                ) : (
                                    t.kmSaveData
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DLHLayout>
    );
}
