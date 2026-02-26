<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KalingController extends Controller
{
    public function index()
    {
        $reports = Report::with('user:id,name')
            ->where('status', 'menunggu')
            ->oldest()
            ->get();

        return Inertia::render('Dashboard/Kaling', [
            'reports' => $reports
        ]);
    }
}
