<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    // Mass assignable attributes
    protected $fillable = [
        'name',
        'email',
        'google_id',
        'avatar_url',
        'notifications_enabled',
    ];

    // Sembunyikan data ini saat di-return sebagai JSON
    protected $hidden = [
        'google_id',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'notifications_enabled' => 'boolean',
    ];

    // Relasi ke Transaksi & Insights
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function insights()
    {
        return $this->hasMany(Insight::class);
    }
}
