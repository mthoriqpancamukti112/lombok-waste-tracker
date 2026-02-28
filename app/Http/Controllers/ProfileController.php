<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        // Eager load relasi warga dan kaling sekaligus (yang kosong akan bernilai null)
        $user = $request->user()->load(['warga', 'kaling', 'petugas']);

        $data = [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'userData' => $user
        ];

        return match ($user->role) {
            'kaling'  => Inertia::render('Profile/EditKaling', $data),
            'petugas' => Inertia::render('Profile/EditPetugas', $data),
            'dlh'     => Inertia::render('Profile/EditDlh', $data),
            default   => Inertia::render('Profile/Edit', $data),
        };
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Update data dasar di tabel users
        $user->fill($request->safe()->only(['name', 'email']));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();

        // Update data tambahan sesuai role
        if ($user->role === 'warga') {
            $user->warga()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'no_telp' => $request->no_telp,
                    'alamat' => $request->alamat,
                ]
            );
        } elseif ($user->role === 'kaling') {
            // Kaling hanya diizinkan update no_telp dari halaman ini (NIK & Wilayah diatur DLH)
            $user->kaling()->updateOrCreate(
                ['user_id' => $user->id],
                ['no_telp' => $request->no_telp]
            );
        }

        return Redirect::back()->with('status', 'profile-updated');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
