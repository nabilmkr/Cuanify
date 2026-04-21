<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    // user_id TIDAK ada di fillable — diisi otomatis via relationship, mencegah mass assignment attack
    protected $fillable = ['category_id', 'amount', 'transaction_date', 'note'];

    protected $casts = [
        'amount' => 'integer',
        'transaction_date' => 'date:Y-m-d',
    ];

    // Relasi balik ke User dan Category
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
