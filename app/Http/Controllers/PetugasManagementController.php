<?php

namespace App\Http\Controllers;

use App\Models\Petugas;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class PetugasManagementController extends Controller
{
    public function index()
    {
        $petugas = Petugas::with('user')->latest()->get();

        return Inertia::render('DLH/Petugas/Index', [
            'petugasList' => $petugas
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Password::defaults()],
            'jenis_kendaraan' => 'required|in:truk_besar,pickup,motor_gerobak',
            'plat_nomor' => 'nullable|string|max:20',
            'kapasitas_kg' => 'required|numeric|min:0',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'petugas',
        ]);

        Petugas::create([
            'user_id' => $user->id,
            'jenis_kendaraan' => $request->jenis_kendaraan,
            'plat_nomor' => $request->plat_nomor,
            'kapasitas_kg' => $request->kapasitas_kg,
            'is_aktif' => true, // Default aktif saat dibuat
        ]);

        return back()->with('success', 'Data Petugas berhasil ditambahkan!');
    }

    public function update(Request $request, $id)
    {
        $petugas = Petugas::findOrFail($id);
        $user = $petugas->user;

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', Password::defaults()],
            'jenis_kendaraan' => 'required|in:truk_besar,pickup,motor_gerobak',
            'plat_nomor' => 'nullable|string|max:20',
            'kapasitas_kg' => 'required|numeric|min:0',
            'is_aktif' => 'required|boolean',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        $user->save();

        $petugas->update([
            'jenis_kendaraan' => $request->jenis_kendaraan,
            'plat_nomor' => $request->plat_nomor,
            'kapasitas_kg' => $request->kapasitas_kg,
            'is_aktif' => $request->is_aktif,
        ]);

        return back()->with('success', 'Data Petugas berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $petugas = Petugas::findOrFail($id);
        $petugas->user->delete();
        return back()->with('success', 'Data Petugas berhasil dihapus!');
    }
}
