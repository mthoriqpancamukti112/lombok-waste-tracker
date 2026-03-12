<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'kaling_id',
        'petugas_id',
        'description',
        'photo_path',
        'latitude',
        'longitude',
        'address',
        'city',
        'status',
        'severity_level',
        'waste_type',
        'needs',
        'resolved_photo_path',
        'resolved_notes',
    ];

    protected $casts = [
        'needs' => 'array',
    ];

    protected $appends = ['likes_count', 'comments_count'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ReportComment::class)->latest();
    }

    public function likes(): HasMany
    {
        return $this->hasMany(ReportLike::class);
    }

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(Petugas::class);
    }

    public function kaling(): BelongsTo
    {
        return $this->belongsTo(Kaling::class);
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(ReportStatusLog::class);
    }

    public function getLikesCountAttribute(): int
    {
        return $this->likes()->count();
    }

    public function getCommentsCountAttribute(): int
    {
        return $this->comments()->count();
    }
}
