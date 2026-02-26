<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function toggle(Report $report): JsonResponse
    {
        $existing = ReportLike::where('report_id', $report->id)
            ->where('user_id', Auth::id())
            ->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            ReportLike::create([
                'report_id' => $report->id,
                'user_id' => Auth::id(),
            ]);
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'count' => $report->likes()->count(),
        ]);
    }
}
