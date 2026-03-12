<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\Kaling;
use App\Models\Report;
use App\Models\ReportStatusLog;
use App\Notifications\ReportStatusUpdated;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
            'photo' => 'required_without:photos|image|mimes:jpeg,png,jpg,webp|max:7168',
            'photos' => 'nullable|array',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'address' => 'nullable|string|max:500',
            'waste_type' => 'nullable|string|max:255',
            'severity_level' => 'nullable|string|max:100',
            'needs' => 'nullable|array',
            'city' => 'nullable|string|max:255',
        ]);

        $photoFile = $request->file('photo') ?? ($request->file('photos')[0] ?? null);

        if (!$photoFile) {
            return back()->withErrors(['photo' => 'Photo is required.']);
        }

        $photoPath = $photoFile->store('reports', 'public');

        // --- SISTEM OTOMATIS DLH (GIS ANALYSIS) ---
        $matchingZone = null;
        /** @var \Illuminate\Database\Eloquent\Collection<\App\Models\DangerZone> $activeZones */
        $activeZones = \App\Models\DangerZone::active()->get();
        foreach ($activeZones as $zone) {
            if ($zone->isPointInside($request->latitude, $request->longitude)) {
                $matchingZone = $zone;
                break; // Ambil zona pertama yang cocok
            }
        }

        $severity = $request->severity_level ?? 'low';
        // Normalize severity to match case if needed, but 'low', 'moderate', 'high' is standard
        $severity = strtolower($severity);
        if ($severity === 'ringan') $severity = 'low';
        if ($severity === 'sedang') $severity = 'moderate';
        if ($severity === 'parah') $severity = 'high';

        $desc = $request->description;

        if ($matchingZone) {
            // Jika masuk zona sistem, otomatis naikkan severity dan tandai deskripsi
            $severity = $matchingZone->severity; // Ikuti severity zona dari DLH
            $desc = "[AUTOSYSTEM: {$matchingZone->name}] " . $desc;
        }

        // --- SISTEM OTOMATIS PENENTUAN KALING (SMART MATCHING) ---
        $kalingId = null;
        // Parsing Kota sederhana dari alamat jika city kosong
        $city = $request->city;

        if ($request->address) {
            $addressLower = strtolower($request->address);

            // Ekstrak nama kota/kabupaten jika ada di dalam alamat
            if (!$city) {
                if (str_contains($addressLower, 'mataram')) $city = 'Mataram';
                elseif (str_contains($addressLower, 'lombok barat')) $city = 'Lombok Barat';
                elseif (str_contains($addressLower, 'lombok tengah')) $city = 'Lombok Tengah';
                elseif (str_contains($addressLower, 'lombok timur')) $city = 'Lombok Timur';
                elseif (str_contains($addressLower, 'lombok utara')) $city = 'Lombok Utara';
            }

            $kalings = Kaling::all();
            $maxScore = 0;

            foreach ($kalings as $k) {
                $wilLower = strtolower($k->nama_wilayah);
                // Bersihkan kata-kata umum wilayah
                $cleanWilayah = preg_replace('/\b(lingkungan|kel\.|kelurahan|kec\.|kecamatan|desa)\b/i', ' ', $wilLower);

                // Ambil kata kunci (lebih dari 3 huruf)
                preg_match_all('/[a-z]{4,}/i', $cleanWilayah, $matches);
                $keywords = $matches[0] ?? [];

                $currentScore = 0;
                foreach ($keywords as $kw) {
                    if (str_contains($addressLower, strtolower($kw))) {
                        $currentScore++;
                    }
                }

                if ($currentScore > $maxScore) {
                    $maxScore = $currentScore;
                    $kalingId = $k->id;
                }
            }
        }

        $report = Report::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'kaling_id' => $kalingId,
            'description' => $desc,
            'photo_path' => $photoPath,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'address' => $request->address,
            'city' => $city,
            'status' => 'menunggu',
            'severity_level' => $severity,
            'waste_type' => $request->waste_type,
            'needs' => $request->needs,
        ]);

        // --- NOTIFIKASI WHATSAPP KE KALING ---
        if ($report->kaling_id) {
            $kaling = \App\Models\Kaling::with('user')->find($report->kaling_id);
            if ($kaling && $kaling->user && $kaling->user->phone_number) {
                // Pastikan class WhatsAppService sudah di-import di atas (use App\Services\WhatsAppService;)
                $wa = new \App\Services\WhatsAppService();
                $msg = "📢 *Laporan Sampah Baru!*\n\n" .
                    "ID: #{$report->id}\n" .
                    "Lokasi: {$report->address}\n" .
                    "Jenis: {$report->waste_type}\n" .
                    "Tingkat: {$report->severity_level}\n\n" .
                    "Silakan balas pesan ini dengan:\n" .
                    "✅ *ACC {$report->id}* (untuk Validasi)\n" .
                    "❌ *TOLAK {$report->id} [Alasan]* (untuk Menolak)";

                $wa->sendMessage($kaling->user->phone_number, $msg);
            }
        }

        return redirect()->to('/')->with('success', 'Laporan berhasil dikirim! Menunggu validasi petugas.');
    }

    public function show($id)
    {
        $report = Report::with(['user:id,name', 'comments.user:id,name'])
            ->findOrFail($id);

        $comments = $report->comments;
        $isLiked = Auth::check() ? $report->likes()->where('user_id', Auth::id())->exists() : false;

        return Inertia::render('Report/Show', [
            'report' => $report,
            'comments' => $comments,
            'isLiked' => $isLiked
        ]);
    }

    public function updateStatus(Request $request, Report $report)
    {
        $oldStatus = $report->status;
        $user = Auth::user();

        // 1. STICK ROLE-BASED ACCESS CONTROL
        if ($user->role === 'kaling') {
            // Kaling hanya bisa memvalidasi atau menolak laporan baru (menunggu)
            if ($oldStatus !== 'menunggu') {
                return back()->with('error', 'Kaling hanya dapat memproses laporan dengan status Menunggu.');
            }
            $request->validate([
                'status' => 'required|in:divalidasi,ditolak',
                'notes' => 'nullable|string|max:500',
            ]);
        } elseif ($user->role === 'petugas') {
            // Petugas hanya bisa memproses laporan yang sudah divalidasi ke 'proses'
            // ATAU menyelesaikan laporan yang sedang 'proses'.
            if ($oldStatus === 'divalidasi') {
                $request->validate(['status' => 'required|in:proses']);
            } elseif ($oldStatus === 'proses') {
                $request->validate(['status' => 'required|in:selesai']);
            } else {
                return back()->with('error', 'Laporan ini tidak dalam tahap yang bisa diproses petugas.');
            }
            $request->validate(['notes' => 'nullable|string|max:500']);
        } elseif ($user->role === 'dlh') {
            // DLH memiliki akses kontrol penuh (superadmin bypass)
            $request->validate([
                'status' => 'required|in:divalidasi,proses,selesai,ditolak',
                'notes' => 'nullable|string|max:500',
            ]);
        } else {
            abort(403, 'Anda tidak memiliki akses untuk mengubah status laporan.');
        }

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

            if ($newStatus === 'proses' && $user->role === 'petugas') {
                if ($user->petugas) {
                    $dataToUpdate['petugas_id'] = $user->petugas->id;
                }
            }

            $report->update($dataToUpdate);
            return back()->with('success', 'Status laporan berhasil diperbarui.');
        }
    }
}
