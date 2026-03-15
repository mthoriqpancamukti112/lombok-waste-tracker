<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\Kaling;
use App\Models\Report;
use App\Models\ReportStatusLog;
use App\Models\User;
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
        if ($severity === 'ringan')
            $severity = 'low';
        if ($severity === 'sedang')
            $severity = 'moderate';
        if ($severity === 'parah')
            $severity = 'high';

        $desc = $request->description;

        if ($matchingZone) {
            // Jika masuk zona sistem, otomatis naikkan severity dan tandai deskripsi
            $severity = $matchingZone->severity; // Ikuti severity zona dari DLH
            $desc = "[AUTOSYSTEM: {$matchingZone->name}] " . $desc;
        }

        // --- SISTEM OTOMATIS PENENTUAN KALING (SMART MATCHING) ---
        $kalingId = null;
        $city = $request->city;
        $addressLower = strtolower($request->address ?? '');

        if ($addressLower) {
            // Ekstrak nama kota/kabupaten jika ada di dalam alamat
            if (!$city) {
                if (str_contains($addressLower, 'mataram'))
                    $city = 'Mataram';
                elseif (str_contains($addressLower, 'lombok barat'))
                    $city = 'Lombok Barat';
                elseif (str_contains($addressLower, 'lombok tengah'))
                    $city = 'Lombok Tengah';
                elseif (str_contains($addressLower, 'lombok timur'))
                    $city = 'Lombok Timur';
                elseif (str_contains($addressLower, 'lombok utara'))
                    $city = 'Lombok Utara';
            }

            $kalings = Kaling::all();
            $maxScore = 0;
            $threshold = 1; // Syarat: Minimal harus dapat skor lebih dari 1 (misal 2 kata cocok) untuk mencegah salah alamat.

            foreach ($kalings as $k) {
                $wilLower = strtolower($k->nama_wilayah);

                // Hapus kata arah angin yang sering memicu "false positive"
                $cleanWilayah = preg_replace('/\b(lingkungan|kel\.|kelurahan|kec\.|kecamatan|desa|timur|barat|utara|selatan|tengah)\b/i', ' ', $wilLower);

                // Ambil kata kunci nama spesifik daerahnya
                preg_match_all('/[a-z]{3,}/i', $cleanWilayah, $matches);
                $keywords = $matches[0] ?? [];

                $currentScore = 0;
                foreach ($keywords as $kw) {
                    if (str_contains($addressLower, strtolower($kw))) {
                        $currentScore += 2; // Beri bobot besar jika kata uniknya cocok
                    }
                }

                // Cek juga kecocokan nama aslinya secara utuh (bonus skor tinggi)
                // Contoh: Jika alamat mengandung persis kata "Jempong Barat"
                $rawWilayahName = trim(preg_replace('/\b(lingkungan|kel\.|kelurahan|kec\.|kecamatan|desa)\b/i', '', $wilLower));
                if (strlen($rawWilayahName) > 4 && str_contains($addressLower, $rawWilayahName)) {
                    $currentScore += 5;
                }

                // Hanya assign jika skor melewati batas threshold DAN lebih besar dari skor Kaling lain
                if ($currentScore > $threshold && $currentScore > $maxScore) {
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

        // --- NOTIFIKASI APP KE WARGA ---
        AppNotification::create([
            'user_id' => $report->user_id,
            'type' => 'report_submitted',
            'notifiable_type' => Report::class,
            'notifiable_id' => $report->id,
            'data' => [
                'report_id' => $report->id,
                'translation_key' => 'notif_report_submitted',
                'icon' => 'status',
                'title' => 'Laporan Terkirim',
                'message' => 'Anda mengajukan laporan. Laporan anda sedang menunggu validasi Kaling.',
            ],
        ]);

        // --- NOTIFIKASI WHATSAPP KE KALING ---
        if ($report->kaling_id) {
            $kaling = \App\Models\Kaling::with('user')->find($report->kaling_id);
            $phone = $kaling ? ($kaling->no_telp ?? ($kaling->user->phone_number ?? null)) : null;
            if ($phone) {
                (new \App\Services\WhatsAppService())->notifyKaling($kaling, $report);
            }
        }

        return redirect()->to('/')->with('success', 'Laporan berhasil dikirim! Menunggu validasi petugas.');
    }

    public function show($id)
    {
        $report = Report::with([
            'user:id,name',
            'comments' => function ($query) {
                $query->whereNull('parent_id')
                    ->with(['user:id,name', 'replies.user:id,name'])
                    ->latest();
            }
        ])->findOrFail($id);

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
            $msg = 'Status laporan Anda telah diperbarui menjadi: ' . $newStatus;

            if ($oldStatus === 'menunggu' && $newStatus === 'divalidasi') {
                $msg = 'Laporan anda telah divalidasi kaling anda mendapatkan 5 poin';
            } elseif ($newStatus === 'proses') {
                $msg = 'Laporan anda di proses oleh petugas';
            } elseif ($oldStatus === 'proses' && $newStatus === 'selesai') {
                $msg = 'Laporan anda selesai di bersihkan oleh petugas dinas lingkungan hidup anda mendapatkan 10 poin';
            } elseif ($newStatus === 'ditolak') {
                $msg = 'Maaf, laporan anda ditolak.';
            }

            AppNotification::create([
                'user_id' => $report->user_id,
                'type' => 'report_status_updated',
                'notifiable_type' => Report::class,
                'notifiable_id' => $report->id,
                'data' => [
                    'report_id' => $report->id,
                    'translation_key' => 'notif_status_updated',
                    'icon' => 'status',
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'title' => 'Update Laporan',
                    'message' => $msg,
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

            // --- TRIGGER WA NOTIFIKASI KE PETUGAS JIKA DIVALIDASI ---
            if ($oldStatus === 'menunggu' && $newStatus === 'divalidasi') {
                (new WhatsAppService())->notifyAllPetugas($report);
            }

            return back()->with('success', 'Status laporan berhasil diperbarui.');
        }
    }

    public function getLatestReportStatus($userId)
    {
        if ($userId == 0) {
            return response()->json(['status' => null], 200);
        }

        // Cari 1 laporan paling baru berdasarkan user_id
        $latestReport = Report::where('user_id', $userId)
            ->latest() // otomatis mengurutkan dari created_at terbaru
            ->first();

        if (!$latestReport) {
            return response()->json(['status' => null], 200);
        }

        return response()->json([
            'status' => $latestReport->status,
            'address' => $latestReport->address ?? 'Lokasi tidak diketahui',
            'date' => $latestReport->created_at->format('d M Y')
        ], 200);
    }

    /**
     * API Endpoint untuk Chatbot Python mengambil 5 laporan terbaru secara global
     */
    public function getLatestReports()
    {
        // Ambil 5 laporan terakhir beserta nama pelapornya
        $reports = Report::with('user:id,name')
            ->latest()
            ->take(5)
            ->get();

        if ($reports->isEmpty()) {
            return response()->json(['reports' => []], 200);
        }

        // Format datanya agar rapi saat dibaca Python
        $formattedReports = $reports->map(function ($report) {
            return [
                'id' => $report->id,
                'pelapor' => $report->user ? $report->user->name : 'Anonim',
                'lokasi' => $report->address ?? ($report->city ?? 'Lokasi tidak diketahui'),
                'status' => $report->status,
                'tanggal' => $report->created_at->format('d M Y, H:i')
            ];
        });

        return response()->json(['reports' => $formattedReports], 200);
    }

    /**
     * API Endpoint untuk Chatbot Python (Khusus Petugas, Kaling, DLH)
     */
    public function getTitikAngkut($userId)
    {
        if ($userId == 0) {
            return response()->json(['role' => 'guest'], 200);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['role' => 'unknown'], 200);
        }

        if ($user->role === 'warga') {
            return response()->json([
                'role' => 'warga',
                'message' => 'Fitur ini khusus untuk operasional petugas.'
            ], 200);
        }

        $totalTugas = Report::whereIn('status', ['divalidasi', 'proses'])->count();
        $menungguKaling = Report::where('status', 'menunggu')->count();

        // Ambil 5 tugas yang SIAP ANGKUT
        $reports = Report::whereIn('status', ['divalidasi', 'proses'])
            ->latest()
            ->take(5)
            ->get();

        $formattedReports = $reports->map(function ($report) {
            return [
                'id' => $report->id,
                'lokasi' => $report->address ?? ($report->city ?? 'Lokasi tidak diketahui'),
                'status' => $report->status,
                'severity' => strtolower($report->severity_level ?? 'low')
            ];
        });

        // --- TAMBAHAN BARU: Ambil 10 data yang MENUNGGU KALING ---
        $menungguList = Report::where('status', 'menunggu')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'lokasi' => $report->address ?? ($report->city ?? 'Lokasi tidak diketahui'),
                ];
            });

        return response()->json([
            'role' => $user->role,
            'total_tugas' => $totalTugas,
            'menunggu_kaling' => $menungguKaling,
            'reports' => $formattedReports,
            'menunggu_list' => $menungguList
        ], 200);
    }

    /**
     * API Endpoint untuk Chatbot Python mengambil statistik keseluruhan laporan
     */
    public function getStatistik()
    {
        $total = Report::count();

        // Ambil jumlah berdasarkan masing-masing status
        $menunggu = Report::where('status', 'menunggu')->count();
        $divalidasi = Report::where('status', 'divalidasi')->count();
        $proses = Report::where('status', 'proses')->count();
        $selesai = Report::where('status', 'selesai')->count();
        $ditolak = Report::where('status', 'ditolak')->count();

        // Hitung persentase penyelesaian (Tingkat Keberhasilan)
        $persentaseSelesai = $total > 0 ? round(($selesai / $total) * 100, 1) : 0;

        return response()->json([
            'total' => $total,
            'menunggu' => $menunggu,
            'divalidasi' => $divalidasi,
            'proses' => $proses,
            'selesai' => $selesai,
            'ditolak' => $ditolak,
            'persentase_selesai' => $persentaseSelesai
        ], 200);
    }
}
