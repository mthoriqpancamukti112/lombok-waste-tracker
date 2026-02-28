<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Exports\LaporanExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanAnalitikController extends Controller
{
    // Menampilkan Halaman Laporan & Analitik
    public function index(Request $request)
    {
        $query = Report::with('user');

        // Fitur Filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }

        $reports = $query->latest()->get();

        return Inertia::render('DLH/Laporan/Index', [
            'reports' => $reports,
            'filters' => $request->only(['status', 'start_date', 'end_date'])
        ]);
    }

    // Ekspor ke Excel
    public function exportExcel(Request $request)
    {
        $namaFile = 'Laporan_Sampah_' . date('Y-m-d_H-i') . '.xlsx';
        return Excel::download(new LaporanExport($request->status, $request->start_date, $request->end_date), $namaFile);
    }

    // Ekspor ke PDF (Dengan Kop Surat)
    public function exportPdf(Request $request)
    {
        $query = Report::with(['user', 'petugas.user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }

        $reports = $query->latest()->get();

        // Me-render tampilan HTML ke PDF
        $pdf = Pdf::loadView('laporan', compact('reports', 'request'));

        // Ukuran kertas A4, mode Landscape (agar tabel muat)
        $pdf->setPaper('A4', 'landscape');

        return $pdf->download('Laporan_Resmi_DLH_' . date('Y-m-d') . '.pdf');
    }
}
