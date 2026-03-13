import { FormEvent, useState, useEffect } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import DLHLayout from "@/Layouts/DLHLayout";
import { Plus, Trash, Edit, Truck, X } from "@mynaui/icons-react";
import Swal from "sweetalert2";
import { landingDict } from "@/Lang/Landing";

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
            jenis_kendaraan: "pickup",
            plat_nomor: "",
            kapasitas_kg: 0,
            is_aktif: true,
        });

    const formatKendaraan = (jenis: string) => {
        switch (jenis) {
            case "truk_besar":
                return t.pmVehicleTruck;
            case "pickup":
                return t.pmVehiclePickup;
            case "motor_gerobak":
                return t.pmVehicleMotor;
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
            put(route("petugas-management.update", editingId), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        title: t.saPmSavedTitle,
                        text: t.saPmUpdatedText,
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                        ...swalTheme,
                    });
                },
            });
        } else {
            post(route("petugas-management.store"), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        title: t.saPmSavedTitle,
                        text: t.saPmAddedText,
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
            title: t.saPmDeleteTitle,
            text: t.saPmDeleteText.replace("{name}", name),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: isDarkMode ? "#64748b" : "#94a3b8",
            confirmButtonText: t.saPmDeleteConfirm,
            cancelButtonText: t.pmCancel,
            reverseButtons: true,
            background: isDarkMode ? "#1e293b" : "#ffffff",
            color: isDarkMode ? "#f8fafc" : "#0f172a",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("petugas-management.destroy", id), {
                    onSuccess: () =>
                        Swal.fire({
                            title: t.saPmDeletedTitle,
                            icon: "success",
                            timer: 1500,
                            showConfirmButton: false,
                            background: isDarkMode ? "#1e293b" : "#ffffff",
                            color: isDarkMode ? "#f8fafc" : "#0f172a",
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
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2 transition-colors">
                            <Truck className="w-7 h-7 text-[#86bf36]" />
                            {t.pmTitle}
                        </h2>
                        <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                            {t.pmSubtitle}
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-[#a7e94a] hover:bg-[#92ce40] text-slate-900 font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs lg:text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:block">{t.pmAddBtn}</span>
                    </button>
                </div>
            }
        >
            <Head title={t.pmTitle} />

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 transition-colors">
                        <thead className="bg-slate-50/80 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 transition-colors">
                            <tr>
                                <th className="px-6 py-4">{t.pmTableCol1}</th>
                                <th className="px-6 py-4">{t.pmTableCol2}</th>
                                <th className="px-6 py-4">{t.pmTableCol3}</th>
                                <th className="px-6 py-4 text-center">
                                    {t.pmTableCol4}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 transition-colors">
                            {petugasList.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                                    >
                                        <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>{t.pmEmptyData}</p>
                                    </td>
                                </tr>
                            ) : (
                                petugasList.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 dark:text-slate-200 transition-colors">
                                                {p.user.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[#86bf36]">
                                                {formatKendaraan(
                                                    p.jenis_kendaraan,
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">
                                                {p.plat_nomor || t.pmNoPlate} •{" "}
                                                {p.kapasitas_kg} kg
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors ${
                                                    p.is_aktif
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                }`}
                                            >
                                                {p.is_aktif
                                                    ? t.pmStatusActive
                                                    : t.pmStatusInactive}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(p)
                                                    }
                                                    className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title={t.pmTooltipEdit}
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
                                                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title={t.pmTooltipDelete}
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
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    ></div>
                    <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80 transition-colors">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
                                {editingId ? (
                                    <Edit className="w-5 h-5 text-blue-500" />
                                ) : (
                                    <Plus className="w-5 h-5 text-[#86bf36]" />
                                )}
                                {editingId ? t.pmEditTitle : t.pmAddTitle}
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
                                id="petugas-form"
                                onSubmit={submit}
                                className="space-y-6"
                            >
                                {/* Akun */}
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 transition-colors">
                                        {t.pmAccountInfo}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.pmFullNameLabel}
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
                                                placeholder={
                                                    t.pmFullNamePlaceholder
                                                }
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 transition-colors"
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 transition-colors">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.pmEmailLabel}
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
                                                placeholder={
                                                    t.pmEmailPlaceholder
                                                }
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 transition-colors"
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 transition-colors">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {editingId
                                                    ? t.pmPasswordNew
                                                    : t.pmPasswordTemp}
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
                                                        ? t.pmPasswordPlaceholderEdit
                                                        : t.pmPasswordPlaceholderAdd
                                                }
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 transition-colors"
                                            />
                                            {errors.password && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 transition-colors">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Armada */}
                                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 transition-colors">
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 mt-2 transition-colors">
                                        {t.pmFleetDetail}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.pmVehicleTypeLabel}
                                            </label>
                                            <select
                                                value={data.jenis_kendaraan}
                                                onChange={(e) =>
                                                    setData(
                                                        "jenis_kendaraan",
                                                        e.target.value as any,
                                                    )
                                                }
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 transition-colors"
                                            >
                                                <option value="pickup">
                                                    {t.pmVehiclePickup}
                                                </option>
                                                <option value="motor_gerobak">
                                                    {t.pmVehicleMotor}
                                                </option>
                                                <option value="truk_besar">
                                                    {t.pmVehicleTruck}
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.pmPlateLabel}
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
                                                placeholder={
                                                    t.pmPlatePlaceholder
                                                }
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 transition-colors uppercase placeholder:normal-case placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                                {t.pmCapacityLabel}
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
                                                placeholder={
                                                    t.pmCapacityPlaceholder
                                                }
                                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 focus:border-[#a7e94a] focus:ring-[#a7e94a] sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                                min="0"
                                            />
                                            {errors.kapasitas_kg && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 transition-colors">
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
                                                        className="rounded-md border-slate-300 dark:border-slate-600 text-[#a7e94a] focus:ring-[#a7e94a] bg-white dark:bg-slate-900 w-5 h-5 transition-colors cursor-pointer"
                                                    />
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                                                        {t.pmStatusActiveLabel}
                                                    </span>
                                                </label>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 ml-8 transition-colors">
                                                    {t.pmStatusActiveNote}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/80 transition-colors">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            >
                                {t.pmCancel}
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
                                        {t.pmProcessing}
                                    </>
                                ) : editingId ? (
                                    t.pmUpdateData
                                ) : (
                                    t.pmSaveData
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DLHLayout>
    );
}
