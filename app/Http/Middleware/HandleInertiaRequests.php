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

        // Kita siapkan data user mentahnya
        $userData = null;

        if ($user) {
            $user->load('warga'); // Load relasi warga

            // Ubah user menjadi bentuk array standar
            $userData = $user->toArray();

            // SUNTIKKAN NOTIFIKASI KE DALAM ARRAY USER
            $userData['notifications'] = AppNotification::where('user_id', $user->id)
                ->latest()
                ->take(15)
                ->get();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
            ],
            'unassignedCount' => $isDlh ? Report::whereNull('kaling_id')->count() : 0,
        ];
    }
}
