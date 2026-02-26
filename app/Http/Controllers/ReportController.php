<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\Report;
use App\Models\ReportStatusLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'address' => 'nullable|string|max:500',
            'waste_type' => 'nullable|in:organik,anorganik,b3,campuran',
            'severity_level' => 'nullable|string|max:100',
        ]);

        $photoPath = $request->file('photo')->store('reports', 'public');

        Report::create([
            'user_id' => Auth::id(),
            'description' => $request->description,
            'photo_path' => $photoPath,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'address' => $request->address,
            'waste_type' => $request->waste_type,
            'status' => 'menunggu',
            'severity_level' => $request->severity_level ?? 'Menunggu Analisis',
        ]);

        return redirect()->route('dashboard.warga')->with('success', 'Laporan berhasil dikirim!');
    }

    public function updateStatus(Request $request, Report $report)
    {
        $request->validate([
            'status' => 'required|in:divalidasi,proses,selesai',
            'notes' => 'nullable|string|max:500',
        ]);

        $oldStatus = $report->status;
        $newStatus = $request->status;

        $report->update(['status' => $newStatus]);

        ReportStatusLog::create([
            'report_id' => $report->id,
            'changed_by' => Auth::id(),
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'notes' => $request->notes,
        ]);

        if ($report->user_id !== Auth::id()) {
            AppNotification::create([
                'user_id' => $report->user_id,
                'type' => 'report_status_updated',
                'notifiable_type' => Report::class,
                'notifiable_id' => $report->id,
                'data' => [
                    'report_id' => $report->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'message' => 'Status laporan Anda telah diperbarui menjadi: ' . $newStatus,
                ],
            ]);
        }

        return back()->with('success', 'Status laporan berhasil diperbarui.');
    }
}
