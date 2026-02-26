<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportComment;
use App\Models\AppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request, Report $report)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $comment = $report->comments()->create([
            'user_id' => Auth::id(),
            'body' => $validated['body'],
        ]);

        if ($report->user_id !== Auth::id()) {
            AppNotification::create([
                'user_id' => $report->user_id,
                'type' => 'new_comment',
                'notifiable_type' => Report::class,
                'notifiable_id' => $report->id,
                'data' => [
                    'report_id' => $report->id,
                    'commenter' => Auth::user()->name,
                    'comment_body' => $comment->body,
                    'message' => Auth::user()->name . ' mengomentari laporan Anda.',
                ],
            ]);
        }

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }

    public function destroy(ReportComment $comment)
    {
        if ($comment->user_id !== Auth::id() && !in_array(Auth::user()->role, ['admin', 'dlh'])) {
            abort(403);
        }

        $comment->delete();

        return back()->with('success', 'Komentar dihapus.');
    }
}
