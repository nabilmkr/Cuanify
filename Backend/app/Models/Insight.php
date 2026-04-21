<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Insight extends Model
{
    // user_id TIDAK ada di fillable — diisi otomatis via relationship
    protected $fillable = [
        'period_month',
        'period_year',
        'insight_text',
        'recommendations',
        'ml_prediction',
        'data_analyzed',
    ];

    // Cast kolom JSON agar otomatis menjadi Array di PHP
    protected $casts = [
        'recommendations' => 'array',
        'data_analyzed' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
