<?php

namespace App\Http\Controllers;

use App\Models\WasteDensityZone;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WasteDensityController extends Controller
{
    public function index()
    {
        return Inertia::render('WasteDensity/Index', [
            'zones' => WasteDensityZone::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'coordinates' => 'nullable|array',
            'density_level' => 'required|in:very_low,low,medium,high,very_high',
            'kelurahan' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'monthly_tonnage' => 'nullable|numeric|min:0',
        ]);

        WasteDensityZone::create($validated);

        return back()->with('success', 'Zona kepadatan berhasil ditambahkan.');
    }

    public function update(Request $request, WasteDensityZone $wasteDensityZone)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'coordinates' => 'nullable|array',
            'density_level' => 'sometimes|in:very_low,low,medium,high,very_high',
            'kelurahan' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'monthly_tonnage' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $wasteDensityZone->update($validated);

        return back()->with('success', 'Zona kepadatan diperbarui.');
    }

    public function destroy(WasteDensityZone $wasteDensityZone)
    {
        $wasteDensityZone->delete();
        return back()->with('success', 'Zona kepadatan dihapus.');
    }
}
