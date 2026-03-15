<?php

namespace App\Http\Middleware;

use App\Models\AppNotification;
use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {

        $isDlh = $request->user() && $request->user()->role === 'dlh';
        $user = $request->user();

        // Jika user sedang login, kita siapkan data profil dan notifikasinya
        if ($user) {
            $user->load('warga'); // Load relasi warga

            // Suntikkan (attach) notifikasi langsung ke dalam object user agar mudah diakses frontend
            // Kita batasi hanya 15 notifikasi terbaru untuk performa
            $user->setAttribute(
                'notifications',
                AppNotification::where('user_id', $user->id)
                    ->latest()
                    ->take(15)
                    ->get()
            );
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user, // Jika null, frontend akan menerima null
            ],
            // Hitungan laporan yang belum ditugaskan (hanya untuk role dlh)
            'unassignedCount' => ($isDlh && $user) ? Report::whereNull('kaling_id')->count() : 0,
        ];
    }
}
