<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class ReportController extends Controller
{
    public function create()
    {
        return Inertia::render('Report/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'description' => 'required|string|max:1000',
            'photo'       => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'latitude'    => 'required|numeric',
            'longitude'   => 'required|numeric',
        ]);

        $photoPath = $request->file('photo')->store('reports', 'public');

        Report::create([
            'user_id'        => $request->user()->id,
            'description'    => $request->description,
            'photo_path'     => $photoPath,
            'latitude'       => $request->latitude,
            'longitude'      => $request->longitude,
            'status'         => 'menunggu',
            'severity_level' => 'Menunggu Analisis',
        ]);

        return redirect()->route('dashboard.warga')->with('success', 'Laporan berhasil dikirim!');
    }

    public function updateStatus(Request $request, Report $report)
    {
        $request->validate([
            'status' => 'required|in:divalidasi,proses,selesai',
        ]);

        $report->update([
            'status' => $request->status
        ]);

        return back()->with('success', 'Status laporan berhasil diperbarui.');
    }
}
