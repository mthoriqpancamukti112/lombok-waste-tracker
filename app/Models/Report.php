<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'user_id',
        'kaling_id',
        'petugas_id',
        'description',
        'photo_path',
        'latitude',
        'longitude',
        'status',
        'severity_level',
        'waste_type',
        'resolved_photo_path',
        'resolved_notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(ReportComment::class)->latest();
    }

    public function likes()
    {
        return $this->hasMany(ReportLike::class);
    }

    public function petugas()
    {
        return $this->belongsTo(Petugas::class);
    }

    public function kaling()
    {
        return $this->belongsTo(Kaling::class);
    }
}
