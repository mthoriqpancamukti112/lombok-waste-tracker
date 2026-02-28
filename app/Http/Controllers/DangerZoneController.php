<?php

namespace App\Http\Controllers;

use App\Models\DangerZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DangerZoneController extends Controller
{
    // Menampilkan halaman manajemen zona untuk DLH
    public function index()
    {
        $zones = DangerZone::with('creator:id,name')
            ->latest()
            ->get();

        return Inertia::render('DLH/DangerZone/Index', [
            'zones' => $zones,
            'mapboxToken' => env('VITE_MAPBOX_TOKEN')
        ]);
    }

    // Menyimpan zona baru dari peta
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:blackspot,illegal_dump,flood_risk,fire_risk,tpa',
            'severity' => 'required|in:low,medium,high,critical',
            'coordinates' => 'nullable|array', // Array dari titik polygon Mapbox
            'center_lat' => 'nullable|numeric',
            'center_lng' => 'nullable|numeric',
            'radius_meters' => 'nullable|numeric',
        ]);

        $validated['created_by'] = Auth::id();

        DangerZone::create($validated);

        return back()->with('success', 'Zona rawan berhasil ditambahkan ke dalam peta.');
    }

    // Mengupdate zona
    public function update(Request $request, DangerZone $dangerZone)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:blackspot,illegal_dump,flood_risk,fire_risk,tpa',
            'severity' => 'required|in:low,medium,high,critical',
            'is_active' => 'boolean',
            'coordinates' => 'nullable|array',
        ]);

        $dangerZone->update($validated);

        return back()->with('success', 'Data zona rawan diperbarui.');
    }

    // Menghapus zona
    public function destroy(DangerZone $dangerZone)
    {
        $dangerZone->delete();

        return back()->with('success', 'Zona rawan berhasil dihapus dari peta.');
    }
}
