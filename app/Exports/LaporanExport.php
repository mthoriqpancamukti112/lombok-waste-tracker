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

class LaporanExport implements FromCollection, WithHeadings, WithMapping
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
        $query = Report::with(['user', 'petugas.user']);

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
            'Koordinat (Lat, Lng)',
            'Deskripsi / Lokasi',
            'Jenis Sampah',
            'Tingkat Keparahan',
            'Petugas Penanggung Jawab',
            'Status'
        ];
    }

    public function map($report): array
    {
        return [
            $report->id,
            Carbon::parse($report->created_at)->timezone('Asia/Makassar')->format('d-m-Y H:i:s'),
            $report->user ? $report->user->name : 'Anonim',
            $report->latitude . ', ' . $report->longitude,
            $report->description ?? 'Tidak ada deskripsi',
            $report->waste_type ?? '-',
            $report->severity_level ?? '-',
            $report->petugas ? $report->petugas->user->name : 'Belum Ditugaskan',
            strtoupper($report->status)
        ];
    }
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
