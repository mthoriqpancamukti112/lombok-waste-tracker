<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    protected $fillable = [
        'user_id',
        'description',
        'photo_path',
        'latitude',
        'longitude',
        'address',
        'status',
        'severity_level',
        'waste_type',
    ];

    protected $appends = ['likes_count', 'comments_count'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ReportComment::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(ReportLike::class);
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
