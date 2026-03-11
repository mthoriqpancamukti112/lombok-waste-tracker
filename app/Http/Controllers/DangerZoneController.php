<?php

namespace App\Http\Controllers;

use App\Models\DangerZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DangerZoneController extends Controller
{
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:blackspot,illegal_dump,flood_risk,fire_risk,tpa',
            'severity' => 'required|in:low,medium,high,critical',
            'coordinates' => 'nullable|array',
            'center_lat' => 'nullable|numeric',
            'center_lng' => 'nullable|numeric',
            'radius_meters' => 'nullable|numeric',
        ]);

        $validated['created_by'] = Auth::id();

        DangerZone::create($validated);

        return back()->with('success', 'Zona rawan berhasil ditambahkan ke dalam peta.');
    }

    public function update(Request $request, DangerZone $dangerZone)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:blackspot,illegal_dump,flood_risk,fire_risk,tpa',
            'severity' => 'sometimes|in:low,medium,high,critical',
            'is_active' => 'boolean',
            'coordinates' => 'nullable|array',
            'center_lat' => 'nullable|numeric',
            'center_lng' => 'nullable|numeric',
            'radius_meters' => 'nullable|numeric',
        ]);

        $dangerZone->update($validated);

        return back()->with('success', 'Data zona rawan diperbarui.');
    }

    public function destroy(DangerZone $dangerZone)
    {
        $dangerZone->delete();

        return back()->with('success', 'Zona rawan berhasil dihapus dari peta.');
    }
}
