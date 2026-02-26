<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\Kaling;
use App\Models\Report;
use App\Models\ReportStatusLog;
use App\Notifications\ReportStatusUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function create()
    {
        $kalings = Kaling::orderBy('nama_wilayah', 'asc')->get(['id', 'nama_wilayah']);

        return Inertia::render('Report/Create', [
            'kalings' => $kalings
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kaling_id' => 'nullable|exists:kalings,id',
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
            'kaling_id' => $request->kaling_id,
            'description' => $request->description,
            'photo_path' => $photoPath,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'address' => $request->address,
            'status' => 'menunggu',
            'severity_level' => $request->severity_level ?? 'Menunggu Analisis',
            'waste_type' => $request->waste_type,
        ]);

        return redirect()->route('dashboard.warga')->with('success', 'Laporan berhasil dikirim!');
    }

    public function updateStatus(Request $request, Report $report)
    {
        $oldStatus = $report->status;

        $request->validate([
            'status' => 'required|in:divalidasi,proses,selesai,ditolak',
            'notes' => 'nullable|string|max:500',
        ]);

        $newStatus = $request->status;
        $pelapor = $report->user;

        // Poin Kepercayaan Warga
        if ($pelapor && $pelapor->role === 'warga') {
            $warga = $pelapor->warga()->firstOrCreate(
                ['user_id' => $pelapor->id],
                ['poin_kepercayaan' => 0, 'is_terverifikasi' => false]
            );

            if ($oldStatus === 'menunggu' && $newStatus === 'divalidasi') {
                $warga->poin_kepercayaan += 5;
            } elseif ($newStatus === 'ditolak') {
                $warga->poin_kepercayaan -= 5;
                if ($warga->poin_kepercayaan < 0) {
                    $warga->poin_kepercayaan = 0;
                }
            } elseif ($oldStatus === 'proses' && $newStatus === 'selesai') {
                $warga->poin_kepercayaan += 10;
            }

            $warga->is_terverifikasi = $warga->poin_kepercayaan >= 50;
            $warga->save();
        }

        // Status log
        ReportStatusLog::create([
            'report_id' => $report->id,
            'changed_by' => Auth::id(),
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'notes' => $request->notes,
        ]);

        // Notifikasi
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

        // Eksekusi
        if ($newStatus === 'ditolak') {
            if ($report->photo_path) {
                Storage::disk('public')->delete($report->photo_path);
            }
            $report->delete();
            return back()->with('success', 'Laporan berhasil ditolak dan dihapus dari sistem.');
        } else {
            $dataToUpdate = ['status' => $newStatus];

            if ($newStatus === 'proses' && $request->user()->role === 'petugas') {
                if ($request->user()->petugas) {
                    $dataToUpdate['petugas_id'] = $request->user()->petugas->id;
                }
            }

            $report->update($dataToUpdate);
            return back()->with('success', 'Status laporan berhasil diperbarui.');
        }
    }
}
