<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relasi ke profil Warga
    public function warga()
    {
        return $this->hasOne(Warga::class);
    }

    // Relasi ke profil Kepala Lingkungan
    public function kaling()
    {
        return $this->hasOne(Kaling::class);
    }

    // Relasi ke profil Petugas
    public function petugas()
    {
        return $this->hasOne(Petugas::class);
    }

    // Relasi ke profil DLH
    public function dlh()
    {
        return $this->hasOne(Dlh::class);
    }
}
