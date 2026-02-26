<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PetugasController extends Controller
{
    public function index()
    {
        $reports = Report::with('user:id,name')
            ->whereIn('status', ['divalidasi', 'proses'])
            ->oldest()
            ->get();

        return Inertia::render('Dashboard/Petugas', [
            'reports' => $reports
        ]);
    }
}
