<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'google_id',
        'avatar',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function warga(): HasOne
    {
        return $this->hasOne(Warga::class);
    }

    public function kaling(): HasOne
    {
        return $this->hasOne(Kaling::class);
    }

    public function petugas(): HasOne
    {
        return $this->hasOne(Petugas::class);
    }

    public function dlh(): HasOne
    {
        return $this->hasOne(Dlh::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function reportComments(): HasMany
    {
        return $this->hasMany(ReportComment::class);
    }

    public function reportLikes(): HasMany
    {
        return $this->hasMany(ReportLike::class);
    }

    public function appNotifications(): HasMany
    {
        return $this->hasMany(AppNotification::class);
    }

    public function getUnreadNotificationsCountAttribute(): int
    {
        return $this->appNotifications()->whereNull('read_at')->count();
    }
}
