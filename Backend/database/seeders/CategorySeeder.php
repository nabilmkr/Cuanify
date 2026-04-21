<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Pemasukan
            ['name' => 'Gaji', 'type' => 'income', 'icon' => 'wallet'],
            ['name' => 'Bonus', 'type' => 'income', 'icon' => 'gift'],
            // Pengeluaran
            ['name' => 'Makanan', 'type' => 'expense', 'icon' => 'food'],
            ['name' => 'Transportasi', 'type' => 'expense', 'icon' => 'car'],
            ['name' => 'Tagihan', 'type' => 'expense', 'icon' => 'receipt'],
            ['name' => 'Hiburan', 'type' => 'expense', 'icon' => 'gamepad'],
            ['name' => 'Lainnya', 'type' => 'expense', 'icon' => 'box'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }
    }
}
