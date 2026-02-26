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
        return Inertia::render('DangerZones/Index', [
            'zones' => DangerZone::latest()->get(),
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
            'radius_meters' => 'nullable|integer|min:50',
        ]);

        DangerZone::create(array_merge($validated, [
            'created_by' => Auth::id(),
        ]));

        return back()->with('success', 'Zona bahaya berhasil ditambahkan.');
    }

    public function update(Request $request, DangerZone $dangerZone)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:blackspot,illegal_dump,flood_risk,fire_risk,tpa',
            'severity' => 'sometimes|in:low,medium,high,critical',
            'coordinates' => 'nullable|array',
            'center_lat' => 'nullable|numeric',
            'center_lng' => 'nullable|numeric',
            'radius_meters' => 'nullable|integer|min:50',
            'is_active' => 'boolean',
        ]);

        $dangerZone->update($validated);

        return back()->with('success', 'Zona bahaya diperbarui.');
    }

    public function destroy(DangerZone $dangerZone)
    {
        $dangerZone->delete();
        return back()->with('success', 'Zona bahaya dihapus.');
    }
}
