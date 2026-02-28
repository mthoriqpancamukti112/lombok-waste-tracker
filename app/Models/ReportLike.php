<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportLike extends Model
{
    protected $fillable = [
        'report_id',
        'user_id',
    ];

    // Relasi ke Report
    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
