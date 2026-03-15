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
        $notifications = [];

        // Jika user sedang login, kita siapkan data profil dan notifikasinya
        if ($user) {
            $user->load('warga'); // Load relasi warga

            // Ambil notifikasi terbaru
            $notifications = AppNotification::where('user_id', $user->id)
                ->latest()
                ->take(15)
                ->get();

            // Suntikkan (attach) notifikasi langsung ke dalam object user (untuk frontend baru)
            $user->setAttribute('notifications', $notifications);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'notifications' => $notifications, // Redundant top-level share (untuk backward compatibility)
            ],
            'unassignedCount' => $isDlh ? Report::whereNull('kaling_id')->count() : 0,
        ];
    }
}
