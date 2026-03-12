<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\DangerZone;

class HomeController extends Controller
{
    public function index()
    {
        $reports = Report::with([
            'user:id,name',
            'likes',
            'comments' => function ($query) {
                $query->whereNull('parent_id')
                    ->with(['user:id,name', 'replies.user:id,name'])
                    ->oldest();
            },
            'user.warga'
        ])
            ->whereIn('status', ['menunggu', 'divalidasi', 'proses', 'selesai'])
            ->latest()
            ->get();

        $dangerZones = DangerZone::where('is_active', true)->get();

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'reports' => $reports,
            'dangerZones' => $dangerZones,
        ]);
    }
}
