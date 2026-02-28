<?php

namespace App\Http\Controllers;

use App\Models\Kaling;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class KalingManagementController extends Controller
{
    public function index()
    {
        $kalings = Kaling::with('user')->latest()->get();

        return Inertia::render('DLH/Kaling/Index', [
            'kalings' => $kalings
        ]);
    }


    // Menyimpan data Kaling baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Password::defaults()],
            'nik' => 'required|string|unique:kalings',
            'nama_wilayah' => 'required|string|max:255',
            'no_telp' => 'required|string|max:15',
        ]);

        // 1. Buat Akun User (Role Kaling)
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'kaling', // Kunci role-nya
        ]);

        // 2. Buat Profil Kaling terkait
        Kaling::create([
            'user_id' => $user->id,
            'nik' => $request->nik,
            'nama_wilayah' => $request->nama_wilayah,
            'no_telp' => $request->no_telp,
        ]);

        return redirect()->route('kaling-management.index')->with('success', 'Data Kaling berhasil ditambahkan!');
    }
    public function update(Request $request, $id)
    {
        $kaling = Kaling::findOrFail($id);
        $user = $kaling->user;

        $request->validate([
            'name' => 'required|string|max:255',
            // Kecualikan email user ini dari aturan unique
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            // Password boleh kosong saat diedit
            'password' => ['nullable', \Illuminate\Validation\Rules\Password::defaults()],
            // Kecualikan nik kaling ini dari aturan unique
            'nik' => 'required|string|unique:kalings,nik,' . $kaling->id,
            'nama_wilayah' => 'required|string|max:255',
            'no_telp' => 'nullable|string|max:15',
        ]);

        // 1. Update Akun User
        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->filled('password')) {
            $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        }
        $user->save();

        // 2. Update Profil Kaling
        $kaling->update([
            'nik' => $request->nik,
            'nama_wilayah' => $request->nama_wilayah,
            'no_telp' => $request->no_telp,
        ]);

        return back()->with('success', 'Data Kaling berhasil diperbarui!');
    }

    // Menghapus data Kaling
    public function destroy($id)
    {
        $kaling = Kaling::findOrFail($id);
        // Karena di migration ada onDelete('cascade'), menghapus User otomatis akan menghapus data Kaling juga
        $kaling->user->delete();

        return back()->with('success', 'Data Kaling berhasil dihapus!');
    }
}
