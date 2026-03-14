<?php

namespace App\Http\Middleware;

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

        // CEK APAKAH USER ADALAH DLH
        $isDlh = $request->user() && $request->user()->role === 'dlh';

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('warga') : null,
                'notifications' => $request->user() ? $request->user()->appNotifications()->latest()->take(20)->get() : [],
            ],
            'unassignedCount' => $isDlh ? Report::whereNull('kaling_id')->count() : 0,
        ];
    }
}
