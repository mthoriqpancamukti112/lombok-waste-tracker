<?php

namespace App\Exports;

use App\Models\Report;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

// Tambahkan ShouldAutoSize di sini agar kolom Excel otomatis lebar menyesuaikan teks
class LaporanExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $status;
    protected $startDate;
    protected $endDate;

    public function __construct($status, $startDate, $endDate)
    {
        $this->status = $status;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        // Tambahkan 'kaling.user' agar nama Kaling ikut terambil dari DB
        $query = Report::with(['user', 'petugas.user', 'kaling.user']);

        if ($this->status) {
            $query->where('status', $this->status);
        }
        if ($this->startDate && $this->endDate) {
            $query->whereBetween('created_at', [$this->startDate . ' 00:00:00', $this->endDate . ' 23:59:59']);
        }

        return $query->latest()->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Tanggal Laporan',
            'Nama Pelapor',
            'Wilayah Kaling',
            'Kepala Lingkungan',
            'Koordinat (Lat, Lng)',
            'Alamat Lengkap',
            'Kota/Kabupaten',
            'Deskripsi Laporan',
            'Jenis Sampah',
            'Tingkat Keparahan',
            'Kebutuhan Bantuan',
            'Petugas Penanggung Jawab',
            'Catatan Penyelesaian',
            'Status'
        ];
    }

    public function map($report): array
    {
        // Format array Kebutuhan (needs) menjadi string yang dipisahkan koma
        $needsString = '-';
        if (is_string($report->needs)) {
            // Jika disimpan sebagai JSON string di DB
            $needsArray = json_decode($report->needs, true);
            $needsString = is_array($needsArray) ? implode(', ', $needsArray) : $report->needs;
        } elseif (is_array($report->needs)) {
            // Jika disimpan sudah di-cast array di Model
            $needsString = implode(', ', $report->needs);
        }

        return [
            $report->id,
            Carbon::parse($report->created_at)->timezone('Asia/Makassar')->format('d-m-Y H:i:s'),
            $report->user ? $report->user->name : 'Anonim',
            // Data Kaling (Sangat berguna untuk melacak laporan nyasar)
            $report->kaling ? $report->kaling->nama_wilayah : 'Belum Ditentukan',
            $report->kaling && $report->kaling->user ? $report->kaling->user->name : '-',
            $report->latitude . ', ' . $report->longitude,
            // Alamat dan Kota
            $report->address ?? 'Tidak ada alamat',
            $report->city ?? '-',
            $report->description ?? '-',
            strtoupper($report->waste_type ?? '-'), // Kapital agar rapi (ORGANIK, B3)
            strtoupper($report->severity_level ?? '-'), // Kapital (TINGGI, RENDAH)
            $needsString,
            $report->petugas && $report->petugas->user ? $report->petugas->user->name : 'Belum Ditugaskan',
            $report->resolved_notes ?? '-',
            strtoupper($report->status)
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Membuat baris Heading (baris 1) menjadi Bold dan memiliki background abu-abu
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF475569'] // Warna Slate-600 Tailwind
                ]
            ],
        ];
    }
}
