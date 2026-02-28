<?php

namespace App\Http\Controllers;

use App\Models\Kaling;
use App\Models\Report;
use App\Notifications\ReportStatusUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

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
            'kaling_id'   => 'nullable|exists:kalings,id',
            'description' => 'required|string|max:1000',
            'photo'       => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'latitude'    => 'required|numeric',
            'longitude'   => 'required|numeric',
        ]);

        $photoPath = $request->file('photo')->store('reports', 'public');

        Report::create([
            'user_id'        => $request->user()->id,
            'kaling_id'      => $request->kaling_id,
            'description'    => $request->description,
            'photo_path'     => $photoPath,
            'latitude'       => $request->latitude,
            'longitude'      => $request->longitude,
            'status'         => 'menunggu',
            'severity_level' => $request->severity_level,
            'waste_type'     => $request->waste_type,
        ]);

        return redirect()->route('dashboard.warga')->with('success', 'Laporan berhasil dikirim!');
    }

    public function updateStatus(Request $request, Report $report)
    {
        $oldStatus = $report->status;

        $request->validate([
            'status' => 'required|in:divalidasi,proses,selesai,ditolak',
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

        // Logika Notifikasi
        $pesan = '';
        if ($newStatus === 'divalidasi') {
            $pesan = "Laporan Anda divalidasi oleh Kepala Lingkungan dan akan diteruskan ke petugas. Selamat, Anda mendapatkan +5 Poin Kepercayaan!";
        } elseif ($newStatus === 'proses') {
            $pesan = "Petugas sedang menuju lokasi untuk mengangkut tumpukan sampah laporan Anda.";
        } elseif ($newStatus === 'selesai') {
            $pesan = "Terima kasih! Tumpukan sampah telah selesai dibersihkan oleh petugas. Anda mendapatkan hadiah +10 Poin Kepercayaan!";
        } elseif ($newStatus === 'ditolak') {
            $pesan = "Mohon maaf, laporan Anda ditolak dan dihapus dari sistem karena tidak memenuhi kriteria. Poin Kepercayaan Anda dikurangi 5 poin.";
        }

        if ($pesan !== '') {
            $pelapor->notify(new ReportStatusUpdated($report, $pesan));
        }

        // Eksekusi Hapus Atau Update
        if ($newStatus === 'ditolak') {
            // Hapus file foto dari folder storage agar server tidak penuh
            if ($report->photo_path) {
                Storage::disk('public')->delete($report->photo_path);
            }

            // Hapus datanya dari tabel database
            $report->delete();

            return back()->with('success', 'Laporan berhasil ditolak dan dihapus dari sistem.');
        } else {
            // Jika status bukan ditolak, lakukan update seperti biasa
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
