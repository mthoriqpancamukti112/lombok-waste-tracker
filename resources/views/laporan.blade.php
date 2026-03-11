<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Laporan Data Sampah</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11px;
        }

        .kop-surat {
            text-align: center;
            border-bottom: 3px solid black;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .kop-surat h2,
        .kop-surat h3,
        .kop-surat p {
            margin: 2px 0;
        }

        .judul-laporan {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid black;
            padding: 6px 8px;
            text-align: left;
        }

        th {
            background-color: #e2e8f0;
        }

        .text-center {
            text-align: center;
        }

        .badge {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9px;
        }
    </style>
</head>

<body>
    <div class="kop-surat">
        <h2>PEMERINTAH KOTA MATARAM</h2>
        <h3>DINAS LINGKUNGAN HIDUP (DLH)</h3>
        <p>Jl. Lingkar Selatan, Kota Mataram, Nusa Tenggara Barat</p>
        <p>Email: dlh@mataramkota.go.id | Telepon: (0370) 123456</p>
    </div>

    <div class="judul-laporan">
        REKAPITULASI LAPORAN PENANGANAN SAMPAH<br>
        <span style="font-weight: normal; font-size: 11px;">Tanggal Dicetak: {{ date('d M Y') }}</span>
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%" class="text-center">No</th>
                <th width="12%">Tanggal</th>
                <th width="15%">Pelapor</th>
                <th width="25%">Keterangan Lokasi</th>
                <th width="15%">Koordinat</th>
                <th width="15%">Petugas</th>
                <th width="13%" class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($reports as $index => $report)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($report->created_at)->timezone('Asia/Makassar')->format('d/m/Y H:i') }}
                    </td>
                    <td>{{ $report->user->name ?? 'Anonim' }}</td>
                    <td>{{ $report->description ?: '-' }}</td>
                    <td style="font-size: 9px;">{{ $report->latitude }}<br>{{ $report->longitude }}</td>

                    <td>
                        {{ $report->petugas ? $report->petugas->user->name : '-' }}
                    </td>

                    <td class="text-center badge">{{ $report->status }}</td>
                </tr>
            @endforeach
            @if (count($reports) == 0)
                <tr>
                    <td colspan="7" class="text-center">Tidak ada data laporan pada periode ini.</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div style="margin-top: 50px; text-align: right; width: 100%;">
        <p>Mataram, {{ date('d F Y') }}</p>
        <p style="margin-bottom: 70px;">Mengetahui,<br>Kepala Dinas Lingkungan Hidup</p>
        <p><b><u>H. Nizar Denny Cahyadi, SE.</u></b></p>
    </div>
</body>

</html>
